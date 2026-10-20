/* Section 9: working at height and confined spaces.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 9</div>
      <div class="h">Working at height &amp; confined spaces</div>
      <div class="s">Planned access, protected edges, and no entry without every control in place.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="cscard"><div class="oc">
    <div class="hd"><img class="logoimg" alt="CWP"><span>Confined space entry</span></div>
    <div class="row"><b>Assessment</b><small>Risks of this space identified</small><i></i></div>
    <div class="row"><b>Authorisation</b><small>Entry permit issued</small><i></i></div>
    <div class="row"><b>Competent people</b><small>Trained entrant and top-person</small><i></i></div>
    <div class="row"><b>Gas monitoring</b><small>Tested before and during entry</small><i></i></div>
    <div class="row"><b>Isolation</b><small>Flows and power locked off</small><i></i></div>
    <div class="row"><b>Rescue plan</b><small>Equipment rigged, team ready</small><i></i></div>
  </div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Plan the work. Protect the edge. Never enter unprepared.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 9</div>
    <h1>Working at height &amp; confined spaces</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
// its own compact site: just the cabins, the building being scaffolded, the tank and the confined spaces
const LAYOUT = LAYOUTS.compact;
const DUR = 63;
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
const CREW = [
  // a labourer by the building, loading out blocks
  { at: [10.6, 7.2], dir: 1, skin: SKINS[1] },
]
// chip captions [from, to, kicker, text]
const CHIPS = [
  [4.4, 11, 'Work at height', 'Planned · right access equipment · fall protection'],
  [11.6, 17.2, 'Access equipment', 'Never use it damaged'],
  [17.6, 23.2, 'Edge protection &amp; scaffolds', 'Only altered with authorisation'],
  [23.8, 30.2, 'Confined spaces can kill', 'Manholes · chambers · tanks · wet wells'],
  [44, 47.6, 'Rescue', 'Planned and rigged before anyone goes in'],
  [48.2, 54.6, 'If someone collapses', 'Never go in after them: raise the alarm, follow the rescue plan'],
];
// blockwork building with a tube-and-fitting scaffold along its front; damaged kit in a quarantine bay;
// the manhole and an open valve chamber by the tank
const BLD = { x: 9, y: .8, w: 7, d: 4, h: 3.9 }, SC = { x0: 9, x1: 15, yi: 4.95, lifts: [1.9, 3.7] }, YO = SC.yi + 1.3, TOPZ = SC.lifts[1];
// laid out left to right in the order the voiceover visits them, so the camera only travels one way:
// scaffold → quarantine bay (ladder, tower, scaffold fittings) → formwork platform → manhole → chamber → tank → wet well
const BAD_TOWER = [20.6, -2.4], QBAY = [18, 26, -2.5, .2], FITTINGS = [23.6, -1.4];
const LADDER = [19.2, -1.3, 19.2, -2.45, 2];
const FORM = { x0: 28, x1: 32.2, y: .6, h: 2.6 }, DECK = FORM.h - 1.1, YP = FORM.y + .3 + .85;
const MH0 = [33, 7.4];                                                       // a manhole
const CHAMBER = [37.2, 38.2, 6.6, 7.6];                                      // open valve chamber
const MH = [48.6, 6.8];                                                      // the wet well: the space that's entered
const KIOSK_TAG = [50.7, 4.51, 1.1];
const PLAN_AT = [5.85, 6.85, 8.7];                                           // planned · access equipment · fall protection
const BAD_AT = [11.6, 13.7, 14.6], RAIL_AT = 19.4, FORM_X = 30;
// with the rail out he steps to the open edge and falls; reset once the camera has moved on
const STEP_AT = 20, FALL_AT = 20.6, LAND_AT = 21.15, FALL_RESET = 30.8;
const TYPE_AT = [25.25, 26.45, 27.2, 27.8];                                  // manholes · chambers · tanks · wet wells
const CS_AT = [30.6, 34.8, 36.4, 38.2, 39.8, 41.2];
const RESCUE_AT = 44, IN_AT = 47.6, COLLAPSE_AT = 49.2, RUSH_STOP = 50.8, WINCH_AT = 51.6, OUT_AT = 54;

function entrantAt(t) {
  // stands by the shaft, clips on, is lowered in; collapses below; winched back out
  if (t < IN_AT) return { x: MH[0] - .9, y: MH[1] - .3, z: 0 };
  if (t < WINCH_AT) return { x: MH[0], y: MH[1], z: -2 * ramp(t, IN_AT, IN_AT + 1.1) };
  return { x: MH[0], y: MH[1], z: -2 * (1 - ramp(t, WINCH_AT, OUT_AT)) };
}
function fallAt(t) {
  // on the deck → steps forward through the gap → falls, tipping head-first → lies on the ground
  if (t < STEP_AT || t >= FALL_RESET) return { y: YP - .4, z: DECK, rot: 0 };
  if (t < FALL_AT) return { y: lerp(YP - .4, YP - .02, ramp(t, STEP_AT, FALL_AT)), z: DECK, rot: 0, moving: true };
  const u = ramp(t, FALL_AT, LAND_AT);
  return { y: lerp(YP - .02, YP + .7, u), z: DECK * (1 - u * u), rot: -112 * Math.min(1, u * 1.15) };   // tips away from the access ladder
}
function rusherAt(t) {
  // a colleague starts towards the shaft, stops at the barrier, steps back
  return walkPath([[48.6, MH[0] - 3.8, 9.6], [RUSH_STOP - .2, MH[0] - 1.8, 8.2], [52.4, MH[0] - 1.8, 8.2], [54, MH[0] - 3.2, 9.4]], t);
}
function cameraAt(t) {
  // mobile: step to each confined space as it's named, instead of one wide shot
  const f = MOBILE && focusSeq(t, 24.6, 29.9, [
    [24.6, () => [MH0[0], MH0[1], .8], 520],
    [TYPE_AT[0] - .35, () => [MH0[0], MH0[1], .6], 400],
    [TYPE_AT[1] - .35, () => [(CHAMBER[0] + CHAMBER[1]) / 2, (CHAMBER[2] + CHAMBER[3]) / 2, .6], 400],
    [TYPE_AT[2] - .35, () => [42, 2.6, 1.6], 560],
    [TYPE_AT[3] - .2, () => [MH[0], MH[1], .6], 420],
  ]);
  if (f) return f;
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  // every move between areas is a steady, constant-speed pan ('lin'), always left to right
  const keys = [
    [0, c(22, 4, 1, 1500)], [4.4, c(12.6, 5.2, 2.4, 520)], [11, c(12.8, 5.2, 2.4, 500)],
    [11.8, c(19.4, -1.2, 1, 460), 'lin'], [13.4, c(19.6, -1.2, 1, 460)],
    [13.9, c(21.4, -1.2, 1, 460), 'lin'], [14.3, c(21.6, -1.2, 1, 460)],
    [14.8, c(23.6, -1.2, .6, 440), 'lin'], [17.2, c(23.8, -1.2, .6, 440)],
    [18, c(FORM_X, 2.2, 1.4, 500), 'lin'], [23, c(FORM_X + .2, 2.2, 1.6, 480)],
    [24.6, MOBILE ? c(MH0[0], MH0[1], .8, 520) : c(41, 5, 1, 1100), 'lin'], [29.9, MOBILE ? c(MH[0], MH[1], .6, 420) : c(41.2, 5, 1, 1060)],
    [31.1, MOBILE ? c(MH[0], MH[1] - .1, 1, 420) : c(49.6, 6.1, 1, 640), 'lin'], [43.6, MOBILE ? c(MH[0], MH[1] - .1, 1, 410) : c(49.6, 6.1, 1, 620)],
    [44, c(MH[0], MH[1] + .1, 1, 440)], [47.6, c(MH[0], MH[1] + .1, 1, 430)],
    [48.2, c(MH[0] - .6, MH[1] + .5, .8, 520)], [55, c(MH[0] - .4, MH[1] + .5, .8, 500)],
    [55.6, c(22, 4, 1, 1500)], [63, c(23, 4, 1, 1480)],
  ];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b, mode] = keys[i + 1];
    if (t <= t1) { const u = t1 - t0 < .2 ? 1 : mode === 'lin' ? clamp((t - t0) / (t1 - t0)) : smooth((t - t0) / (t1 - t0)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u) }; }
  }
  return keys[keys.length - 1][1];
}

/* ---------------------------------------------------------------- sound */
function audioUpdate(F) {
  const ctx = A.ctx; if (!ctx) return;
  const n = ctx.currentTime;
  const busy = F.t > 4 && F.t < 55 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 55.5 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 55 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-9/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, 'Working at height, and confined spaces.'],
  [4.4, 1, 0, null, 'Work at height must be properly planned, with the right access equipment, and protection against falls.'],
  // one take (clip 17), split at its pauses so each item lands on its picture
  [11.6, 16, 0, 1.83, 'Never use damaged ladders,'],
  [13.7, 16, 1.83, 2.52, 'towers,'],
  [14.6, 16, 2.52, null, 'or scaffolds.'],
  [17.6, 5, 0, null, 'And never remove edge protection, or alter scaffolding, without authorisation.'],
  [23.8, 6, 0, null, 'Confined spaces, like manholes, chambers, tanks, and wet wells, can kill.'],
  [30.6, 7, 0, null, 'No one enters a confined space without the assessment,'],
  [34.8, 8, 0, null, 'authorisation,'],
  [36.4, 9, 0, null, 'competent people,'],
  [38.2, 10, 0, null, 'gas monitoring,'],
  [39.8, 11, 0, null, 'isolation,'],
  [41.2, 12, 0, null, 'and a rescue plan in place.'],
  [44, 13, 0, null, 'Rescue must be planned before anyone goes in.'],
  [48.2, 14, 0, null, 'If someone collapses, never go in after them. Raise the alarm, and follow the rescue plan.'],
  [55.6, 15, 0, null, 'Plan the work. Protect the edge. Never enter unprepared.'],
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

  const items = [];
  items.push({ k: -1.2, bb: [-5.6, -1.2, 1, 2], s: STAIR || (STAIR = stair(-5.6, -4.2, -1.2, 1, 2, 2.7)) });
  for (const p of CREW) items.push({ k: p.at[0] + p.at[1], s: person({ x: p.at[0], y: p.at[1], dir: p.dir || 1, tool: 'carry', carrying: [], skin: p.skin, t }) });

  // working at height: building, scaffold (back layer, then the bricklayer, then guardrails), with a rail out while it's tampered with
  const railOff = t >= RAIL_AT && t < FALL_RESET;
  items.push({ k: BLD.x + BLD.w / 2 + BLD.y + BLD.d / 2, bb: [BLD.x, BLD.x + BLD.w, BLD.y, BLD.y + BLD.d], s: blockBuilding(BLD.x, BLD.y, BLD.w, BLD.d, BLD.h) });
  items.push({ k: 12 + SC.yi + .3, bb: [SC.x0, SC.x1, SC.yi, YO - .4], s: tubeScaffold(SC.x0, SC.x1, SC.yi, SC.lifts, { part: 'back' }) });
  items.push({ k: 12 + YO, bb: [SC.x0, SC.x1 + .7, YO - .05, YO + .05], s: tubeScaffold(SC.x0, SC.x1, SC.yi, SC.lifts, { part: 'front' }) });
  items.push({ k: (FORM.x0 + FORM.x1) / 2 + FORM.y, bb: [FORM.x0, FORM.x1, FORM.y, YP - .5], s: wallFormwork(FORM.x0, FORM.x1, FORM.y, FORM.h, { railOff, part: 'back' }) });
  items.push({ k: (FORM.x0 + FORM.x1) / 2 + YP, bb: [FORM.x0, FORM.x1, YP - .05, YP + .05], s: wallFormwork(FORM.x0, FORM.x1, FORM.y, FORM.h, { railOff, part: 'front' }) });
  items.push({ k: FORM.x1 - .5 + YP + .6, bb: [FORM.x1 - .8, FORM.x1 - .2, YP, YP + 1.1], s: leaningLadder(FORM.x1 - .5, YP + 1.1, FORM.x1 - .5, YP - .05, DECK + 1) });
  {
    // the formwork hand: takes the rail out, steps to the open edge, falls to the ground
    const f = fallAt(t), body = person({ x: FORM_X, y: f.y, z: f.z, dir: 1, work: !railOff && f.rot === 0 && f.y < YP - .3, moving: f.moving, phase: t * 9, seed: 3, raise: ramp(t, RAIL_AT - .5, RAIL_AT) * (1 - ramp(t, RAIL_AT + .2, RAIL_AT + .5)) * .6, skin: SKINS[4], t });
    let s = body;
    if (f.rot) {
      const [px, py] = P(FORM_X, f.y, f.z), [gx, gy] = P(FORM_X, f.y, 0), r = f.rot * Math.PI / 180, lay = f.z < .1 ? .42 * 1.8 * S : 0;
      s = `<ellipse cx="${f1(gx + Math.sin(r) * lay)}" cy="${f1(gy - Math.cos(r) * lay + 1)}" rx="${f1(lay ? 30 : 10)}" ry="${f1(lay ? 7 : 3.2)}" fill="#2a2010" opacity=".33"/><g transform="rotate(${f1(f.rot)} ${f1(px)} ${f1(py)})">${body.replace(/<ellipse[^>]*opacity="\.33"\/>/, '')}</g>`;
    }
    items.push({ k: FORM_X + f.y + (f.y > YP ? .3 : -.2), s });
  }
  items.push({ k: 12.4 + SC.yi + .5, s: person({ x: 12.4, y: SC.yi + .5, z: TOPZ, dir: -1, work: true, seed: 1, skin: SKINS[2], t }) });
  // open valve chamber with its cover aside, behind barriers
  items.push({ k: -45, bb: [MH0[0] - .6, MH0[0] + .6, MH0[1] - .6, MH0[1] + .6], s: poly(isoCircle(MH0[0], MH0[1], .55, .015, 20), '#5c5f62', 'stroke="#2c2c2c" stroke-width="1"') + poly(isoCircle(MH0[0], MH0[1], .38, .02, 20), 'none', 'stroke="#3a3a3a" stroke-width="1"') });
  items.push({ k: -44, bb: [MH[0] - 1.1, MH[0] + 1.1, MH[1] - 1.1, MH[1] + 1.1], s: box(MH[0] - 1.1, MH[1] - 1.1, 0, 2.2, 2.2, .25, '#a7a39b') });
  items.push({ k: -40, bb: CHAMBER, s: pit('valvech', ...CHAMBER, 1.3) + poly(isoCircle(CHAMBER[1] + .6, CHAMBER[2] + .3, .4, .02, 16), '#5c5f62') });
  for (const [a2, b2] of [[[CHAMBER[0] - .3, 8], [CHAMBER[1] + .5, 8]], [[CHAMBER[1] + .5, 6.3], [CHAMBER[1] + .5, 8]]]) items.push({ k: (a2[0] + b2[0]) / 2 + (a2[1] + b2[1]) / 2, bb: [Math.min(a2[0], b2[0]) - .1, Math.max(a2[0], b2[0]) + .1, Math.min(a2[1], b2[1]) - .1, Math.max(a2[1], b2[1]) + .1], s: barrier(a2, b2) });
  // damaged access equipment, tagged out
  items.push({ k: 19.2 - 1.9, bb: [18.9, 19.5, -2.5, -1.2], s: leaningLadder(...LADDER, { damaged: true }) });
  // quarantine bay: barriers and a sign
  items.push({ k: QBAY[0] + QBAY[3], bb: [QBAY[0] - .1, QBAY[0] + .1, QBAY[2], QBAY[3]], s: barrier([QBAY[0], QBAY[2]], [QBAY[0], QBAY[3]]) });
  for (let x = QBAY[0]; x < QBAY[1] - .1; x += 2) items.push({ k: x + 1 + QBAY[3], bb: [x, x + 2, QBAY[3] - .1, QBAY[3] + .1], s: barrier([x, QBAY[3]], [Math.min(x + 2, QBAY[1]), QBAY[3]]) });
  items.push({ k: 25.4 + .3, bb: [25.2, 26.2, .25, .35], s: signXZ(25.1, .3, 1.75, 1.3, .55, `<rect width="1.3" height=".55" fill="#d42a20" stroke="#fff" stroke-width=".03"/><text x=".65" y=".23" font-size=".14" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="1.12" lengthAdjust="spacingAndGlyphs">DEFECTIVE EQUIPMENT</text><text x=".65" y=".44" font-size=".14" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength=".8" lengthAdjust="spacingAndGlyphs">DO NOT USE</text>`) + line3([25.75, .3, 0], [25.75, .3, 1.2], '#7d7d7d', 2) });
  // damaged scaffold fittings: a bundle of tubes, one bent, and loose couplers
  items.push({ k: FITTINGS[0] + FITTINGS[1], bb: [FITTINGS[0] - 1.1, FITTINGS[0] + 1.1, FITTINGS[1] - .4, FITTINGS[1] + .4], s: [-.2, 0, .2].map((dy, i) => line3([FITTINGS[0] - 1.1, FITTINGS[1] + dy, .08 + i % 2 * .1], [FITTINGS[0] + 1.1, FITTINGS[1] + dy, .08 + i % 2 * .1], '#9aa2a8', 3.4)).join('') + `<path d="M${pts([[FITTINGS[0] - 1, FITTINGS[1] + .45, .1]])} Q${pts([[FITTINGS[0], FITTINGS[1] + .45, .7]])} ${pts([[FITTINGS[0] + 1, FITTINGS[1] + .6, .1]])}" stroke="#9aa2a8" stroke-width="3.4" fill="none"/>`.replace(/(-?\d+\.\d+),(-?\d+\.\d+)/g, '$1 $2') + box(FITTINGS[0] + .3, FITTINGS[1] - .5, 0, .18, .14, .1, '#6c7277') + box(FITTINGS[0] + .6, FITTINGS[1] - .45, 0, .18, .14, .1, '#6c7277') });
  items.push({ k: BAD_TOWER[0] + .7 + BAD_TOWER[1] + 1.2, bb: [BAD_TOWER[0], BAD_TOWER[0] + 1.4, BAD_TOWER[1], BAD_TOWER[1] + 2.4], s: scaffoldTower(...BAD_TOWER, 1, { damaged: true }) });
  // confined space: barriers, permit board, isolation lock on the kiosk, tripod once rescue is planned
  for (const [a, b] of [[[MH[0] - 1.5, MH[1] - 1.3], [MH[0] + .5, MH[1] - 1.3]], [[MH[0] - 1.5, MH[1] - 1.3], [MH[0] - 1.5, MH[1] + .7]]]) items.push({ k: (a[0] + b[0]) / 2 + (a[1] + b[1]) / 2, bb: [Math.min(a[0], b[0]) - .1, Math.max(a[0], b[0]) + .1, Math.min(a[1], b[1]) - .1, Math.max(a[1], b[1]) + .1], s: barrier(a, b) });
  items.push({ k: MH[0] - 2.8 + MH[1] - .5, bb: [MH[0] - 3.4, MH[0] - 2.1, MH[1] - .6, MH[1] - .4], s: permitBoard(MH[0] - 3.4, MH[1] - .5) });
  const ent = entrantAt(t);
  items.push({ k: MH[0] + MH[1] - .3, bb: [MH[0] - .6, MH[0] + 1.6, MH[1] - .9, MH[1] + .6], s: manholeEntry(...MH, t, { tripod: t >= CS_AT[5], lineZ: t >= IN_AT ? ent.z + 1.4 : -.6 }) });
  // the entrant, shown only above the rim while in the shaft
  {
    const [ox, oy] = P(MH[0], MH[1], 0), r = .42 * S;
    const body = person({ x: ent.x, y: ent.y, z: ent.z, dir: 1, extra: { harness: true }, skin: SKINS[0], t });
    const clip = ent.z < -.05 ? `<clipPath id="shaft"><path d="M${f1(ox - 60)} ${f1(oy - 120)} H${f1(ox + 60)} V${f1(oy)} H${f1(ox + r)} A${f1(r)} ${f1(r * .5)} 0 0 1 ${f1(ox - r)} ${f1(oy)} H${f1(ox - 60)} Z"/></clipPath>` : '';
    items.push({ k: ent.x + ent.y + (ent.z < 0 ? -.4 : 0), s: clip ? clip + `<g clip-path="url(#shaft)">${body}</g>` : body });
  }
  const topPerson = { x: MH[0] + 1.1, y: MH[1] + .7 };
  const alarm = t > COLLAPSE_AT + .4 && t < WINCH_AT;
  items.push({ k: topPerson.x + topPerson.y, s: person({ ...topPerson, dir: -1, tool: t > WINCH_AT && t < OUT_AT ? 'winch' : alarm ? 'radio' : t >= CS_AT[3] - .2 && t < 44 ? 'gas' : 'tablet', talk: alarm, extra: { harness: false }, skin: SKINS[1], t }) });
  const ru = rusherAt(t);
  if (ru) items.push({ k: ru.x + ru.y, s: person({ ...ru, dir: ru.moving ? ru.dir : -1, skin: SKINS[3], t }) });
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  let fx = '';
  // planning, access equipment, fall protection
  const o11 = 1 - ramp(t, 10.8, 11.2);
  fx += tag(12.4, SC.yi + .5, TOPZ + 2.5, 'Planned', '#2c9a4a', ramp(t, PLAN_AT[0], PLAN_AT[0] + .3) * o11, fs * .9);
  fx += tag(SC.x1 + .4, YO, 1.2, 'Right access equipment', '#2c9a4a', ramp(t, PLAN_AT[1], PLAN_AT[1] + .3) * o11, fs * .9);
  fx += tag(SC.x0 + 1, YO, TOPZ + 1.6, 'Guardrails: fall protection', '#2c9a4a', ramp(t, PLAN_AT[2], PLAN_AT[2] + .3) * o11, fs * .9);
  // damaged access equipment
  fx += mark(19.2, -1.7, 2.4, false, ramp(t, BAD_AT[0], BAD_AT[0] + .3) * (1 - ramp(t, 14.2, 14.5))) + tag(19.2, -1.7, 3.2, 'Damaged ladder', '#e5483b', ramp(t, BAD_AT[0], BAD_AT[0] + .3) * (1 - ramp(t, 14.2, 14.5)));
  fx += mark(BAD_TOWER[0] + .7, BAD_TOWER[1] + 1.2, 2.2, false, ramp(t, BAD_AT[1], BAD_AT[1] + .3) * (1 - ramp(t, 14.2, 14.5))) + tag(BAD_TOWER[0] + .7, BAD_TOWER[1] + 1.2, 3, 'Damaged tower', '#e5483b', ramp(t, BAD_AT[1], BAD_AT[1] + .3) * (1 - ramp(t, 14.2, 14.5)));
  fx += mark(FITTINGS[0], FITTINGS[1], 1, false, ramp(t, BAD_AT[2], BAD_AT[2] + .3) * (1 - ramp(t, 17.2, 17.5))) + tag(FITTINGS[0], FITTINGS[1], 1.8, 'Damaged scaffold fittings', '#e5483b', ramp(t, BAD_AT[2], BAD_AT[2] + .3) * (1 - ramp(t, 17.2, 17.5)));
  // edge protection removed without authorisation, then put back
  fx += mark(FORM_X - .3, YP, DECK + 1.6, false, ramp(t, RAIL_AT, RAIL_AT + .3) * (1 - ramp(t, LAND_AT - .1, LAND_AT + .2)));
  fx += tag(FORM_X - .3, YP, DECK + 2.5, 'Not authorised', '#e5483b', ramp(t, RAIL_AT, RAIL_AT + .3) * (1 - ramp(t, LAND_AT - .1, LAND_AT + .2)));
  fx += tag(FORM_X - .6, YP + 1.1, .9, 'Fall from height', '#e5483b', ramp(t, LAND_AT + .1, LAND_AT + .4) * (1 - ramp(t, 23.4, 23.7)));
  // confined space types
  const o30 = 1 - ramp(t, 29.8, 30.2);
  fx += tag(MH0[0], MH0[1], .6, 'Manhole', '#e07a1a', ramp(t, TYPE_AT[0], TYPE_AT[0] + .3) * o30);
  fx += tag((CHAMBER[0] + CHAMBER[1]) / 2, 7.1, 1.5, 'Chamber', '#e07a1a', ramp(t, TYPE_AT[1], TYPE_AT[1] + .3) * o30);
  fx += tag(42, 2.6, 3.2, 'Tank', '#e07a1a', ramp(t, TYPE_AT[2], TYPE_AT[2] + .3) * o30);
  fx += tag(MH[0], MH[1], .9, 'Wet well', '#e07a1a', ramp(t, TYPE_AT[3], TYPE_AT[3] + .3) * o30);
  // entry controls
  const o43 = 1 - ramp(t, 43.4, 43.8);
  fx += tag(MH[0] - 2.8, MH[1] - .5, 2.5, 'Permit to enter', '#2c9a4a', ramp(t, CS_AT[1], CS_AT[1] + .3) * o43);
  fx += tag(topPerson.x, topPerson.y, 2.3, 'Gas: safe', '#2c9a4a', ramp(t, CS_AT[3], CS_AT[3] + .3) * o43, fs * .9);
  if (t >= CS_AT[4]) {
    const [px, py] = P(...KIOSK_TAG), a = ramp(t, CS_AT[4], CS_AT[4] + .3);
    fx += `<g opacity="${f2(a)}"><rect x="${f1(px - 7)}" y="${f1(py - 3)}" width="14" height="16" rx="1.5" fill="#d42a20" stroke="#fff" stroke-width="1"/><text x="${f1(px)}" y="${f1(py + 4.5)}" font-size="4" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="11" lengthAdjust="spacingAndGlyphs">LOCKED</text><text x="${f1(px)}" y="${f1(py + 10)}" font-size="4" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="11" lengthAdjust="spacingAndGlyphs">OFF</text><path d="M${f1(px - 2.5)} ${f1(py - 3)} v-3 a2.5 2.5 0 0 1 5 0 v3" stroke="#333" stroke-width="1.2" fill="none"/></g>`;
    fx += tag(50.7, 4.5, 2.4, 'Isolated', '#2c9a4a', a * o43);
  }
  fx += tag(MH[0] + 1.6, MH[1] - 1.2, 2.7, 'Rescue tripod & winch', '#2c9a4a', ramp(t, CS_AT[5], CS_AT[5] + .3) * (1 - ramp(t, 44.6, 45)));
  // rescue: planned before entry, then the collapse
  fx += tag(ent.x, ent.y, 2.2, 'Harness on, line attached', '#2c9a4a', ramp(t, RESCUE_AT + 1, RESCUE_AT + 1.3) * (1 - ramp(t, IN_AT - .3, IN_AT)), fs * .9);
  fx += tag(MH[0], MH[1], .4, 'Entrant collapsed', '#e5483b', ramp(t, COLLAPSE_AT, COLLAPSE_AT + .3) * (1 - ramp(t, WINCH_AT, WINCH_AT + .3)));
  if (ru) {
    fx += mark(ru.x, ru.y, 2.4, false, ramp(t, RUSH_STOP, RUSH_STOP + .3) * (1 - ramp(t, 53.6, 54)));
    fx += tag(ru.x, ru.y, 3.2, "Don't go in after them", '#e5483b', ramp(t, RUSH_STOP, RUSH_STOP + .3) * (1 - ramp(t, 53.6, 54)));
  }
  fx += tag(topPerson.x, topPerson.y, 2.4, 'Alarm raised', '#e07a1a', ramp(t, COLLAPSE_AT + .4, COLLAPSE_AT + .7) * (1 - ramp(t, WINCH_AT - .2, WINCH_AT)));
  fx += tag(topPerson.x, topPerson.y, 2.4, 'Rescue plan: winched out', '#2c9a4a', ramp(t, WINCH_AT, WINCH_AT + .3) * (1 - ramp(t, 54.8, 55.2)));
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 4, 4.4)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  const cs = $('cscard');
  show(cs, ramp(t, 30.4, 30.9) * (1 - ramp(t, 43.4, 43.9)), 1);
  cs.querySelectorAll('.row').forEach((r, i) => r.classList.toggle('ok', t >= CS_AT[i]));
  $('end').style.opacity = f2(ramp(t, 55.2, 55.9));
  $('end').querySelector('.line').style.width = (ramp(t, 56, 57) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 56, 56.6));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 56.8, 57.4));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 55.2, 57.2) * .7, ns: ru };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  [...PLAN_AT, ...BAD_AT, RAIL_AT, ...TYPE_AT, RUSH_STOP, WINCH_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  CS_AT.forEach(tc => { if (cross(tc)) shot('card'); });
  if (cross(COLLAPSE_AT + .4)) shot('beep');
  if (cross(LAND_AT)) shot('thud');
  if (cross(56)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 4) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
