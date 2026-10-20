/* Section 12: fire and emergency arrangements.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 12</div>
      <div class="h">Fire &amp; emergency arrangements</div>
      <div class="s">Raise the alarm, know your way out, and know who can help.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Raise the alarm. Know your way out. Know who can help.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 12</div>
    <h1>Fire &amp; emergency arrangements</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
// the compact compound: cabins, gate and assembly point on the left, then this section's own areas
const LAYOUT = { ...LAYOUTS.compact, tank: null };   // no treatment tank: nothing here needs it
const DUR = 60;
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
// chip captions [from, to, kicker, text]
const CHIPS = [
  [4, 10.6, 'Fire', 'Raise the alarm · follow the emergency arrangements'],
  [11.2, 18.1, 'Tackling a fire', 'Only if trained, safe, and with a clear escape route'],
  [18.6, 25.7, 'Know your site', 'Emergency exits · assembly point · fire-fighting equipment'],
  [26.8, 32.2, 'Hot works', 'Permit and controls in place first'],
  [33, 40.5, 'Serious accident', 'Call the emergency services · notify site management'],
  [41, 45.6, 'Injured person', "Don't move them unless they're in immediate danger"],
  [46, 51.6, 'First aid', 'Know your first aiders and where the kit is'],
];
// laid out in the order the voiceover visits them: the fire by the skip, the evacuation to the
// assembly point (front left), then left to right: hot works → accident by the store → first aid point
const SKIP = [16.4, 18.4, 2.6, 3.8], FIRE = [17.4, 3.2];
const FP = [13.2, 6.4];                                   // fire point: call point and extinguishers
const FP2 = [.3, 1.25];                                   // second fire point, between the office and the welfare unit
const GATE = [3.3, 12.6], ASSEMBLY = [-4.5, 10.8];
const HW = { x0: 24.4, x1: 27.8, y: 3.6 }, PERMIT = [22.8, 4.9];
const STORE = [34, 1.4, 3, 1.4, 2.5], STEP = [35.6, 3.45];
const AID = [44, 7.5];                                  // first aid point
// timings
const IGNITE = 2, DISCOVER = 4, ALARM_AT = 6, EVAC_AT = 7.7, SPRAY = [12.4, 16.2];
const TRAINED_AT = 13.2, SAFE_AT = 14.4, ESCAPE_AT = 15.9;
const EXIT_AT = 20.9, ASM_AT = 21.8, FFE_AT = 22.9, SWAP = 25.6, CLEAR = 32.5;
const PERMIT_AT = 29, WATCH_AT = 30;
const FALL_AT = 33.3, LAND_AT = 33.85, CALL_AT = 35.3, NOTIFY_AT = 38.3, REACH_AT = 41.6, BACK_AT = 43.6, DANGER_AT = 44;
const AIDER_AT = 46.4, KIT_AT = 48.9;

// fire size 0–1: catches in the skip, burns, then knocked down by the extinguisher
const fireLevel = t => ramp(t, IGNITE, DISCOVER) * (1 - ramp(t, SPRAY[0] + .4, SPRAY[1]));
const smokeLevel = t => ramp(t, IGNITE, DISCOVER) * (1 - ramp(t, SPRAY[1], SPRAY[1] + 2.4));

// people in the fire scene: everyone walks out to the assembly point along the haul road
const EVAC = {
  finder: [[3.4, 19.6, 5.6], [5.8, 13.8, 7.1], [6.9, 13.8, 7.1], [8, 12.6, 9.6], [20.4, -4, 10.2]],
  w2: [[6.6, 21.5, 5], [8.6, 20.6, 9.4], [22, -4.7, 10.9]],
  w3: [[6.9, 23.5, 3.5], [9.3, 22.4, 9.8], [23.2, -3.9, 11.4]],
  welfare: [[7, 3.3, 1.7], [11, 2.2, 8.4], [14.6, -1.2, 11.8], [17, -5, 11.9]],
  manager: [[7.4, -.5, 1.6], [9, -.8, 6], [12, -2.9, 8.9]],
  marshal: [[6.8, 11.2, 3.6], [8.4, 13.9, 6.9], [8.9, 13.9, 6.9], [10.8, 16, 5], [18.2, 16, 5], [19.4, 15.4, 8.8], [31, -4.9, 10.1]],
};
// the accident crew: a fitter on a stepladder at the store, a colleague nearby, another who comes over, the first aider
const CALLER = [[25.6, 31, 6.8], [33.9, 31, 6.8], [34.9, 31.6, 5.8]];
const HELPER = [[25.6, 40.4, 6.9], [39.8, 40.4, 6.9], [41.4, 37, 4.9], [BACK_AT, 37, 4.9], [BACK_AT + .7, 37.8, 5.3]];
const AIDER = [[25.6, AID[0] + .2, AID[1] + .6], [40.6, AID[0] + .2, AID[1] + .6], [44.6, STEP[0] - 1.1, 6.6]];

// walkPath, but standing at the start point before the walk begins
const at = (path, t) => walkPath(path, Math.max(t, path[0][0]));
function casualtyAt(t) {
  // up the stepladder fixing a light → topples backwards → lies on the ground
  if (t < FALL_AT) return { y: STEP[1] + .1, z: .95, rot: 0 };
  const u = ramp(t, FALL_AT, LAND_AT);
  return { y: lerp(STEP[1] + .1, STEP[1] + 1.1, u), z: .95 * (1 - u * u), rot: -112 * Math.min(1, u * 1.15) };
}
function cameraAt(t) {
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  // mobile: step to each place as it's named
  const f = MOBILE && focusSeq(t, 18.4, 25.6, [
    [18.4, () => [GATE[0], GATE[1] - 1, 1], 440],
    [ASM_AT - .4, () => [ASSEMBLY[0] + .4, ASSEMBLY[1] - .2, 1], 440],
    [FFE_AT - .4, () => [FP2[0] + .6, FP2[1] + .8, 1], 420],
  ]);
  if (f) return f;
  // moves between areas are steady, constant-speed pans ('lin'); after the evacuation everything runs left to right
  const keys = [
    [0, c(22, 4, 1, 1500)], [3, c(16.4, 5, 1, 620)], [17.9, c(16.2, 5, 1, 600)],
    [20.6, c(-.4, 7.4, 1, 760), 'lin'], [SWAP, c(-.3, 7.4, 1, 750)],
    [27.2, c(25.6, 4.3, 1, 520), 'lin'], [32.1, c(25.8, 4.3, 1, 520)],
    [33.1, c(35.2, 5, 1, 520), 'lin'], [47.9, c(35.4, 5, 1, 510)],
    [48.9, c(40.4, 6.6, 1, 580), 'lin'], [51.8, c(40.6, 6.6, 1, 580)],
    [53, c(22, 4, 1, 1500)], [60, c(23, 4, 1, 1480)],
  ];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b, mode] = keys[i + 1];
    if (t <= t1) { const u = t1 - t0 < .2 ? 1 : mode === 'lin' ? clamp((t - t0) / (t1 - t0)) : smooth((t - t0) / (t1 - t0)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u) }; }
  }
  return keys[keys.length - 1][1];
}

/* ---------------------------------------------------------------- drawing helpers for this section */
function extinguisherV(x, y, band) {
  // a 9 kg extinguisher standing on the ground: red body, coloured band, black head and hose
  return cylinderV(x, y, .11, 0, .55, '#c8102e') + cylinderV(x, y, .112, .36, .09, band) + cylinderV(x, y, .05, .55, .07, '#222') + line3([x + .05, y + .05, .58], [x + .12, y + .12, .3], '#222', 1.6);
}
function firePoint(x, y, ext) {
  // two posts, red FIRE POINT board with a manual call point, extinguishers on a stand in front
  let o = line3([x, y, 0], [x, y, 1.75], '#7d7d7d', 2) + line3([x + 1.2, y, 0], [x + 1.2, y, 1.75], '#7d7d7d', 2);
  o += signXZ(x - .05, y + .02, 1.95, 1.3, .3, `<rect width="1.3" height=".3" fill="#c8102e"/><text x=".65" y=".22" font-size=".17" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="1.05" lengthAdjust="spacingAndGlyphs">FIRE POINT</text>`);
  o += fireAlarm(x + .1, y + .02, 1.55);
  o += box(x + .4, y + .15, 0, .75, .35, .04, '#5f6468');
  if (ext.includes(0)) o += extinguisherV(x + .58, y + .32, '#111');
  if (ext.includes(1)) o += extinguisherV(x + .95, y + .32, '#f1e6c8');
  return o;
}
function skipBin() {
  // yellow skip: sloped ends, open top full of timber offcuts and packaging
  const [x0, x1, y0, y1] = SKIP, h = .95, Y = '#e0a92a';
  let o = poly([[x0 - .25, y0, h], [x1 + .25, y0, h], [x1 + .25, y1, h], [x0 - .25, y1, h]], '#3a3026');
  o += poly([[x0, y1, 0], [x1, y1, 0], [x1 + .25, y1, h], [x0 - .25, y1, h]], col(Y, .95));
  o += poly([[x1, y0, 0], [x1, y1, 0], [x1 + .25, y1, h], [x1 + .25, y0, h]], col(Y, .7));
  for (const [a, b] of [[[x0 + .2, y0 + .3, h - .1], [x0 + 1.1, y0 + .9, h + .05]], [[x0 + .8, y0 + .2, h], [x1 - .2, y0 + .7, h - .05]], [[x0 + 1.2, y1 - .2, h - .05], [x1 - .1, y0 + .4, h + .08]]]) o += line3(a, b, '#b88b55', 3);
  o += line3([x0 - .25, y1, h], [x1 + .25, y1, h], col(Y, .8), 2);
  return o;
}
function flames(f, t) {
  if (f <= 0) return '';
  let o = '';
  for (let i = 0; i < 6; i++) {
    const [px, py] = P(SKIP[0] + .3 + i * .3, FIRE[1] + (i % 2 ? .2 : -.2), .95);
    const h = (12 + 9 * Math.sin(t * 9 + i * 1.7) + 5 * (i % 3)) * f, w = 5 * (.5 + .5 * f);
    o += `<path d="M${f1(px - w)} ${f1(py)} Q${f1(px - w * .6)} ${f1(py - h * .6)} ${f1(px + Math.sin(t * 7 + i) * 2)} ${f1(py - h)} Q${f1(px + w * .7)} ${f1(py - h * .5)} ${f1(px + w)} ${f1(py)} Z" fill="#f05a28"/>`;
    o += `<path d="M${f1(px - w * .5)} ${f1(py)} Q${f1(px - w * .3)} ${f1(py - h * .4)} ${f1(px)} ${f1(py - h * .65)} Q${f1(px + w * .35)} ${f1(py - h * .35)} ${f1(px + w * .5)} ${f1(py)} Z" fill="#ffc93c"/>`;
  }
  return o;
}
function smoke(s, t) {
  if (s <= 0) return '';
  const [bx, by] = P(...FIRE, 1.3);
  let o = '';
  for (let k = 0; k < 7; k++) {
    const ph = frac(t * .3 + k / 7);
    o += `<circle cx="${f1(bx + ph * 34 + Math.sin(k * 2.3) * 5)}" cy="${f1(by - ph * 80)}" r="${f1(6 + ph * 16)}" fill="#55534f" opacity="${f2(s * .5 * (1 - ph))}" filter="url(#blur)"/>`;
  }
  return o;
}
// extinguisher held at a person's side (screen space from their feet); spray = 0–1 jet towards (tx, ty)
function heldExtinguisher(px, py, dir, spray, tx, ty, t) {
  const hx = px + 7 * dir, hy = py - 24;
  let o = `<rect x="${f1(hx - 3)}" y="${f1(hy)}" width="6" height="15" rx="2.2" fill="#c8102e"/><rect x="${f1(hx - 3)}" y="${f1(hy + 4)}" width="6" height="3" fill="#111"/><rect x="${f1(hx - 1.6)}" y="${f1(hy - 3)}" width="3.2" height="3.4" fill="#222"/>`;
  const nx = hx + 9 * dir, ny = hy + 5;
  o += `<path d="M${f1(hx)} ${f1(hy - 1)} Q${f1(hx + 5 * dir)} ${f1(hy + 2)} ${f1(nx)} ${f1(ny)}" stroke="#222" stroke-width="1.6" fill="none"/>`;
  if (spray > 0) {
    const a = Math.atan2(ty - ny, tx - nx), L = Math.hypot(tx - nx, ty - ny) * spray, sp = 10 + Math.sin(t * 30) * 2;
    const ex = nx + Math.cos(a) * L, ey = ny + Math.sin(a) * L, qx = -Math.sin(a) * sp, qy = Math.cos(a) * sp;
    o += `<path d="M${f1(nx)} ${f1(ny)} L${f1(ex + qx)} ${f1(ey + qy)} L${f1(ex - qx)} ${f1(ey - qy)} Z" fill="#f4f4f4" opacity=".7" filter="url(#blur)"/>`;
  }
  return o;
}
function hotWorks(t, on) {
  // pipe on trestles behind red welding screens; sparks while the grinder runs
  let o = '';
  for (const x0 of [HW.x0 - .2, (HW.x0 + HW.x1) / 2 + .05]) {
    const x1 = x0 + 1.75, q = [[x0, HW.y - .55, .1], [x1, HW.y - .55, .1], [x1, HW.y - .55, 1.8], [x0, HW.y - .55, 1.8]];
    o += poly(q, 'rgba(196,40,32,.55)') + poly(q, 'none', 'stroke="#5f6468" stroke-width="1.6"') + line3([x0 + .1, HW.y - .8, 0], [x0 + .1, HW.y - .3, 0], '#5f6468', 2) + line3([x1 - .1, HW.y - .8, 0], [x1 - .1, HW.y - .3, 0], '#5f6468', 2);
  }
  for (const x of [HW.x0 + .5, HW.x1 - .5]) o += line3([x, HW.y - .3, 0], [x, HW.y, .62], '#8a6a42', 2.2) + line3([x, HW.y + .3, 0], [x, HW.y, .62], '#8a6a42', 2.2) + line3([x - .2, HW.y, .62], [x + .2, HW.y, .62], '#8a6a42', 3);
  o += pipeX(HW.x0, HW.x1, HW.y, .75, .16, '#5f666c', '#8a9299');
  return o;
}
function sparks(px, py, t) {
  let o = '';
  for (let i = 0; i < 9; i++) {
    const ph = frac(t * 3 + i / 9), a = .2 + i * .17, L = 6 + ph * 22;
    const x0 = px + Math.cos(a) * ph * 18, y0 = py + Math.sin(a) * ph * 18 + ph * ph * 10;
    o += `<path d="M${f1(x0)} ${f1(y0)} l${f1(Math.cos(a) * L * .25)} ${f1(Math.sin(a) * L * .25)}" stroke="${i % 2 ? '#ffd23c' : '#ff8a2a'}" stroke-width="1.3" opacity="${f2(1 - ph)}" stroke-linecap="round"/>`;
  }
  return o;
}
function hotWorksPermit(x, y) {
  let o = line3([x, y, 0], [x, y, 1.45], '#7d7d7d', 2) + line3([x + 1.1, y, 0], [x + 1.1, y, 1.45], '#7d7d7d', 2);
  o += signXZ(x - .05, y + .02, 1.7, 1.2, .82, `<rect width="1.2" height=".82" fill="#fff" stroke="#e07a1a" stroke-width=".03"/><rect width="1.2" height=".2" fill="#e07a1a"/>` +
    `<text x=".6" y=".15" font-size=".12" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="1.02" lengthAdjust="spacingAndGlyphs">HOT WORKS PERMIT</text>` +
    [0, 1, 2].map(k => `<rect x=".1" y="${(.3 + k * .1).toFixed(2)}" width="${(.62 - k * .12).toFixed(2)}" height=".04" fill="#9aa0a4"/>`).join('') +
    `<g transform="rotate(-12 .9 .6)"><rect x=".66" y=".5" width=".46" height=".18" rx=".03" fill="none" stroke="#2c9a4a" stroke-width=".03"/><text x=".89" y=".63" font-size=".1" font-family="Arial" font-weight="700" text-anchor="middle" fill="#2c9a4a" textLength=".38" lengthAdjust="spacingAndGlyphs">ISSUED</text></g>`);
  return o;
}
function store() {
  // steel store container with a task light being fitted over its doors
  const [x, y, w, d, h] = STORE;
  let o = box(x, y, 0, w, d, h, '#3f6f8f');
  for (let xx = x + .15; xx < x + w; xx += .2) o += line3([xx, y + d + .01, .05], [xx, y + d + .01, h - .05], 'rgba(0,0,0,.14)', 1);
  o += signXZ(x + .9, y + d + .02, h - .35, 1.2, .3, `<text x=".6" y=".24" font-size=".26" font-family="Arial" font-weight="700" text-anchor="middle" fill="#e8e6df">STORE</text>`);
  o += box(STEP[0] - .2, y + d, 2.05, .4, .06, .22, '#e9e9e2');
  return o;
}
function stepladder(x, y) {
  // aluminium stepladder, open, back legs towards the store
  const fy = y + .45, by = y - .4, top = 1.15;
  let o = '';
  for (const dx of [-.22, .22]) o += line3([x + dx, by, 0], [x + dx * .8, y, top], '#9aa2a8', 2.2);
  for (const dx of [-.25, .25]) o += line3([x + dx, fy, 0], [x + dx * .8, y, top], '#b9c0c6', 2.4);
  for (let z = .25; z < top; z += .3) { const u = z / top; o += line3([x - .25 + .05 * u, lerp(fy, y, u), z], [x + .25 - .05 * u, lerp(fy, y, u), z], '#b9c0c6', 2); }
  o += box(x - .2, y - .1, top, .4, .2, .04, '#7d868d');
  return o;
}
function firstAidPoint(x, y) {
  // first aid point: green kit box and AED cabinet on posts, with the first aiders board
  let o = line3([x, y, 0], [x, y, 1.9], '#7d7d7d', 2) + line3([x + 1.3, y, 0], [x + 1.3, y, 1.9], '#7d7d7d', 2);
  o += signXZ(x - .05, y + .02, 2.15, 1.4, .3, `<rect width="1.4" height=".3" fill="#1f8a43"/><text x=".7" y=".22" font-size=".17" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="1.2" lengthAdjust="spacingAndGlyphs">FIRST AID POINT</text>`);
  o += signXZ(x + .05, y + .03, 1.7, .55, .45, `<rect width=".55" height=".45" rx=".04" fill="#1f8a43"/><path d="M.23 .1 h.09 v.08 h.08 v.09 h-.08 v.08 h-.09 v-.08 h-.08 v-.09 h.08 z" fill="#fff"/>`);
  o += signXZ(x + .7, y + .03, 1.75, .5, .55, `<rect width=".5" height=".55" rx=".04" fill="#2c9a4a"/><path d="M.25 .38 l-.1 -.1 a.055 .055 0 0 1 .1 -.07 a.055 .055 0 0 1 .1 .07 z" fill="#fff"/><path d="M.18 .27 l.05 -.04 .03 .06 .04 -.05" stroke="#2c9a4a" stroke-width=".02" fill="none"/><text x=".25" y=".5" font-size=".09" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff">AED</text>`);
  o += signXZ(x + .1, y + .03, 1.1, 1.1, .5, `<rect width="1.1" height=".5" fill="#fff" stroke="#1f8a43" stroke-width=".02"/><rect width="1.1" height=".13" fill="#1f8a43"/><text x=".55" y=".1" font-size=".08" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength=".9" lengthAdjust="spacingAndGlyphs">FIRST AIDERS</text>` +
    [0, 1, 2].map(k => `<rect x="${(.1 + k * .34).toFixed(2)}" y=".18" width=".22" height=".24" fill="#cfd6db"/><circle cx="${(.21 + k * .34).toFixed(2)}" cy=".26" r=".05" fill="#8a949b"/><rect x="${(.13 + k * .34).toFixed(2)}" y=".44" width=".16" height=".03" fill="#9aa0a4"/>`).join(''));
  return o;
}
// the first aider: a green cross on the helmet and the kit in hand
function aiderBadge(px, py, dir, carrying) {
  let o = `<rect x="${f1(px + dir * 1 - 3)}" y="${f1(py - 51)}" width="6" height="6" fill="#1f8a43"/><path d="M${f1(px + dir * 1 - .8)} ${f1(py - 50)} h1.6 v1.7 h1.7 v1.6 h-1.7 v1.7 h-1.6 v-1.7 h-1.7 v-1.6 h1.7 z" fill="#fff"/>`;
  if (carrying) o += `<rect x="${f1(px + 6 * dir - 4)}" y="${f1(py - 22)}" width="8" height="6.5" rx="1" fill="#1f8a43"/><path d="M${f1(px + 6 * dir - .7)} ${f1(py - 21)} h1.4 v1.6 h1.6 v1.4 h-1.6 v1.6 h-1.4 v-1.6 h-1.6 v-1.4 h1.6 z" fill="#fff"/>`;
  return o;
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-12/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, 'Fire, and emergency arrangements.'],
  [4, 1, 0, null, 'If you discover a fire, raise the alarm immediately, and follow the site emergency arrangements.'],
  [11.2, 2, 0, null, 'Only attempt to tackle a fire if you are trained, it is safe to do so, and you have a clear escape route.'],
  [18.6, 3, 0, null, 'Make yourself familiar with the emergency exits, the assembly point, and the location of fire-fighting equipment.'],
  [26.8, 4, 0, null, 'Hot works require the appropriate authorisation and controls.'],
  [33, 5, 0, null, 'In the event of a serious accident, contact the emergency services where necessary, and notify site management.'],
  [41, 6, 0, null, 'Do not move an injured person unless they are in immediate danger.'],
  [46, 7, 0, null, 'You must know who the first aiders are, and where the first aid equipment is located.'],
  [52.4, 8, 0, null, 'Raise the alarm. Know your way out. Know who can help.'],
];

