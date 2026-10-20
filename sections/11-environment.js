/* Section 11: environmental protection.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages.
   The environmental kit (river, silt fence, fuel store, spill kit, washout, skips, wheel wash, sweeper) is drawn here. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 11</div>
      <div class="h">Environmental protection</div>
      <div class="s">Keep pollution out of the water, store and handle substances safely, and report every spill.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="rcard"><div class="oc">
    <div class="hd"><img class="logoimg" alt="CWP"><span>Report it</span></div>
    <div class="row"><b>Environmental incidents</b><small>Spills, leaks, pollution of drains or water</small><i></i></div>
    <div class="row"><b>Near misses</b><small>Anything that nearly caused pollution</small><i></i></div>
    <div class="row"><b>Same as safety incidents</b><small>Tell your supervisor straight away</small><i></i></div>
  </div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Store it right. Keep it out of the water. Report every spill.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 11</div>
    <h1>Environmental protection</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
  onBoot() {
    // the river runs beyond the back fence; drawn under everything else in the back layer
    $('back').insertAdjacentHTML('afterbegin', riverSvg());
    $('back').insertAdjacentHTML('beforeend', '<g id="decal"></g>');
  },
};
// the compact site, stretched to the right for the treatment tank, with a river beyond the back fence
const LAYOUT = { ...LAYOUTS.compact, xEnd: 68, backN: 22, frontN: 14, tank: 61, kiosk: [65.6, 3.4, 0, 1.4, 1.1, 1.6],
  GB: { x: -600, y: -240, w: 2380, h: 1420 }, GS: 1.6 };
const DUR = 64.5;
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
// laid out right to left in the order the voiceover visits them, so the camera only travels one way:
// tank, river & drain → fuel store → spill kit → concrete washout → skips → generator, damping down, wheel wash,
// road sweeper, site hours → site office
const GULLY = [55, 7.4];                                                     // surface water drain by the tank
const BUND = { x0: 49, x1: 52.6, y0: -1.3, y1: 1 };                          // bunded fuel tank
const DRUMS = [46.8, -1.1];                                                  // oil drums on a spill pallet
const COSHH = [45, -1.3];                                                    // chemicals cabinet
const GEN = [49.8, 2.6];                                                     // generator on a drip tray, being refuelled
const KIT = [42.6, 2.6];                                                     // spill kit
const SPILL = [44.5, 3.8];
const WASH = { x0: 34.4, x1: 36.8, y0: .1, y1: 1.8, h: .9 };                 // lined concrete washout
const DRAIN = [38.8, 7.3];                                                   // a gully that gets covered
const SKIPS = [[29.8, 'GENERAL', '#6d7378', '#7d7468'], [27.4, 'TIMBER', '#3d7a3c', '#b08550'], [25, 'METAL', '#2f5d9a', '#8f969b'], [22.6, 'INERT', '#9a6a2c', '#8c7a62']];
const WBOARD = [32.2, .7];                                                   // waste carrier notice
const SILENT = [20.2, -1.6];                                                 // silenced generator
const BOWSER = [29.6, 5.1];                                                    // water bowser for damping down
const DAMP = [28.4, 7.2], SPRAY = [26.6, 9.5];
const WW = { x0: 20.2, x1: 24.4, y0: 8.9, y1: 11.1 };                        // wheel wash before the exit
const HOURS = [8.1, 12.62];
const OFFICE = [-.5, 1.9];                                                   // where the report is made

const WATER_AT = [9.9, 12.4, 13.55, 14.2];                                   // water sector · rivers · drains · watercourses
const FUEL_AT = [16.45, 17.2, 17.9, 20.6, 21.7];                             // fuel · oils · chemicals · stored · handled
const KIT_AT = 23.9, DROP_AT = 25.4, PADS_AT = 27.5, REPORT_AT = 28.2;
const WASH_AT = [30.5, 35.5, 36.7];                                          // washout · drains · unprotected ground
const WASTE_AT = [39.2, 41.4], TOSS_AT = 40;
const NUIS_AT = [44.5, 45.2, 46, 46.6, 47.8];                                // noise · dust · mud · sweeper · disturbance
const REP_AT = [51, 52.6, 54.5];

function refuellerAt(t) {
  // refuels the generator over its drip tray, carries the can off, drops it, fetches the spill kit, reports
  const w = walkPath([[23, 50.4, 4.3], [25.2, 45.6, 4.5], [25.6, 45.6, 4.5], [26.6, 42.95, 3.6], [26.9, 42.95, 3.6], [27.5, 43.7, 4.9]], t);
  return w || { x: 50.4, y: 4.3, moving: false, phase: 0, d: 0 };
}
const SWEEP = t => 34 - 7 * (t - 45.2);                                      // road sweeper's x on the public road
let NOW = 0;

function cameraAt(t) {
  NOW = t;
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  // mobile: step to each item as it's named, instead of one wide shot
  const f = MOBILE && (focusSeq(t, 6.6, 15.6, [
    [6.6, () => [LAYOUT.tank, 2.6, 1.6], 520],
    [WATER_AT[1] - .35, () => [56, -4.8, 0], 440],
    [WATER_AT[2] - .35, () => [GULLY[0], GULLY[1], .3], 440],
    [WATER_AT[3] - .2, () => [54.5, .5, 0], 640],
  ]) || focusSeq(t, 16.4, 23, [
    [16.4, () => [50.8, -.2, 1.2], 440],
    [FUEL_AT[1] - .35, () => [47.5, -.4, .8], 440],
    [FUEL_AT[2] - .35, () => [45.45, -1, 1], 440],
    [FUEL_AT[3] - .4, () => [48.6, 1.2, .8], 600],
  ]) || focusSeq(t, 44.6, 50.3, [
    [44.6, () => [SILENT[0] + .95, SILENT[1] + .55, 1], 460],
    [NUIS_AT[1] - .35, () => [SPRAY[0] + .6, SPRAY[1] - .6, .5], 480],
    [NUIS_AT[2] - .35, () => [(WW.x0 + WW.x1) / 2, (WW.y0 + WW.y1) / 2, .3], 480],
    [NUIS_AT[3] - .35, () => [SWEEP(NOW) + 1.8, 17.4, .8], 480],
    [NUIS_AT[4] - .35, () => [HOURS[0] + .8, HOURS[1], 1.6], 440],
  ], [[OFFICE[0] + .4, OFFICE[1], 1.6], 560]));
  if (f) return f;
  const WIDE = c(31, 3, 0, 2080);
  const M = (d, m) => MOBILE ? m : d;
  // every move between areas is a steady, constant-speed pan ('lin'), always right to left
  const keys = [
    [0, WIDE], [4.4, WIDE],
    [6.6, M(c(59.4, 2.6, 1, 820), c(LAYOUT.tank, 2.6, 1.6, 520))], [15.6, M(c(59.2, 2.6, 1, 800), c(54.5, .5, 0, 640))],
    [16.4, M(c(49.6, 1, 1, 620), c(50.8, -.2, 1.2, 440)), 'lin'], [23, M(c(49.4, 1.2, 1, 600), c(48.6, 1.2, .8, 600))],
    [23.8, c(45, 3.2, 1, 580), 'lin'], [29.7, c(44.8, 3.2, 1, 560)],
    [30.4, c(36.6, 3.6, 1, 620), 'lin'], [38.5, c(36.4, 3.6, 1, 600)],
    [39.2, c(27.4, 1.8, 1, 680), 'lin'], [43.9, c(27.2, 1.8, 1, 660)],
    [44.6, M(c(19.6, 10.6, 0, 920), c(SILENT[0] + .95, SILENT[1] + .55, 1, 460)), 'lin'], [50.3, M(c(19.4, 10.6, 0, 900), c(OFFICE[0] + .4, OFFICE[1], 1.6, 560))],
    [51, M(c(2.6, 1.6, 1.2, 640), c(OFFICE[0] + .4, OFFICE[1], 1.6, 560)), 'lin'], [57, M(c(2.4, 1.6, 1.2, 620), c(OFFICE[0] + .4, OFFICE[1], 1.6, 540))],
    [57.6, WIDE], [64.5, c(31.5, 3, 0, 2060)],
  ];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b, mode] = keys[i + 1];
    if (t <= t1) { const u = t1 - t0 < .2 ? 1 : mode === 'lin' ? clamp((t - t0) / (t1 - t0)) : smooth((t - t0) / (t1 - t0)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u) }; }
  }
  return keys[keys.length - 1][1];
}
// chip captions [from, to, kicker, text]
const CHIPS = [
  [4.4, 15.6, 'Pollution', 'Water sites · rivers · drains · watercourses'],
  [16.4, 23.2, 'Hazardous substances', 'Stored and handled correctly'],
  [23.8, 29.7, 'Spills', 'Spill kit on hand · report it straight away'],
  [30.3, 38.5, 'Washout', 'Never into drains or onto open ground'],
  [39.1, 43.9, 'Waste', 'Segregated · approved disposal'],
  [44.5, 50.3, 'Nuisance', 'Noise · dust · mud · disturbance'],
];

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-11/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, 'Environmental protection.'],
  [4.4, 1, 0, null, 'CWP works in environments where pollution can have serious consequences, particularly on water-sector projects, and near rivers, drains, and watercourses.'],
  [16.4, 2, 0, null, 'Fuel, oils, chemicals, and other hazardous substances must be stored and handled correctly.'],
  [23.8, 3, 0, null, 'Spill kits must be available where required, and any spill must be reported immediately.'],
  [30.3, 4, 0, null, 'Never wash concrete, cement slurry, chemicals, or contaminated water into drains, or onto unprotected ground.'],
  [39.1, 5, 0, null, 'Waste must be segregated, and disposed of through approved arrangements.'],
  [44.5, 6, 0, null, 'Noise, dust, mud on roads, and unnecessary disturbance must be controlled.'],
  [50.9, 7, 0, null, 'Environmental incidents and near misses are to be reported in the same way as safety incidents.'],
  [57.8, 8, 0, null, 'Store it right. Keep it out of the water. Report every spill.'],
];

/* ---------------------------------------------------------------- environmental kit */
const txt = (x, y, s, size, fill, len, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" font-family="Arial" font-weight="700" text-anchor="middle" fill="${fill}" textLength="${len}" lengthAdjust="spacingAndGlyphs"${extra}>${s}</text>`;
// river in the grass strip beyond the back fence: muddy banks, water, ripples, reeds
function riverSvg() {
  const x0 = -9.5, x1 = LAYOUT.xEnd + 3.5, n = 80;
  const edge = (y, amp, ph) => Array.from({ length: n + 1 }, (_, i) => { const x = lerp(x0, x1, i / n); return [x, y + amp * Math.sin(x * .33 + ph), 0]; });
  let s = poly([...edge(-5.95, .08, 1), ...edge(-3.8, .12, 2).reverse()], '#6f6a48');
  s += poly([...edge(-5.55, .14, .4), ...edge(-4.15, .16, 2.6).reverse()], '#4f8196');
  s += poly([...edge(-5.3, .12, .9), ...edge(-4.8, .12, 1.9).reverse()], '#5b90a6', 'opacity=".55"');
  const r = rng(11);
  for (let x = x0 + 1; x < x1; x += 1.7) { const y = -5.2 + r() * .8; s += line3([x, y, 0], [x + .6 + r() * .5, y + .03, 0], '#9cc3d2', 1.2, 'opacity=".7"'); }
  for (let x = x0 + .5; x < x1; x += .9 + r() * .8) { const y = -4.05 + r() * .2; s += line3([x, y, 0], [x - .05, y, .35 + r() * .25], '#4f6b2e', 1.4) + line3([x + .1, y, 0], [x + .18, y, .3], '#5f7d36', 1.2); }
  return s;
}
// silt fence along the inside of the back fence: geotextile on stakes, trapping run-off before it reaches the river
function siltFence(x0, x1, y) {
  let s = poly([[x0, y, 0], [x1, y, 0], [x1, y, .55], [x0, y, .55]], '#262626', 'opacity=".88"');
  s += line3([x0, y, .55], [x1, y, .55], '#111', 1.2);
  for (let x = x0 + .1; x < x1; x += 1.5) s += line3([x, y + .02, -.05], [x, y + .02, .7], '#7a5a36', 2);
  return s;
}
function fuelStore() {
  // concrete bund (low walls all round, 110% capacity) with a steel diesel tank inside
  const { x0, x1, y0, y1 } = BUND, wt = .15, h = .45, W = '#a9a69e';
  let s = poly([[x0, y0, .02], [x1, y0, .02], [x1, y1, .02], [x0, y1, .02]], '#7f7d77');
  s += box(x0, y0, 0, x1 - x0, wt, h, W) + box(x0, y0, 0, wt, y1 - y0, h, W);
  const tx = x0 + .45, ty = y0 + .4, tw = 2.7, td = 1.3;
  for (const [sx, sy] of [[tx + .2, ty + .2], [tx + tw - .3, ty + .2], [tx + .2, ty + td - .3], [tx + tw - .3, ty + td - .3]]) s += box(sx, sy, .02, .1, .1, .2, '#555');
  s += box(tx, ty, .2, tw, td, 1.2, '#2f6d4c');
  s += signXZ(tx + .35, ty + td + .01, 1.15, 1.2, .38, `<rect width="1.2" height=".38" fill="#f2f2ee"/>${txt(.6, .28, 'DIESEL', .24, '#1d1d1d', .9)}`);
  // pump cabinet and hose on the end
  s += box(tx + tw - .55, ty + .25, 1.4, .45, .8, .4, '#3a3d40') + line3([tx + tw - .3, ty + td, 1.5], [tx + tw - .1, ty + td + .1, .6], '#1d1d1d', 2);
  s += box(x1 - wt, y0, 0, wt, y1 - y0, h, W) + box(x0, y1 - wt, 0, x1 - x0, wt, h, W);
  return s;
}
function drumPallet() {
  const [x, y] = DRUMS;
  let s = box(x, y, 0, 1.4, 1.4, .3, '#e8c21e') + poly([[x + .08, y + .08, .3], [x + 1.32, y + .08, .3], [x + 1.32, y + 1.32, .3], [x + .08, y + 1.32, .3]], '#2a2a2a');
  for (const [dx, dy] of [[.35, .35], [1.05, .35], [.35, 1.05], [1.05, 1.05]]) {
    s += cylinderV(x + dx, y + dy, .3, .3, .9, '#2d5c9e', col('#5f7fae'));
    s += line3([x + dx + .1, y + dy + .29, .55], [x + dx + .29, y + dy + .1, .55], col('#2d5c9e', .6), 1) + line3([x + dx + .1, y + dy + .29, .95], [x + dx + .29, y + dy + .1, .95], col('#2d5c9e', .6), 1);
  }
  return s;
}
function coshhCabinet() {
  const [x, y] = COSHH;
  let s = box(x, y, 0, .9, .6, 1.7, '#e8c21e') + line3([x + .45, y + .61, .1], [x + .45, y + .61, 1.6], '#8a7210', 1);
  // flammable diamond and COSHH label on the doors
  s += signXZ(x + .1, y + .62, 1.5, .7, .55, `<rect width=".7" height=".55" fill="#fff"/><path d="M.35 .04 L.5 .2 L.35 .36 L.2 .2 Z" fill="#e5483b"/><path d="M.35 .11 q-.06 .08 0 .15 q.06 -.07 0 -.15" fill="#fff"/>${txt(.35, .5, 'COSHH', .12, '#1d1d1d', .5)}`);
  return s;
}
function generator(x, y, refuelling) {
  // generator on a drip tray
  let s = box(x - .2, y - .2, 0, 1.8, 1.3, .1, '#2a2a2a') + poly([[x - .12, y - .12, .1], [x + 1.52, y - .12, .1], [x + 1.52, y + 1.02, .1], [x - .12, y + 1.02, .1]], '#151515');
  s += box(x, y, .1, 1.4, .9, .9, '#d8a320');
  for (let k = 0; k < 4; k++) s += line3([x + .15 + k * .12, y + .91, .35], [x + .15 + k * .12, y + .91, .8], col('#d8a320', .55), 1.2);
  s += box(x + 1.05, y + .2, 1, .2, .2, .08, '#333');
  return s;
}
function spillKit() {
  const [x, y] = KIT;
  let s = box(x, y, 0, .7, .6, 1, '#f0c419') + box(x - .03, y - .03, 1, .76, .66, .06, '#c99d10');
  s += signXZ(x + .06, y + .61, .85, .58, .34, `<rect width=".58" height=".34" fill="#1f8a43"/>${txt(.29, .15, 'SPILL', .12, '#fff', .4)}${txt(.29, .29, 'KIT', .12, '#fff', .24)}`);
  return s;
}
function washout() {
  // steel skip with a heavy black liner; slurry settles inside, nothing runs out
  const { x0, x1, y0, y1, h } = WASH, b = .08;
  let s = poly([[x0, y0, h], [x1, y0, h], [x1, y1, h], [x0, y1, h]], '#1b1b1b');
  s += poly([[x0 + b, y0 + b, .55], [x1 - b, y0 + b, .55], [x1 - b, y1 - b, .55], [x0 + b, y1 - b, .55]], '#9d9a92');
  s += poly([[x0 + .5, y0 + .5, .56], [x0 + 1.4, y0 + .4, .56], [x0 + 1.2, y0 + 1, .56], [x0 + .4, y0 + 1.1, .56]], '#b4b1a9');
  s += poly([[x0, y1, 0], [x1, y1, 0], [x1, y1, h], [x0, y1, h]], col('#c8a33a', LIGHT.left));
  s += poly([[x1, y0, 0], [x1, y1, 0], [x1, y1, h], [x1, y0, h]], col('#c8a33a', LIGHT.right));
  s += line3([x0, y1, h], [x1, y1, h], '#1b1b1b', 2.4) + line3([x1, y0, h], [x1, y1, h], '#1b1b1b', 2.4);
  s += signXZ(x0 + .3, y1 + .01, .75, 1.8, .34, `<rect width="1.8" height=".34" fill="#fff"/>${txt(.9, .25, 'CONCRETE WASHOUT', .19, '#1d1d1d', 1.6)}`);
  return s;
}
function barrow(x, y) {
  // wheelbarrow tipped up against the washout's front lip
  let s = poly(discYZ(x, y - .1, .2, .2, 12), '#1d1d1d');
  s += line3([x - .25, y + .15, .3], [x - .25, y + .85, .45], '#555', 2) + line3([x + .25, y + .15, .3], [x + .25, y + .85, .45], '#555', 2);
  s += poly([[x - .32, y - .25, .85], [x + .32, y - .25, .85], [x + .34, y + .35, .4], [x - .34, y + .35, .4]], '#2f7a3a');
  s += poly([[x - .26, y - .18, .82], [x + .26, y - .18, .82], [x + .27, y + .25, .45], [x - .27, y + .25, .45]], '#8d8a82');
  return s;
}
function skip(x, y, colr, label, load) {
  const w = 2, d = 1.5, h = 1, b0 = x + .35, b1 = x + w - .35;
  let s = poly([[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]], col(colr, .4));
  s += poly([[x + .12, y + .12, h * .78], [x + w - .12, y + .12, h * .78], [x + w - .12, y + d - .12, h * .78], [x + .12, y + d - .12, h * .78]], load);
  const r = rng(label.length * 7);
  for (let k = 0; k < 7; k++) { const px = x + .3 + r() * 1.3, py = y + .25 + r() * 1; s += line3([px, py, h * .8], [px + .3 + r() * .2, py + (r() - .5) * .3, h * .8], col(load, .7), 2); }
  s += poly([[b0, y + d, 0], [b1, y + d, 0], [x + w, y + d, h], [x, y + d, h]], col(colr, LIGHT.left));
  s += poly([[b1, y, 0], [b1, y + d, 0], [x + w, y + d, h], [x + w, y, h]], col(colr, LIGHT.right));
  s += line3([x, y + d, h], [x + w, y + d, h], col(colr, .5), 2) + line3([x + w, y, h], [x + w, y + d, h], col(colr, .5), 2);
  s += signXZ(x + .35, y + d + .01, .82, 1.3, .3, `<rect width="1.3" height=".3" fill="#fff"/>${txt(.65, .23, label, .2, '#1d1d1d', label.length * .14)}`);
  return s;
}
function wasteBoard() {
  const [x, y] = WBOARD;
  let s = line3([x + .1, y, 0], [x + .1, y, 1.2], '#5f6468', 3) + line3([x + 1.3, y, 0], [x + 1.3, y, 1.2], '#5f6468', 3);
  s += signXZ(x, y + .02, 2, 1.4, .85, `<rect width="1.4" height=".85" fill="#fff" stroke="#5f6468" stroke-width=".03"/><rect width="1.4" height=".26" fill="#1f8a43"/>${txt(.7, .19, 'WASTE', .17, '#fff', .7)}` +
    txt(.7, .45, 'Licensed carrier only', .11, '#1d1d1d', 1.2) + txt(.7, .62, 'Transfer notes kept', .11, '#1d1d1d', 1.1) + txt(.7, .78, 'Ask before you dispose', .09, '#5f6468', 1.1));
  return s;
}
function silencedGen() {
  const [x, y] = SILENT;
  let s = box(x, y, 0, 1.9, 1.1, 1.3, '#3f6b4a');
  for (let k = 0; k < 5; k++) s += line3([x + .2, y + 1.11, .3 + k * .17], [x + 1.1, y + 1.11, .3 + k * .17], col('#3f6b4a', .55), 1.6);
  s += box(x + 1.5, y + .4, 1.3, .14, .14, .3, '#2a2a2a');
  return s;
}
function waterBowser() {
  const [x, y] = BOWSER;
  let s = line3([x - .9, y + .5, .35], [x, y + .5, .5], '#3a3a3a', 2.5);
  s += poly(wheelXZ(x + 1, y + 1, .3, .3, 12), '#1d1d1d');
  s += box(x, y, .35, 2, 1, .95, '#2d5fa3');
  s += signXZ(x + .4, y + 1.01, 1.05, 1.2, .3, `<rect width="1.2" height=".3" fill="#fff"/>${txt(.6, .22, 'WATER', .18, '#2d5fa3', .7)}`);
  s += poly(wheelXZ(x + 1, y + 1.01, .3, .3, 12), '#1d1d1d') + poly(wheelXZ(x + 1, y + 1.02, .3, .12, 8), '#666');
  return s;
}
function wheelWash() {
  const { x0, x1, y0, y1 } = WW, z = .25;
  let s = box(x0 + 1.2, y0 - 1.25, 0, 1.6, .8, .9, '#3d6f8f');                 // recirculation tank
  s += line3([x0 + 2, y0 - .45, .2], [x0 + 2, y0, .1], '#1d1d1d', 2.4);
  s += poly([[x0 - .9, y0, 0], [x0, y0, z], [x0, y1, z], [x0 - .9, y1, 0]], '#6d7276');            // entry ramp
  s += poly([[x1, y0, z], [x1 + .9, y0, 0], [x1 + .9, y1, 0], [x1, y1, z]], '#6d7276');            // exit ramp
  s += poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], '#5a8aa6');
  for (let x = x0 + .2; x < x1; x += .3) s += line3([x, y0, z + .01], [x, y1, z + .01], '#3a3e41', 2);
  s += box(x0, y1, 0, x1 - x0, .12, z + .05, '#7d8287');
  return s;
}
function hoursSign() {
  const [x, y] = HOURS;
  return signXZ(x, y + .02, 2.25, 1.6, 1, `<rect width="1.6" height="1" fill="#fff" stroke="#5f6468" stroke-width=".03"/><rect width="1.6" height=".28" fill="${BLUE}"/>${txt(.8, .2, 'SITE HOURS', .17, '#fff', 1.1)}` +
    txt(.8, .48, 'Mon–Fri 08:00–18:00', .12, '#1d1d1d', 1.3) + txt(.8, .66, 'Sat 08:00–13:00', .12, '#1d1d1d', 1.05) + txt(.8, .86, 'Considerate site', .1, '#1f8a43', 1.05));
}
function sweeper(x, y, t) {
  // road sweeper heading -x: cab at the front, hopper behind, brushes turning under the front
  const L = 3.6, W = 1.8;
  let o = poly([[x + .2, y + .2, 0], [x + L + .3, y + .2, 0], [x + L + .3, y + W + .25, 0], [x + .2, y + W + .25, 0]], '#1a1a1a', 'opacity=".3" filter="url(#blur)"');
  const wheel = (u, side) => poly(wheelXZ(x + u, side, .38, .38, 14), '#1d1d1d') + poly(wheelXZ(x + u, side + .01, .38, .15, 8), '#5a5a5a');
  o += wheel(.7, y) + wheel(2.9, y);
  const [bx, by] = P(x - .1, y + W * .75, 0);
  o += `<ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="11" ry="5" fill="#2a2a2a"/>`;
  for (let k = 0; k < 6; k++) { const a = t * 14 + k * Math.PI / 3; o += `<path d="M${f1(bx)} ${f1(by)} l${f1(Math.cos(a) * 10)} ${f1(Math.sin(a) * 4.6)}" stroke="#d8c37a" stroke-width="1.2"/>`; }
  o += box(x + 1.25, y, .4, L - 1.25, W, 1.75, '#f2f2ee') + poly([[x + 1.25, y + W, 1.3], [x + L, y + W, 1.3], [x + L, y + W, 1.5], [x + 1.25, y + W, 1.5]], '#e07a1a');
  o += box(x, y, .4, 1.25, W, 1.65, '#f2f2ee');
  o += poly([[x, y + .15, 1.15], [x, y + W - .15, 1.15], [x, y + W - .15, 1.9], [x, y + .15, 1.9]], '#2b3a44');
  o += poly([[x + .15, y + W, 1.15], [x + 1.05, y + W, 1.15], [x + 1.05, y + W, 1.9], [x + .15, y + W, 1.9]], '#3a4d59');
  o += beacon(x + .6, y + W / 2, 2.05, t);
  o += wheel(.7, y + W) + wheel(2.9, y + W);
  return o;
}
// static kit, sorted with everything else every frame
for (let x = 23; x < 67.3; x += 3) { const xe = Math.min(x + 3, 67.4); prop(siltFence(x, xe, -2.05), [x, xe, -2.1, -2]); }
prop(fuelStore(), [BUND.x0, BUND.x1, BUND.y0, BUND.y1]);
prop(drumPallet(), [DRUMS[0], DRUMS[0] + 1.4, DRUMS[1], DRUMS[1] + 1.4]);
prop(coshhCabinet(), [COSHH[0], COSHH[0] + .9, COSHH[1], COSHH[1] + .6]);
prop(generator(...GEN), [GEN[0] - .2, GEN[0] + 1.6, GEN[1] - .2, GEN[1] + 1.1]);
prop(spillKit(), [KIT[0], KIT[0] + .7, KIT[1], KIT[1] + .6]);
prop(washout(), [WASH.x0, WASH.x1, WASH.y0, WASH.y1]);
prop(barrow(36, 2.2), [35.6, 36.4, 1.9, 3.1]);
for (const [x, label, colr, load] of SKIPS) prop(skip(x, 0, colr, label, load), [x, x + 2, 0, 1.5]);
prop(wasteBoard(), [WBOARD[0], WBOARD[0] + 1.4, WBOARD[1] - .05, WBOARD[1] + .05]);
prop(silencedGen(), [SILENT[0], SILENT[0] + 1.9, SILENT[1], SILENT[1] + 1.1]);
prop(waterBowser(), [BOWSER[0] - .9, BOWSER[0] + 2, BOWSER[1], BOWSER[1] + 1]);
prop(wheelWash(), [WW.x0 - .9, WW.x1 + .9, WW.y0 - 1.25, WW.y1 + .1]);
prop(line3([38.3, .5, 0], [38.3, .5, .9], '#5f6468', 3) + box(38.2, .4, .85, .2, .2, .1, '#2d5fa3'), [38.2, 38.4, .4, .6]);   // standpipe for the washout hose

