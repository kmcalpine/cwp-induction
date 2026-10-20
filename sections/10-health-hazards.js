/* Section 10: dust, noise, vibration and hazardous substances.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages.
   The section's own kit (COSHH store, cutting bay, breaker, concrete pour, wash unit) is drawn here. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 10</div>
      <div class="h">Dust, noise, vibration &amp; hazardous substances</div>
      <div class="s">Know what you're using, control the exposure, protect yourself.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="coshh"><div class="oc">
    <div class="hd"><img class="logoimg" alt="CWP"><span>COSHH assessment</span></div>
    <div class="row"><b>Hazards</b><small>What the product can do to you</small><i></i></div>
    <div class="row"><b>Control measures</b><small>Extraction, suppression, safe method</small><i></i></div>
    <div class="row"><b>PPE &amp; RPE</b><small>Gloves, eye and breathing protection</small><i></i></div>
    <div class="row"><b>First aid &amp; spills</b><small>What to do if it goes wrong</small><i></i></div>
  </div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Control the dust. Protect your lungs, ears and skin. Know what you're using.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 10</div>
    <h1>Dust, noise, vibration &amp; hazardous substances</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
// its own compact site: the cabins, a COSHH store and four work areas laid out left to right
const LAYOUT = { ...LAYOUTS.compact, tank: null };   // no treatment tank: nothing here needs it
const DUR = 66;
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
// chip captions [from, to, kicker, text]
const CHIPS = [
  [5.4, 9.9, 'On site', 'Dust · noise · vibration'],
  [10.2, 16.8, 'Hazardous substances', 'Fuels · oils · cement · resins · chemicals'],
  [23.2, 28.4, 'Dust', 'Extraction or water suppression'],
  [28.8, 35.8, 'Respiratory protection', 'Suitable for the task · face-fit tested'],
  [36.4, 41.4, 'Noise &amp; vibration', 'Exposure must be controlled'],
  [42, 50.8, 'Wet concrete &amp; cement', 'Burns skin: gloves, boots, washing'],
  [51.4, 57.8, 'Unfamiliar products', 'Information and instruction first'],
];
// laid out left to right in the order the voiceover visits them, so the camera only travels one way:
// COSHH store → cutting bay (extraction, then water suppression) → breaker → concrete pour + wash unit → unknown product
const STORE = { fuel: [9.8, -.9], oil: [11.2, -1.1], cement: [12.5, -1.6], shelf: [13.9, -2.1, 1.6, .7, 1.9], board: [16.1, -.6] };
const GRIND = { at: [18.6, 1.6], vac: [17.6, 2.3] }, SAW = { at: [22.2, 1.6], bottle: [21.2, 2.4], slab: [22.9, 1.1] };
const SLAB = [25.6, 29, .4, 2.8], BRK = [27.6, 1.7], HZONE = [25.2, 3.6];
const POUR = [31.4, 35.6, .6, 3.2], RAKER = [33.4, 1.9], WASH = [36.4, 4.6];
const DRUM = [46.2, 5.9];
const DUST_AT = 7.3, NOISE_AT = 7.95, VIB_AT = 8.7;
const PROD_AT = [11.8, 12.9, 13.6, 14.4, 15.4];                              // fuels · oils · cement · resins · chemicals
const COSHH_AT = [17.6, 18.8, 20, 21.2];
const EXTRACT_AT = 25.1, SUPP_AT = 26.2;
const RPE_AT = 29.3, FIT_AT = 33.6;
const HEAR_AT = 37.4, HAV_AT = 38.6, REST_AT = 39.9;
const BURN_AT = 42.6, GLOVE_AT = 46.6, BOOT_AT = 47.5, WASH_AT = 48.3;
const STOP_AT = 52.2, INFO_AT = 55.2;

function newcomerAt(t) {
  // walks up to the unlabelled drum, stops short, then waits for the supervisor
  return walkPath([[50.2, 43.8, 7.4], [STOP_AT, DRUM[0] - 1.2, DRUM[1] + 1.1]], t);
}
function supervisorAt(t) {
  // brings the safety data sheet across on a tablet
  return walkPath([[52.8, 49.8, 7.6], [INFO_AT - .3, DRUM[0] + .9, DRUM[1] + 1.4]], t);
}
function cameraAt(t) {
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  // mobile: step to each item as it's named; each step is a constant-speed move (up to .9 s), then a hold
  const seq = (end, shots) => {
    const out = [];
    shots.forEach(([ts, p, w], i) => {
      const cam = c(...p, w), next = i < shots.length - 1 ? shots[i + 1][0] : end;
      if (i === 0) out.push([ts, cam, 'lin']);
      else { out.push([ts, out[out.length - 1][1]]); out.push([Math.min(ts + .9, next), cam, 'lin']); }
    });
    out.push([end, out[out.length - 1][1]]);
    return out;
  };
  const CUT = [(GRIND.at[0] + SAW.at[0]) / 2, 1.6, .8], SHELF = [STORE.shelf[0] + .8, STORE.shelf[1] + .4];
  // every move is a steady, constant-speed pan, always left to right
  const keys = MOBILE ? [
    [0, c(22, 3, 1, 1500)], [4.6, c(22, 2.4, 1, 1400), 'lin'],
    ...seq(9.9, [[5.6, CUT, 520], [DUST_AT - .35, CUT, 460], [NOISE_AT, [BRK[0], BRK[1], .8], 420]]),
    ...seq(16.8, [[10.6, [...STORE.fuel, .6], 380], [PROD_AT[1] - .3, [...STORE.oil, .6], 380], [PROD_AT[2] - .3, [...STORE.cement, .6], 380], [PROD_AT[3] - .3, [...SHELF, 1.4], 380], [PROD_AT[4] - .3, [...SHELF, .9], 380]]),
    [17.4, c(15.6, -.4, 1, 420), 'lin'], [22.4, c(15.6, -.4, 1, 420)],
    ...seq(28.4, [[23.4, [GRIND.at[0], GRIND.at[1], .8], 400], [SUPP_AT - .35, [SAW.at[0], SAW.at[1], .8], 400]]),
    [28.8, c(SAW.at[0], SAW.at[1], 1.3, 340), 'lin'], [35.8, c(SAW.at[0] + .1, SAW.at[1], 1.3, 330)],
    [36.6, c(BRK[0] - .6, BRK[1] + .4, 1, 400), 'lin'], [41.4, c(BRK[0] - .4, BRK[1] + .4, 1, 390)],
    ...seq(50.6, [[42.4, [RAKER[0], RAKER[1], .8], 420], [WASH_AT - .3, [WASH[0], WASH[1], .8], 400]]),
    [51.4, c(DRUM[0] + .2, DRUM[1] + 1, 1, 420), 'lin'], [57.8, c(DRUM[0] + .3, DRUM[1] + 1, 1, 410)],
    [58.4, c(22, 3, 1, 1500), 'lin'], [66, c(23, 3, 1, 1480)],
  ] : [
    [0, c(22, 3, 1, 1500)], [4.6, c(22, 2.4, 1, 1400)],
    [5.4, c(23.4, 1.8, 1, 800)], [9.9, c(23.6, 1.8, 1, 780)],
    [10.6, c(12.4, -1.1, 1, 440)], [16.8, c(12.6, -1.1, 1, 430)],
    [17.4, c(15.4, -.6, 1, 560)], [22.4, c(15.6, -.6, 1, 560)],
    [23.4, c(20.4, 1.7, 1, 500)], [28.4, c(20.6, 1.7, 1, 480)],
    [28.8, c(SAW.at[0], SAW.at[1], 1.3, 380)], [35.8, c(SAW.at[0] + .1, SAW.at[1], 1.3, 370)],
    [36.6, c(BRK[0] - .6, BRK[1] + .4, 1, 460)], [41.4, c(BRK[0] - .4, BRK[1] + .4, 1, 450)],
    [42.4, c(34, 2.6, .8, 540)], [50.6, c(34.2, 2.6, .8, 530)],
    [51.4, c(DRUM[0] + .2, DRUM[1] + 1, 1, 480)], [57.8, c(DRUM[0] + .3, DRUM[1] + 1, 1, 470)],
    [58.4, c(22, 3, 1, 1500)], [66, c(23, 3, 1, 1480)],
  ];
  // all segments linear: no easing anywhere
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b] = keys[i + 1];
    if (t <= t1) { const u = t1 - t0 < .05 ? 1 : clamp((t - t0) / (t1 - t0)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u) }; }
  }
  return keys[keys.length - 1][1];
}

/* ---------------------------------------------------------------- the section's own kit */
const TXT = (x, y, s, size, fill, w, anchor = 'middle') => `<text x="${x}" y="${y}" font-size="${size}" font-family="Arial" font-weight="700" text-anchor="${anchor}" fill="${fill}" textLength="${w}" lengthAdjust="spacingAndGlyphs">${s}</text>`;
const diamond = (x, y, z, r = .09) => { const [px, py] = P(x, y, z), q = r * S; return `<path d="M${f1(px)} ${f1(py - q)} L${f1(px + q)} ${f1(py)} L${f1(px)} ${f1(py + q)} L${f1(px - q)} ${f1(py)} Z" fill="#fff" stroke="#d42a20" stroke-width="${f2(q * .28)}"/>`; };
// red and green fuel cans on a drip tray
function fuelCans(x, y) {
  let o = box(x - .1, y - .1, 0, 1, .7, .08, '#2f6d4c');
  for (const [dx, c] of [[0, '#c8302a'], [.42, '#c8302a'], [.2, '#2f8a3a']]) {
    const yy = y + (dx === .2 ? .35 : 0);
    o += box(x + dx, yy, .08, .32, .18, .46, c) + box(x + dx + .06, yy + .04, .54, .2, .1, .05, '#222');
  }
  return o;
}
// 205 litre oil drums on a bunded spill pallet
function oilDrums(x, y) {
  let o = box(x - .5, y - .45, 0, 1.4, .9, .2, '#f2c200');
  for (const dx of [-.15, .55]) {
    o += cylinderV(x + dx, y, .3, .2, .9, '#2b5c9e', col('#2b5c9e', 1.15));
    o += poly(isoCircle(x + dx + .12, y - .08, .05, 1.1, 10), '#222');
  }
  return o;
}
// cement bags on a pallet
function cementPallet(x, y) {
  let o = box(x - .5, y - .4, 0, 1, .8, .12, '#8a6a3f');
  for (let k = 0; k < 3; k++) for (const [dx, dy] of k % 2 ? [[-.46, -.36], [-.46, 0]] : [[-.46, -.36], [0, -.36]]) {
    const w = k % 2 ? .92 : .44, d = k % 2 ? .34 : .72;
    o += box(x + dx, y + dy, .12 + k * .13, w, d, .12, k % 2 ? '#b8b2a6' : '#c4beb2');
  }
  const [lx, ly] = P(x - .1, y + .38, .3);
  return o + `<rect x="${f1(lx - 4)}" y="${f1(ly - 2)}" width="8" height="3" fill="#2c6fb0"/>`;
}
// open galvanised shelving: resin tins on the top shelf, chemical bottles below, a drip tray at the bottom
function shelving(x, y, w, d, h) {
  const G = '#9aa2a8', shelves = [.12, .78, 1.42];
  let o = poly([[x, y, 0], [x + w, y, 0], [x + w, y, h], [x, y, h]], col(G, .7));            // back panel
  o += poly([[x, y, 0], [x, y + d, 0], [x, y + d, h], [x, y, h]], col(G, .82));              // left end, inside face
  shelves.forEach((z, si) => {
    o += poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], col(G, 1.05)) + poly([[x, y + d, z - .04], [x + w, y + d, z - .04], [x + w, y + d, z], [x, y + d, z]], col(G, .8));
    if (si === 0) o += box(x + .1, y + .1, z, w - .2, d - .2, .05, '#2f6d4c');
    if (si === 1) for (let k = 0; k < 4; k++) { const bx = x + .15 + k * .36; o += box(bx, y + .25, z, .22, .2, .36, k % 2 ? '#e9ecea' : '#2c6fb0') + box(bx + .07, y + .3, z + .36, .08, .08, .06, '#d42a20') + diamond(bx + .11, y + .45, z + .2, .06); }
    if (si === 2) for (let k = 0; k < 4; k++) { const cx = x + .25 + k * .36; o += cylinderV(cx, y + .35, .13, z, .28, '#d8dcdc', col('#9aa2a8')) + poly([[cx - .13, y + .48, z + .1], [cx + .13, y + .48, z + .1], [cx + .13, y + .48, z + .17], [cx - .13, y + .48, z + .17]], '#2f8a3a'); }
  });
  o += poly([[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]], col(G, .62));  // right end
  o += poly([[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]], col(G, 1.1));
  // COSHH store sign along the top
  return o + signXZ(x + .2, y + d, h + .32, w - .4, .28, `<rect width="${f2(w - .4)}" height=".28" fill="#f2c200" stroke="#111" stroke-width=".02"/>${TXT(f2((w - .4) / 2), .2, 'COSHH STORE', .17, '#111', f2(w - .7))}`);
}
// COSHH assessment board on two posts
function coshhBoard(x, y) {
  const W = 1.2, H = .8;
  let o = line3([x + .1, y, 0], [x + .1, y, 1.9], '#7d7d7d', 2) + line3([x + W - .1, y, 0], [x + W - .1, y, 1.9], '#7d7d7d', 2);
  let inner = `<rect width="${W}" height="${H}" fill="#fff" stroke="#2c6fb0" stroke-width=".03"/><rect width="${W}" height=".2" fill="#2c6fb0"/>${TXT(W / 2, .15, 'COSHH ASSESSMENTS', .13, '#fff', W - .2)}`;
  for (let k = 0; k < 4; k++) inner += `<rect x=".08" y="${f2(.28 + k * .12)}" width=".07" height=".07" fill="#e07a1a"/><rect x=".2" y="${f2(.29 + k * .12)}" width="${f2(.8 - (k % 2) * .2)}" height=".05" fill="#9a9a9a"/>`;
  return o + signXZ(x, y, 1.95, W, H, inner);
}
// a plain grey pressurised water bottle (for the cut-off saw) or a dust extraction unit on wheels
function waterBottle(x, y) { return cylinderV(x, y, .22, 0, .7, '#e8e4dc', col('#cfcac0')) + poly(isoCircle(x, y, .05, .82, 8), '#2c6fb0') + line3([x, y, .7], [x, y, .82], '#555', 2); }
function extractor(x, y) {
  let o = box(x - .3, y - .25, .08, .6, .5, .55, '#e07a1a') + box(x - .25, y - .2, .63, .5, .4, .06, '#333');
  for (const [dx, dy] of [[-.25, .25], [.25, .25]]) { const [wx, wy] = P(x + dx, y + dy, .08); o += `<circle cx="${f1(wx)}" cy="${f1(wy)}" r="2.6" fill="#222"/>`; }
  const [lx, ly] = P(x - .05, y + .25, .45);
  return o + `<rect x="${f1(lx - 5)}" y="${f1(ly - 2)}" width="10" height="3.2" fill="#fff"/><text x="${f1(lx)}" y="${f1(ly + .8)}" font-size="2.6" font-family="Arial" font-weight="700" text-anchor="middle" fill="#111" textLength="9" lengthAdjust="spacingAndGlyphs">M-CLASS</text>`;
}
// a hose from a point on the ground kit to a screen point (the tool in a worker's hand)
function hose(a, b, colr) {
  const [ax, ay] = P(...a), [bx, by] = b;
  return `<path d="M${f1(ax)} ${f1(ay)} Q${f1((ax + bx) / 2)} ${f1(Math.max(ay, by) + 10)} ${f1(bx)} ${f1(by)}" stroke="${colr}" stroke-width="1.8" fill="none"/>`;
}
// concrete being broken out: a slab with cracks and rubble
function breakSlab(x0, x1, y0, y1) {
  let o = box(x0, y0, 0, x1 - x0, y1 - y0, .2, '#a7a39b');
  const r = rng(12);
  for (let k = 0; k < 6; k++) { const ax = lerp(x0 + .3, x1 - .3, r()), ay = lerp(y0 + .3, y1 - .3, r()); o += `<path d="M${pts([[ax, ay, .2], [ax + .5 * r(), ay + .4 * r(), .2], [ax + .9 * r(), ay + .1, .2]]).replace(/,/g, ' ')}" stroke="#5e5b55" stroke-width=".9" fill="none"/>`; }
  for (let k = 0; k < 7; k++) o += box(x1 + .1 + .5 * r(), lerp(y0, y1, r()), 0, .25 + .2 * r(), .2 + .2 * r(), .12 + .1 * r(), '#9c9890');
  return o;
}
// the formed bay of wet concrete being placed
function pourBay(x0, x1, y0, y1) {
  const T = '#c99a55';
  let o = poly([[x0, y0, .18], [x1, y0, .18], [x1, y1, .18], [x0, y1, .18]], '#8f8c86');
  o += poly([[x0 + .4, y0 + .5, .181], [x0 + 1.8, y0 + .4, .181], [x0 + 1.4, y0 + 1.1, .181]], '#a29f99', 'opacity=".6"');
  o += poly([[x0, y0, 0], [x0, y1, 0], [x0, y1, .25], [x0, y0, .25]], col(T, .8)) + poly([[x0, y0, 0], [x1, y0, 0], [x1, y0, .25], [x0, y0, .25]], col(T, .7));
  return o;
}
function pourFront(x0, x1, y0, y1) {
  const T = '#c99a55';
  return poly([[x0, y1, 0], [x1, y1, 0], [x1, y1, .25], [x0, y1, .25]], col(T, LIGHT.left)) + poly([[x1, y0, 0], [x1, y1, 0], [x1, y1, .25], [x1, y0, .25]], col(T, LIGHT.right));
}
// welfare wash unit: basin, tap and an eyewash station
function washUnit(x, y) {
  let o = box(x - .4, y - .3, 0, .8, .6, .85, '#e9ecea') + poly(isoCircle(x, y, .2, .86, 14), '#9aa2a8') + line3([x - .15, y - .2, .86], [x - .15, y - .2, 1.05], '#888', 2);
  o += box(x + .45, y - .2, 0, .4, .4, 1.2, '#2f8a3a');
  const [px, py] = P(x + .65, y + .2, 1.05);
  return o + `<rect x="${f1(px - 4)}" y="${f1(py - 3.5)}" width="8" height="7" fill="#fff"/><path d="M${f1(px)} ${f1(py - 2.5)} v5 M${f1(px - 2.5)} ${f1(py)} h5" stroke="#2f8a3a" stroke-width="1.6"/>`;
}
// unlabelled drum: no supplier label, just a scrawled "?"
function mysteryDrum(x, y) {
  const [px, py] = P(x + .1, y + .3, .5);
  return cylinderV(x, y, .3, 0, .9, '#c4c0b6', col('#a29d92')) + `<text x="${f1(px)}" y="${f1(py)}" font-size="9" font-family="Arial" font-weight="700" text-anchor="middle" fill="#5e5b55">?</text>`;
}
// blue "ear protection must be worn" sign on a post
function hearingSign(x, y) {
  const inner = `<rect width=".7" height=".8" fill="#fff" stroke="#999" stroke-width=".01"/><circle cx=".35" cy=".27" r=".2" fill="#1a5dab"/>` +
    `<path d="M.24 .3 a.11 .11 0 0 1 .22 0" stroke="#fff" stroke-width=".035" fill="none"/><rect x=".21" y=".28" width=".07" height=".1" rx=".02" fill="#fff"/><rect x=".42" y=".28" width=".07" height=".1" rx=".02" fill="#fff"/>` +
    TXT(.35, .58, 'EAR PROTECTION', .09, '#111', .6) + TXT(.35, .7, 'MUST BE WORN', .09, '#111', .56);
  return line3([x + .35, y, 0], [x + .35, y, 1.4], '#7d7d7d', 2) + signXZ(x, y, 2.1, .7, .8, inner);
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-10/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, 'Dust, noise, vibration, and hazardous substances.'],
  [5.4, 1, 0, null, 'Some of our activities create dust, noise, and vibration.'],
  [10.2, 2, 0, null, 'And we may use products such as fuels, oils, cement, resins, and other chemicals.'],
  [17.2, 3, 0, null, 'You must follow the relevant COSHH assessment, and use the required control measures.'],
  [23.2, 4, 0, null, 'Where dust is generated, suitable extraction or suppression must be used.'],
  [28.8, 5, 0, null, 'Respiratory protection must be suitable for the task, and tight-fitting masks require face-fit testing.'],
  [36.4, 6, 0, null, 'Exposure to noisy equipment and vibrating tools must be controlled.'],
  [42, 7, 0, null, 'Wet concrete and cement can cause serious chemical burns, so suitable gloves, footwear, and washing arrangements are essential.'],
  [51.4, 8, 0, null, 'Do not use chemicals or unfamiliar products without the necessary information and instruction.'],
  [58.6, 9, 0, null, "Control the dust. Protect your lungs, ears, and skin. Know what you're using."],
];

