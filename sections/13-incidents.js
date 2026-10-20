/* Section 13: accidents, near misses and unsafe conditions.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 13</div>
      <div class="h">Accidents, near misses &amp; unsafe conditions</div>
      <div class="s">Report everything, near misses included, and stop anything unsafe.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="rpcard"><div class="oc">
    <div class="hd"><img class="logoimg" alt="CWP"><span>Report to your supervisor</span></div>
    <div class="row"><b>Accidents</b><i></i></div>
    <div class="row"><b>Injuries</b><i></i></div>
    <div class="row"><b>Near misses</b><i></i></div>
    <div class="row"><b>Damage</b><i></i></div>
    <div class="row"><b>Dangerous occurrences</b><i></i></div>
    <div class="ft">As soon as possible</div>
  </div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>See it. Make it safe. Report it.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 13</div>
    <h1>Accidents, near misses &amp; unsafe conditions</h1>`,
  hint: 'Under a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
// its own compact site: the cabins, a building being scaffolded (the near miss) and a missing cover (the unsafe condition)
const LAYOUT = { ...LAYOUTS.compact, tank: null };   // no treatment tank: nothing here needs it
const DUR = 50;
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
// chip captions [from, to, kicker, text]
const CHIPS = [
  [14.2, 19.2, 'Near miss', 'Nobody hurt, but somebody could have been'],
  [19.6, 26.8, 'Report near misses', 'So we put things right before someone gets hurt'],
  [27.2, 31.2, 'Speak up', 'No one is criticised for a genuine concern'],
  [33, 43.4, 'Unsafe condition', 'Stop · make it safe if you safely can · report it'],
];
// laid out left to right in the order the voiceover visits them:
// the scaffolded building (near miss, report, put right) → the missing cover (stop, make safe, report)
const BLD = { x: 9, y: .8, w: 7, d: 4, h: 3.9 }, SC = { x0: 9, x1: 15, yi: 4.95, lifts: [1.9, 3.7] }, YO = SC.yi + 1.3, TOPZ = SC.lifts[1];
const PILE = [13.1, SC.yi + 1];                                              // blocks stacked at the edge of the top lift
const BOSS = { x: 18.6, y: 7.5 };                                            // the supervisor
const HOLE = [27.6, 6.2], HW = .36;                                          // a missing chamber cover
const CARD_AT = [4.9, 5.9, 6.7, 7.6, 8.4];                                   // accidents · injuries · near misses · damage · dangerous occurrences
const DROP_AT = 14.7, LAND_AT = 15.25, REPORT_AT = 22, GUARD_AT = 24.2, THANKS_AT = 27.6;
const UNSAFE_AT = 33.5, STOP_AT = 34.6, BAR_AT = [37.2, 38.2, 39.2, 40.2], SAFE_AT = 40.6, RADIO_AT = 41.4;

// the labourer walking past the scaffold: stops dead when the block lands, then goes to report it
function walkerAt(t) {
  return walkPath([[0, 6.6, 7.3], [LAND_AT, 12.2, 7.3], [19.8, 12.2, 7.3], [REPORT_AT, 17.5, 7.5]], t);
}
// the falling block: knocked off the pile, drops past the guardrails, lands beside the path
function blockAt(t) {
  if (t < DROP_AT) return { x: PILE[0] + .1, y: PILE[1] - .05, z: TOPZ, rot: 0 };
  const u = ramp(t, DROP_AT, LAND_AT), g = clamp((t - DROP_AT) / (LAND_AT - DROP_AT));
  return { x: PILE[0] + .2, y: lerp(PILE[1] - .05, 6.75, u), z: TOPZ * (1 - g * g), landed: t >= LAND_AT };
}
// the second worker: walking, stops short of the open chamber, puts barriers round it, reports it
function finderAt(t) {
  const [x, y] = HOLE, o = HW + .75;
  return walkPath([[31.4, x - 4, y + .3], [33.9, x - o, y + .3], [36.4, x - o, y + .3], [37.2, x - o, y], [37.7, x - o, y - o], [38.2, x, y - o],
    [38.7, x + o, y - o], [39.2, x + o, y], [39.7, x + o, y + o], [40.2, x, y + o], [41.1, x - 1.5, y + o + .3]], t);
}
const SIDES = [[[-1, -1], [-1, 1]], [[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[-1, 1], [1, 1]]];   // west, north, east, south
function cameraAt(t) {
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  // mobile: the near miss, the report and the brick guard each get their own shot
  const f = MOBILE && focusSeq(t, 14, 31.4, [
    [14, () => [12.8, 6.6, 1.8], 400],
    [19.9, () => [16.4, 7.3, 1], 430],
    [GUARD_AT - .4, () => [12.2, YO, TOPZ], 420],
    [THANKS_AT - .5, () => [18, 7.4, 1], 400],
  ]);
  if (f) return f;
  // every move between areas is a steady, constant-speed pan ('lin'), always left to right
  const keys = [
    [0, c(22, 4, 1, 1500)],
    [4.4, MOBILE ? c(14.2, 7, .2, 520) : c(17.6, 4.8, 1.4, 640)], [13.6, MOBILE ? c(14.2, 7, .2, 520) : c(17.6, 4.8, 1.4, 620)],
    [14.2, c(13.2, 6.4, 1.8, 480)], [19.4, c(13.6, 6.4, 1.8, 470)],
    [20.2, c(15.2, 6.4, 2.4, 580)], [31.2, c(15.4, 6.4, 2.4, 560)],
    [33, c(HOLE[0] - .8, HOLE[1] - .3, .8, MOBILE ? 380 : 400), 'lin'], [43.4, c(HOLE[0] - .6, HOLE[1] - .3, .8, MOBILE ? 370 : 390)],
    [44.4, c(22, 4, 1, 1500)], [DUR, c(23, 4, 1, 1480)],
  ];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b, mode] = keys[i + 1];
    if (t <= t1) { const u = t1 - t0 < .2 ? 1 : mode === 'lin' ? clamp((t - t0) / (t1 - t0)) : smooth((t - t0) / (t1 - t0)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u) }; }
  }
  return keys[keys.length - 1][1];
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-13/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, 'Accidents, near misses, and unsafe conditions.'],
  [4.6, 1, 0, null, 'All accidents, injuries, near misses, damage, and dangerous occurrences must be reported to your supervisor as soon as possible.'],
  [14.2, 2, 0, null, 'This includes incidents where nobody was injured, but somebody could have been.'],
  [19.6, 3, 0, null, 'Near-miss reporting is important, because it gives us an opportunity to put things right before someone gets hurt.'],
  [27.2, 4, 0, null, 'You will not be criticised for raising a genuine safety concern.'],
  // one take (clip 6), split at its pauses so each step lands on its picture
  [33, 5, 0, 3, 'If something is unsafe, stop the activity,'],
  [36.6, 5, 3, 7.3, 'make the area safe where you can do so without putting yourself at risk,'],
  [41.2, 5, 7.3, null, 'and report it.'],
  [44.8, 6, 0, null, 'See it. Make it safe. Report it.'],
];

/* ---------------------------------------------------------------- sound */
function audioUpdate(F) {
  const ctx = A.ctx; if (!ctx) return;
  const n = ctx.currentTime;
  const busy = F.t > 4 && F.t < 44 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 44.5 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 44 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- frame */
// a concrete block, with the cut end facing the camera
const block = (x, y, z) => box(x - .22, y - .11, z, .44, .22, .22, '#b3ada3');
// a mesh brick guard clipped to the top lift's guardrails
function brickGuard(x0, x1, y, z, a) {
  if (a <= 0) return '';
  let o = poly([[x0, y, z + .15], [x1, y, z + .15], [x1, y, z + 1.05], [x0, y, z + 1.05]], 'url(#mesh)', 'stroke="#5d6468" stroke-width="1.2"');
  o += poly([[x0, y, z + .15], [x1, y, z + .15], [x1, y, z + 1.05], [x0, y, z + 1.05]], 'rgba(40,46,50,.18)');
  return `<g opacity="${f2(a)}">${o}</g>`;
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

  // the building and its scaffold (back layer, then the bricklayer and the block pile, then guardrails and the brick guard)
  items.push({ k: BLD.x + BLD.w / 2 + BLD.y + BLD.d / 2, bb: [BLD.x, BLD.x + BLD.w, BLD.y, BLD.y + BLD.d], s: blockBuilding(BLD.x, BLD.y, BLD.w, BLD.d, BLD.h) });
  items.push({ k: 12 + SC.yi + .3, bb: [SC.x0, SC.x1, SC.yi, YO - .4], s: tubeScaffold(SC.x0, SC.x1, SC.yi, SC.lifts, { part: 'back' }) });
  items.push({ k: 12 + YO, bb: [SC.x0, SC.x1 + .7, YO - .05, YO + .05], s: tubeScaffold(SC.x0, SC.x1, SC.yi, SC.lifts, { part: 'front' }) + brickGuard(SC.x0, SC.x1, YO + .03, TOPZ, ramp(t, GUARD_AT, GUARD_AT + .5)) });
  items.push({ k: 11.6 + SC.yi + .5, s: person({ x: 11.6, y: SC.yi + .5, z: TOPZ, dir: 1, work: true, seed: 1, skin: SKINS[2], t }) });
  items.push({ k: PILE[0] + PILE[1] - .1, bb: [PILE[0] - .3, PILE[0] + .3, PILE[1] - .3, PILE[1] - .05], s: block(PILE[0], PILE[1] - .2, TOPZ) + block(PILE[0], PILE[1] - .2, TOPZ + .2) + block(PILE[0] - .1, PILE[1] - .25, TOPZ + .4) });
  const bl = blockAt(t);
  items.push({ k: bl.x + bl.y + (bl.y < YO ? -.6 : 0), bb: [bl.x - .2, bl.x + .2, bl.y - .1, bl.y + .1], s: block(bl.x, bl.y, bl.z) + (bl.landed ? block(bl.x + .25, bl.y + .2, 0) : '') });

  // the labourer, the supervisor
  const wk = walkerAt(t), reporting = t >= REPORT_AT && t < 31.4;
  items.push({ k: wk.x + wk.y, s: person({ x: wk.x, y: wk.y, dir: wk.moving ? wk.dir : 1, moving: wk.moving, phase: wk.phase, raise: ramp(t, LAND_AT, LAND_AT + .15) * (1 - ramp(t, LAND_AT + .8, LAND_AT + 1.2)) * .5, talk: reporting, skin: SKINS[1], t }) });
  items.push({ k: BOSS.x + BOSS.y, s: person({ ...BOSS, dir: -1, tool: 'tablet', vest: 'cwp', skin: SKINS[3], t }) });

  // the missing cover: an open chamber, the broken lid beside it, barriers going up round it
  const [hx, hy] = HOLE;
  items.push({ k: -40, bb: [hx - HW, hx + HW, hy - HW, hy + HW], s: poly([[hx - HW - .14, hy - HW - .14, .01], [hx + HW + .14, hy - HW - .14, .01], [hx + HW + .14, hy + HW + .14, .01], [hx - HW - .14, hy + HW + .14, .01]], '#8f8b84', 'stroke="#5a5650" stroke-width="1"') + pit('ch13', hx - HW, hx + HW, hy - HW, hy + HW, 1.1, '#5f5b55') });
  // the broken cover, cracked in two, lying beside it
  items.push({ k: hx + hy + 1.4, bb: [hx + .55, hx + 1.45, hy + .5, hy + 1.3], s: poly([[hx + .6, hy + .55, .03], [hx + 1.05, hy + .55, .03], [hx + .95, hy + 1.25, .03], [hx + .6, hy + 1.25, .03]], '#4f5357', 'stroke="#2c2c2c" stroke-width="1"') +
    poly([[hx + 1.1, hy + .5, .03], [hx + 1.45, hy + .5, .03], [hx + 1.45, hy + 1.2, .03], [hx + 1.02, hy + 1.2, .03]], '#4f5357', 'stroke="#2c2c2c" stroke-width="1"') });
  const o = HW + .3;
  SIDES.forEach(([a, b], i) => {
    const al = ramp(t, BAR_AT[i] - .2, BAR_AT[i] + .2);
    if (al <= 0) return;
    const A2 = [hx + a[0] * o, hy + a[1] * o], B2 = [hx + b[0] * o, hy + b[1] * o];
    items.push({ k: (A2[0] + B2[0]) / 2 + (A2[1] + B2[1]) / 2, bb: [Math.min(A2[0], B2[0]) - .08, Math.max(A2[0], B2[0]) + .08, Math.min(A2[1], B2[1]) - .08, Math.max(A2[1], B2[1]) + .08], s: `<g opacity="${f2(al)}">${barrier(A2, B2)}</g>` });
  });
  const fd = finderAt(t);
  if (fd) items.push({ k: fd.x + fd.y, s: person({ x: fd.x, y: fd.y, dir: fd.moving ? fd.dir : 1, moving: fd.moving, phase: fd.phase, tool: t >= RADIO_AT - .2 ? 'radio' : undefined, talk: t >= RADIO_AT && t < 43.6, raise: ramp(t, STOP_AT - .2, STOP_AT + .1) * (1 - ramp(t, STOP_AT + .9, STOP_AT + 1.3)) * .45, skin: SKINS[0], t }) });

  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  let fx = '';
  // the near miss
  const o19 = 1 - ramp(t, 19.2, 19.6);
  fx += mark(bl.x, bl.y, .9, false, ramp(t, LAND_AT, LAND_AT + .3) * o19) + tag(bl.x, bl.y, 1.7, 'Near miss', '#e5483b', ramp(t, LAND_AT, LAND_AT + .3) * o19);
  fx += tag(wk.x, wk.y, 2.4, 'Nobody hurt', '#e07a1a', ramp(t, LAND_AT + 1.4, LAND_AT + 1.7) * o19, fs * .9);
  // reported; put right; thanked
  fx += tag(BOSS.x, BOSS.y, 2.5, 'Reported', '#2c9a4a', ramp(t, REPORT_AT, REPORT_AT + .3) * (1 - ramp(t, 26.8, 27.2)), fs * .9);
  fx += tag((SC.x0 + SC.x1) / 2, YO, TOPZ + 1.9, 'Put right: brick guard fitted', '#2c9a4a', ramp(t, GUARD_AT + .2, GUARD_AT + .5) * (1 - ramp(t, 31, 31.4)), fs * .9);
  fx += tag(BOSS.x, BOSS.y, 2.5, 'Thanks for reporting it', '#2c9a4a', ramp(t, THANKS_AT, THANKS_AT + .3) * (1 - ramp(t, 31, 31.4)), fs * .9);
  // the unsafe condition
  const o43 = 1 - ramp(t, 43.2, 43.6);
  fx += tag(hx, hy, .9, 'Cover missing', '#e5483b', ramp(t, UNSAFE_AT, UNSAFE_AT + .3) * (1 - ramp(t, SAFE_AT - .3, SAFE_AT)));
  if (fd) {
    fx += mark(fd.x, fd.y, 2.3, false, ramp(t, STOP_AT, STOP_AT + .3) * (1 - ramp(t, 36.3, 36.6))) + tag(fd.x, fd.y, 3.1, 'Stop', '#e5483b', ramp(t, STOP_AT, STOP_AT + .3) * (1 - ramp(t, 36.3, 36.6)));
    fx += tag(fd.x, fd.y, 2.5, 'Reported', '#2c9a4a', ramp(t, RADIO_AT + .5, RADIO_AT + .8) * o43, fs * .9);
  }
  fx += mark(hx, hy, 1.4, true, ramp(t, SAFE_AT, SAFE_AT + .3) * o43) + tag(hx, hy, 2.2, 'Made safe', '#2c9a4a', ramp(t, SAFE_AT, SAFE_AT + .3) * o43);
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 4, 4.4)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  const rc = $('rpcard');
  show(rc, ramp(t, 4.5, 5) * (1 - ramp(t, 13.4, 13.9)), 1);
  rc.querySelectorAll('.row').forEach((r, i) => r.classList.toggle('ok', t >= CARD_AT[i]));
  rc.querySelector('.ft').classList.toggle('ok', t >= 10.6);
  $('end').style.opacity = f2(ramp(t, 44.2, 44.9));
  $('end').querySelector('.line').style.width = (ramp(t, 45, 46) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 45, 45.6));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 45.8, 46.4));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 44.2, 46.2) * .7, ns: wk.moving ? wk : fd };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  CARD_AT.forEach(tc => { if (cross(tc)) shot('card'); });
  [REPORT_AT, GUARD_AT + .2, THANKS_AT, UNSAFE_AT, STOP_AT, ...BAR_AT, SAFE_AT, RADIO_AT + .5].forEach(tc => { if (cross(tc)) shot('ping'); });
  if (cross(LAND_AT)) shot('thud');
  if (cross(45)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 4) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
