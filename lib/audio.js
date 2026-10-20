/* audio.js: synthesised site sound, music pad and sound effects
   Each section supplies audioUpdate(F) to set levels per frame.
   Shared by every section: change it here, not in a section file. */
'use strict';
const A = { ctx: null, muted: false };
const CHORDS = [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 62]];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function audioInit() {
  if (A.ctx) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)(); A.ctx = ctx;
  const out = ctx.createGain(); out.gain.value = A.muted ? 0 : .9; out.connect(ctx.destination); A.out = out;
  const comp = ctx.createDynamicsCompressor(); comp.connect(out);
  A.voice = ctx.createGain(); A.voice.gain.value = 1; A.voice.connect(out);
  const len = ctx.sampleRate * 2, white = ctx.createBuffer(1, len, ctx.sampleRate), brown = ctx.createBuffer(1, len, ctx.sampleRate);
  const wd = white.getChannelData(0), bd = brown.getChannelData(0); let last = 0;
  for (let i = 0; i < len; i++) { wd[i] = Math.random() * 2 - 1; last = (last + .02 * wd[i]) / 1.02; bd[i] = last * 3.5; }
  A.white = white;
  const gain = v => { const g = ctx.createGain(); g.gain.value = v; return g; };
  const filt = (type, f, q = .7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const src = ctx.createBufferSource(); src.buffer = brown; src.loop = true;
  A.site = gain(0); src.connect(filt('lowpass', 420)).connect(A.site); A.site.connect(comp); src.start();
  A.eng = gain(0); const ef = filt('lowpass', 220, 2); ef.connect(A.eng); A.eng.connect(comp);
  for (const [f, ty, g] of [[33, 'sawtooth', 1], [66.5, 'square', .3]]) { const o = ctx.createOscillator(); o.type = ty; o.frequency.value = f; const gg = gain(g); o.connect(gg); gg.connect(ef); o.start(); }
  // pad: four voices, two detuned oscillators each
  A.padF = filt('lowpass', 900, .5); A.pad = gain(0); A.padF.connect(A.pad); A.pad.connect(comp);
  A.voices = CHORDS[0].map(m => [-6, 6].map(dt => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.detune.value = dt; o.frequency.value = mtof(m); const g = gain(.12); o.connect(g); g.connect(A.padF); o.start(); return o; }));
}
function shot(kind) {
  const ctx = A.ctx; if (!ctx) return;
  const t = ctx.currentTime;
  const env = (g, peak, dur, at = t, atk = .005) => { g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(peak, at + atk); g.gain.exponentialRampToValueAtTime(.0001, at + dur); };
  const tone = (f0, f1v, peak, dur, at = t, type = 'sine', atk) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1v, at + dur); const g = ctx.createGain(); env(g, peak, dur, at, atk); o.connect(g); g.connect(A.out); o.start(at); o.stop(at + dur + .05); };
  const noise = (type, f, q, peak, dur, at = t, atk) => { const s = ctx.createBufferSource(); s.buffer = A.white; const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; const g = ctx.createGain(); env(g, peak, dur, at, atk); s.connect(b); b.connect(g); g.connect(A.out); s.start(at, Math.random()); s.stop(at + dur + .05); };
  if (kind === 'whoosh') noise('bandpass', 1400, .8, .12, .45, t, .15);
  if (kind === 'beep') tone(1250, 1250, .06, .22, t, 'square');   // reversing alarm
  if (kind === 'thud') { tone(110, 45, .28, .7, t, 'sine'); tone(240, 90, .08, .3, t, 'triangle'); }   // a body hitting the ground
  if (kind === 'ping') { tone(880, 860, .12, .6); tone(1320, 1300, .05, .5); }
  if (kind === 'card') { noise('bandpass', 900, .9, .1, .35, t, .08); tone(330, 330, .08, .5); }
  if (kind === 'chime') for (const [f, a, d] of [[523.25, .14, 2.2], [659.25, .09, 2], [783.99, .08, 2.4], [1046.5, .04, 2.6]]) tone(f, f, a, d);
  if (kind === 'step') noise('lowpass', 600, 1, .2, .07);
  if (kind === 'bird') { const f = 2600 + Math.random() * 1800; for (let i = 0; i < 3; i++) tone(f, f * 1.3, .035, .08, t + i * .11); }
}
