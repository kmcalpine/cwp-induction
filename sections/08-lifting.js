/* Section 8: lifting operations.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 8</div>
      <div class="h">Lifting operations</div>
      <div class="s">Excavators and lifting accessories: planned, controlled, and stopped if it isn&rsquo;t going to plan.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="liftcard"><div class="oc">
    <div class="hd"><img class="logoimg" alt="CWP"><span>Lift plan</span></div>
    <div class="row"><b>Load</b><small>Weight and lifting points known</small><i></i></div>
    <div class="row"><b>Excavator &amp; accessories</b><small>Rated for lifting, accessories in date</small><i></i></div>
    <div class="row"><b>Lift team</b><small>Operator, slinger and signaller briefed</small><i></i></div>
    <div class="row"><b>Exclusion zone</b><small>Set out and controlled for the whole lift</small><i></i></div>
  </div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Plan it. Clear it. Lift it safely.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 8</div>
    <h1>Lifting operations</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
const LAYOUT = LAYOUTS.standard;
const DUR = 61;
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
const CREW = [
  { at: [44.2, 4.2], vest: 'sub', tool: 'rake', work: true, seed: 0 }, { at: [45.6, 3], vest: 'sub', tool: 'rake', work: true, seed: 2, skin: SKINS[3] }, { at: [45, 5.6], vest: 'sub', tool: 'rake', work: true, seed: 4, skin: SKINS[2] },
  { at: [23.2, 5.4], dir: -1, skin: SKINS[1] },
]
// chip captions [from, to, kicker, text]
const CHIPS = [
  [8.2, 16.6, 'Lift team', 'Competent and authorised for their role'],
  [17.6, 23.4, 'Lifting accessories', 'Right for the load, checked before use'],
  [24.2, 31.6, 'Lifting with an excavator', 'Rated for lifting, load on a proper lifting point'],
  [32.6, 38.8, 'Suspended loads', 'Never beneath one, never where you could be trapped'],
  [39.6, 43.8, 'Exclusion zone', 'Kept clear for the whole lift'],
  [50.4, 53.6, 'Not going to plan?', 'Stop the operation'],
]
// excavator on the haul-road side, working along the line y = LINE; it lifts a precast manhole ring
// from the delivery stack and sets it down beside the new chamber excavation
const SPOTS = liftSpots(LAYOUT), LINE = SPOTS.line, PICK = SPOTS.pick, LAND = SPOTS.land;
const PLAN_AT = [4.3, 5, 5.7, 6.4];
const ROLE_AT = [10.6, 13, 15];                                         // operator · slinger · signaller
const GEAR_AT = [18.1, 19.7, 21.6];                                     // sling inspected · rated for the load · checked
const RATED_AT = 26.8, POINT_AT = 29.8;                                 // excavator rated for lifting · proper lifting point
const BENEATH_AT = 32.8, ROUND_AT = 34.4, TRAP_AT = 36.6, OUT_AT = 38.1;
const ZONE_AT = 39.8, UNSTABLE_AT = 44.8, OFFPLAN_AT = 47.6, STOP_AT = 50.4, DOWN_AT = 52.6;

function loadAt(t) {
  // [x, y, z] of the ring's base, plus sway
  const up = ramp(t, 31.8, 33), go = ramp(t, 33, 37.6), down = ramp(t, STOP_AT + .4, DOWN_AT);
  const x = lerp(PICK[0], LAND[0], go);
  const z = up * 1.3 * (1 - down);
  const wobble = ramp(t, UNSTABLE_AT, UNSTABLE_AT + .6) * (1 - ramp(t, STOP_AT, DOWN_AT + .6));
  return { at: [x, LINE, z], swing: wobble * .45 * Math.sin(t * 2.6) };
}
function poseAt(t) {
  // arm tip sits 2 m above the ring's base: hook and chains take up the rest
  const L = loadAt(t);
  return { x: L.at[0], z: L.at[2] + 2.05, tk: 335 };
}
function ring(x, y, z) { return cylinderV(x, y, .6, z, .6, '#a7a39b', col('#4a4640')); }
function slingerAt(t) { return walkPath([[0, 51.4, 9.1], [30.6, 51.4, 9.1], [31.4, 50.6, 10.4], [61, 50.6, 10.4]], t); }
function walkerAt(t) {
  // heads for the gap under the ring's path, stops, then goes back the long way
  return walkPath([[31.8, 55.6, 5.1], [BENEATH_AT + .6, 54.4, 6.6], [ROUND_AT, 54.4, 6.6], [36.6, 56.2, 5]], t);
}
function trappedAt(t) {
  // standing between the swinging ring and the stack of rings, then steps out
  return walkPath([[34, 53.6, 9.15], [OUT_AT, 53.6, 9.15], [39.4, 55.4, 10.6]], t);
}
function cameraAt(t) {
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  const keys = [
    [0, c(40, 6, 1, 1300)], [3.4, MOBILE ? c(54.4, 8, 1.4, 600) : c(57.6, 7, 1.4, 820)], [7.8, MOBILE ? c(54.4, 8, 1.4, 580) : c(57.6, 7, 1.4, 800)],
    [8.4, c(55.4, 8.4, 1.6, 660)], [16.8, c(55.4, 8.4, 1.6, 640)],
    [17.4, c(52.4, 8.2, .7, 300)], [23.2, c(52.4, 8.2, .7, 290)],
    [24, c(56, 7.8, 2, 460)], [31.4, c(55.8, 7.8, 2, 440)],
    [32, c(53.8, 7.6, 1.2, 560)], [38.8, c(53.8, 7.8, 1.2, 540)],
    [39.4, c(56, 7.8, 1.2, 860)], [44, c(56.2, 7.8, 1.2, 840)],
    [44.6, c(54.6, 7.8, 1.6, 480)], [53.6, c(54.6, 7.8, 1.4, 460)],
    [54.2, c(40, 6, 1, 1300)], [61, c(41, 6, 1, 1280)],
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
  const busy = F.t > 3 && F.t < 54 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.12 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 54.5 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 54 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-8/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, 'Lifting operations.'],
  [3.6, 1, 0, null, 'Every lift must be properly planned, and controlled.'],
  [8.4, 2, 0, null, 'Only competent, authorised people may operate the machine,'],
  [13, 3, 0, null, 'sling the load,'],
  [15, 4, 0, null, 'or signal the lift.'],
  [17.6, 5, 0, null, 'Lifting equipment and accessories must be right for the load, and checked before use.'],
  [24.2, 13, 0, null, 'If an excavator is used to lift, it must be rated for lifting, and the load attached to a proper lifting point.'],
  [32.6, 6, 0, null, 'Never stand beneath a suspended load,'],
  [36, 7, 0, null, 'or anywhere you could become trapped.'],
  [39.6, 8, 0, null, 'The exclusion zone must be kept clear for the whole lift.'],
  [44.8, 9, 0, null, 'If a load becomes unstable,'],
  [47.6, 10, 0, null, "or the lift can't go to plan:"],
  [50.4, 11, 0, null, 'stop the operation.'],
  [54.4, 12, 0, null, 'Plan it. Clear it. Lift it safely.'],
]

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
  items.push({ k: 21, s: excavator(8, excavatorPose(t), t) });
  const rx = 69.6 + 1.6 * Math.sin(t * .55); items.push({ k: rx + 4.9, s: roller(rx, 2.6, t) });
  for (const p of CREW) items.push({ k: p.at[0] + p.at[1], s: person({ x: p.at[0], y: p.at[1], dir: p.dir || 1, tool: p.tool, vest: p.vest, work: p.work, seed: p.seed, skin: p.skin, t }) });
  const cu = frac(t / 9), cx = cu < .5 ? lerp(33.4, 39.6, cu * 2) : lerp(39.6, 33.4, (cu - .5) * 2);
  items.push({ k: cx + 3.2, s: person({ x: cx, y: 3.2, moving: true, phase: t * 4.5, dir: cu < .5 ? 1 : -1, tool: 'cat', t }) });

  // the lift: excavator with chain sling from its lifting point, precast ring, delivery stack, new chamber
  const L = loadAt(t), lift = liftWorks(LAYOUT, t, { load: L, crew: false });
  items.push(...lift);
  const [hx, hy, hz] = lift[1].hook, [lx, ly, lz] = lift[1].load;
  // lift team: slinger by the load, signaller with radio in view of the operator
  const sl = slingerAt(t);
  items.push({ k: sl.x + sl.y, s: person({ ...sl, dir: sl.moving ? sl.dir : 1, work: t > 12.6 && t < 22.6, seed: 3, tool: t > 21.2 && t < 22.6 ? 'tablet' : null, skin: SKINS[1], t }) });
  const sigRaise = Math.max(ramp(t, STOP_AT, STOP_AT + .3) * (1 - ramp(t, DOWN_AT + .6, DOWN_AT + 1)), t > 31.6 && t < 42 ? .35 + .15 * Math.sin(t * 2) : 0);
  items.push({ k: 56.2 + 10.4, s: person({ x: 56.2, y: 10.4, dir: 1, tool: 'radio', talk: t > 14.6 && t < STOP_AT, raise: sigRaise, skin: SKINS[3], t }) });
  const wk = walkerAt(t);
  if (wk && t < 39) items.push({ k: wk.x + wk.y, s: person({ ...wk, dir: wk.moving ? wk.dir : -1, skin: SKINS[0], t }) });
  const tp = trappedAt(t);
  if (tp && t < 44) items.push({ k: tp.x + tp.y, s: person({ ...tp, dir: tp.moving ? tp.dir : -1, skin: SKINS[4], t }) });
  // exclusion zone barriers go up for the lift
  if (t >= ZONE_AT - .2) for (let x = 50.4; x < 56.4; x += 2) items.push({ k: x + 1 + 6, bb: [x, x + 1.96, 5.9, 6.1], s: barrier([x, 6], [x + 1.96, 6]) });
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  let fx = '';
  // lift team roles
  const out16 = 1 - ramp(t, 16.4, 16.8);
  fx += tag(60.1, 9.7, 3.6, 'Machine operator', BLUE, ramp(t, ROLE_AT[0], ROLE_AT[0] + .3) * out16);
  fx += tag(sl.x, sl.y, 2.3, 'Slinger', BLUE, ramp(t, ROLE_AT[1], ROLE_AT[1] + .3) * out16);
  fx += tag(56.2, 10.4, 2.3, 'Signaller', BLUE, ramp(t, ROLE_AT[2], ROLE_AT[2] + .3) * out16);
  // accessory checks
  const out23 = 1 - ramp(t, 23, 23.4);
  // checklist beside the load: each line carries its own tick, first check at the top
  [['Chain sling inspected', 2.3], ['Rated for the load', 1.8], ['Checked before use', 1.3]].forEach(([n, z], i) => {
    fx += tag(PICK[0] - 1.7, PICK[1] + .7, z, '\u2713  ' + n, '#2c9a4a', ramp(t, GEAR_AT[i], GEAR_AT[i] + .3) * out23, fs * .85);
  });
  // excavator lifting: rated machine, proper lifting point
  const out31 = 1 - ramp(t, 31.2, 31.6);
  fx += tag(61, 9.7, 3.6, 'Rated for lifting', '#2c9a4a', ramp(t, RATED_AT, RATED_AT + .3) * out31) + mark(62.6, 9.7, 3.3, true, ramp(t, RATED_AT, RATED_AT + .3) * out31, .7);
  fx += tag(hx, hy, hz + 1.3, 'Lifting point & shackle', '#2c9a4a', ramp(t, POINT_AT, POINT_AT + .3) * out31) + mark(hx + .6, hy, hz + .3, true, ramp(t, POINT_AT, POINT_AT + .3) * out31, .6);
  // never beneath: the shortcut under the load, then the long way round
  if (t > 32 && t < 37) {
    const a = ramp(t, BENEATH_AT, BENEATH_AT + .3) * (1 - ramp(t, 36.4, 36.8));
    fx += line3([54.4, 6.6, .05], [53.2, 9, .05], '#e5483b', fs * .25, `stroke-dasharray="${f1(fs * .6)} ${f1(fs * .4)}" opacity="${f2(a * (1 - ramp(t, ROUND_AT, ROUND_AT + .3)))}"`);
    fx += mark(54.4, 6.6, 2.4, false, a * (1 - ramp(t, ROUND_AT, ROUND_AT + .3)));
    fx += mark(54.4, 6.6, 2.4, true, ramp(t, ROUND_AT, ROUND_AT + .3) * (1 - ramp(t, 36.4, 36.8)));
    fx += tag(lx, ly, lz + 1.6, 'Suspended load', '#e5483b', a);
  }
  // trap point between the swinging ring and the stack
  if (t > 36 && t < 39.4) {
    const a = 1 - ramp(t, 39, 39.4);
    fx += mark(tp ? tp.x : 53.6, tp ? tp.y : 9.15, 2.4, false, ramp(t, TRAP_AT, TRAP_AT + .3) * (1 - ramp(t, OUT_AT, OUT_AT + .3)));
    fx += tag(53.2, 9.2, .25, 'Trap point', '#e5483b', ramp(t, TRAP_AT, TRAP_AT + .3) * a);
    fx += mark(tp ? tp.x : 55.4, tp ? tp.y : 10.6, 2.4, true, ramp(t, OUT_AT + .9, OUT_AT + 1.2) * a);
  }
  // exclusion zone
  const za = ramp(t, ZONE_AT, ZONE_AT + .5) * (1 - ramp(t, 53.4, 54));
  if (za > 0) {
    fx += poly([[50.2, 6, .02], [65.2, 6, .02], [65.2, 11.2, .02], [50.2, 11.2, .02]], 'rgba(229,72,59,.07)', `stroke="#e5483b" stroke-width="${f2(fs * .2)}" stroke-dasharray="${f1(fs * .7)} ${f1(fs * .45)}" opacity="${f2(za)}"`);
    fx += tag(53.4, 6, .1, 'Exclusion zone: kept clear', '#e5483b', za * (1 - ramp(t, 43.6, 44)));
  }
  // unstable load, off-plan, stop
  fx += tag(lx, ly, lz + 1.6, 'Load unstable', '#e07a1a', ramp(t, UNSTABLE_AT, UNSTABLE_AT + .3) * (1 - ramp(t, OFFPLAN_AT - .2, OFFPLAN_AT)));
  fx += tag(lx, ly, lz + 1.6, 'Not going to plan', '#e07a1a', ramp(t, OFFPLAN_AT, OFFPLAN_AT + .3) * (1 - ramp(t, STOP_AT - .2, STOP_AT)));
  fx += tag(56.2, 10.4, 2.6, 'Stop', '#e5483b', ramp(t, STOP_AT, STOP_AT + .3) * (1 - ramp(t, DOWN_AT, DOWN_AT + .3)));
  fx += tag(lx, ly, 1.3, 'Lowered safely', '#2c9a4a', ramp(t, DOWN_AT, DOWN_AT + .3) * (1 - ramp(t, 53.4, 53.8)));
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 3.2, 3.6)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  const lc = $('liftcard');
  show(lc, ramp(t, 3.6, 4.1) * (1 - ramp(t, 7.6, 8.1)), 1);
  lc.querySelectorAll('.row').forEach((r, i) => r.classList.toggle('ok', t >= PLAN_AT[i]));
  $('end').style.opacity = f2(ramp(t, 54, 54.7));
  $('end').querySelector('.line').style.width = (ramp(t, 54.8, 55.8) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 54.8, 55.4));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 55.6, 56.2));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 54, 56) * .7, ns: wk && t < 39 ? wk : null };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  [...ROLE_AT, ...GEAR_AT, RATED_AT, POINT_AT, BENEATH_AT, ROUND_AT, TRAP_AT, OUT_AT + .9, ZONE_AT, UNSTABLE_AT, OFFPLAN_AT, STOP_AT, DOWN_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  PLAN_AT.forEach(tc => { if (cross(tc)) shot('card'); });
  if (cross(54.8)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 3) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
