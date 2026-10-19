/* voice.js: voiceover playback
   Plays the section's clips (VO_DATA) at the times in its VO cue list; the browser voice is only a fallback.
   Shared by every section: change it here, not in a section file. */
'use strict';
const V = { voice: null, bufs: null, loading: null, srcs: [], speaking: false };
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  const score = v => (/en-GB/i.test(v.lang) ? 4 : /^en/i.test(v.lang) ? 1 : -9) + (/natural|neural|online/i.test(v.name) ? 3 : 0);
  V.voice = vs.slice().sort((a, b) => score(b) - score(a))[0] || null;
}
function voLoad() {
  if (V.loading || !A.ctx) return V.loading;
  if (!VO_DATA.length) { V.failed = true; return null; }
  V.loading = Promise.all(VO_DATA.map(b64 => {
    const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return A.ctx.decodeAudioData(bin.buffer);
  })).then(bufs => { V.bufs = bufs; }, () => { V.bufs = null; });
  return V.loading;
}
function voStop() {
  V.srcs.forEach(s => { try { s.stop(); } catch (e) {} }); V.srcs = [];
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}
function voSay(text) {
  if (A.muted || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  if (V.voice) { u.voice = V.voice; u.lang = V.voice.lang; } else u.lang = 'en-GB';
  speechSynthesis.speak(u);
}
const segLen = i => { const [, c, a, b] = VO[i]; return (b === null ? (V.bufs ? V.bufs[c].duration : 4) : b) - a; };
function voPlay(i, offset = 0) {
  if (V.bufs) {
    const [, c, from] = VO[i], len = segLen(i);
    if (offset >= len) return;
    offset = Math.max(0, offset);
    const s = A.ctx.createBufferSource(); s.buffer = V.bufs[c]; s.connect(A.voice); s.start(0, from + offset, len - offset);
    s.onended = () => { V.srcs = V.srcs.filter(x => x !== s); };
    V.srcs.push(s);
  } else if (V.loading && !V.failed) {
    // still decoding: start the line once ready, from where the film has got to
    V.loading.then(() => { if (playing && V.bufs) voPlay(i, T - VO[i][0]); else if (!V.bufs) voSay(VO[i][4]); });
  } else if (offset < .5) voSay(VO[i][4]);
}
function voTick(F, P0) {
  V.speaking = VO.some(([tc], i) => F.t >= tc && F.t < tc + segLen(i));
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  VO.forEach(([tc], i) => { if (P0.t < tc && F.t >= tc) voPlay(i); });
}
