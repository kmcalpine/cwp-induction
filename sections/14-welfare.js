/* Section 14: welfare, housekeeping and behaviour.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 14</div>
      <div class="h">Welfare, housekeeping &amp; behaviour</div>
      <div class="s">Clean facilities, clean hands, and clear routes, all day, every day.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="washcard"><div class="oc">
    <div class="hd"><img class="logoimg" alt="CWP"><span>Wash your hands after</span></div>
    <div class="row"><b>Chemicals</b><small>Fuels, oils, resins, cleaning products</small><i></i></div>
    <div class="row"><b>Concrete &amp; cement</b><small>Wet cement burns skin</small><i></i></div>
    <div class="row"><b>Contaminated materials</b><small>Soil, sludge, waste</small><i></i></div>
    <div class="row"><b>Drainage work</b><small>Sewage and dirty water</small><i></i></div>
  </div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Keep it clean. Wash your hands. Keep it clear.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 14</div>
    <h1>Welfare, housekeeping &amp; behaviour</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
// the small compound: cabins, a cut-away welfare unit, then the yard laid out in voiceover order
const LAYOUT = { ...LAYOUTS.compact, tank: null };   // no treatment tank: nothing here needs it
const DUR = 52.2;
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
// chip captions [from, to, kicker, text]
const CHIPS = [
  [4.4, 9.8, 'Welfare', 'Kept clean and tidy'],
  [10.2, 14.8, 'Welfare', 'Toilets · washing · rest areas'],
  [15.2, 26.2, 'Wash your hands', 'Before eating, drinking or smoking'],
  [26.6, 31.2, 'Smoking &amp; vaping', 'Designated areas only'],
  [31.8, 38.8, 'Keep it clear', 'Access routes · emergency equipment · work areas'],
  [39.3, 44.5, 'Housekeeping', 'Everyone, all day'],
];
// laid out left to right in the order the voiceover visits them, so the camera only travels one way:
// welfare unit (toilets → washroom → rest area) → smoking shelter → walkway → fire point → working area → waste bins
const WU = { x0: 9.6, x1: 19.4, y0: -1.9, y1: 1.1, h: 2.7, fl: .25, cut: 1.35 };   // welfare unit, roof and front cut away
const ROOMS = { wc: [9.6, 12.4], wash: [12.4, 15], rest: [15, 19.4] };
const DOORS = [[10.7, 11.5], [13.2, 14], [16, 16.8]];                                 // doorways in the cut front wall
const SHELTER = { x0: 21.6, x1: 24.6, y0: -1.5, y1: -.45 };                            // designated smoking shelter
const WALK = { x0: 26.2, x1: 33.6, y0: 4.4, y1: 5.4 };                                 // pedestrian route
const FIRE = [35.2, 4];                                                                // fire point board
const WORK = { x0: 38, x1: 44, y0: 6.7, y1: 8 };                                       // working area by the tank
const BINS = [[46, 'General', '#3b4045'], [47.5, 'Timber', '#8a5a2b'], [49, 'Metal', '#2c6fb0'], [50.5, 'Plastic', '#d4a21a']];
const BIN_Y = 6, BIN_D = .9;
const REVEAL_AT = 5;                                                                    // closed unit fades away to show inside
const CLEAN_AT = [6.4, 8.2], ROOM_AT = [11.5, 12.2, 13.6], WASH_AT = [17.6, 20.4, 21.2, 22, 23.6];
const SMOKE_AT = [27, 29.2], ROUTE_AT = 31.8, FIREPT_AT = 34.2, AREA_AT = 36.6, HOUSE_AT = [39.9, 41.5];   // the three phrases ~1 s apart
const ROUTE_CLR = [32.5, 33.4], FIRE_CLR = [34.9, 35.8], AREA_CLR = [37.3, 38.2];

// the hand-washer: walks in off the haul road, washes, then goes through to the rest area to eat
const WASHER = [[12.5, 8.6, 9.6], [15.6, 13.6, 3.2], [16.6, 13.6, 1.4], [17, 13.6, .7], [17.6, 13.6, -.9], [23.8, 13.6, -.9], [24.4, 14.2, .5], [24.6, 15, .5], [25.6, 17, .5]];
const washerAt = t => walkPath(WASHER, t) || { x: WASHER[0][1], y: WASHER[0][2], moving: false, phase: 0, dir: 1 };
// floor level inside the unit (people step up through the doorway)
const floorZ = (x, y) => x > WU.x0 && x < WU.x1 && y < WU.y1 + .25 ? WU.fl * clamp((WU.y1 + .25 - y) / .4) : 0;
// the smoker: lights up by the welfare unit, then moves to the shelter
const SMOKER = [[27.7, 21, 3.6], [29.1, 22.4, -.05]];
const smokerAt = t => walkPath(SMOKER, t) || { x: SMOKER[0][1], y: SMOKER[0][2], moving: false, phase: 0, dir: 1 };
// pallet of bags in front of the fire point, pulled clear on a pallet truck
const palletX = t => FIRE[0] - .6 + 1.9 * ramp(t, FIRE_CLR[0], FIRE_CLR[1]);
// housekeeping: one sweeps along the bins, one carries offcuts to the timber skip
const SWEEP = t => ({ x: 45 + 1.4 * (.5 - .5 * Math.cos((t - 38.7) * 1.2)), y: 7.4 });
const CARRIER = [[40.1, 44.6, 8.2], [41.2, 47.5, 8.2], [41.9, 48.1, 7.45], [43.1, 48.1, 7.45], [43.7, 48.6, 8.2], [44.7, 51.6, 8.2]];

function cameraAt(t) {
  // mobile: step to each room as it's named, instead of one wide shot
  const f = MOBILE && focusSeq(t, 10.2, 14.8, [
    [10.2, () => [11, -.4, 1], 420],
    [ROOM_AT[0] + .3, () => [13.7, -.4, 1], 420],
    [ROOM_AT[2] - .5, () => [17.2, -.4, 1], 440],
  ]);
  if (f) return f;
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  // the wash-hands card sits on the right (top on a phone), so the washroom is framed to the left (lower)
  const washShot = MOBILE ? c(13.8, -.6, 3.2, 400) : c(15.65, -2.65, 1.2, 470);
  // every move between areas is a steady, constant-speed pan ('lin'), always left to right
  const keys = [
    [0, c(24, 4, 1, 1500)], [4.4, c(14.5, -.4, 1.2, MOBILE ? 760 : 640)], [9.8, c(14.6, -.4, 1.2, MOBILE ? 740 : 620)],
    [14.8, c(14.6, -.4, 1.2, MOBILE ? 740 : 620)], [15.6, washShot], [23.8, { ...washShot, w: washShot.w - 10 }],
    [25.8, MOBILE ? c(17, .3, 1, 420) : c(17.2, -.3, 1.2, 520), 'lin'], [26.2, MOBILE ? c(17.1, .3, 1, 420) : c(17.3, -.3, 1.2, 520)],
    [27, c(22.4, 1.4, 1, MOBILE ? 500 : 480), 'lin'], [31, c(22.8, 1.4, 1, MOBILE ? 500 : 470)],
    [31.8, c(29.9, 4.6, .6, MOBILE ? 560 : 500), 'lin'], [33.6, c(30, 4.6, .6, MOBILE ? 560 : 495)],
    [34.2, c(35.8, 4.8, .8, 440), 'lin'], [36, c(35.85, 4.8, .8, 435)],
    [36.6, c(41, 7.2, .6, MOBILE ? 560 : 500), 'lin'], [38.6, c(41.1, 7.2, .6, MOBILE ? 560 : 490)],
    [39.2, c(48.6, 6.9, .8, MOBILE ? 540 : 520), 'lin'], [44.3, c(48.8, 6.9, .8, MOBILE ? 530 : 500)],
    [45.1, c(24, 4, 1, 1500)], [52.2, c(25, 4, 1, 1480)],
  ];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b, mode] = keys[i + 1];
    if (t <= t1) { const u = t1 - t0 < .2 ? 1 : mode === 'lin' ? clamp((t - t0) / (t1 - t0)) : smooth((t - t0) / (t1 - t0)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u) }; }
  }
  return keys[keys.length - 1][1];
}

/* ---------------------------------------------------------------- welfare unit, shelter, yard (this section only) */
const WALL_IN = { wc: '#dce7ec', wash: '#e1ebe5', rest: '#efe8d6' }, CUT = '#dad7ce', FLOOR = '#a9b4b6';
// back of the cut-away unit: floor, back and left walls (inside faces), skids, wall signs and fittings on the back wall
let WU_BACK = '';
function welfareBack() {
  const { x0, x1, y0, y1, h, fl } = WU, yb = y0 + .1;
  let s = poly([[x0, y1, 0], [x1, y1, 0], [x1, y1, fl], [x0, y1, fl]], col('#4a5446')) + poly([[x1, y0, 0], [x1, y1, 0], [x1, y1, fl], [x1, y0, fl]], col('#3e473b'));
  s += poly([[x0, y0, fl], [x1, y0, fl], [x1, y1, fl], [x0, y1, fl]], FLOOR);
  for (let x = x0 + .6; x < x1; x += .6) s += line3([x, yb, fl + .002], [x, y1, fl + .002], 'rgba(0,0,0,.06)', 1);
  for (const [k, [a, b]] of Object.entries(ROOMS)) s += poly([[a, yb, fl], [b, yb, fl], [b, yb, h], [a, yb, h]], WALL_IN[k]);
  s += poly([[x0 + .1, y0, fl], [x0 + .1, y1, fl], [x0 + .1, y1, h], [x0 + .1, y0, h]], col(WALL_IN.wc, .86));
  s += poly([[x0, y0, h], [x1, y0, h], [x1, yb, h], [x0, yb, h]], CUT) + poly([[x0, y0, h], [x0 + .1, y0, h], [x0 + .1, y1, h], [x0, y1, h]], CUT);
  s += line3([x0 + .1, yb, fl], [x1, yb, fl], 'rgba(0,0,0,.18)', 1.2);
  const sign = (x, z, w, txt, bg = BLUE, fg = '#fff') => signXZ(x, yb + .01, z, w, .26, `<rect width="${w}" height=".26" rx=".03" fill="${bg}"/><text x="${w / 2}" y=".19" font-size=".16" font-family="Arial" font-weight="700" text-anchor="middle" fill="${fg}" textLength="${(w * .82).toFixed(2)}" lengthAdjust="spacingAndGlyphs">${txt}</text>`);
  s += sign(10.4, 2.5, 1.2, 'TOILETS') + sign(12.85, 2.5, 1.7, 'WASH YOUR HANDS', '#1f8a43') + sign(16.2, 2.5, 2, 'REST AREA · KEEP IT CLEAN');
  // washroom: mirror over the trough, soap, paper towels, water heater
  s += signXZ(12.75, yb + .01, 1.95, 1.9, .55, `<rect width="1.9" height=".55" fill="#b9d6e2" stroke="#8a9aa0" stroke-width=".03"/><path d="M.2 .45 L.55 .1 M.4 .45 L.75 .1" stroke="#fff" stroke-width=".04" opacity=".6"/>`);
  for (const x of [13.35, 14.05]) s += box(x - .06, yb, 1.5, .12, .06, .18, '#f2f2f0');
  s += box(14.75, yb, 1.4, .2, .1, .3, '#f4f4f2') + box(12.48, yb, 1.85, .3, .25, .45, '#e8e8e4');
  // rest area: notice board, clock
  s += signXZ(17, yb + .01, 2.05, .9, .55, `<rect width=".9" height=".55" fill="#c9a26a" stroke="#7a5a32" stroke-width=".03"/><rect x=".08" y=".07" width=".3" height=".4" fill="#fff"/><rect x=".46" y=".09" width=".34" height=".22" fill="#fff6c8"/><rect x=".5" y=".35" width=".3" height=".14" fill="#dbe9f5"/>`);
  { const [cx, cy] = P(18.4, yb + .01, 2.2); s += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="5" ry="5.6" fill="#fff" stroke="#333" stroke-width="1"/><path d="M${f1(cx)} ${f1(cy)} v-3.5 M${f1(cx)} ${f1(cy)} l2.4 1.4" stroke="#333" stroke-width=".9"/>`; }
  return s;
}
// the unit closed up, as seen from the yard: full-height walls, roof, doors and windows; faded away to reveal the inside
let WU_SHELL = '';
function welfareShell() {
  const { x0, x1, y0, y1, h } = WU;
  let s = cabin(x0, y0, x1 - x0, y1 - y0, 0, h);
  for (const [a, b] of DOORS) s += cabinDoor(a - .07, y1, 0, b - a + .14) + box(a - .05, y1, 0, b - a + .1, .45, WU.fl, '#8a8a86');
  for (const x of [11.75, 14.2, 17.2, 18.3]) s += cabinWindow(x, y1, 1.15, .85, .7);
  s += signXZ(16.85, y1 + .02, 2.55, 2.2, .3, `<rect width="2.2" height=".3" rx=".03" fill="${BLUE}"/><text x="1.1" y=".22" font-size=".19" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="1.8" lengthAdjust="spacingAndGlyphs">WELFARE UNIT</text>`);
  return s;
}
// low cut walls (front, right end, partitions): box with a pale cut face on top
function cutWall(x, y, w, d, z0, z1, base) { return box(x, y, z0, w, d, z1 - z0, base) + poly([[x, y, z1], [x + w, y, z1], [x + w, y + d, z1], [x, y + d, z1]], CUT); }
function welfareItems(t) {
  const { x0, x1, y0, y1, fl, cut } = WU, yb = y0 + .1, out = [];
  // front wall in segments between the doorways, a step at each door
  const ends = [x0, ...DOORS.flat(), x1];
  for (let i = 0; i < ends.length; i += 2) out.push({ k: (ends[i] + ends[i + 1]) / 2 + y1, bb: [ends[i], ends[i + 1], y1 - .1, y1], s: cutWall(ends[i], y1 - .1, ends[i + 1] - ends[i], .1, 0, cut, CABIN) });
  for (const [a, b] of DOORS) out.push({ k: (a + b) / 2 + y1 + .2, bb: [a - .05, b + .05, y1, y1 + .45], s: box(a - .05, y1, 0, b - a + .1, .45, fl, '#8a8a86') });
  out.push({ k: x1 + (y0 + y1) / 2, bb: [x1 - .1, x1, y0, y1], s: cutWall(x1 - .1, y0, .1, y1 - y0, 0, cut, CABIN) });
  // partitions, the rest-area one with a doorway through to the washroom
  out.push({ k: 12.4 + (yb + y1) / 2, bb: [12.35, 12.45, yb, y1 - .1], s: cutWall(12.35, yb, .1, y1 - .1 - yb, fl, cut, '#c9d0cd') });
  out.push({ k: 15 + (yb + .2) / 2, bb: [14.95, 15.05, yb, .2], s: cutWall(14.95, yb, .1, .2 - yb, fl, cut, '#c9d0cd') });
  out.push({ k: 15 + .95, bb: [14.95, 15.05, .8, y1 - .1], s: cutWall(14.95, .8, .1, y1 - .1 - .8, fl, cut, '#c9d0cd') });
  // toilets: two WCs with a cubicle divider
  for (const x of [10.3, 11.7]) out.push({ k: x + yb + .4, bb: [x - .25, x + .25, yb, yb + .8], s: box(x - .25, yb, fl + .45, .5, .18, .42, '#f2f2f0') + box(x - .17, yb + .18, fl, .34, .55, .38, '#f4f4f2') + poly(isoCircle(x, yb + .5, .14, fl + .385, 14), '#d6dcde') });
  out.push({ k: 11 + yb + .6, bb: [10.97, 11.03, yb, yb + 1.2], s: cutWall(10.97, yb, .06, 1.2, fl, fl + 1.05, '#8fb0c2') });
  // washroom: trough with three basins and taps
  { let s = box(12.6, yb, fl, 2.2, .55, .85, '#d7dbdc');
    for (const x of [13, 13.7, 14.4]) s += poly(isoCircle(x, yb + .3, .2, fl + .851, 16), '#eef2f3', 'stroke="#aab3b6" stroke-width=".8"') + line3([x, yb + .05, fl + .85], [x, yb + .05, fl + 1.05], '#9aa0a4', 2) + line3([x, yb + .05, fl + 1.05], [x, yb + .18, fl + 1.02], '#9aa0a4', 2);
    out.push({ k: 13.7 + yb + .27, bb: [12.6, 14.8, yb, yb + .55], s }); }
  out.push({ k: 14.6 + .6, bb: [14.45, 14.75, .45, .75], s: cylinderV(14.6, .6, .15, fl, .45, '#6c7a83') });
  // rest area: counter with microwave and kettle, fridge, table and bench
  out.push({ k: 15.9 + yb + .27, bb: [15.2, 16.6, yb, yb + .55], s: box(15.2, yb, fl, 1.4, .55, .9, '#c9b48a') + box(15.3, yb + .06, fl + .9, .52, .38, .3, '#e8e8e6') + poly([[15.36, yb + .45, fl + .95], [15.66, yb + .45, fl + .95], [15.66, yb + .45, fl + 1.15], [15.36, yb + .45, fl + 1.15]], '#2e3438') + cylinderV(16.25, yb + .25, .08, fl + .9, .2, '#d9d9d6') });
  out.push({ k: 18.9 + yb + .3, bb: [18.6, 19.2, yb, yb + .6], s: box(18.6, yb, fl, .6, .6, 1.55, '#eceeee') + line3([19.15, yb + .61, fl + 1], [19.15, yb + .61, fl + 1.3], '#9aa0a4', 1.6) });
  const legs = (xa, xb, ya, yc, z) => [[xa + .05, ya + .05], [xb - .05, ya + .05], [xa + .05, yc - .05], [xb - .05, yc - .05]].map(([x, y]) => line3([x, y, fl], [x, y, z], '#6c7277', 1.6)).join('');
  out.push({ k: 17.6 + -1.1, bb: [16.6, 18.6, -1.25, -.95], s: legs(16.6, 18.6, -1.25, -.95, fl + .42) + box(16.6, -1.25, fl + .42, 2, .3, .05, '#7d8a8f') });
  { let s = legs(16.6, 18.6, -.8, 0, fl + .72) + box(16.6, -.8, fl + .72, 2, .8, .04, '#ece7da');
    // a mug and lunchbox on the table once the washer sits down to eat
    if (t > WASHER[8][0]) s += cylinderV(16.95, -.25, .05, fl + .76, .1, '#c8302a') + box(17.15, -.45, fl + .76, .3, .22, .1, '#3a7ac0');
    out.push({ k: 17.6 - .4, bb: [16.6, 18.6, -.8, 0], s }); }
  return out;
}
// designated smoking shelter: back panel with its sign, lean-to canopy, bench and a cigarette bin
function shelter() {
  const { x0, x1, y0, y1 } = SHELTER;
  let s = '';
  for (const x of [x0, x1]) s += line3([x, y0, 0], [x, y0, 2.45], '#6c7277', 3);
  s += poly([[x0, y0, .1], [x1, y0, .1], [x1, y0, 2.3], [x0, y0, 2.3]], 'rgba(170,200,210,.45)', 'stroke="#6c7277" stroke-width="1.5"');
  s += signXZ(x0 + .55, y0 + .02, 2.15, 1.9, .5, `<rect width="1.9" height=".5" fill="#1f8a43"/><text x=".95" y=".22" font-size=".17" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="1.62" lengthAdjust="spacingAndGlyphs">DESIGNATED</text><text x=".95" y=".42" font-size=".15" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="1.62" lengthAdjust="spacingAndGlyphs">SMOKING &amp; VAPING AREA</text>`);
  s += box(x0 + .3, y0 + .05, .42, 2.2, .35, .06, '#8a6a42');
  for (const x of [x0 + .45, x0 + 2.35]) s += line3([x, y0 + .22, 0], [x, y0 + .22, .42], '#6c7277', 2);
  for (const x of [x0, x1]) s += line3([x, y1, 0], [x, y1, 2.2], '#6c7277', 3);
  s += poly([[x0 - .1, y0 - .05, 2.45], [x1 + .1, y0 - .05, 2.45], [x1 + .1, y1 + .05, 2.2], [x0 - .1, y1 + .05, 2.2]], 'rgba(200,215,220,.8)', 'stroke="#6c7277" stroke-width="1.5"');
  return s;
}
const ashBin = () => cylinderV(24.25, .1, .17, 0, .85, '#4a4f54') + poly(isoCircle(24.25, .1, .17, .86, 12), '#c9cdcf');
// smoke or vapour rising from a point (screen space), drifting with time
function wisps(px, py, t, n = 4, big = 1) {
  let o = '';
  for (let i = 0; i < n; i++) { const u = frac(t * .45 + i / n); o += `<circle cx="${f1(px + Math.sin(u * 5 + i) * 3 * big)}" cy="${f1(py - u * 22 * big)}" r="${f1((1.4 + u * 4) * big)}" fill="#e6e8ea" opacity="${f2(.55 * (1 - u))}"/>`; }
  return o;
}
// cigarette (or vape) held to the mouth of a standing person at (x, y)
function smokeAt(x, y, dir, t, vape) {
  const [sx, sy] = P(x, y, 0), H = 1.8 * S, hy = sy - .905 * H + 3, mx = sx + dir * (vape ? 5.6 : 5.2);
  const stick = vape ? `<rect x="${f1(mx - (dir < 0 ? 3.4 : 0))}" y="${f1(hy - 1)}" width="3.4" height="1.8" rx=".6" fill="#2a2d31"/>` :
    `<line x1="${f1(mx)}" y1="${f1(hy)}" x2="${f1(mx + dir * 3.4)}" y2="${f1(hy + .6)}" stroke="#f4f2ec" stroke-width="1.2"/><circle cx="${f1(mx + dir * 3.6)}" cy="${f1(hy + .6)}" r=".8" fill="#e8642a"/>`;
  return stick + wisps(mx + dir * (vape ? 2 : 3.6), hy - 1, t + x, vape ? 5 : 3, vape ? 1.3 : .8);
}
// painted pedestrian route
function walkway() {
  const { x0, x1, y0, y1 } = WALK;
  let s = poly([[x0, y0, .01], [x1, y0, .01], [x1, y1, .01], [x0, y1, .01]], '#4f8a54');
  for (const y of [y0 + .06, y1 - .06]) s += line3([x0, y, .02], [x1, y, .02], '#f2e04a', 2);
  for (const x of [x0 + 1.2, x0 + 4.6]) {
    const [px, py] = P(x + .4, (y0 + y1) / 2, .02);
    s += `<g transform="translate(${f1(px)} ${f1(py)}) matrix(${f2(C)},${f2(N)},${f2(-C)},${f2(N)},0,0)"><circle cx="0" cy="-5" r="2.6" fill="#fff"/><path d="M0 -2 v6 M-3 1 h6 M0 4 l-3 5 M0 4 l3 5" stroke="#fff" stroke-width="1.8" fill="none"/></g>`;
  }
  return s;
}
// fire point: red board on posts, two extinguishers on the stand
function firePoint() {
  const [x, y] = FIRE;
  let s = line3([x - .5, y, 0], [x - .5, y, 1.9], '#7d7d7d', 3) + line3([x + .5, y, 0], [x + .5, y, 1.9], '#7d7d7d', 3);
  s += signXZ(x - .6, y + .02, 2.1, 1.2, .55, `<rect width="1.2" height=".55" fill="#c8102e"/><text x=".6" y=".24" font-size=".17" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength=".95" lengthAdjust="spacingAndGlyphs">FIRE POINT</text><text x=".6" y=".44" font-size=".1" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength=".95" lengthAdjust="spacingAndGlyphs">KEEP CLEAR</text>`);
  s += box(x - .55, y + .02, .25, 1.1, .3, .05, '#7d7d7d');
  for (const [dx, band] of [[-.25, '#e8e8e4'], [.25, '#1d1d1d']]) s += cylinderV(x + dx, y + .18, .11, .3, .62, '#c8102e') + box(x + dx - .1, y + .1, .62, .2, .16, .05, band) + line3([x + dx, y + .18, .95], [x + dx + .08, y + .22, 1.02], '#1d1d1d', 2);
  return s;
}
// skips for segregated waste, labelled on the front
function wasteBin(x, label, c) {
  let s = box(x, BIN_Y, 0, 1.2, BIN_D, .95, c) + poly([[x + .06, BIN_Y + .06, .951], [x + 1.14, BIN_Y + .06, .951], [x + 1.14, BIN_Y + BIN_D - .06, .951], [x + .06, BIN_Y + BIN_D - .06, .951]], col(c, .55));
  s += signXZ(x + .15, BIN_Y + BIN_D + .01, .78, .9, .26, `<rect width=".9" height=".26" rx=".03" fill="#fff"/><text x=".45" y=".19" font-size=".16" font-family="Arial" font-weight="700" text-anchor="middle" fill="${INK}" textLength="${Math.min(.78, label.length * .1).toFixed(2)}" lengthAdjust="spacingAndGlyphs">${label.toUpperCase()}</text>`);
  return s;
}
// loose items: timber offcut, cement bag, bucket, pipe offcut (drawn at a position and angle, so they can be tidied away)
function plank(x, y, a, len = 1.4) { const dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2, nx = -Math.sin(a) * .1, ny = Math.cos(a) * .1; return poly([[x - dx - nx, y - dy - ny, .06], [x + dx - nx, y + dy - ny, .06], [x + dx + nx, y + dy + ny, .06], [x - dx + nx, y - dy + ny, .06]], '#c89a5a') + poly([[x - dx + nx, y - dy + ny, 0], [x + dx + nx, y + dy + ny, 0], [x + dx + nx, y + dy + ny, .06], [x - dx + nx, y - dy + ny, .06]], '#9a7240'); }
const cementBag = (x, y, z = 0) => box(x - .3, y - .2, z, .6, .4, .14, '#c9c2b0') + poly([[x - .15, y + .201, z + .03], [x + .15, y + .201, z + .03], [x + .15, y + .201, z + .11], [x - .15, y + .201, z + .11]], '#c8302a');
const bucket = (x, y) => cylinderV(x, y, .16, 0, .3, '#2a2d31');
const pipeBit = (x, y, a, len = 1.1) => { const dx = Math.cos(a) * len / 2, dy = Math.sin(a) * len / 2; return line3([x - dx, y - dy, .09], [x + dx, y + dy, .09], '#a65424', 7) + line3([x - dx, y - dy, .12], [x + dx, y + dy, .12], '#e98a46', 3); };
// tween a loose item from its scattered spot to its tidy spot
const tidy = (t, [a, b], from, to) => { const u = ramp(t, a, b); return from.map((v, i) => lerp(v, to[i], u)); };

/* ---------------------------------------------------------------- sound */
function audioUpdate(F) {
  const ctx = A.ctx; if (!ctx) return;
  const n = ctx.currentTime;
  const busy = F.t > 4 && F.t < 44.7 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.06 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.28 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 45.2 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 44.7 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-14/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, 'Welfare, housekeeping, and behaviour.'],
  [4.4, 1, 0, null, 'Welfare facilities are provided for your use, and must be kept clean and tidy.'],
  [10.2, 2, 0, null, 'Use the designated toilets, washing facilities, and rest areas.'],
  [15.2, 3, 0, null, 'Wash your hands before eating, drinking, or smoking, particularly after handling chemicals, concrete, contaminated materials, or working in drainage environments.'],
  [26.6, 4, 0, null, 'Smoking and vaping are only permitted in designated areas.'],
  // one take (clip 6), split at its pauses so each item lands on its picture
  [ROUTE_AT, 5, 0, 1.33, 'Keep access routes,'],
  [FIREPT_AT, 5, 1.33, 2.74, 'emergency equipment,'],
  [AREA_AT, 5, 2.74, null, 'and working areas clear.'],
  [39.3, 6, 0, null, 'Everyone is responsible for maintaining good housekeeping throughout the working day.'],
  [45.7, 7, 0, null, 'Keep it clean. Wash your hands. Keep it clear.'],
];

/* ---------------------------------------------------------------- frame */
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
  const between = (a, b, fade = .3) => ramp(t, a, a + fade) * (1 - ramp(t, b - fade, b));

  const items = [];
  items.push({ k: -1.2, bb: [-5.6, -1.2, 1, 2], s: STAIR || (STAIR = stair(-5.6, -4.2, -1.2, 1, 2, 2.7)) });
  // welfare unit: the shell first, then everything in it in depth order
  items.push({ k: -50, bb: [WU.x0, WU.x1, WU.y0, WU.y0 + .1], s: WU_BACK || (WU_BACK = welfareBack()) });
  items.push(...welfareItems(t));
  { const a = 1 - ramp(t, REVEAL_AT, REVEAL_AT + .9);
    if (a > 0) items.push({ k: WU.x1 + WU.y1 + .5, bb: [WU.x0, WU.x1, WU.y0, WU.y1], s: `<g opacity="${f2(a)}">${WU_SHELL || (WU_SHELL = welfareShell())}</g>` }); }
  // the welfare attendant, wiping down the table
  items.push({ k: 18 + .5, s: person({ x: 18, y: .5, z: WU.fl, dir: -1, work: true, seed: 2, kit: { helmet: false, glasses: false }, hair: '#2a1d14', skin: SKINS[2], t }) });
  // the hand-washer
  const w = washerAt(t), washing = t >= WASHER[4][0] && t < WASHER[5][0];
  items.push({ k: w.x + w.y, s: person({ x: w.x, y: w.y, z: floorZ(w.x, w.y), dir: washing ? 1 : t > WASHER[8][0] ? 1 : w.dir, moving: w.moving, phase: w.phase, work: washing, seed: 4, kit: t > WASHER[3][0] ? { helmet: false, gloves: false } : {}, tool: t < WASHER[3][0] ? 'helmet' : undefined, skin: SKINS[1], t }) });
  // the smoking shelter, the smoker and a colleague vaping
  items.push({ k: (SHELTER.x0 + SHELTER.x1) / 2 + SHELTER.y0, bb: [SHELTER.x0, SHELTER.x1, SHELTER.y0 - .1, SHELTER.y1], s: shelter() });
  items.push({ k: 24.25 + .1, bb: [24.08, 24.42, -.07, .27], s: ashBin() });
  const sm = smokerAt(t);
  items.push({ k: sm.x + sm.y, s: person({ ...sm, dir: sm.moving ? sm.dir : 1, skin: SKINS[0], t }) + smokeAt(sm.x, sm.y, sm.moving ? sm.dir : 1, t, false) });
  items.push({ k: 23.6 - .1, s: person({ x: 23.6, y: -.1, dir: -1, skin: SKINS[3], t }) + smokeAt(23.6, -.1, -1, t, true) });
  // walkway with its trip hazards, cleared to the side
  items.push({ k: -40, bb: [WALK.x0, WALK.x1, WALK.y0, WALK.y1], s: walkway() });
  { const cab = ramp(t, ROUTE_CLR[0], ROUTE_CLR[0] + .5);
    const [lx, ly] = P(27.2, 3.7, .05);
    let s = cab < 1 ? `<path d="M${pts([[27.3, 4.1, .04]])} C${pts([[27.9, 4.6, .04]])} ${pts([[27.5, 5, .04]])} ${pts([[28.4, 5.7, .04]])}" stroke="#f08a1c" stroke-width="2.4" fill="none" opacity="${f2(1 - cab)}"/>`.replace(/(-?\d+\.\d),(-?\d+\.\d)/g, '$1 $2') : '';
    s += `<g opacity="${f2(cab)}"><ellipse cx="${f1(lx)}" cy="${f1(ly)}" rx="7" ry="3.6" fill="none" stroke="#f08a1c" stroke-width="2.4"/><ellipse cx="${f1(lx)}" cy="${f1(ly)}" rx="4.4" ry="2.2" fill="none" stroke="#f08a1c" stroke-width="2.2"/></g>`;
    items.push({ k: -39, s }); }
  { const [px, py, pa] = tidy(t, ROUTE_CLR, [29.6, 4.9, .7], [30.2, 3.75, 0]), [qx, qy, qa] = tidy(t, ROUTE_CLR, [30.1, 4.75, -.4], [30.2, 3.55, 0]);
    items.push({ k: px + py, bb: [Math.min(px, qx) - .75, Math.max(px, qx) + .75, Math.min(py, qy) - .35, Math.max(py, qy) + .35], s: plank(qx, qy, qa) + plank(px, py, pa) });
    const [bx, by] = tidy(t, ROUTE_CLR, [31.4, 4.75], [31.5, 3.7]);
    items.push({ k: bx + by, bb: [bx - .3, bx + .3, by - .2, by + .2], s: cementBag(bx, by) });
    const [kx, ky] = tidy(t, ROUTE_CLR, [32.6, 5.05], [32.2, 3.7]);
    items.push({ k: kx + ky, bb: [kx - .16, kx + .16, ky - .16, ky + .16], s: bucket(kx, ky) }); }
  items.push({ k: 30.8 + 3.2, s: person({ x: 30.8, y: 3.15, dir: 1, work: t > ROUTE_CLR[0] - .3 && t < ROUTE_CLR[1], seed: 1, skin: SKINS[4], t }) });
  // fire point, blocked by a pallet of bags until it's pulled clear
  items.push({ k: FIRE[0] + FIRE[1] + .1, bb: [FIRE[0] - .6, FIRE[0] + .6, FIRE[1] - .05, FIRE[1] + .35], s: firePoint() });
  { const px = palletX(t), y0 = 4.6;
    let s = box(px, y0, 0, 1.2, 1, .12, '#9a7240');
    for (let i = 0; i < 3; i++) s += cementBag(px + .3 + (i % 2) * .6, y0 + .3 + (i > 1 ? .45 : 0), .12) + cementBag(px + .6, y0 + .5, .26 + i * .14);
    items.push({ k: px + .6 + y0 + .5, bb: [px, px + 1.2, y0, y0 + 1], s });
    const mv = t > FIRE_CLR[0] && t < FIRE_CLR[1], hx = px + 1.55;
    items.push({ k: hx + 5.1, s: line3([px + 1.2, y0 + .5, .2], [hx - .1, y0 + .5, .9], '#2a2d31', 2.4) + person({ x: hx, y: y0 + .5, dir: 1, moving: mv, phase: t * 9, skin: SKINS[2], t }) }); }
  // working area: offcuts and kit left lying about, then stacked at the end of the area
  { const P1 = tidy(t, AREA_CLR, [39.6, 7.4, .5], [38.5, 6.95, 0]), P2 = tidy(t, AREA_CLR, [41, 7.6, -.6], [38.5, 7.15, 0]);
    items.push({ k: P1[0] + P1[1], bb: [Math.min(P1[0], P2[0]) - .7, Math.max(P1[0], P2[0]) + .7, Math.min(P1[1], P2[1]) - .4, Math.max(P1[1], P2[1]) + .4], s: plank(P2[0], P2[1], P2[2]) + plank(P1[0], P1[1], P1[2]) });
    const Q1 = tidy(t, AREA_CLR, [42.4, 7.3, 1.1], [39.9, 7.05, 0]), Q2 = tidy(t, AREA_CLR, [43.2, 7.7, .3], [39.9, 7.35, 0]);
    items.push({ k: Q1[0] + Q1[1], bb: [Math.min(Q1[0], Q2[0]) - .6, Math.max(Q1[0], Q2[0]) + .6, Math.min(Q1[1], Q2[1]) - .5, Math.max(Q1[1], Q2[1]) + .5], s: pipeBit(Q1[0], Q1[1], Q1[2]) + pipeBit(Q2[0], Q2[1], Q2[2]) });
    const [cx2, cy2] = tidy(t, AREA_CLR, [40.4, 7.1], [41, 6.95]);
    items.push({ k: cx2 + cy2, bb: [cx2 - .3, cx2 + .3, cy2 - .2, cy2 + .2], s: cementBag(cx2, cy2) }); }
  items.push({ k: 41.6 + 7.7, s: person({ x: 41.6, y: 7.7, dir: -1, work: t > AREA_CLR[0] - .3 && t < AREA_CLR[1], seed: 5, skin: SKINS[0], t }) });
  // segregated waste and the sweep-up
  BINS.forEach(([x, label, c]) => items.push({ k: x + .6 + BIN_Y + BIN_D / 2, bb: [x, x + 1.2, BIN_Y, BIN_Y + BIN_D], s: wasteBin(x, label, c) }));
  const sw = SWEEP(t);
  items.push({ k: sw.x + sw.y, s: person({ x: sw.x, y: sw.y, dir: Math.sin((t - 38.7) * 1.2) >= 0 ? 1 : -1, tool: 'rake', work: true, seed: 6, skin: SKINS[1], t }) });
  const ca = walkPath(CARRIER, t) || { x: CARRIER[0][1], y: CARRIER[0][2], moving: false, phase: 0, dir: 1 };
  const carrying = t < CARRIER[3][0] - .4;
  items.push({ k: ca.x + ca.y, s: person({ x: ca.x, y: ca.y, dir: ca.moving ? ca.dir : -1, moving: ca.moving, phase: ca.phase, tool: carrying ? 'carry' : undefined, skin: SKINS[4], t }) +
    (carrying ? (() => { const [hx, hy] = P(ca.x, ca.y, 0); return `<rect x="${f1(hx - 2)}" y="${f1(hy - 26)}" width="20" height="3" fill="#c89a5a" transform="rotate(-8 ${f1(hx)} ${f1(hy - 25)})"/>`; })() : '') });
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = '';
  $('gate').innerHTML = pedGate(gateOpen(t));

  let fx = '';
  // clean and tidy
  fx += tag(13.7, -.4, 3.4, 'Clean', '#2c9a4a', between(CLEAN_AT[0], 9.8)) + tag(17.6, -.4, 3.4, 'Tidy', '#2c9a4a', between(CLEAN_AT[1], 9.8));
  // toilets, washing facilities, rest areas
  fx += tag(11, -.4, 3.2, 'Toilets', '#1d9ad6', between(ROOM_AT[0], 14.8)) + tag(13.7, -.4, 3.2, 'Washing facilities', '#1d9ad6', between(ROOM_AT[1], 14.8)) + tag(17.2, -.4, 3.2, 'Rest area', '#1d9ad6', between(ROOM_AT[2], 14.8));
  // wash hands, with soap bubbles at the basin
  if (washing) { for (let i = 0; i < 6; i++) { const [bx, by] = P(13.6 + Math.sin(t * 3 + i) * .12, -1.45, WU.fl + .95 + frac(t * .8 + i / 6) * .25); fx += `<circle cx="${f1(bx)}" cy="${f1(by)}" r="${f1(1.2 + (i % 3) * .5)}" fill="#fff" opacity=".85" stroke="#b9d6e2" stroke-width=".5"/>`; } }
  fx += mark(13.6, -.9, 2.3, true, between(WASH_AT[0], 19.6)) + tag(13.6, -.9, 3.1, 'Wash hands', '#2c9a4a', between(WASH_AT[0], 19.6));
  fx += tag(17.6, .5, 2.6, 'Then eat', '#2c9a4a', between(WASHER[8][0] - .2, 26.4));
  // smoking: not here; designated area
  fx += mark(21, 3.6, 2.3, false, between(SMOKE_AT[0], 28.1)) + tag(21, 3.6, 3.1, 'Not a smoking area', '#e5483b', between(SMOKE_AT[0], 28.1));
  fx += mark(23, .2, 2.7, true, between(SMOKE_AT[1], 31.2)) + tag(23, .2, 3.5, 'Designated area', '#2c9a4a', between(SMOKE_AT[1], 31.2));
  // keep it clear
  fx += mark(29.9, 4.9, 1, false, between(ROUTE_AT + .1, ROUTE_CLR[0] + .3)) + tag(29.9, 4.9, 1.8, 'Trip hazards', '#e5483b', between(ROUTE_AT + .1, ROUTE_CLR[0] + .3));
  fx += mark(29.9, 4.9, 1, true, between(ROUTE_CLR[1], 34)) + tag(29.9, 4.9, 1.8, 'Route clear', '#2c9a4a', between(ROUTE_CLR[1], 34));
  fx += mark(FIRE[0], FIRE[1], 3, false, between(FIREPT_AT + .2, FIRE_CLR[0] + .3)) + tag(FIRE[0], FIRE[1], 3.8, 'Fire point blocked', '#e5483b', between(FIREPT_AT + .2, FIRE_CLR[0] + .3));
  fx += mark(FIRE[0], FIRE[1], 3, true, between(FIRE_CLR[1], 36.4)) + tag(FIRE[0], FIRE[1], 3.8, 'Fire point clear', '#2c9a4a', between(FIRE_CLR[1], 36.4));
  fx += mark(41, 7.35, 1, false, between(AREA_AT + .1, AREA_CLR[0] + .3)) + tag(41, 7.35, 1.8, 'Untidy', '#e5483b', between(AREA_AT + .1, AREA_CLR[0] + .3));
  fx += mark(41, 7.35, 1, true, between(AREA_CLR[1], 38.9)) + tag(41, 7.35, 1.8, 'Working area clear', '#2c9a4a', between(AREA_CLR[1], 38.9));
  // housekeeping
  fx += tag(51.1, BIN_Y + .4, 1.9, 'Segregated waste', '#2c9a4a', between(HOUSE_AT[0], 44.5));
  fx += tag(45.7, 7.4, 2.6, 'Tidy as you go', '#2c9a4a', between(HOUSE_AT[1], 44.5));
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 4, 4.4)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  const wc = $('washcard');
  show(wc, ramp(t, 19.6, 20.1) * (1 - ramp(t, 25.8, 26.3)), 1);
  wc.querySelectorAll('.row').forEach((r, i) => r.classList.toggle('ok', t >= WASH_AT[i + 1]));
  $('end').style.opacity = f2(ramp(t, 45.1, 45.8));
  $('end').querySelector('.line').style.width = (ramp(t, 45.9, 46.9) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 45.9, 46.5));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 46.7, 47.3));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 45.1, 47.1) * .7, ns: w };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  if (cross(REVEAL_AT)) shot('whoosh');
  [...CLEAN_AT, ...ROOM_AT, WASH_AT[0], ...SMOKE_AT, ROUTE_AT + .4, ROUTE_CLR[1], FIREPT_AT + .2, FIRE_CLR[1], AREA_AT + .1, AREA_CLR[1], ...HOUSE_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  WASH_AT.slice(1).forEach(tc => { if (cross(tc)) shot('card'); });
  if (cross(45.9)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 4) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
