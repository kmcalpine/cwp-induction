/* Section 4: personal protective equipment.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 4</div>
      <div class="h">Personal protective equipment</div>
      <div class="s">What to wear, when you need more, and how to look after it.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="dim"></div>
  <div id="cards">
    <div class="card"><div class="top"><div class="ic">${CHECK_ICON}<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div></div>
      <div class="body"><div class="q">Right for the task</div><div class="a">Suitable.</div><div class="n">The protection the job and its risk assessment call for.</div></div></div>
    <div class="card"><div class="top"><div class="ic">${CHECK_ICON}<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/><path d="M9 12.5l3 2 3-2"/></svg></div></div>
      <div class="body"><div class="q">Sized and adjusted</div><div class="a">Correctly fitted.</div><div class="n">Straps done up, the right size, worn the way it&rsquo;s meant to be.</div></div></div>
    <div class="card"><div class="top"><div class="ic">${CHECK_ICON}<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg></div></div>
      <div class="body"><div class="q">Checked before use</div><div class="a">Good condition.</div><div class="n">Clean, undamaged and in date. If it isn&rsquo;t, swap it.</div></div></div>
  </div>
  <div id="hoc">
    <div class="ttl">Hierarchy of control</div>
    <div class="row r0">Eliminate the hazard</div>
    <div class="row r1">Substitute something safer</div>
    <div class="row r2">Engineering controls</div>
    <div class="row r3">Safe systems &amp; supervision</div>
    <div class="row r4 ppe">PPE <span>Last line of defence</span></div>
    <div class="sub">PPE doesn&rsquo;t replace safe working methods</div>
  </div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Right kit. Worn right. Every time.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 4</div>
    <h1>Personal protective equipment</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
const LAYOUT = LAYOUTS.standard;
const DUR = 77;
// the pedestrian gate stays shut: everyone in this section is already on site
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
const CREW = [
  // at work around the site
  { at: [23.2, 5.4], dir: -1, skin: SKINS[1] }, { at: [29.9, 5.45], dir: -1, skin: SKINS[2] },
  { at: [44.2, 4.2], vest: 'sub', tool: 'rake', work: true, seed: 0 }, { at: [45.6, 3], vest: 'sub', tool: 'rake', work: true, seed: 2, skin: SKINS[3] }, { at: [45, 5.6], vest: 'sub', tool: 'rake', work: true, seed: 4, skin: SKINS[2] },
  { at: [69.2, 6.9], dir: 1, skin: SKINS[4] },
];
// chip captions [from, to, kicker, text]
const CHIPS = [
  [7.4, 22.2, 'Minimum PPE', 'Every job, every day'],
  [22.4, 28.2, 'Plus', 'Whatever the site rules and your task&rsquo;s risk assessment require'],
  [28.4, 31.1, 'Additional PPE', 'Some jobs need extra protection'],
  [31.3, 34.2, 'Additional PPE', 'Hearing protection'],
  [34.4, 37.6, 'Additional PPE', 'Respiratory protection'],
  [37.8, 40.4, 'Additional PPE', 'Face protection'],
  [40.6, 43.8, 'Additional PPE', 'Chemical-resistant clothing'],
  [44, 48.2, 'Additional PPE', 'Lifejacket when working near water'],
  [55.8, 62.8, 'Damaged, unsuitable or missing?', 'Tell your supervisor before you start work'],
];
// the kit-up: the new starter by the cabins, each item going on as it's named
const KIT_SPOT = [1.6, 2.5];
const KIT = [
  // [kit key, time it goes on, label, body point [z, side], label side]
  ['helmet', 10.95, 'Safety helmet', 1.82, 1],
  ['vest', 13.35, 'Hi-vis clothing', 1.15, -1],
  ['boots', 16.05, 'Safety footwear', .06, 1],
  ['gloves', 18.3, 'Gloves', .92, -1],
  ['glasses', 20.1, 'Eye protection', 1.62, -1],
];
// additional PPE: one job per item, visited left to right along the site
const JOBS = [
  { at: 31.7, name: 'Hearing protection', who: { x: 31.2, y: 7.5, dir: 1, tool: 'breaker', extra: { ear: true }, skin: SKINS[1] }, head: 1.9 },
  { at: 34.7, name: 'Respiratory protection', who: { x: 41.6, y: 1.2, dir: 1, tool: 'saw', extra: { mask: true, ear: true }, skin: SKINS[0] }, head: 1.9 },
  { at: 37.9, name: 'Face protection', who: { x: 51.4, y: 4.2, dir: -1, tool: 'grinder', extra: { visor: true }, skin: SKINS[3] }, head: 1.9 },
  { at: 40.7, name: 'Chemical-resistant clothing', who: { x: 74.6, y: .9, dir: 1, work: true, seed: 1, extra: { coverall: true, mask: true }, skin: SKINS[4] }, head: 1.9 },
  { at: 44.1, name: 'Lifejacket', who: { x: 84.2, y: 5.9, z: 2.3, dir: 1, tool: 'tablet', extra: { life: true }, skin: SKINS[2] }, head: 4.2 },
];
const CARD_AT = [49.95, 51.85, 52.95];
const HOC_AT = 63.6, PPE_AT = 64.4, SAFE_AT = 67.4;

function starterAt(t) {
  // walks in from the gate to the cabins
  return walkPath([[0, 3.3, 10.6], [1.4, 3.3, 9.4], [6.6, KIT_SPOT[0], KIT_SPOT[1]]], t) || { x: 3.3, y: 10.6, moving: false, dir: 1, phase: 0 };
}
function dumperAt(t) {
  const a = 6, b = 40, v = 3.2, per = 2 * (b - a) / v;
  const u = frac((t + 4) / per) * per, half = per / 2;
  return u < half ? { x: a + v * u, dir: 1 } : { x: b - v * (u - half), dir: -1 };
}
function brokenSlab() {
  let s = poly([[31.7, 7.05, .01], [33.1, 7.05, .01], [33.1, 7.95, .01], [31.7, 7.95, .01]], '#9c9a94');
  for (const [a, b] of [[[31.8, 7.3], [32.6, 7.6]], [[32.2, 7.1], [32.4, 7.9]], [[32.6, 7.6], [33, 7.4]]]) s += line3([...a, .02], [...b, .02], '#4a4844', 1.4);
  return s;
}
function chemDrums() {
  let s = '';
  for (const [x, y] of [[75.35, .2], [76, .45]]) {
    s += cylinderV(x, y, .3, 0, .88, '#2c5d95', col('#3a6fb0'));
    const [px, py] = P(x + .21, y + .21, .5);
    s += `<path d="M${f1(px)} ${f1(py - 4)} l4 4 -4 4 -4 -4z" fill="#fff" stroke="#c8102e" stroke-width="1.2"/>`;
  }
  return s;
}
function tankPlatform() {
  // access platform on the near side of the tank, with handrail
  const x0 = 83.5, x1 = 84.9, y0 = 5.2, y1 = 6.5, z = 2.3;
  let s = '';
  for (const [x, y] of [[x0, y1], [x1, y1], [x1, y0]]) s += line3([x, y, 0], [x, y, z], '#7d8287', 2.4);
  s += box(x0, y0, z - .1, x1 - x0, y1 - y0, .1, '#8b8f93');
  for (const [a, b] of [[[x0, y1], [x1, y1]], [[x1, y0], [x1, y1]]]) s += line3([...a, z + 1], [...b, z + 1], '#e0b13a', 2) + line3([...a, z + .5], [...b, z + .5], '#e0b13a', 1.4);
  for (const [x, y] of [[x0, y1], [x1, y1], [x1, y0]]) s += line3([x, y, z], [x, y, z + 1], '#7d8287', 1.6);
  return s;
}
function cameraAt(t) {
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  const keys = [
    [0, c(3.2, 9.4, 1.2, 560)], [6, c(2, 3.6, 1.1, 420)], [7.4, c(1.6, 2.5, 1.05, 250)], [22.2, c(1.6, 2.5, 1.05, 240)],
    [23.4, c(2, 3.2, 1, 440)], [28.2, c(2.4, 3.2, 1, 460)],
    [29.9, c(18, 6.6, 1, 900)], [31.2, c(31.8, 7.3, 1, 280)], [34, c(32, 7.3, 1, 270)],
    [34.8, c(42.2, 1, 1, 280)], [37.6, c(42.3, 1, 1, 270)],
    [38.3, c(51, 4.3, 1, 280)], [40.4, c(51, 4.3, 1, 270)],
    [41, c(75.2, .6, 1, 280)], [43.8, c(75.3, .6, 1, 270)],
    [44.4, c(84.2, 5.9, 3.1, 310)], [48.2, c(84.2, 5.9, 3.1, 300)],
    [49, c(30, 6, 1, 1300)], [55.4, c(31, 6, 1, 1260)],
    [55.8, c(1.6, 3.8, 1.1, 340)], [62.8, c(.8, 3, 1.1, 300)],
    [63.4, c(30, 6, 1, 1500)], [77, c(32, 6, 1, 1450)],
  ];
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
  const busy = F.t > 28 && F.t < 49 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 71.5 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 48 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-4/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, "Personal protective equipment. Here's what you'll need to wear on a C.W.P. site."],
  [7.6, 1, 0, null, 'As a minimum, every job needs:'],
  [10.8, 2, 0, null, 'A safety helmet.'],
  [13.2, 3, 0, null, 'High-visibility clothing.'],
  [15.9, 4, 0, null, 'Safety footwear.'],
  [18.2, 5, 0, null, 'Gloves.'],
  [19.8, 6, 0, null, 'And eye protection.'],
  [22.4, 7, 0, null, 'The site rules, and the risk assessment for your task, may call for more.'],
  [28.4, 8, 0, null, 'Some jobs need extra protection.'],
  [31.6, 9, 0, null, 'Hearing protection.'],
  [34.6, 10, 0, null, 'Respiratory protection.'],
  [37.8, 11, 0, null, 'Face protection.'],
  [40.6, 12, 0, null, 'Chemical-resistant clothing.'],
  [44, 13, 0, null, "And a lifejacket, when you're working near water."],
  [48.8, 14, 0, null, 'Your PPE must be suitable for the job, correctly fitted, and kept in good condition.'],
  [56, 15, 0, null, "If it's damaged, unsuitable, or missing, tell your supervisor before you start work."],
  [63.4, 16, 0, null, "Remember: PPE is the last line of defence. It doesn't replace safe working methods."],
  [72, 17, 0, null, 'Right kit. Worn right. Every time.'],
];

/* ---------------------------------------------------------------- frame */
function render(t) {
  const cam = cameraAt(t);
  setView(cam);
  const fs = labelSize();
  const tag = (x, y, z, text, colr, a = 1, f = fs) => {
    const [px0, py] = P(x, y, z), bw = textW(text.toUpperCase(), f) + f * 1.2, px = keepIn(px0, bw, f * .4);
    if (!inShot(px0, py)) return '';
    return `<g opacity="${f2(a)}"><rect x="${f1(px - bw / 2)}" y="${f1(py - f * 1.6)}" width="${f1(bw)}" height="${f1(f * 1.75)}" rx="${f1(f * .25)}" fill="${colr}"/><text x="${f1(px)}" y="${f1(py - f * .35)}" fill="#fff" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="${f1(f)}" text-anchor="middle">${text.toUpperCase()}</text></g>`;
  };
  // label to one side of a point on the body, joined to it by a leader line
  const callout = (x, y, z, text, side, a) => {
    if (a <= 0) return '';
    const [ax, ay] = P(x, y, z), f = fs * 1.35, bw = textW(text.toUpperCase(), f) + f * 1.2;
    const lx = keepIn(ax + side * (bw / 2 + f * 4), bw, f * .4), ly = ay - f * .6;
    return `<g opacity="${f2(a)}"><line x1="${f1(ax)}" y1="${f1(ay)}" x2="${f1(lx - side * bw / 2)}" y2="${f1(ly)}" stroke="${BLUE}" stroke-width="${f2(f * .14)}"/>` +
      `<circle cx="${f1(ax)}" cy="${f1(ay)}" r="${f1(f * .32)}" fill="${BLUE}" stroke="#fff" stroke-width="${f2(f * .1)}"/>` +
      `<rect x="${f1(lx - bw / 2)}" y="${f1(ly - f * .95)}" width="${f1(bw)}" height="${f1(f * 1.75)}" rx="${f1(f * .25)}" fill="${BLUE}"/>` +
      `<text x="${f1(lx)}" y="${f1(ly + f * .3)}" fill="#fff" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="${f1(f)}" text-anchor="middle">${text.toUpperCase()}</text></g>`;
  };
  const mark = (x, y, z, ok, a, scale = 1) => {
    // green tick or red cross badge
    const [px, py] = P(x, y, z), r = fs * 1.25 * scale, c = ok ? '#2c9a4a' : '#e5483b';
    const g = ok ? `M${f1(px - r * .45)} ${f1(py)} l${f1(r * .3)} ${f1(r * .32)} l${f1(r * .6)} ${f1(-r * .62)}` : `M${f1(px - r * .38)} ${f1(py - r * .38)} l${f1(r * .76)} ${f1(r * .76)} m0 ${f1(-r * .76)} l${f1(-r * .76)} ${f1(r * .76)}`;
    return `<g opacity="${f2(a)}"><circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r)}" fill="${c}" stroke="#fff" stroke-width="${f2(fs * .2)}"/><path d="${g}" stroke="#fff" stroke-width="${f2(r * .28)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  };

  const items = [];
  items.push({ k: -1.2, bb: [-5.6, -1.2, 1, 2], s: STAIR || (STAIR = stair(-5.6, -4.2, -1.2, 1, 2, 2.7)) });
  items.push({ k: 21, s: excavator(8, excavatorPose(t), t) });
  const d = dumperAt(t); items.push({ k: d.x + 1.8 + 9.6, s: dumper(d.x, 8.7, d.dir, t) });
  items.push({ k: 58, s: mixer(44.6, 8.75, t) });
  const rx = 69.6 + 1.6 * Math.sin(t * .55); items.push({ k: rx + 4.9, s: roller(rx, 2.6, t) });
  items.push(...liftWorks(LAYOUT, t));   // the excavator lifting area
  for (const p of CREW) items.push({ k: p.at[0] + p.at[1], s: person({ x: p.at[0], y: p.at[1], dir: p.dir || 1, tool: p.tool, vest: p.vest, work: p.work, seed: p.seed, skin: p.skin, t }) });
  const cu = frac(t / 9), cx = cu < .5 ? lerp(33.4, 39.6, cu * 2) : lerp(39.6, 33.4, (cu - .5) * 2);
  items.push({ k: cx + 3.2, s: person({ x: cx, y: 3.2, moving: true, phase: t * 4.5, dir: cu < .5 ? 1 : -1, tool: 'cat', t }) });

  // 1-2 · the new starter walks in, then kits up by the cabins
  const ns = starterAt(t);
  if (t < 28.4) {
    const kit = Object.fromEntries(KIT.map(([k, at]) => [k, t >= at]));
    items.push({ k: ns.x + ns.y, s: person({ ...ns, dir: ns.moving ? ns.dir : 1, kit, shirt: '#4a5a78', hair: '#3a2a1e', skin: SKINS[2], t }) });
  }
  // 3 · additional PPE, one job each
  items.push({ k: 32.4 + 7.5, bb: [31.7, 33.1, 7.05, 7.95], s: brokenSlab() });
  items.push({ k: 42.8 + 1.2, bb: [42.1, 43.5, 1.04, 1.36], s: pipeX(42.1, 43.5, 1.2, .16, .16, '#c8662a', '#e98a46') });
  items.push({ k: 75.7 + .3, bb: [75.05, 76.3, -.1, .75], s: chemDrums() });
  items.push({ k: 84.2 + 5.85, bb: [83.5, 84.9, 5.2, 6.5], s: tankPlatform() });
  for (const j of JOBS) items.push({ k: j.who.x + j.who.y + (j.who.z ? .1 : 0), s: person({ ...j.who, t }) });
  // 5 · cracked helmet: swapped by the supervisor before work starts
  if (t >= 55.4 && t < 63.4) {
    const swapped = t >= 60.4;
    const w = walkPath([[55.4, 4.4, 6.2], [58.4, .9, 2.6], [63.4, .9, 2.6]], t);
    items.push({ k: w.x + w.y, s: person({ ...w, dir: w.moving ? w.dir : -1, kit: { helmet: swapped }, tool: swapped ? null : 'helmet', skin: SKINS[1], t }) });
    items.push({ k: -.4 + 2.2, s: person({ x: -.4, y: 2.2, dir: 1, tool: 'tablet', raise: ramp(t, 59.4, 59.8) * (1 - ramp(t, 60.2, 60.5)) * .5, t }) });
  }
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  // labels and badges
  let fx = '';
  if (t >= 7 && t < 22.6) for (const [k, at, label, z, side] of KIT) {
    const [x, y] = KIT_SPOT, hand = k === 'gloves', a = ramp(t, at, at + .3) * (1 - ramp(t, 22, 22.5));
    fx += callout(hand ? x + .1 : x, hand ? y + .25 : y, z, label, side, a);
  }
  if (t >= 22.4 && t < 28.2) fx += mark(KIT_SPOT[0], KIT_SPOT[1], 2.25, true, ramp(t, 22.6, 22.9) * (1 - ramp(t, 27.8, 28.2)), 1.2);
  for (const j of JOBS) {
    const a = ramp(t, j.at, j.at + .3) * (1 - ramp(t, j.at + 2.6, j.at + 3));
    if (a > 0) fx += tag(j.who.x, j.who.y, j.head, j.name, BLUE, a, fs * 1.3);
  }
  // dust from the cut-off saw and sparks from the grinder
  if (t > 33 && t < 39) for (let i = 0; i < 9; i++) {
    const u = frac(t * .7 + i / 9), [px, py] = P(42.4 + u * 1.6, 1.2 - u * .4, .35 + u * 1.1);
    fx += `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(4 + u * 16)}" fill="#cfc8bb" opacity="${f2((1 - u) * .55)}" filter="url(#soft)"/>`;
  }
  if (t > 36 && t < 42) {
    const [gx, gy] = P(50.9, 4.55, .95);
    for (let i = 0; i < 14; i++) {
      const a = (i * 2.4 + t * 9) % 6.28, l = 6 + (i * 37 + Math.floor(t * 20) * 13) % 14;
      fx += `<line x1="${f1(gx)}" y1="${f1(gy)}" x2="${f1(gx - 4 - Math.abs(Math.cos(a)) * l)}" y2="${f1(gy + Math.sin(a) * l * .5 + 3)}" stroke="#ffb54a" stroke-width="1.1" opacity=".85"/>`;
    }
  }
  if (t >= 55.4 && t < 63.4) {
    fx += mark(.9, 2.6, 2.3, false, ramp(t, 56.3, 56.6) * (1 - ramp(t, 59.6, 59.9)));
    fx += mark(.9, 2.6, 2.3, true, ramp(t, 60.6, 60.9) * (1 - ramp(t, 62.6, 63)));
  }
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 6.4, 6.9)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  $('dim').style.opacity = f2(ramp(t, 48.6, 49.3) * (1 - ramp(t, 55.2, 55.8)) + ramp(t, 63.2, 63.8));
  document.querySelectorAll('#cards .card').forEach((c, i) => {
    const a = ramp(t, CARD_AT[i], CARD_AT[i] + .5) * (1 - ramp(t, 55, 55.6));
    c.style.opacity = f2(a); c.style.transform = `translateY(${f2((1 - a) * 1.2)}em)`;
  });
  const hoc = $('hoc'), hocOut = 1 - ramp(t, 71.2, 71.8);
  hoc.style.opacity = f2(ramp(t, HOC_AT - .4, HOC_AT) * hocOut);
  hoc.querySelectorAll('.row').forEach((r, i) => { const a = ramp(t, HOC_AT + i * .2, HOC_AT + i * .2 + .3); r.style.opacity = f2(a); r.style.transform = `translateX(${f2((1 - a) * -1)}em)`; });
  hoc.querySelector('.ppe').classList.toggle('on', t >= PPE_AT);
  hoc.querySelectorAll('.r0,.r1,.r2,.r3').forEach(r => r.classList.toggle('safe', t >= SAFE_AT));
  hoc.querySelector('.sub').style.opacity = f2(ramp(t, SAFE_AT, SAFE_AT + .4));
  $('end').style.opacity = f2(ramp(t, 71.6, 72.3));
  $('end').querySelector('.line').style.width = (ramp(t, 72.4, 73.4) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 72.6, 73.2));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 73.4, 74));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 71.6, 73.6) * .7, ns: t < 7 ? ns : null };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  [...KIT.map(k => k[1]), ...JOBS.map(j => j.at), 22.6, 56.3, 60.6, PPE_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  [...CARD_AT, HOC_AT].forEach(tc => { if (cross(tc)) shot('card'); });
  if (cross(72.4)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 8) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