/* ---------------------------------------------------------------- sound */
function audioUpdate(F) {
  const ctx = A.ctx; if (!ctx) return;
  const n = ctx.currentTime;
  const busy = F.t > 4 && F.t < 52 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.06 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.3 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 52.5 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 52 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}
// this section's own sounds: the site fire alarm (a sounder) and the extinguisher's hiss
function sfx(kind) {
  const ctx = A.ctx; if (!ctx) return;
  const t = ctx.currentTime, g = ctx.createGain(); g.connect(A.out);
  if (kind === 'sounder') {
    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(960, t); o.frequency.setValueAtTime(760, t + .2);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022, t + .01); g.gain.setValueAtTime(.022, t + .38); g.gain.linearRampToValueAtTime(0, t + .4);
    o.connect(g); o.start(t); o.stop(t + .42);
  }
  if (kind === 'hiss') {
    const s = ctx.createBufferSource(); s.buffer = A.white; const b = ctx.createBiquadFilter(); b.type = 'highpass'; b.frequency.value = 2500;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .05); g.gain.setValueAtTime(.07, t + .3); g.gain.linearRampToValueAtTime(0, t + .36);
    s.connect(b); b.connect(g); s.start(t, Math.random()); s.stop(t + .4);
  }
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
  const walker = path => at(path, t);

  const items = [];
  items.push({ k: -1.2, bb: [-5.6, -1.2, 1, 2], s: STAIR || (STAIR = stair(-5.6, -4.2, -1.2, 1, 2, 2.7)) });

  // fire scene: skip, fire point, smoke and flames
  const fl = fireLevel(t), took = t >= EVAC.marshal[2][0];
  items.push({ k: (SKIP[0] + SKIP[1]) / 2 + (SKIP[2] + SKIP[3]) / 2, bb: [SKIP[0] - .25, SKIP[1] + .25, SKIP[2], SKIP[3]], s: skipBin() + flames(fl, t) });
  items.push({ k: FP[0] + .6 + FP[1] + .3, bb: [FP[0], FP[0] + 1.2, FP[1], FP[1] + .5], s: firePoint(...FP, took && t < SWAP ? [1] : [0, 1]) });
  items.push({ k: FP2[0] + .6 + FP2[1] + .3, bb: [FP2[0], FP2[0] + 1.2, FP2[1], FP2[1] + .5], s: firePoint(...FP2, [0, 1]) });

  // the evacuation (chapter one), cleared once the camera has moved on
  let finder = null;
  if (t < CLEAR) {
    finder = walker(EVAC.finder);
    const raise = ramp(t, ALARM_AT - .2, ALARM_AT + .2) * (1 - ramp(t, ALARM_AT + .7, ALARM_AT + 1));
    const settle = (p, face) => p.moving ? p.dir : face;
    items.push({ k: finder.x + finder.y, s: person({ ...finder, dir: t < 3.4 ? -1 : settle(finder, 1), work: t < 3.4, raise, seed: 2, skin: SKINS[1], tool: t < 3.4 ? 'spade' : undefined, t }) });
    const w2 = walker(EVAC.w2), w3 = walker(EVAC.w3);
    items.push({ k: w2.x + w2.y, s: person({ ...w2, dir: t < EVAC.w2[0][0] ? 1 : settle(w2, 1), work: t < EVAC.w2[0][0], seed: 4, skin: SKINS[2], t }) });
    items.push({ k: w3.x + w3.y, s: person({ ...w3, dir: t < EVAC.w3[0][0] ? -1 : settle(w3, 1), work: t < EVAC.w3[0][0], seed: 5, skin: SKINS[3], t }) });
    const wf = walker(EVAC.welfare);
    if (t >= EVAC.welfare[0][0]) items.push({ k: wf.x + wf.y, s: person({ ...wf, dir: settle(wf, 1), skin: SKINS[0], t }) });
    const mg = walker(EVAC.manager);
    if (t >= EVAC.manager[0][0]) items.push({ k: mg.x + mg.y, s: person({ ...mg, dir: settle(mg, -1), tool: 'tablet', skin: SKINS[4], t }) });
    // the trained marshal: takes an extinguisher from the fire point and knocks the fire down from upwind
    const ms = walker(EVAC.marshal);
    const sp = ramp(t, SPRAY[0], SPRAY[0] + .3) * (1 - ramp(t, SPRAY[1], SPRAY[1] + .2));
    let s = person({ ...ms, dir: settle(ms, t > 20 ? 1 : 1), tool: took ? undefined : 'tablet', skin: SKINS[1], t });
    if (took && t < 26) { const [px, py] = P(ms.x, ms.y, 0), [tx, ty] = P(...FIRE, 1.1); s += heldExtinguisher(px, py, ms.moving ? ms.dir : 1, sp, tx, ty, t); }
    items.push({ k: ms.x + ms.y, s });
  }

  // chapter two crews appear once the camera is at the assembly point, well away from their areas
  const two = t >= SWAP;
  items.push({ k: (HW.x0 + HW.x1) / 2 + HW.y - .4, bb: [HW.x0 - .2, HW.x1 + .2, HW.y - .8, HW.y + .3], s: hotWorks(t, two) });
  items.push({ k: PERMIT[0] + .55 + PERMIT[1], bb: [PERMIT[0], PERMIT[0] + 1.1, PERMIT[1] - .05, PERMIT[1] + .05], s: hotWorksPermit(...PERMIT) });
  if (two) {
    const welder = { x: 25.5, y: HW.y + .75 };
    let s = person({ ...welder, dir: 1, tool: 'grinder', work: true, extra: { visor: true }, seed: 1, skin: SKINS[2], t });
    const [wx, wy] = P(welder.x, welder.y, 0);
    s += sparks(wx + 17, wy - 22, t);
    items.push({ k: welder.x + welder.y, s });
    const watch = { x: 28.6, y: 5.6 }, [ax, ay] = P(watch.x, watch.y, 0);
    items.push({ k: watch.x + watch.y, s: person({ ...watch, dir: -1, skin: SKINS[0], t }) + heldExtinguisher(ax, ay, -1, 0, 0, 0, t) });
  }
  // accident at the store
  const [sx0, sy0, sw, sd, sh] = STORE;
  items.push({ k: sx0 + sw / 2 + sy0 + sd / 2, bb: [sx0, sx0 + sw, sy0, sy0 + sd], s: store() });
  items.push({ k: STEP[0] + STEP[1] - .1, bb: [STEP[0] - .3, STEP[0] + .3, STEP[1] - .4, STEP[1] + .45], s: stepladder(...STEP) });
  let cas = null, helper = null, aider = null, caller = null;
  if (two) {
    cas = casualtyAt(t);
    const body = person({ x: STEP[0], y: cas.y, z: cas.z, dir: 1, raise: cas.rot ? 0 : .7, skin: SKINS[3], t });
    let s = body;
    if (cas.rot) {
      const [px, py] = P(STEP[0], cas.y, cas.z), [gx, gy] = P(STEP[0], cas.y, 0), r = cas.rot * Math.PI / 180, lay = cas.z < .1 ? .42 * 1.8 * S : 0;
      s = `<ellipse cx="${f1(gx + Math.sin(r) * lay)}" cy="${f1(gy - Math.cos(r) * lay + 1)}" rx="${f1(lay ? 30 : 10)}" ry="${f1(lay ? 7 : 3.2)}" fill="#2a2010" opacity=".33"/><g transform="rotate(${f1(cas.rot)} ${f1(px)} ${f1(py)})">${body.replace(/<ellipse[^>]*opacity="\.33"\/>/, '')}</g>`;
    }
    items.push({ k: STEP[0] + cas.y + (cas.y > STEP[1] + .5 ? .5 : .1), s });
    caller = walker(CALLER);
    const talk = (t > CALL_AT - .2 && t < CALL_AT + 2.4) || (t > NOTIFY_AT - .2 && t < NOTIFY_AT + 1.9);
    items.push({ k: caller.x + caller.y, s: person({ ...caller, dir: caller.moving ? caller.dir : 1, tool: t < 34 ? 'carry' : 'radio', talk, carrying: [], skin: SKINS[0], t }) });
    helper = walker(HELPER);
    const reach = ramp(t, REACH_AT - .1, REACH_AT + .4) * (1 - ramp(t, BACK_AT - .3, BACK_AT)) * .5;
    items.push({ k: helper.x + helper.y, s: person({ ...helper, dir: helper.moving ? helper.dir : -1, raise: reach, skin: SKINS[2], seed: 6, t }) });
    aider = walker(AIDER);
    const [ax, ay] = P(aider.x, aider.y, 0), adir = aider.moving ? aider.dir : 1;
    items.push({ k: aider.x + aider.y, s: person({ ...aider, dir: adir, skin: SKINS[4], t }) + aiderBadge(ax, ay, adir, true) });
  }
  items.push({ k: AID[0] + .65 + AID[1], bb: [AID[0], AID[0] + 1.3, AID[1] - .05, AID[1] + .05], s: firstAidPoint(...AID) });
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  let fx = smoke(smokeLevel(t), t);
  // discover, raise the alarm, evacuate
  const o10 = 1 - ramp(t, 10.3, 10.7);
  fx += tag(FIRE[0], FIRE[1], 2.6, 'Fire!', '#e5483b', ramp(t, DISCOVER, DISCOVER + .3) * o10);
  fx += tag(FP[0] + .4, FP[1] + .7, 2.6, 'Alarm raised', '#e07a1a', ramp(t, ALARM_AT, ALARM_AT + .3) * o10);
  if (t < CLEAR) { const w2 = at(EVAC.w2, t); fx += tag(w2.x, w2.y, 2.4, 'Evacuate', '#2c9a4a', ramp(t, EVAC_AT, EVAC_AT + .3) * o10, fs * .9); }
  // tackling it: trained, safe, escape route behind
  if (t < CLEAR) {
    const ms = at(EVAC.marshal, t), o18 = 1 - ramp(t, 17.8, 18.2);
    fx += tag(ms.x, ms.y, 2.3, 'Trained', '#2c9a4a', ramp(t, TRAINED_AT, TRAINED_AT + .3) * o18, fs * .9);
    fx += tag(FIRE[0] + .3, FIRE[1], 2.9, 'Safe to do so', '#2c9a4a', ramp(t, SAFE_AT, SAFE_AT + .3) * o18, fs * .9);
    const ea = ramp(t, ESCAPE_AT, ESCAPE_AT + .4) * o18;
    if (ea > 0) {
      const [ax, ay] = P(16, 5.6, 0), [bx, by] = P(15.6, 7.9, 0), an = Math.atan2(by - ay, bx - ax), hw = 6;
      fx += `<g opacity="${f2(ea)}"><path d="M${f1(ax)} ${f1(ay)} L${f1(bx)} ${f1(by)}" stroke="#2c9a4a" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 5"/><path d="M${f1(bx + Math.cos(an) * 6)} ${f1(by + Math.sin(an) * 6)} L${f1(bx - Math.sin(an) * hw)} ${f1(by + Math.cos(an) * hw)} L${f1(bx + Math.sin(an) * hw)} ${f1(by - Math.cos(an) * hw)} Z" fill="#2c9a4a"/></g>`;
      fx += tag(15.6, 8.2, .3, 'Clear escape route', '#2c9a4a', ea, fs * .9);
    }
  }
  // know your site
  const o25 = 1 - ramp(t, 25.3, 25.7);
  fx += tag(GATE[0], GATE[1], 2.8, 'Emergency exit', '#2c9a4a', ramp(t, EXIT_AT, EXIT_AT + .3) * o25);
  fx += tag(ASSEMBLY[0], ASSEMBLY[1] - 1.3, 3.3, 'Assembly point', '#2c9a4a', ramp(t, ASM_AT, ASM_AT + .3) * o25);
  fx += tag(FP2[0] + .6, FP2[1], 2.5, 'Fire-fighting equipment', '#2c9a4a', ramp(t, FFE_AT, FFE_AT + .3) * o25);
  // hot works controls
  const o32 = 1 - ramp(t, 32, 32.4);
  fx += tag(PERMIT[0] + .55, PERMIT[1], 2.2, 'Hot works permit', '#2c9a4a', ramp(t, PERMIT_AT, PERMIT_AT + .3) * o32);
  fx += tag(28.6, 5.6, 2.5, 'Fire watch & extinguisher', '#2c9a4a', ramp(t, WATCH_AT, WATCH_AT + .3) * o32);
  // the accident
  if (cas) {
    fx += tag(STEP[0] - .3, STEP[1] + 1.6, 1.1, 'Serious accident', '#e5483b', ramp(t, LAND_AT + .1, LAND_AT + .4) * (1 - ramp(t, CALL_AT - .4, CALL_AT - .1)));
    fx += tag(caller.x, caller.y, 2.4, 'Emergency services called', '#2c9a4a', ramp(t, CALL_AT, CALL_AT + .3) * (1 - ramp(t, NOTIFY_AT - .5, NOTIFY_AT - .2)), fs * .9);
    fx += tag(caller.x, caller.y, 2.4, 'Site management notified', '#2c9a4a', ramp(t, NOTIFY_AT, NOTIFY_AT + .3) * (1 - ramp(t, 40.4, 40.8)), fs * .9);
    const bad = ramp(t, REACH_AT, REACH_AT + .3) * (1 - ramp(t, BACK_AT - .1, BACK_AT + .2));
    fx += mark(helper.x, helper.y, 2.3, false, bad) + tag(helper.x, helper.y, 3.1, "Don't move them", '#e5483b', bad);
    fx += tag(STEP[0] - .3, STEP[1] + 1.6, 1.1, 'Unless in immediate danger', '#e07a1a', ramp(t, DANGER_AT, DANGER_AT + .3) * (1 - ramp(t, 45.5, 45.9)), fs * .9);
    fx += tag(aider.x, aider.y, 2.5, 'First aider', '#1f8a43', ramp(t, AIDER_AT, AIDER_AT + .3) * (1 - ramp(t, 51.4, 51.8)));
  }
  fx += tag(AID[0] + .65, AID[1], 2.6, 'First aid kit & AED', '#1f8a43', ramp(t, KIT_AT, KIT_AT + .3) * (1 - ramp(t, 51.6, 52)));
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 3.6, 4)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  $('end').style.opacity = f2(ramp(t, 52, 52.7));
  $('end').querySelector('.line').style.width = (ramp(t, 52.8, 53.8) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 52.8, 53.4));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 53.6, 54.2));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 52, 54) * .7, ns: t < CLEAR ? at(EVAC.finder, t) : null };
}
let nextSounder = 0, nextHiss = 0;
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  [DISCOVER, TRAINED_AT, SAFE_AT, ESCAPE_AT, EXIT_AT, ASM_AT, FFE_AT, PERMIT_AT, WATCH_AT, CALL_AT, NOTIFY_AT, AIDER_AT, KIT_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  if (cross(REACH_AT)) shot('beep');
  if (cross(LAND_AT)) shot('thud');
  if (nextSounder > F.t + 1) nextSounder = 0;   // after a seek back
  if (nextHiss > F.t + 1) nextHiss = 0;
  // the fire alarm sounds from the call point until everyone is out
  if (F.t >= ALARM_AT && F.t < SWAP - .4 && F.t >= nextSounder) { sfx('sounder'); nextSounder = F.t + .42; }
  if (F.t >= SPRAY[0] && F.t < SPRAY[1] && F.t >= nextHiss) { sfx('hiss'); nextHiss = F.t + .3; }
  if (cross(53)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 4) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
