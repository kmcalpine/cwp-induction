#!/usr/bin/env python3
"""Generate voiceover clips with the ElevenLabs API.

Usage:
    python3 tools/tts.py tools/lines-04.json            # make any clips that don't exist yet
    python3 tools/tts.py tools/lines-04.json --force    # re-make every clip
    python3 tools/tts.py tools/lines-04.json --only 03.mp3 05.mp3
    python3 tools/tts.py --models                       # list the models on this account

The API key is read from the ELEVENLABS_API_KEY environment variable, or from
~/.config/elevenlabs/api_key. It is never stored in this project.

Voice, model and settings come from tools/voice.json so every section sounds the same.
"model" can be an exact model_id, or a short name like "v4": the script then picks the
matching text-to-speech model from the account's model list.
A lines file looks like:
    {"out": "audio-4", "lines": [{"file": "01.mp3", "text": "..."}, ...]}
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
API = "https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128"


def api_key():
    key = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not key:
        path = Path.home() / ".config" / "elevenlabs" / "api_key"
        if path.exists():
            key = path.read_text().strip()
    if not key:
        sys.exit("No API key: set ELEVENLABS_API_KEY or save it to ~/.config/elevenlabs/api_key")
    return key


def list_models(key):
    req = urllib.request.Request("https://api.elevenlabs.io/v1/models", headers={"xi-api-key": key})
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            return json.load(res)
    except urllib.error.HTTPError as e:
        sys.exit(f"Couldn't list models ({e.code}): {e.read().decode(errors='replace')[:300]}")


def resolve_model(key, wanted):
    # exact ids pass straight through; short names ("v4") are matched against the account's models
    if wanted.startswith("eleven_"):
        return wanted
    tag = wanted.lower().replace(" ", "")
    hits = [m for m in list_models(key) if m.get("can_do_text_to_speech", True)
            and (tag in m["model_id"].lower().replace("_", "") or tag in m.get("name", "").lower().replace(" ", ""))]
    if not hits:
        sys.exit(f'No text-to-speech model matching "{wanted}" on this account; run with --models to see the list')
    return hits[0]["model_id"]


def fetch(req, tries=5):
    # retry dropped connections (flaky network); HTTP errors from ElevenLabs are raised straight away
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=120) as res:
                return res.read()
        except urllib.error.HTTPError:
            raise
        except (urllib.error.URLError, ConnectionError, TimeoutError, OSError) as e:
            if i == tries - 1:
                sys.exit(f"Couldn't reach ElevenLabs after {tries} tries: {e}")
            wait = 2 * (i + 1)
            print(f"  connection dropped ({e.__class__.__name__}); retrying in {wait} s")
            time.sleep(wait)


def synthesise(key, voice, text, prev_text, next_text):
    settings = dict(voice.get("settings", {}))
    body = {
        "text": text,
        "model_id": voice["model_id"],
        "voice_settings": settings,
        # the previous line keeps the intonation consistent across separate clips. (next_text is not sent:
        # v4 sometimes speaks the start of the next line at the end of the clip.)
        "previous_text": prev_text,
    }
    # newer models can reject some options; fall back step by step rather than failing
    fallbacks = [
        ("without previous-line context", lambda b: b.pop("previous_text", None)),
        ("with simplified voice settings", lambda b: b.update(voice_settings={"stability": min((0, .5, 1), key=lambda v: abs(v - settings.get("stability", .5)))})),
        ("with the model's default voice settings", lambda b: b.pop("voice_settings", None)),
    ]
    while True:
        req = urllib.request.Request(
            API.format(voice=voice["voice_id"]),
            data=json.dumps(body).encode(),
            headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
        )
        try:
            return fetch(req)
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")[:400]
            if e.code not in (400, 422) or not fallbacks:
                sys.exit(f"ElevenLabs refused the request ({e.code}): {detail}")
            note, change = fallbacks.pop(0)
            print(f"  model didn't accept that request; retrying {note}")
            change(body)


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    if args[0] == "--models":
        for m in list_models(api_key()):
            tts = "TTS" if m.get("can_do_text_to_speech", True) else "   "
            print(f"{tts}  {m['model_id']:<32} {m.get('name', '')}")
        return
    spec = json.loads(Path(args[0]).read_text())
    force = "--force" in args
    only = set(args[args.index("--only") + 1:]) if "--only" in args else None

    voice = json.loads((HERE / "voice.json").read_text())
    if not voice.get("voice_id"):
        sys.exit("Set voice_id in tools/voice.json first")
    out = (HERE.parent / spec["out"]).resolve()
    out.mkdir(parents=True, exist_ok=True)
    key = api_key()
    voice["model_id"] = resolve_model(key, voice.get("model") or voice.get("model_id", ""))
    print(f"voice {voice['voice_id']}  model {voice['model_id']}")

    lines = spec["lines"]
    for i, line in enumerate(lines):
        target = out / line["file"]
        if only and line["file"] not in only:
            continue
        if target.exists() and not force and not only:
            print(f"skip   {target.name} (exists)")
            continue
        prev_text = lines[i - 1]["text"] if i > 0 else ""
        next_text = lines[i + 1]["text"] if i + 1 < len(lines) else ""
        audio = synthesise(key, voice, line["text"], prev_text, next_text)
        target.write_bytes(audio)
        print(f"saved  {target.relative_to(HERE.parent)}  {len(audio) // 1024} KB  \"{line['text']}\"")
        time.sleep(0.4)


if __name__ == "__main__":
    main()
