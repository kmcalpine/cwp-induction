/* Section 1: welcome & introduction.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 1</div>
      <div class="h">Welcome to CWP Construction Ltd</div>
      <div class="s">How we operate, the standards we expect, and the health &amp; safety arrangements you need to know.</div>
    </div>
  </div>
  <div id="chip"><div class="k">What we do</div><div class="h"></div></div>
  <div id="riskTitle">Our work can involve significant risks</div>
  <div id="banner"><div><small></small><span></span></div></div>
  <div id="dim"></div>
  <div id="cards">
    <div class="card"><div class="top"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg></div></div>
      <div class="body"><div class="q">See something unsafe?</div><div class="a">Report it.</div><div class="n">Hazards, damaged equipment, unsafe behaviour &ndash; tell your supervisor straight away.</div></div></div>
    <div class="card"><div class="top"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 9a3 3 0 1 1 4.2 2.75c-.75.33-1.2 1.05-1.2 1.85V15"/><circle cx="12" cy="19" r=".6" fill="#fff"/></svg></div></div>
      <div class="body"><div class="q">Not sure about something?</div><div class="a">Ask.</div><div class="n">No question is too small. Nobody expects you to guess.</div></div></div>
    <div class="card stop"><div class="top"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg></div></div>
      <div class="body"><div class="q">Think it's dangerous?</div><div class="a">Stop work.</div><div class="n">Make it safe if you can, then speak to your supervisor.</div></div></div>
  </div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Everyone home safe. Every day.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 1</div>
    <h1>Welcome &amp; introduction</h1>`,
  hint: 'About a minute &middot; with voiceover &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
const LAYOUT = LAYOUTS.welcome;
const DUR = 72.3;
// the gate only stands open while people are coming or going
const GATE_OPEN = [[-1, 6.5], [42.8, 51.5]];

/* ---------------------------------------------------------------- scene */
const CREW = [
  // at work around the site
  { at: [13.9, 7.4], tool: 'tablet', dir: -1 },
  { at: [23.5, 5.6], dir: -1, skin: SKINS[1] }, { at: [29.7, 5.6], dir: -1, skin: SKINS[2] },
  { at: [65.6, 4.2], vest: 'sub', tool: 'rake', work: true, seed: 0 }, { at: [67, 3], vest: 'sub', tool: 'rake', work: true, seed: 2, skin: SKINS[3] }, { at: [66.4, 5.6], vest: 'sub', tool: 'rake', work: true, seed: 4, skin: SKINS[2] },
  { at: [55.2, 6.9], dir: 1, skin: SKINS[4] }, { at: [77.4, 6.2], tool: 'tablet', dir: -1 },
];
// each work area: camera arrives at a, its voice clip starts just after, moves on at b
// (each hold is that clip's length plus a short beat, minimum 1.6 s)
const ZONES = [
  { name: 'Groundworks &amp; excavations', x: 13.5, y: 5.4, a: 8, b: 11.5 },
  { name: 'Drainage', x: 25.5, y: 5.2, a: 12.3, b: 13.9 },
  { name: 'Utilities', x: 36.5, y: 5.4, a: 14.7, b: 16.4 },
  { name: 'Lifting operations', x: 46.8, y: 4.6, a: 17.2, b: 19.2 },
  { name: 'Highways', x: 58, y: 4.8, a: 20, b: 21.6 },
  { name: 'Concrete works', x: 68.4, y: 5.6, a: 22.4, b: 24 },
  { name: 'Operational &amp; water-sector sites', x: 78.6, y: 4, a: 24.8, b: 29.5 },
];
function dumperAt(t) {
  const a = 6, b = 40, v = 3.2, per = 2 * (b - a) / v;   // turns well before the far end of the haul road
  const u = frac((t + 4) / per) * per, half = per / 2;
  return u < half ? { x: a + v * u, dir: 1 } : { x: b - v * (u - half), dir: -1 };
}
const RISKS = [
  { name: 'Moving plant', pos: t => { const d = dumperAt(t); return [d.x + 1.8, 9.6, 2.2]; } },
  { name: 'Excavations', pos: () => [25.5, 3.9, .6] },
  { name: 'Underground services', pos: () => [36.5, 4.6, .4], left: true },  // label to the left of its marker, clear of the lifting label
  { name: 'Lifting operations', pos: t => [45.3 + Math.sin(t * 1.1) * .08, 3.3, 2.3] },
  { name: 'Other contractors', pos: () => [66.4, 4.3, 2.2] },
];
function cameraAt(t) {
  const f = MOBILE && focusSeq(t, 29.6, 45.4, [
    [29.6, () => [16, 6.2, 1], 820],
    ...RISKS.map((r, i) => [RISK_AT[i] - .35, () => r.pos(t), 640]),
  ], [[2, 10.6, 1], 760]);
  if (f) return f;
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  const keys = [[0, c(1.6, 12.2, 1.4, 600)], [5.8, c(1.6, 10.5, 1.2, 640)]];
  ZONES.forEach(z => { keys.push([z.a, c(z.x, z.y, 1.2, 700)], [z.b, c(z.x + .5, z.y, 1.2, 690)]); });
  keys.push([30.1, c(37.5, 6, 1, 2330)], [44.1, c(38, 6, 1, 2270)], [45.4, c(2, 10.6, 1, 760)], [49.8, c(1.8, 11, 1, 720)],
    [49.9, c(2.4, 13.8, 1.1, 480)], [54.7, c(2.4, 13.8, 1.1, 440)], [55.5, c(4, 9, 1, 900)], [72.3, c(6, 8, 1, 1000)]);
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b] = keys[i + 1];
    if (t <= t1) { const u = t1 - t0 < .2 ? 1 : smooth((t - t0) / (t1 - t0)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u) }; }
  }
  return keys[keys.length - 1][1];
}

