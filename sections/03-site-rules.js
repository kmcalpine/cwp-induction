/* Section 3: site access & general rules.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 3</div>
      <div class="h">Site access &amp; general rules</div>
      <div class="s">How to get around site, and how we expect everyone to behave.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="dim"></div>
  <div id="tiles"><div class="row"><div class="tile"><div class="ic"><svg viewBox="0 0 100 100" fill="none" stroke="#231f20" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="34" cy="26" r="7"/><path d="M34 33 L32 56 L24 76 M32 56 L42 74 M33 40 L52 46"/><circle cx="66" cy="30" r="7"/><path d="M64 37 L70 58 L64 78 M70 58 L78 76 M66 44 L54 47"/><path d="M50 46 l6 -4 m-6 4 l6 4" stroke-width="3"/></svg><svg class="no" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><line x1="19" y1="81" x2="81" y2="19" pathLength="100"/></svg></div><div class="lbl">Horseplay</div></div><div class="tile"><div class="ic"><svg viewBox="0 0 100 100" fill="none" stroke="#231f20" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M30 46 h40 a8 8 0 0 1 8 8 v8 a18 18 0 0 1 -18 18 h-12 a18 18 0 0 1 -18 -18 z"/><path d="M30 46 v-10 a6 6 0 0 1 12 0 v10 M42 46 v-12 a6 6 0 0 1 12 0 v12 M54 46 v-10 a6 6 0 0 1 12 0 v10 M66 46 v-6 a6 6 0 0 1 12 0 v14"/></svg><svg class="no" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><line x1="19" y1="81" x2="81" y2="19" pathLength="100"/></svg></div><div class="lbl">Fighting</div></div><div class="tile"><div class="ic"><svg viewBox="0 0 100 100" fill="none" stroke="#231f20" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 26 h52 a6 6 0 0 1 6 6 v24 a6 6 0 0 1 -6 6 h-30 l-12 12 v-12 h-10 a6 6 0 0 1 -6 -6 v-24 a6 6 0 0 1 6 -6z"/><path d="M34 38 l8 6 m0 -6 l-8 6 M50 38 l8 6 m0 -6 l-8 6"/><circle cx="80" cy="74" r="6"/><path d="M80 80 v10"/></svg><svg class="no" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><line x1="19" y1="81" x2="81" y2="19" pathLength="100"/></svg></div><div class="lbl">Bullying</div></div><div class="tile"><div class="ic"><svg viewBox="0 0 100 100" fill="none" stroke="#231f20" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M30 18 h12 v14 l6 10 v40 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 v-40 l6 -10 z"/><path d="M24 56 h24"/><rect x="56" y="54" width="30" height="14" rx="7" transform="rotate(-30 71 61)"/><path d="M66 70 l10 -16" stroke-width="3"/></svg><svg class="no" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><line x1="19" y1="81" x2="81" y2="19" pathLength="100"/></svg></div><div class="lbl">Alcohol &amp; drugs</div></div></div><div class="verdict">Will not be tolerated</div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Respect the site, and everyone on it.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 3</div>
    <h1>Site access &amp; general rules</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
const LAYOUT = LAYOUTS.standard;
const DUR = 64;
// the gate only stands open while people are coming or going
const GATE_OPEN = [[-1, 5.5], [46.5, 64]];

/* ---------------------------------------------------------------- scene */
const CREW = [
  // at work around the site
  { at: [23.2, 5.4], dir: -1, skin: SKINS[1] }, { at: [29.9, 5.45], dir: -1, skin: SKINS[2] },
  { at: [44.2, 4.2], vest: 'sub', tool: 'rake', work: true, seed: 0 }, { at: [45.6, 3], vest: 'sub', tool: 'rake', work: true, seed: 2, skin: SKINS[3] }, { at: [45, 5.6], vest: 'sub', tool: 'rake', work: true, seed: 4, skin: SKINS[2] },
  { at: [69.2, 6.9], dir: 1, skin: SKINS[4] }, { at: [78.6, 5.6], tool: 'tablet', dir: -1 },
];
// chip captions [from, to, kicker, text]
const CHIPS = [
  [8.6, 16.4, 'Restricted areas', 'Ask before entering another contractor&rsquo;s work area'],
  [17.6, 27.6, 'Housekeeping', 'Keep access routes clear'],
  [28.2, 37, 'Mobile phones', 'Never while operating plant or on safety-critical work'],
  [47.2, 57.8, 'Respect', 'Treat everyone on and around site with respect'],
];
// on-screen tags, each landing with its word in the voiceover
const ROUTE_TAGS = [{ name: 'Pedestrian gate', at: [3.3, 12.5, 3.1] }, { name: 'Crossing point', at: [3.3, 9.8, .5] }, { name: 'Walkway', at: [3.3, 5.6, 1.2] }];
const ROUTE_AT = [2.8, 3.9, 5.1];
const PEOPLE_TAGS = [
  { name: 'Colleagues', pos: () => [1, 7.2, 2.3] },
  { name: 'Subcontractors', pos: () => [5.6, 7.4, 2.3] },
  { name: 'Clients', pos: () => [.2, 4.4, 2.3] },
  { name: 'Members of the public', pos: t => [publicAt(t).x, 14.1, 2.3] },
];
const PEOPLE_AT = [50, 50.7, 51.9, 52.8];
const TILE_AT = [38.3, 39.1, 39.9, 42.3], VERDICT_AT = 43.7;
const CLUTTER = [
  // [what, x, y] lying across the walkway, each cleared to the skip in turn
  ['pipe', 3.3, 7.1], ['bags', 3.6, 6.2], ['hose', 3.1, 5.3], ['box', 3, 4.5],
];
// clean-up: pick-up and drop-in times for each piece (trips: pipe, bags, then hose and box together)
const PICK_AT = [20.1, 22.6, 24.6, 25.3], DROP_AT = [21.7, 23.5, 26.6, 26.6];
const SKIP = [4.7, 4.9];
const TIDY = [[18.8, 3.3, 8.6], [19.7, 3.3, 7.6], [20.1, 3.3, 7.6], [21.3, 4.45, 6.6], [21.7, 4.45, 6.6], [22.2, 3.95, 6.55], [22.6, 3.95, 6.55],
  [23.1, 4.45, 6], [23.5, 4.45, 6], [24.2, 3.5, 5.4], [24.6, 3.5, 5.4], [24.95, 3.3, 5], [25.3, 3.3, 5], [26.2, 4.45, 5.4], [27.6, 4.45, 5.4]];