/* ---------------------------------------------------------------- sound */
function audioUpdate(F) {
  const ctx = A.ctx; if (!ctx) return;
  const n = ctx.currentTime;
  const busy = F.t > 4 && F.t < 57 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 57.5 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 57 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}
function render(t) {
  const cam = cameraAt(t);
  setView(cam);
  const fs = labelSize();
  const tag = (x, y, z, text, colr, a = 1, f = fs) => {
    if (a <= 0) return '';
    const [px0, py] = P(x, y, z), bw = textW(text.toUpperCase(), f) + f * 1.2, px = keepIn(px0, bw, f * .4);
    if (!inShot(px0, py)) return '';
    return `<g opacity="${f2(a)}"><rect x="${f1(px - bw / 2)}" y="${f1(py - f * 1.6)}" width="${f1(bw)}" height="${f1(f * 1.75)}" rx="${f1(f * .25)}" fill="${colr}"/><text x="${f1(px)}" y="${f1(py - f * .35)}" fill="#fff" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="${f1(f)}" text-anchor="middle">${text.toUpperCase()}</text></g>`;
  };
  const mark = (x, y, z, ok, a, scale = 1) => {
    if (a <= 0) return '';
    const [px, py] = P(x, y, z), r = fs * 1.25 * scale, c = ok ? '#2c9a4a' : '#e5483b';
    const g = ok ? `M${f1(px - r * .45)} ${f1(py)} l${f1(r * .3)} ${f1(r * .32)} l${f1(r * .6)} ${f1(-r * .62)}` : `M${f1(px - r * .38)} ${f1(py - r * .38)} l${f1(r * .76)} ${f1(r * .76)} m0 ${f1(-r * .76)} l${f1(-r * .76)} ${f1(r * .76)}`;
    return `<g opacity="${f2(a)}"><circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r)}" fill="${c}" stroke="#fff" stroke-width="${f2(fs * .2)}"/><path d="${g}" stroke="#fff" stroke-width="${f2(r * .28)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  };

  const items = [];
  items.push({ k: -1.2, bb: [-5.6, -1.2, 1, 2], s: STAIR || (STAIR = stair(-5.6, -4.2, -1.2, 1, 2, 2.7)) });

  // ground decals: the spill, the absorbent pads and boom, the drain and its cover
  let dec = '';
  const grow = ramp(t, DROP_AT, DROP_AT + 1.2);
  if (grow > 0) {
    const r = .2 + .5 * grow, sp = isoCircle(SPILL[0], SPILL[1], r, .01, 22).map(([x, y, z], i) => [x + Math.sin(i * 1.7) * .08 * grow, y + Math.cos(i * 2.3) * .08 * grow, z]);
    dec += poly(sp, '#1f2326', 'opacity=".85"') + poly(isoCircle(SPILL[0] + .1, SPILL[1] - .1, r * .5, .01, 14), '#5a4f7a', 'opacity=".35"');
    dec += poly([[45.45, 4.6, .01], [SPILL[0] + .3, SPILL[1] + .2, .01], [SPILL[0] + .2, SPILL[1] + .35, .01]], '#1f2326', 'opacity=".85"');
    const pads = [[-.35, -.35], [.15, -.35], [-.35, .15], [.15, .15]];
    pads.forEach(([dx, dy], i) => { const a = ramp(t, PADS_AT + i * .15, PADS_AT + i * .15 + .2); if (a > 0) dec += poly([[SPILL[0] + dx, SPILL[1] + dy, .02], [SPILL[0] + dx + .45, SPILL[1] + dy, .02], [SPILL[0] + dx + .45, SPILL[1] + dy + .45, .02], [SPILL[0] + dx, SPILL[1] + dy + .45, .02]], '#f4f4ef', `opacity="${f2(a)}" stroke="#c9c9c2" stroke-width="1"`); });
    const boom = ramp(t, PADS_AT + .6, PADS_AT + .9);
    if (boom > 0) dec += poly(isoCircle(SPILL[0], SPILL[1], .85, .03, 26), 'none', `stroke="#e8e8e2" stroke-width="5" opacity="${f2(boom)}"`) + poly(isoCircle(SPILL[0], SPILL[1], .85, .06, 26), 'none', `stroke="#c9c9c2" stroke-width="1" opacity="${f2(boom)}"`);
  }
  for (const [gx, gy] of [GULLY, DRAIN]) {
    dec += poly([[gx - .3, gy - .3, .01], [gx + .3, gy - .3, .01], [gx + .3, gy + .3, .01], [gx - .3, gy + .3, .01]], '#2b2b2b');
    for (let k = -.2; k <= .21; k += .1) dec += line3([gx + k, gy - .27, .02], [gx + k, gy + .27, .02], '#6c7074', 1.4);
  }
  $('decal').innerHTML = dec;

  // drain cover mat dropped over the gully
  const cov = ramp(t, WASH_AT[1] - .3, WASH_AT[1]);
  if (cov > 0) {
    const z = .5 * (1 - cov), [gx, gy] = DRAIN;
    items.push({ k: gx + gy, bb: [gx - .55, gx + .55, gy - .55, gy + .55], s: `<g opacity="${f2(Math.min(1, cov * 2))}">` + poly([[gx - .55, gy - .55, z], [gx + .55, gy - .55, z], [gx + .55, gy + .55, z], [gx - .55, gy + .55, z]], '#141414', 'stroke="#3a3a3a" stroke-width="1"') + '</g>' });
  }

  // refuelling over the drip tray, then the dropped can and the spill kit
  const rf = refuellerAt(t), atGen = t < 23, carrying = t >= 23 && t < DROP_AT, withPads = t >= 26.6 && t < PADS_AT + .4;
  const talking = t >= REPORT_AT - .1 && t < 30.5;
  let rs = person({ x: rf.x, y: rf.y, dir: atGen ? 1 : rf.moving ? (rf.dir || -1) : (t > 27 ? 1 : -1), moving: rf.moving, phase: rf.phase, work: (atGen && t > 19.8) || (t >= PADS_AT && t < PADS_AT + .9), tool: talking ? 'radio' : carrying || withPads ? 'carry' : undefined, talk: talking, seed: 2, skin: SKINS[1], t });
  if (carrying || atGen) { const [hx, hy] = P(rf.x, rf.y, 0), d = atGen ? 1 : (rf.dir || -1); rs += `<rect x="${f1(hx + d * 6 - 4)}" y="${f1(hy - 30)}" width="8" height="9" rx="1.2" fill="#c8302a" stroke="#7a1a16" stroke-width=".8"/>`; }
  if (withPads && t < PADS_AT) { const [hx, hy] = P(rf.x, rf.y, 0), d = rf.moving ? (rf.dir || -1) : 1; rs += `<rect x="${f1(hx + d * 7 - 5)}" y="${f1(hy - 31)}" width="10" height="6" fill="#f4f4ef" stroke="#c9c9c2" stroke-width=".8"/>`; }
  items.push({ k: rf.x + rf.y, s: rs });
  if (t >= DROP_AT) {
    const u = ramp(t, DROP_AT, DROP_AT + .25), cx = 45.6, cy = 4.7;
    items.push({ k: cx + cy, bb: [cx - .25, cx + .25, cy - .2, cy + .2], s: box(cx - .2, cy - .12, .5 * (1 - u), .4, .25, lerp(.35, .2, u), '#c8302a') });
  }

  // concrete washout: hosing a barrow out into the lined washout
  {
    const wx = 37.3, wy = 2.95, [hx, hy] = P(wx, wy, 0);
    let s = person({ x: wx, y: wy, dir: -1, tool: 'carry', skin: SKINS[3], t });
    const [tx, ty] = P(36, 2.1, .75);
    for (let k = 0; k < 3; k++) { const u = frac(t * 2.4 + k / 3); s += `<path d="M${f1(hx - 7)} ${f1(hy - 24)} Q${f1(lerp(hx - 7, tx, .5))} ${f1(hy - 34)} ${f1(tx)} ${f1(ty)}" stroke="#a9d3e6" stroke-width="2" fill="none" stroke-dasharray="4 5" stroke-dashoffset="${f1(-u * 27)}"/>`; }
    s += `<path d="M${f1(hx - 2)} ${f1(hy - 22)} q-4 10 4 22 l${f1(P(38.3, .5)[0] - hx - 2)} ${f1(P(38.3, .5)[1] - hy)}" stroke="#1d1d1d" stroke-width="1.6" fill="none"/>`;
    items.push({ k: wx + wy, s });
    const [lx, ly] = P(36, 1.85, .7), [sx2, sy2] = P(36, 1.5, .55);
    items.push({ k: 36 + 1.8, bb: [35.9, 36.1, 1.7, 1.9], s: `<path d="M${f1(lx)} ${f1(ly)} L${f1(sx2)} ${f1(sy2)}" stroke="#9d9a92" stroke-width="3" stroke-dasharray="3 3" stroke-dashoffset="${f1(-frac(t * 2) * 6)}"/>` });
  }

  // segregated skips: timber goes in the timber skip
  {
    const w = walkPath([[38.4, 32.6, 4.2], [39.7, 28.4, 2.4], [40.6, 28.4, 2.4], [41.8, 32.2, 4]], t) || { x: 32.6, y: 4.2, moving: false };
    const toss = ramp(t, TOSS_AT, TOSS_AT + .4), hold = t < TOSS_AT;
    items.push({ k: w.x + w.y, s: person({ x: w.x, y: w.y, dir: w.moving ? w.dir : -1, moving: w.moving, phase: w.phase, tool: hold ? 'carry' : undefined, raise: ramp(t, TOSS_AT - .3, TOSS_AT) * (1 - ramp(t, TOSS_AT + .3, TOSS_AT + .6)) * .5, skin: SKINS[0], t }) });
    if (hold) items.push({ k: w.x + w.y + .1, s: line3([w.x - .7, w.y + .25, .95], [w.x + .6, w.y + .25, .95], '#c49a5a', 4) });
    else if (toss < 1) { const px = lerp(28.4, 28.4, toss), py = lerp(2.4, .75, toss), pz = .95 + Math.sin(toss * Math.PI) * .6 - toss * .2; items.push({ k: px + py + .3, s: line3([px - .7, py, pz], [px + .6, py, pz], '#c49a5a', 4) }); }
  }

  // damping down the haul road from the water bowser
  {
    const spraying = t > NUIS_AT[1] - .4 && t < 50.4, [hx, hy] = P(...DAMP, 0), [tx, ty] = P(...SPRAY, 0);
    let s = person({ x: DAMP[0], y: DAMP[1], dir: -1, tool: 'carry', skin: SKINS[2], t });
    s += `<path d="M${f1(hx - 2)} ${f1(hy - 20)} q-6 12 4 20 L${f1(P(BOWSER[0] - .9, BOWSER[1] + .5)[0])} ${f1(P(BOWSER[0] - .9, BOWSER[1] + .5)[1])}" stroke="#1d1d1d" stroke-width="1.6" fill="none"/>`;
    if (spraying) for (let k = 0; k < 4; k++) {
      const u = frac(t * 2 + k / 4), ex = tx + (k - 1.5) * 9, ey = ty + (k - 1.5) * 3;
      s += `<path d="M${f1(hx - 7)} ${f1(hy - 24)} Q${f1(lerp(hx, ex, .5))} ${f1(hy - 46)} ${f1(ex)} ${f1(ey)}" stroke="#bfe0ee" stroke-width="1.6" fill="none" opacity=".8" stroke-dasharray="3 6" stroke-dashoffset="${f1(-u * 36)}"/>`;
      s += `<ellipse cx="${f1(ex)}" cy="${f1(ey)}" rx="9" ry="3.5" fill="#6f8a96" opacity="${f2(.25 * ramp(t, NUIS_AT[1] - .4, NUIS_AT[1] + .6))}"/>`;
    }
    items.push({ k: DAMP[0] + DAMP[1], s });
  }

  // reporting it at the site office
  {
    const w = walkPath([[49.6, 4.6, 6], [52.2, OFFICE[0], OFFICE[1]]], t) || { x: 4.6, y: 6, moving: false };
    items.push({ k: w.x + w.y, s: person({ x: w.x, y: w.y, dir: w.moving ? w.dir : -1, moving: w.moving, phase: w.phase, tool: 'tablet', skin: SKINS[4], t }) });
  }

  // road sweeper on the public road, in front of the hoarding
  if (t > 45 && t < 51) items.push({ k: SWEEP(t) + 16.8, y: 16.8, s: sweeper(SWEEP(t), 16.4, t) });
  items.push({ k: 30, y: 12.7, s: hoursSign() });

  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  let fx = '';
  const G = '#2c9a4a', O = '#e07a1a', R = '#e5483b', on = (a, b) => ramp(t, a, a + .3) * (1 - ramp(t, b, b + .3));
  // where pollution matters
  fx += tag(LAYOUT.tank, 2.6, 3.4, 'Water treatment works', O, on(WATER_AT[0], 15.3));
  fx += tag(56, -4.8, .5, 'River', O, on(WATER_AT[1], 15.3));
  fx += tag(GULLY[0], GULLY[1], .7, 'Surface water drain', O, on(WATER_AT[2], 15.3));
  fx += tag(52.5, -2.05, 1.1, 'Silt fence protects the river', G, on(WATER_AT[3], 15.3), fs * .9);
  // stored and handled correctly
  fx += tag(50.8, -.2, 2.2, 'Fuel', O, on(FUEL_AT[0], 20.2));
  fx += tag(47.5, -.4, 1.75, 'Oils', O, on(FUEL_AT[1], 20.2));
  fx += tag(45.45, -1, 2.35, 'Chemicals', O, on(FUEL_AT[2], 20.2));
  fx += tag(50.8, -.2, 2.2, 'Bunded store', G, on(FUEL_AT[3], 22.9));
  fx += tag(45.45, -1, 2.35, 'COSHH cabinet', G, on(FUEL_AT[3] + .3, 22.9), fs * .9);
  fx += tag(GEN[0] + .7, GEN[1] + .45, 1.55, 'Drip tray', G, on(FUEL_AT[4], 22.9));
  // spill kit and the spill
  fx += tag(KIT[0] + .35, KIT[1] + .3, 1.75, 'Spill kit', G, on(KIT_AT, PADS_AT - .2));
  fx += mark(SPILL[0], SPILL[1], .9, false, on(DROP_AT + .3, PADS_AT - .1)) + tag(SPILL[0], SPILL[1], 1.7, 'Spill', R, on(DROP_AT + .3, PADS_AT - .1));
  fx += tag(SPILL[0], SPILL[1], 1.2, 'Pads & boom', G, on(PADS_AT + .5, 29.4), fs * .9);
  fx += tag(rf.x, rf.y, 2.4, 'Spill reported', G, on(REPORT_AT, 29.4));
  // washout and drains
  fx += tag(35.6, .95, 1.7, 'Lined washout', G, on(WASH_AT[0], WASH_AT[2] - .3));
  fx += tag(DRAIN[0], DRAIN[1], .8, 'Drain covered', G, on(WASH_AT[1], 38.3));
  fx += tag(35.6, .95, 1.7, 'Contained: no run-off', G, on(WASH_AT[2], 38.3));
  // waste
  fx += tag(26.2, .75, 2, 'Segregated waste', G, on(WASTE_AT[0], WASTE_AT[1] - .3));
  fx += tag(WBOARD[0] + .7, WBOARD[1], 2.75, 'Approved waste carrier', G, on(WASTE_AT[1], 43.7), fs * .9);
  // nuisance
  fx += tag(SILENT[0] + .95, SILENT[1] + .55, 1.9, 'Silenced generator', G, on(NUIS_AT[0], 50.1), fs * .9);
  fx += tag(SPRAY[0] + .6, SPRAY[1] - .6, .9, 'Damping down', G, on(NUIS_AT[1], 50.1), fs * .9);
  fx += tag((WW.x0 + WW.x1) / 2, (WW.y0 + WW.y1) / 2, .8, 'Wheel wash', G, on(NUIS_AT[2], 50.1), fs * .9);
  if (t > 45) fx += tag(SWEEP(t) + 1.8, 17.3, 2.7, 'Road sweeper', G, on(NUIS_AT[3], 48.6), fs * .9);
  fx += tag(HOURS[0] + .8, HOURS[1], 2.95, 'Considerate hours', G, on(NUIS_AT[4], 50.1), fs * .9);
  // reporting
  fx += tag(OFFICE[0], OFFICE[1], 2.4, 'Report to your supervisor', G, on(52.3, 56.8), fs * .9);
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 4, 4.4)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  const rc = $('rcard');
  show(rc, ramp(t, 50.8, 51.3) * (1 - ramp(t, 56.8, 57.3)), 1);
  rc.querySelectorAll('.row').forEach((r, i) => r.classList.toggle('ok', t >= REP_AT[i]));
  $('end').style.opacity = f2(ramp(t, 57.2, 57.9));
  $('end').querySelector('.line').style.width = (ramp(t, 58, 59) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 58, 58.6));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 58.8, 59.4));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 57.2, 59.2) * .7, ns: rf };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  [...WATER_AT, ...FUEL_AT, KIT_AT, PADS_AT + .5, REPORT_AT, ...WASH_AT, ...WASTE_AT, ...NUIS_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  REP_AT.forEach(tc => { if (cross(tc)) shot('card'); });
  if (cross(DROP_AT + .2)) shot('thud');
  if (cross(58)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 4) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