/* ---------------------------------------------------------------- sound */
function audioUpdate(F) {
  const ctx = A.ctx; if (!ctx) return;
  const n = ctx.currentTime;
  const busy = F.t < 43.9 ? 1 : .35;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 66.9 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 51.3 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
// Each work area has its own clip (02a-02g) so every line stands on its own.
const VO = [
  [0.4, 0, 0, null, "Welcome to C.W.P. Construction Limited. Before you start work, here's how we operate, and what we expect."],
  [8.1, 1, 0, null, 'We carry out groundworks and excavations.'],
  [12.4, 2, 0, null, 'Drainage.'],
  [14.8, 3, 0, null, 'Utilities.'],
  [17.3, 6, 0, null, 'Lifting operations.'],
  [20.1, 5, 0, null, 'Highways.'],
  [22.5, 4, 0, null, 'Concrete works.'],
  [24.9, 7, 0, null, 'And work on live, operational sites, including the water sector.'],
  [30.7, 8, 0, 2.32, 'This work carries real risks:'],
  [33.5, 8, 2.32, 3.44, 'moving plant,'],
  [35.5, 8, 3.44, 4.6, 'excavations,'],
  [37.5, 8, 4.6, 6.03, 'underground services,'],
  [39.8, 8, 6.03, 6.74, 'lifting,'],
  [41.4, 8, 6.74, null, 'and working alongside other contractors.'],
  [45.1, 9, 0, null, 'Our priority: everyone goes home safely, at the end of every day.'],
  [51.1, 10, 0, null, 'However experienced you are, the same standards apply to everyone.'],
  [55.7, 11, 0, null, 'If you see something unsafe, report it.'],
  [58.7, 12, 0, null, "If you're unsure, ask."],
  [60.9, 13, 0, null, 'And if you believe something is dangerous, stop work, and speak to your supervisor.'],
  [68.7, 14, 0, null, 'Welcome to the team.'],
];
// each risk marker appears as it's named in clip 04 (offsets of the spoken items)
const CARD_AT = [55.7, 62.7, 64.9];
// each risk marker appears as its word is spoken (cue + the short pause before the word)
const RISK_AT = [33.68, 35.6, 37.6, 39.89, 41.48];

/* ---------------------------------------------------------------- frame */
function render(t) {
  const cam = cameraAt(t);
  setView(cam);

  // dynamic objects, depth sorted by their footprint
  const items = [];
  items.push({ k: -1.2, bb: [-5.6, -1.2, 1, 2], s: STAIR || (STAIR = stair(-5.6, -4.2, -1.2, 1, 2, 2.7)) });
  items.push({ k: 15 + 6, s: excavator(8, excavatorPose(t), t) });
  const d = dumperAt(t); items.push({ k: d.x + 1.8 + 9.6, s: dumper(d.x, 8.7, d.dir, t) });
  items.push({ k: 70 + 10, s: mixer(66, 8.75, t) });
  const rx = 55.6 + 1.6 * Math.sin(t * .55); items.push({ k: rx + 1.5 + 3.4, s: roller(rx, 2.6, t) });
  items.push({ k: 50 + 3.5, s: telehandler(47.5, 2.4, t) });
  for (const p of CREW) items.push({ k: p.at[0] + p.at[1], s: person({ x: p.at[0], y: p.at[1], dir: p.dir || 1, tool: p.tool, vest: p.vest, work: p.work, seed: p.seed, skin: p.skin, t }) });
  // CAT operator sweeping the utilities corridor
  const cu = frac(t / 9), cx = cu < .5 ? lerp(33.4, 39.6, cu * 2) : lerp(39.6, 33.4, (cu - .5) * 2);
  items.push({ k: cx + 3.2, s: person({ x: cx, y: 3.2, moving: true, phase: t * 4.5, dir: cu < .5 ? 1 : -1, tool: 'cat', t }) });
  // the new starter and the supervisor who meets them
  const ns = walkPath([[.4, 3.3, 14.6], [4.2, 3.3, 11.6], [7.6, 1.6, 6.4], [9, 1.4, 5.6]], t);
  if (ns && t < 29.3) items.push({ k: ns.x + ns.y, y: ns.y, s: person({ ...ns, skin: SKINS[2], t }) });
  if (t < 29.3) items.push({ k: .6 + 4.6, s: person({ x: .6, y: 4.6, dir: 1, tool: 'tablet', raise: ramp(t, 6.4, 6.7) * (1 - ramp(t, 7.6, 7.9)), t }) });
  // home time: crew walks out through the gate
  if (t > 43.4 && t < 49.9) for (let i = 0; i < 9; i++) {
    const t0 = 43.5 + i * .5, sx = 1 + (i % 3) * 1.2, sy = 5.6 + (i % 2) * 1.6;
    const p = walkPath([[t0, sx, sy], [t0 + Math.hypot(3.3 - sx, 11.8 - sy) / 1.5, 3.3, 11.8], [t0 + Math.hypot(3.3 - sx, 11.8 - sy) / 1.5 + 1.4, 3.1, 13.9], [t0 + 12, -12, 13.9]], t);
    if (p) items.push({ k: p.x + p.y, y: p.y, s: person({ ...p, skin: SKINS[i % 5], vest: i === 4 ? 'sub' : 'cwp', tool: i === 2 ? 'tablet' : null, t }) });
  }
  // the line-up: different roles, same standard
  if (t >= 49.9 && t < 55.5) ['#c4946f', '#6b4429', '#e0b48f', '#8d5a3b', '#d1a07a'].forEach((sk, i) => {
    items.push({ k: 100 + i, y: 13.9, s: person({ x: .2 + i * 1.05, y: 13.9 - i * .05, dir: i < 2 ? 1 : -1, skin: sk, vest: i === 4 ? 'sub' : 'cwp', tool: i === 3 ? 'tablet' : null, t }) });
  });
  items.push(...PROPS);
  sortDepth(items);
  // anyone outside the hoarding line is drawn in front of it
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');

  // risk markers + role tags
  let fx = '';
  const fs = labelSize();
  if (t > 29.8 && t < 44.6) RISKS.forEach((r, i) => {
    const a = ramp(t, RISK_AT[i], RISK_AT[i] + .35) * (1 - ramp(t, 44, 44.5));
    if (a <= 0) return;
    const [px, py] = P(...r.pos(t)), pulse = frac(t * 1.2 + i * .2);
    const lw = textW(r.name.toUpperCase(), fs * 1.05, fs * .05) + fs * 1.4, lx = keepIn(px - (r.left ? lw / 2 + fs * 1.6 : 0), lw, fs * .4), ly = r.left ? 3.2 : 0;
    if (!inShot(px, py)) return;
    fx += `<g opacity="${f2(a)}"><circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(fs * (1.6 + pulse * 3.5))}" fill="none" stroke="#e5483b" stroke-width="${f2(fs * .25)}" opacity="${f2(1 - pulse)}"/>` +
      `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(fs * .9)}" fill="#e5483b" stroke="#fff" stroke-width="${f2(fs * .2)}"/>` +
      `<rect x="${f1(lx - lw / 2)}" y="${f1(py - fs * (4.1 - ly))}" width="${f1(lw)}" height="${f1(fs * 1.9)}" rx="${f1(fs * .3)}" fill="rgba(35,31,32,.92)"/>` +
      `<text x="${f1(lx)}" y="${f1(py - fs * (2.75 - ly))}" fill="#fff" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="${f1(fs * 1.05)}" text-anchor="middle" letter-spacing="${f2(fs * .05)}">${r.name.toUpperCase()}</text></g>`;
  });
  if (t >= 50.3 && t < 55.3) ['Apprentice', 'Operative', 'Plant operator', 'Engineer', 'Subcontractor'].forEach((n, i) => {
    const a = ramp(t, 50.5 + i * .35, 50.9 + i * .35) * (1 - ramp(t, 54.9, 55.3));
    const [px, py] = P(.2 + i * 1.05, 13.9 - i * .05, 2.25), f = labelSize(12);
    fx += `<g opacity="${f2(a)}"><rect x="${f1(px - (textW(n.toUpperCase(), f) + f * 1.2) / 2)}" y="${f1(py - f * 1.5)}" width="${f1(textW(n.toUpperCase(), f) + f * 1.2)}" height="${f1(f * 1.7)}" rx="${f1(f * .25)}" fill="${BLUE}"/><text x="${f1(px)}" y="${f1(py - f * .25)}" fill="#fff" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="${f1(f)}" text-anchor="middle">${n.toUpperCase()}</text></g>`;
  });
  $('gate').innerHTML = pedGate(gateOpen(t));
  $('fx').innerHTML = fx;

  // grade: morning warmth, day, dusk
  const dusk = ramp(t, 43.1, 45.1) * (1 - ramp(t, 54.9, 56.4));
  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('dusk').style.opacity = f2(dusk * .55);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  // overlays
  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 6.4, 6.9)));
  const z = ZONES.find(z => t >= z.a - .2 && t < z.b);
  show($('chip'), z ? ramp(t, z.a - .2, z.a + .15) * (1 - ramp(t, z.b - .25, z.b)) : 0);
  if (z) $('chip').lastElementChild.innerHTML = z.name;
  show($('riskTitle'), ramp(t, 29.9, 30.4) * (1 - ramp(t, 44, 44.5)));
  let bn = null;
  if (t >= 44.9 && t < 49.7) bn = ['Our priority', 'Everyone goes home safely at the end of every day', 44.9, 49.7];
  else if (t >= 51.1 && t < 55.1) bn = ['Same standards for everyone', 'Whatever your experience &ndash; no exceptions', 51.1, 55.1];
  show($('banner'), bn ? ramp(t, bn[2], bn[2] + .4) * (1 - ramp(t, bn[3] - .4, bn[3])) : 0);
  if (bn) { $('banner').querySelector('small').innerHTML = bn[0]; $('banner').querySelector('span').innerHTML = bn[1]; }
  $('dim').style.opacity = f2(ramp(t, 55.3, 56.1) * (1 - ramp(t, 66.7, 67.3)));
  document.querySelectorAll('.card').forEach((c, i) => {
    const a = ramp(t, CARD_AT[i], CARD_AT[i] + .5) * (1 - ramp(t, 66.5, 67.1));
    c.style.opacity = f2(a); c.style.transform = `translateY(${f2((1 - a) * 1.2)}em)`;
  });
  $('end').style.opacity = f2(ramp(t, 66.9, 67.6));
  $('end').querySelector('.line').style.width = (ramp(t, 67.7, 68.7) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 68.3, 68.9));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 68.9, 69.5));
  $('black').style.opacity = f2(1 - ramp(t, 0, 0.9));
  return { t, on: 1 - ramp(t, 67.1, 69.1) * .7, ns };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > 0.25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  ZONES.forEach(z => { if (cross(z.a - .2)) shot('whoosh'); });
  RISK_AT.forEach(tc => { if (cross(tc)) shot('ping'); });
  for (const tb of [44.9, 51.1]) if (cross(tb)) shot('whoosh');
  for (const tc of CARD_AT) if (cross(tc)) shot('card');
  if (cross(67.7)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 12) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