function publicAt(t) { return walkPath([[46.6, -7, 14.1], [53.4, 1.2, 14.1], [55.4, 1.2, 14.1], [61, 8.6, 14.1]], t) || { x: -7, y: 14.1, moving: false, dir: 1, phase: 0 }; }
function dumperAt(t) {
  if (t >= 27.6 && t < 31.6) return { x: lerp(7, 18.6, (t - 27.6) / 4), dir: 1, phone: true };
  if (t >= 31.6 && t < 37.2) return { x: 18.6, dir: 1, parked: true };
  const a = 6, b = 40, v = 3.2, per = 2 * (b - a) / v;   // turns before the mixer parked at x 44.6
  const u = frac((t + 4) / per) * per, half = per / 2;
  return u < half ? { x: a + v * u, dir: 1 } : { x: b - v * (u - half), dir: -1 };
}
function walkway() {
  // green pedestrian route from the gate, over a marked crossing, to the cabins
  let s = poly([[2.5, 1.1, .01], [4.1, 1.1, .01], [4.1, 8.2, .01], [2.5, 8.2, .01]], '#3f9a52') + poly([[2.5, 11.4, .01], [4.1, 11.4, .01], [4.1, 12.6, .01], [2.5, 12.6, .01]], '#3f9a52');
  for (let y = 1.6; y < 8; y += 1.3) s += poly([[3.1, y, .02], [3.5, y + .3, .02], [3.9, y, .02], [3.9, y + .25, .02], [3.5, y + .55, .02], [3.1, y + .25, .02]], 'rgba(255,255,255,.55)');
  for (let y = 8.35; y < 11.3; y += .55) s += poly([[2.5, y, .015], [4.1, y, .015], [4.1, y + .3, .015], [2.5, y + .3, .015]], '#efefe8');
  s += line3([2.5, 1.1, .02], [2.5, 8.2, .02], '#e8e6df', 1.6) + line3([4.1, 1.1, .02], [4.1, 8.2, .02], '#e8e6df', 1.6);
  return s;
}
function skip(kinds = []) {
  const [x, y] = SKIP;
  let s = box(x, y, 0, 2.2, 1.3, .25, '#2f6fb0') + poly([[x, y + 1.3, .25], [x + 2.2, y + 1.3, .25], [x + 2.6, y + 1.3, 1.2], [x - .4, y + 1.3, 1.2]], col('#2f6fb0', .86)) +
    poly([[x + 2.2, y, .25], [x + 2.2, y + 1.3, .25], [x + 2.6, y + 1.3, 1.2], [x + 2.6, y, 1.2]], col('#2f6fb0', .6)) + poly([[x - .4, y, 1.2], [x + 2.6, y, 1.2], [x + 2.6, y + 1.3, 1.2], [x - .4, y + 1.3, 1.2]], '#3a3530');
  // waste inside rises as each load goes in
  if (kinds.length) {
    const lvl = .45 + .2 * kinds.length;
    const rim = [[x - .4, y, 1.2], [x + 2.6, y, 1.2], [x + 2.6, y + 1.3, 1.2], [x - .4, y + 1.3, 1.2]];
    s += `<clipPath id="skipclip"><polygon points="${pts(rim)}"/></clipPath><g clip-path="url(#skipclip)">` + poly([[x - .4, y, lvl], [x + 2.6, y, lvl], [x + 2.6, y + 1.3, lvl], [x - .4, y + 1.3, lvl]], '#5e5040');
    if (kinds.includes('pipe')) s += line3([x - .1, y + .45, lvl + .1], [x + 2.2, y + .7, lvl + .1], '#c8662a', 6);
    if (kinds.includes('bags')) s += box(x + .2, y + .55, lvl, .5, .4, .2, '#e0ddd2') + box(x + .65, y + .7, lvl, .45, .38, .18, '#d6d2c4');
    if (kinds.includes('box')) s += box(x + 1.3, y + .4, lvl, .45, .45, .25, '#a8834e');
    if (kinds.includes('hose')) { const [cx, cy] = P(x + 1.9, y + .9, lvl + .05); s += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="9" ry="4.5" fill="none" stroke="#1d1d1d" stroke-width="3"/>`; }
    s += '</g>';
  }
  return s;
}
function clutterItem(kind, x, y) {
  if (kind === 'pipe') return pipeX(x - 1.4, x + 1.4, y, .16, .16, '#c8662a', '#e98a46');
  if (kind === 'bags') return box(x - .4, y - .3, 0, .7, .5, .35, '#e0ddd2') + box(x + .1, y + .05, 0, .6, .45, .3, '#d6d2c4');
  if (kind === 'hose') return `<path d="M${P(x - 1, y)} Q${P(x, y + .6)} ${P(x + .4, y - .2)} T${P(x + 1.3, y + .3)}" stroke="#1d1d1d" stroke-width="3" fill="none"/>`.replace(/(-?\d+\.\d+),(-?\d+\.\d+)/g, (m, a, b) => `${(+a).toFixed(1)} ${(+b).toFixed(1)}`);
  return box(x - .35, y - .35, 0, .7, .7, .5, '#a8834e');
}
function tidyAt(t) {
  // labourer walks (about 1.3 m/s) to each piece, lifts it, carries it to the skip
  const w = walkPath(TIDY, t);
  if (!w) return null;
  const carrying = CLUTTER.map(c => c[0]).filter((k, i) => t >= PICK_AT[i] && t < DROP_AT[i]);
  return { ...w, carrying, tool: carrying.length ? 'carry' : null };
}
// what he's holding, just in front of him at waist height
function carriedSvg(kinds, w) {
  const a = w.ang || 0, hx = Math.cos(a), hy = Math.sin(a), px = w.x + hx * .34, py = w.y + hy * .34;
  let o = '';
  if (kinds.includes('pipe')) o += line3([px - hx * .8, py - hy * .8, .98], [px + hx * .8, py + hy * .8, .98], '#c8662a', 7) + line3([px - hx * .8, py - hy * .8, 1.03], [px + hx * .8, py + hy * .8, 1.03], '#e98a46', 2.5);
  if (kinds.includes('bags')) o += box(px - .22, py - .18, .78, .3, .26, .28, '#e0ddd2') + box(px + .02, py - .02, .8, .26, .24, .24, '#d6d2c4');
  if (kinds.includes('box')) o += box(px - .2, py - .2, .82, .4, .4, .3, '#a8834e');
  if (kinds.includes('hose')) { const [cx, cy] = P(px, py, kinds.includes('box') ? 1.16 : .95); o += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="7" ry="3.6" fill="none" stroke="#1d1d1d" stroke-width="2.6"/>`; }
  return o;
}
function cameraAt(t) {
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  const keys = [
    [0, c(3.3, 11.4, 1.3, 520)], [8.4, c(3.3, 7.6, 1, 660)],
    [8.5, c(44.6, 6.6, 1, 620)], [16.4, c(44.8, 6.4, 1, 600)],
    [16.5, c(4, 6, .6, 520)], [27.5, c(4.2, 6, .6, 500)],
    [27.6, c(12, 9.4, 1, 820)], [31.5, c(16.6, 9.6, 1, 760)], [37, c(17.6, 9.8, 1, 700)],
    [37.1, c(4, 9, 1, 900)], [46.4, c(4, 9, 1, 880)],
    [46.5, c(1.6, 9.6, 1, 800)], [58, c(2, 9.8, 1, 760)], [64, c(4, 9, 1, 900)],
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
  const busy = F.t < 37 || F.t > 46.5 ? 1 : .35;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 58.5 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 44 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-3/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
// Lines are recorded as whole sentences and split at their pauses, so each item lands on its picture.
const VO = [
  [1, 0, 0, null, 'Only use the designated site entrances, access routes, and pedestrian walkways.'],
  [9, 1, 0, null, "Don't enter restricted areas, or another contractor's work area, without permission."],
  [18, 2, 0, null, 'Keep your work area tidy, and never let materials, tools, or waste block an access route.'],
  [28.4, 3, 0, null, "Don't use your mobile phone while operating plant, or doing any safety-critical task."],
  [38.2, 4, 0, null, 'Horseplay, fighting, bullying, or working under the influence of alcohol or drugs, will not be tolerated.'],
  [47.6, 5, 0, null, 'Treat everyone with respect: colleagues, subcontractors, clients, and members of the public.'],
  [59.4, 6, 0, null, 'Respect the site, and everyone on it.'],
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
  const mark = (x, y, z, ok, a, scale = 1) => {
    // green tick or red cross badge
    const [px, py] = P(x, y, z), r = fs * 1.25 * scale, c = ok ? '#2c9a4a' : '#e5483b';
    const g = ok ? `M${f1(px - r * .45)} ${f1(py)} l${f1(r * .3)} ${f1(r * .32)} l${f1(r * .6)} ${f1(-r * .62)}` : `M${f1(px - r * .38)} ${f1(py - r * .38)} l${f1(r * .76)} ${f1(r * .76)} m0 ${f1(-r * .76)} l${f1(-r * .76)} ${f1(r * .76)}`;
    return `<g opacity="${f2(a)}"><circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r)}" fill="${c}" stroke="#fff" stroke-width="${f2(fs * .2)}"/><path d="${g}" stroke="#fff" stroke-width="${f2(r * .28)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  };
  const phoneIcon = (x, y, z, a) => {
    const [px, py] = P(x, y, z), r = fs * 1.7;
    return `<g opacity="${f2(a)}"><circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r)}" fill="#fff" stroke="#e5483b" stroke-width="${f2(fs * .28)}"/><rect x="${f1(px - r * .28)}" y="${f1(py - r * .5)}" width="${f1(r * .56)}" height="${f1(r)}" rx="${f1(r * .1)}" fill="#231f20"/><line x1="${f1(px - r * .7)}" y1="${f1(py + r * .7)}" x2="${f1(px + r * .7)}" y2="${f1(py - r * .7)}" stroke="#e5483b" stroke-width="${f2(fs * .28)}"/></g>`;
  };

  const inSkip = CLUTTER.map(c => c[0]).filter((k, i) => t >= DROP_AT[i] && t < 27.6);
  const items = [{ k: -100, s: walkway() }, { k: 7.8, bb: [SKIP[0], SKIP[0] + 2.2, SKIP[1], SKIP[1] + 1.3], s: skip(inSkip) }];
  items.push({ k: -1.2, bb: [-5.6, -1.2, 1, 2], s: STAIR || (STAIR = stair(-5.6, -4.2, -1.2, 1, 2, 2.7)) });
  items.push({ k: 21, s: excavator(8, excavatorPose(t), t) });
  const d = dumperAt(t); items.push({ k: d.x + 1.8 + 9.6, s: dumper(d.x, 8.7, d.dir, t, d.parked) });
  items.push({ k: 58, s: mixer(44.6, 8.75, t) });
  const rx = 69.6 + 1.6 * Math.sin(t * .55); items.push({ k: rx + 4.9, s: roller(rx, 2.6, t) });
  items.push(...liftWorks(LAYOUT, t));   // the excavator lifting area
  for (const p of CREW) {
    const foreman = p.at[0] === 45 && p.at[1] === 5.6;
    items.push({ k: p.at[0] + p.at[1], s: person({ x: p.at[0], y: p.at[1], dir: foreman && t > 10 && t < 16.4 ? 1 : p.dir || 1, tool: p.tool, vest: p.vest, work: p.work && !(foreman && t > 10 && t < 16.4), seed: p.seed, skin: p.skin, raise: foreman ? ramp(t, 12.4, 12.7) * (1 - ramp(t, 13.8, 14.1)) * .7 : 0, t }) });
  }
  const cu = frac(t / 9), cx = cu < .5 ? lerp(33.4, 39.6, cu * 2) : lerp(39.6, 33.4, (cu - .5) * 2);
  items.push({ k: cx + 3.2, s: person({ x: cx, y: 3.2, moving: true, phase: t * 4.5, dir: cu < .5 ? 1 : -1, tool: 'cat', t }) });

  // 1 · designated route: a worker comes in through the gate
  if (t < 8.5) { const w = walkPath([[.4, 3.3, 14.3], [2, 3.3, 11.8], [3.1, 3.3, 11.8], [5.4, 3.3, 8], [8.4, 3.3, 3.8]], t); if (w) items.push({ k: w.x + w.y, y: w.y, s: person({ ...w, skin: SKINS[2], t }) }); }
  // 2 · restricted area: stops at the edge until the contractor waves him in
  if (t >= 8.5 && t < 16.5) { const w = walkPath([[8.5, 39.4, 9.6], [10.8, 42.4, 7.2], [13.8, 42.4, 7.2], [16.4, 44, 6.6]], t); items.push({ k: w.x + w.y, s: person({ ...w, dir: w.moving ? w.dir : 1, skin: SKINS[1], t }) }); }
  // 3 · housekeeping
  if (t >= 16.5 && t < 27.6) {
    CLUTTER.forEach(([kind, x, y], i) => { if (t < PICK_AT[i]) items.push({ k: x + y - .5, s: clutterItem(kind, x, y) }); });
    const w = tidyAt(t);
    if (w) {
      // carried load sits in front of him when he's walking towards the camera, behind when walking away
      const load = carriedSvg(w.carrying, w), body = person({ ...w, skin: SKINS[4], t }), towards = Math.cos(w.ang || 0) + Math.sin(w.ang || 0) > 0;
      items.push({ k: w.x + w.y, s: towards ? body + load : load + body.replace(/^<!--p:[^>]*-->/, '') });
      if (!towards) items[items.length - 1].s = `<!--p:${f2(w.x)},${f2(w.y)}-->` + items[items.length - 1].s;
    }
  }
  // 4 · phones: driver steps off the parked dumper to take the call
  if (t >= 31.6 && t < 37.2) { const w = walkPath([[31.6, 19.4, 10.5], [33, 19.6, 11.8], [37.2, 19.6, 11.8]], t); items.push({ k: w.x + w.y, s: person({ ...w, dir: w.moving ? w.dir : 1, tool: 'radio', talk: t > 33.2, skin: SKINS[3], t }) }); }
  // 6 · respect: people on and around the gate
  if (t >= 46.5) {
    const pb = publicAt(t);
    items.push({ k: pb.x + pb.y, y: pb.y, s: person({ ...pb, casual: '#7d4e8c', hair: '#5a3a22', skin: SKINS[2], t }) });
    items.push({ k: 3.3 + 12.2, s: person({ x: 3.3, y: 12.2, dir: -1, raise: ramp(t, 53, 53.3) * (1 - ramp(t, 54.4, 54.7)) * .6, skin: SKINS[1], t }) });
    for (const [x, y, dir, sk] of [[.6, 7.4, 1, 0], [1.5, 7, -1, 3]]) items.push({ k: x + y, s: person({ x, y, dir, skin: SKINS[sk], t }) });
    items.push({ k: 13, s: person({ x: 5.6, y: 7.4, dir: -1, vest: 'sub', skin: SKINS[4], t }) });
    items.push({ k: 4.6, s: person({ x: .2, y: 4.4, dir: 1, casual: '#3a3f47', hair: '#2a2a2a', skin: SKINS[0], t }) });
    items.push({ k: 5.2, s: person({ x: 1.1, y: 4.1, dir: -1, tool: 'tablet', t }) });
  }
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');

  // tags and badges
  let fx = '';
  if (t < 8.5) ROUTE_TAGS.forEach((r, i) => { fx += tag(...r.at, r.name, '#2c9a4a', ramp(t, ROUTE_AT[i], ROUTE_AT[i] + .3) * (1 - ramp(t, 8, 8.4))); });
  if (t >= 8.5 && t < 16.5) {
    const ok = t > 13.8;
    fx += poly([[42.9, 1.9, .03], [51.1, 1.9, .03], [51.1, 6.9, .03], [42.9, 6.9, .03]], ok ? 'rgba(44,154,74,.14)' : 'rgba(229,72,59,.14)', `stroke="${ok ? '#2c9a4a' : '#e5483b'}" stroke-width="${f2(fs * .22)}" stroke-dasharray="${f1(fs * .6)} ${f1(fs * .4)}" opacity="${f2(ramp(t, 9.4, 9.9))}"`);
    fx += tag(47, 6.9, 2.4, "Contractor's work area", '#7a7f1c', ramp(t, 9.6, 10) * (1 - ramp(t, 16, 16.4)));
    fx += mark(42.4, 7.2, 2.3, false, ramp(t, 11, 11.3) * (1 - ramp(t, 13.4, 13.7)));
    fx += mark(42.4, 7.2, 2.3, true, ramp(t, 13.8, 14.1) * (1 - ramp(t, 16, 16.4)));
  }
  if (t >= 16.5 && t < 27.6) {
    fx += tag(3.3, 6, 2.4, 'Obstructed', '#e5483b', ramp(t, 18.6, 19) * (1 - ramp(t, 20.4, 20.8)));
    fx += mark(3.3, 6, 1, false, ramp(t, 18.6, 19) * (1 - ramp(t, 20.4, 20.8)), 1.2);
    fx += tag(3.3, 6, 2.4, 'Clear', '#2c9a4a', ramp(t, 26.7, 27) * (1 - ramp(t, 27.3, 27.6)));
    fx += mark(3.3, 6, 1, true, ramp(t, 26.7, 27) * (1 - ramp(t, 27.3, 27.6)), 1.2);
  }
  if (t >= 27.6 && t < 31.6) fx += phoneIcon(d.x + 2.9 * (d.dir > 0 ? 0 : 1) + .6, 9.6, 3.2, ramp(t, 28.4, 28.7));
  if (t >= 33.2 && t < 37.2) fx += mark(19.6, 11.8, 2.6, true, ramp(t, 33.6, 33.9) * (1 - ramp(t, 36.8, 37.1)));
  if (t >= 46.5) PEOPLE_TAGS.forEach((p, i) => { const [x, y, z] = p.pos(t); fx += tag(x, y, z, p.name, BLUE, ramp(t, PEOPLE_AT[i], PEOPLE_AT[i] + .3) * (1 - ramp(t, 57.6, 58)), fs * .85); });
  $('gate').innerHTML = pedGate(gateOpen(t));
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 7.6, 8.1)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  $('dim').style.opacity = f2(ramp(t, 37.2, 37.8) * (1 - ramp(t, 46, 46.6)) + ramp(t, 58.2, 58.8));
  const tilesOut = 1 - ramp(t, 45.8, 46.4);
  document.querySelectorAll('#tiles .tile').forEach((el, i) => {
    const a = ramp(t, TILE_AT[i] - .5, TILE_AT[i] - .1) * tilesOut;
    el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * 1)}em)`;
    const strike = ramp(t, TILE_AT[i], TILE_AT[i] + .35);
    el.querySelector('.no line').style.strokeDashoffset = f1(100 - strike * 100);
    el.querySelector('.no circle').style.opacity = f2(strike);
  });
  const v = ramp(t, VERDICT_AT, VERDICT_AT + .3) * tilesOut;
  $('tiles').querySelector('.verdict').style.opacity = f2(v);
  $('tiles').querySelector('.verdict').style.transform = `scale(${f2(.9 + v * .1)})`;
  $('end').style.opacity = f2(ramp(t, 58.6, 59.3));
  $('end').querySelector('.line').style.width = (ramp(t, 59.4, 60.4) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 59.6, 60.2));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 60.4, 61));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  const walker = t < 8.5 ? walkPath([[.4, 3.3, 14.3], [2, 3.3, 11.8], [3.1, 3.3, 11.8], [5.4, 3.3, 8], [8.4, 3.3, 3.8]], t) : null;
  return { t, on: 1 - ramp(t, 58.6, 60.6) * .7, ns: walker };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  [...ROUTE_AT, ...PEOPLE_AT, 11, 13.8, 18.6, 26.7, 28.4, 33.6].forEach(tc => { if (cross(tc)) shot('ping'); });
  TILE_AT.forEach(tc => { if (cross(tc)) shot('card'); });
  if (cross(VERDICT_AT)) shot('whoosh');
  if (cross(59.4)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 12) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