/* ---------------------------------------------------------------- sound */
function audioUpdate(F) {
  const ctx = A.ctx; if (!ctx) return;
  const n = ctx.currentTime;
  const busy = F.t > 4 && F.t < 58 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 58.5 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 58 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- frame */
let KIT = '';
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
  // a drifting dust cloud from a tool tip (screen point), amount 0..1
  const dust = (px, py, amt, seed) => {
    if (amt <= .01) return '';
    let o = '';
    for (let i = 0; i < 9; i++) {
      const u = frac(t * .45 + i / 9 + seed * .13), r = 5 + 22 * u;
      o += `<circle cx="${f1(px + (u * 34 + Math.sin(i * 2.1 + seed) * 6))}" cy="${f1(py - u * 26 - 2)}" r="${f1(r)}" fill="#ddd6c8" opacity="${f2(amt * .55 * (1 - u))}"/>`;
    }
    return `<g filter="url(#soft)">${o}</g>`;
  };

  const items = [];
  items.push({ k: -1.2, bb: [-5.6, -1.2, 1, 2], s: STAIR || (STAIR = stair(-5.6, -4.2, -1.2, 1, 2, 2.7)) });
  // static kit (built once)
  if (!KIT) KIT = [
    { k: STORE.fuel[0] + STORE.fuel[1], bb: [STORE.fuel[0] - .1, STORE.fuel[0] + .9, STORE.fuel[1] - .1, STORE.fuel[1] + .6], s: fuelCans(...STORE.fuel) },
    { k: STORE.oil[0] + STORE.oil[1], bb: [STORE.oil[0] - .5, STORE.oil[0] + .9, STORE.oil[1] - .45, STORE.oil[1] + .45], s: oilDrums(...STORE.oil) },
    { k: STORE.cement[0] + STORE.cement[1], bb: [STORE.cement[0] - .5, STORE.cement[0] + .5, STORE.cement[1] - .4, STORE.cement[1] + .4], s: cementPallet(...STORE.cement) },
    { k: STORE.shelf[0] + STORE.shelf[1], bb: [STORE.shelf[0], STORE.shelf[0] + STORE.shelf[2], STORE.shelf[1], STORE.shelf[1] + STORE.shelf[3]], s: shelving(...STORE.shelf) },
    { k: STORE.board[0] + .6 + STORE.board[1], bb: [STORE.board[0], STORE.board[0] + 1.2, STORE.board[1] - .05, STORE.board[1] + .05], s: coshhBoard(...STORE.board) },
    { k: GRIND.vac[0] + GRIND.vac[1], bb: [GRIND.vac[0] - .3, GRIND.vac[0] + .3, GRIND.vac[1] - .25, GRIND.vac[1] + .25], s: extractor(...GRIND.vac) },
    { k: GRIND.at[0] + .9 + GRIND.at[1], bb: [GRIND.at[0] + .55, GRIND.at[0] + 1.35, GRIND.at[1] - .5, GRIND.at[1] + .1], s: box(GRIND.at[0] + .55, GRIND.at[1] - .5, 0, .8, .6, .45, '#b5b0a6') },
    { k: SAW.bottle[0] + SAW.bottle[1], bb: [SAW.bottle[0] - .22, SAW.bottle[0] + .22, SAW.bottle[1] - .22, SAW.bottle[1] + .22], s: waterBottle(...SAW.bottle) },
    { k: SAW.slab[0] + SAW.slab[1], bb: [SAW.slab[0] - .1, SAW.slab[0] + .9, SAW.slab[1] - .3, SAW.slab[1] + .3], s: box(SAW.slab[0] - .1, SAW.slab[1] - .3, 0, 1, .6, .15, '#b5b0a6') + box(SAW.slab[0] - .1, SAW.slab[1] - .3, .15, 1, .6, .15, '#c0bbb1') },
    { k: (SLAB[0] + SLAB[1]) / 2 + SLAB[2], bb: [SLAB[0], SLAB[1] + .8, SLAB[2], SLAB[3]], s: breakSlab(...SLAB) },
    { k: HZONE[0] + .35 + HZONE[1], bb: [HZONE[0], HZONE[0] + .7, HZONE[1] - .05, HZONE[1] + .05], s: hearingSign(...HZONE) },
    { k: -30, bb: [POUR[0], POUR[1], POUR[2], POUR[2] + .2], s: pourBay(...POUR) },
    { k: POUR[1] + POUR[3], bb: [POUR[0], POUR[1], POUR[3] - .05, POUR[3] + .05], s: pourFront(...POUR) },
    { k: WASH[0] + WASH[1], bb: [WASH[0] - .4, WASH[0] + .85, WASH[1] - .3, WASH[1] + .3], s: washUnit(...WASH) },
    { k: DRUM[0] + DRUM[1], bb: [DRUM[0] - .3, DRUM[0] + .3, DRUM[1] - .3, DRUM[1] + .3], s: mysteryDrum(...DRUM) },
  ];
  items.push(...KIT);

  // cutting bay: the grinder (on-tool extraction from EXTRACT_AT) and the cut-off saw (water from SUPP_AT)
  const cutting = t > 4 && t < 58.4;
  const ext = ramp(t, EXTRACT_AT, EXTRACT_AT + .6), wet = ramp(t, SUPP_AT, SUPP_AT + .6);
  const [gx, gy] = P(...GRIND.at), [sx, sy] = P(...SAW.at), H = 1.8 * S;
  const gTool = [gx + 7.5 + 7.4, gy - .5 * H - 3 + 1], sTool = [sx + 19, sy - .5 * H + 5];
  items.push({ k: GRIND.at[0] + GRIND.at[1], s: person({ x: GRIND.at[0], y: GRIND.at[1], dir: 1, tool: 'grinder', extra: { mask: true, ear: true }, skin: SKINS[1], t }) + (ext > 0 ? `<g opacity="${f2(ext)}">${hose([GRIND.vac[0], GRIND.vac[1], .5], gTool, '#333')}</g>` : '') });
  items.push({ k: SAW.at[0] + SAW.at[1], s: person({ x: SAW.at[0], y: SAW.at[1], dir: 1, tool: 'saw', extra: { mask: true, ear: true }, skin: SKINS[2], t }) + (wet > 0 ? `<g opacity="${f2(wet)}">${hose([SAW.bottle[0], SAW.bottle[1], .3], sTool, '#2c6fb0')}</g>` : '') });
  // a ganger checking the COSHH assessment on the board
  items.push({ k: STORE.board[0] + .6 + .9, s: person({ x: STORE.board[0] + .6, y: STORE.board[1] + .9, dir: -1, tool: 'tablet', skin: SKINS[0], t }) });
  // breaker: stops for a break at REST_AT, back on the tool for the closing shot
  const resting = t >= REST_AT && t < 41.6;
  items.push({ k: BRK[0] + BRK[1], s: person({ x: BRK[0], y: BRK[1], z: .2, dir: resting ? -1 : 1, tool: resting ? null : 'breaker', extra: { ear: true }, skin: SKINS[3], t }) });
  // the concrete gang: a raker in the wet concrete
  items.push({ k: RAKER[0] + RAKER[1], s: person({ x: RAKER[0], y: RAKER[1], z: .1, dir: 1, tool: 'rake', work: true, seed: 2, skin: SKINS[0], t }) });
  // the unfamiliar product
  const nc = newcomerAt(t), sv = supervisorAt(t);
  if (nc && t < 58.4) items.push({ k: nc.x + nc.y, s: person({ ...nc, dir: nc.moving ? nc.dir : 1, skin: SKINS[4], t }) });
  if (sv && t < 58.4) items.push({ k: sv.x + sv.y, s: person({ ...sv, dir: sv.moving ? sv.dir : -1, tool: 'tablet', skin: SKINS[1], t }) });
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  let fx = '';
  // dust: thick while cutting dry, gone once extraction / water is on
  if (cutting) {
    fx += dust(...gTool, (1 - ext) * ramp(t, 4.5, 6), 1);
    fx += dust(...sTool, (1 - wet) * ramp(t, 4.5, 6), 2);
    if (wet > 0) {
      // water at the blade and a slurry patch
      for (let i = 0; i < 6; i++) { const u = frac(t * 2 + i / 6); fx += `<circle cx="${f1(sTool[0] + 3 + u * 9)}" cy="${f1(sTool[1] + 2 + u * 4)}" r="1.1" fill="#8fd0ff" opacity="${f2(wet * (1 - u))}"/>`; }
    }
  }
  // the slurry and grinding dust on the ground are scene detail, under the people: put them in the scene layer instead
  // noise rings and vibration lines from the breaker while it runs
  const [bx, by] = P(BRK[0], BRK[1], .2), breaking = cutting && !resting;
  if (breaking) {
    const nAmt = ramp(t, NOISE_AT - .4, NOISE_AT) * (1 - ramp(t, 9.6, 10)) + ramp(t, HEAR_AT - .4, HEAR_AT) * (1 - ramp(t, REST_AT - .3, REST_AT));
    for (let i = 0; i < 3 && nAmt > 0; i++) { const u = frac(t * 1.4 + i / 3), r = 8 + 34 * u; fx += `<ellipse cx="${f1(bx + 10)}" cy="${f1(by - 4)}" rx="${f1(r)}" ry="${f1(r * .55)}" fill="none" stroke="#fff" stroke-width="1.4" opacity="${f2(nAmt * .7 * (1 - u))}"/>`; }
    const vAmt = ramp(t, VIB_AT - .3, VIB_AT) * (1 - ramp(t, 9.6, 10)) + ramp(t, HAV_AT - .3, HAV_AT) * (1 - ramp(t, REST_AT - .3, REST_AT));
    if (vAmt > 0) { const hx = bx + 6.5, hy = by - .5 * H - 1, j = Math.sin(t * 60) * 1.2; fx += `<path d="M${f1(hx - 7)} ${f1(hy - 4 + j)} l-3 2 3 2 -3 2 M${f1(hx + 12)} ${f1(hy - 4 - j)} l3 2 -3 2 3 2" stroke="#fff" stroke-width="1.2" fill="none" opacity="${f2(vAmt)}"/>`; }
  }
  // hazards on site
  const o99 = 1 - ramp(t, 9.6, 10);
  fx += tag(SAW.at[0] - 1.6, SAW.at[1], 2.9, 'Dust', '#e5483b', ramp(t, DUST_AT, DUST_AT + .3) * o99);
  fx += tag(BRK[0] - .4, BRK[1], 3.1, 'Noise', '#e5483b', ramp(t, NOISE_AT, NOISE_AT + .3) * o99);
  fx += tag(BRK[0] + 1.6, BRK[1], 2.5, 'Vibration', '#e5483b', ramp(t, VIB_AT, VIB_AT + .3) * o99);
  // products, one at a time as they're named
  const PROD = [[STORE.fuel[0] + .4, STORE.fuel[1] + .2, 1.1, 'Fuels'], [STORE.oil[0] + .2, STORE.oil[1], 1.6, 'Oils'], [STORE.cement[0], STORE.cement[1], 1, 'Cement'],
    [STORE.shelf[0] + .8, STORE.shelf[1] + .35, 2.3, 'Resins'], [STORE.shelf[0] + .8, STORE.shelf[1] + .7, 1.35, 'Chemicals']];
  PROD.forEach(([x, y, z, s], i) => { fx += tag(x, y, z, s, '#e07a1a', ramp(t, PROD_AT[i], PROD_AT[i] + .25) * (1 - ramp(t, (PROD_AT[i + 1] || 16.6) - .1, (PROD_AT[i + 1] || 16.6) + .15))); });
  // dust controls, then RPE
  fx += tag(GRIND.at[0] - .2, GRIND.at[1], 2.5, 'On-tool extraction', '#2c9a4a', ramp(t, EXTRACT_AT, EXTRACT_AT + .3) * (1 - ramp(t, 28.2, 28.6)), fs * .9);
  fx += tag(SAW.at[0] + .2, SAW.at[1], 2.5, 'Water suppression', '#2c9a4a', ramp(t, SUPP_AT, SUPP_AT + .3) * (1 - ramp(t, 28.2, 28.6)), fs * .9);
  fx += tag(SAW.at[0] + .1, SAW.at[1], 2.35, 'FFP3 mask: right for the task', '#2c9a4a', ramp(t, RPE_AT, RPE_AT + .3) * (1 - ramp(t, 35.4, 35.8)), fs * .9);
  fx += mark(SAW.at[0] - .9, SAW.at[1] + .9, 1.3, true, ramp(t, FIT_AT, FIT_AT + .3) * (1 - ramp(t, 35.4, 35.8)), .9);
  fx += tag(SAW.at[0] - .9, SAW.at[1] + .9, .45, 'Face-fit tested', '#2c9a4a', ramp(t, FIT_AT, FIT_AT + .3) * (1 - ramp(t, 35.4, 35.8)), fs * .9);
  // noise and vibration controls
  const o41 = 1 - ramp(t, 41, 41.4);
  fx += tag(HZONE[0] + .35, HZONE[1], .3, 'Hearing protection zone', '#1a5dab', ramp(t, HEAR_AT, HEAR_AT + .3) * o41, fs * .9);
  fx += tag(BRK[0] + .2, BRK[1], 2.45, 'Ear defenders on', '#2c9a4a', ramp(t, HEAR_AT + .3, HEAR_AT + .6) * (1 - ramp(t, HAV_AT - .2, HAV_AT)), fs * .9);
  fx += tag(BRK[0] + .2, BRK[1], 2.45, 'Trigger time monitored', '#2c9a4a', ramp(t, HAV_AT, HAV_AT + .3) * (1 - ramp(t, REST_AT - .2, REST_AT)), fs * .9);
  fx += tag(BRK[0] + .2, BRK[1], 2.45, 'Breaks &amp; job rotation', '#2c9a4a', ramp(t, REST_AT, REST_AT + .3) * o41, fs * .9);
  // wet concrete
  const o50 = 1 - ramp(t, 50.2, 50.6);
  fx += tag(RAKER[0] - 1.2, RAKER[1] - .4, .9, 'Wet concrete burns skin', '#e5483b', ramp(t, BURN_AT, BURN_AT + .3) * (1 - ramp(t, GLOVE_AT - .3, GLOVE_AT)), fs * .9);
  fx += tag(RAKER[0], RAKER[1], 2.4, 'Gauntlets', '#2c9a4a', ramp(t, GLOVE_AT, GLOVE_AT + .3) * o50, fs * .9);
  fx += tag(RAKER[0] - .9, RAKER[1] + .9, 0, 'Wellington boots', '#2c9a4a', ramp(t, BOOT_AT, BOOT_AT + .3) * o50, fs * .9);
  fx += tag(WASH[0] + .2, WASH[1], 1.75, 'Washing &amp; eyewash', '#2c9a4a', ramp(t, WASH_AT, WASH_AT + .3) * o50, fs * .9);
  // unfamiliar product: stop; then the data sheet and instruction
  const o57 = 1 - ramp(t, 57.4, 57.8);
  fx += tag(DRUM[0], DRUM[1], 1.5, 'Unknown product', '#e07a1a', ramp(t, 51.6, 51.9) * (1 - ramp(t, INFO_AT - .3, INFO_AT)), fs * .9);
  if (nc) {
    fx += mark(nc.x, nc.y, 2.4, false, ramp(t, STOP_AT, STOP_AT + .3) * (1 - ramp(t, INFO_AT - .3, INFO_AT)));
    fx += tag(nc.x, nc.y, 3.2, "Don't use it yet", '#e5483b', ramp(t, STOP_AT, STOP_AT + .3) * (1 - ramp(t, INFO_AT - .3, INFO_AT)));
  }
  if (sv) {
    fx += mark(sv.x, sv.y, 2.4, true, ramp(t, INFO_AT, INFO_AT + .3) * o57);
    fx += tag(sv.x, sv.y, 3.2, 'Data sheet &amp; instruction', '#2c9a4a', ramp(t, INFO_AT, INFO_AT + .3) * o57);
  }
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 4.6, 5)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  const cs = $('coshh');
  show(cs, ramp(t, 17.2, 17.7) * (1 - ramp(t, 22.2, 22.7)), 1);
  cs.querySelectorAll('.row').forEach((r, i) => r.classList.toggle('ok', t >= COSHH_AT[i]));
  $('end').style.opacity = f2(ramp(t, 58.2, 58.9));
  $('end').querySelector('.line').style.width = (ramp(t, 59, 60) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 59, 59.6));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 59.8, 60.4));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 58.2, 60.2) * .7, ns: nc, sv };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  [DUST_AT, NOISE_AT, VIB_AT, ...PROD_AT, EXTRACT_AT, SUPP_AT, RPE_AT, FIT_AT, HEAR_AT, HAV_AT, REST_AT, BURN_AT, GLOVE_AT, BOOT_AT, WASH_AT, STOP_AT, INFO_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  COSHH_AT.forEach(tc => { if (cross(tc)) shot('card'); });
  if (cross(59)) shot('chime');
  for (const k of ['ns', 'sv']) if (F[k] && P0[k] && F[k].moving && Math.floor(F[k].d / .7) !== Math.floor(P0[k].d / .7)) shot('step');
  if (F.t > nextBird && F.t < 4) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
