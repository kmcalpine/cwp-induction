/* Section 6: plant, vehicles and pedestrian safety.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 6</div>
      <div class="h">Plant, vehicles &amp; pedestrian safety</div>
      <div class="s">People and moving machines: how we keep them apart.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="opcard"><div class="oc">
    <div class="hd"><img class="logoimg" alt="CWP"><span>Plant operator</span></div>
    <div class="row"><b>Trained</b><small>Holds the right card for this machine</small><i></i></div>
    <div class="row"><b>Competent</b><small>Experienced and assessed on it</small><i></i></div>
    <div class="row"><b>Authorised</b><small>Permitted by site management to operate it</small><i></i></div>
  </div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>See them. Be seen. Stay clear.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 6</div>
    <h1>Plant, vehicles &amp; pedestrian safety</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
const LAYOUT = LAYOUTS.welcome;
const DUR = 68;
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
const CREW = [
  { at: [71.6, 4.2], vest: 'sub', tool: 'rake', work: true, seed: 0 }, { at: [73, 3], vest: 'sub', tool: 'rake', work: true, seed: 2, skin: SKINS[3] }, { at: [72.4, 5.6], vest: 'sub', tool: 'rake', work: true, seed: 4, skin: SKINS[2] },
  { at: [23.2, 5.4], dir: -1, skin: SKINS[1] }, { at: [83.4, 6.2], tool: 'tablet', dir: -1 },
];
// chip captions [from, to, kicker, text]
const CHIPS = [
  [10.6, 17.4, 'Moving plant on our sites', ''],
  [18.6, 24.2, 'Keep clear', 'Never assume the operator has seen you'],
  [24.8, 30.4, 'Wait to be acknowledged', 'Only approach when the operator signals it&rsquo;s safe'],
  [31.2, 36, 'Lifting', 'Never under a suspended load or inside an exclusion zone'],
  [42.6, 48.6, 'Before you drive', 'Pre-use checks &middot; seat belt on'],
  [49.4, 55.2, 'Defects', 'Report it and take it out of service'],
  [55.8, 61, 'Traffic management', 'Follow the plan and the banksman'],
];
const PLANT_AT = [10.8, 12.6, 14.2, 15.8];                 // excavators · dumpers · rollers · telehandlers
const ZONE = [15.6, 5.9, 6.2];                              // excavator exclusion zone
const WAVE_AT = 25, ACK_AT = 26.9, GO_AT = 28.3;           // worker signals · operator acknowledges · safe to approach
const OP_AT = [36.9, 38, 39], CHECK_AT = [43, 43.8, 44.6], BELT_AT = 46.8, DEFECT_AT = 49.5, OOS_AT = 52.1;
const ROLL_STOP = 48.5;

function excPose(t) {
  // the operator stops with the bucket grounded once the worker has signalled
  if (t < WAVE_AT + .3) return excavatorPose(t);
  const a = excavatorPose(WAVE_AT + .3), b = excavatorPose(1.5), u = ramp(t, WAVE_AT + .3, ACK_AT - .2);
  return { x: lerp(a.x, b.x, u), z: lerp(a.z, b.z, u), tk: lerp(a.tk, b.tk, u), spill: 0 };
}
function dumperAt(t) {
  // patrols the haul road clear of the excavator, parks for the pre-use check, then reverses to the banksman
  if (t >= 41 && t < 49) return { x: 30, dir: 1, parked: t < 45.4, belt: t >= 45.4 };
  if (t >= 49 && t < 55.8) return { x: lerp(30, 38, ramp(t, 49, 54)), dir: 1, belt: true };
  if (t >= 55.8) return { x: lerp(38, 36.6, ramp(t, 56.4, 60)), dir: 1, belt: true, reversing: t > 56.4 && t < 60 };
  const a = 28.5, b = 38, v = 3.2, per = 2 * (b - a) / v;
  const u = frac((t + 3) / per) * per, half = per / 2;
  return u < half ? { x: a + v * u, dir: 1 } : { x: b - v * (u - half), dir: -1 };
}
function walkerAt(t) {
  // comes from the drainage area (never along the haul road), stops outside the zone, signals, then approaches once acknowledged
  return walkPath([[18.2, 26.2, 7.05], [21.4, 22.2, 7.5], [GO_AT, 22.2, 7.6], [30.4, 20.2, 7.9]], t);
}
function liftWalkerAt(t) {
  // walks the long way round the lifting exclusion zone
  // heads for the ring hanging from the excavator, stops, then backs off the long way round
  return walkPath([[31.4, 48.2, 4.2], [33.2, 46.6, 5.6], [33.9, 46.6, 5.6], [35.8, 49.4, 4.4]], t);
}
function checkerAt(t) {
  // pre-use walk-round of the parked dumper, then climbs on
  return walkPath([[42.6, 29.4, 11.1], [44.8, 33.9, 11.1], [45.4, 33.9, 11.1]], t);
}
function cameraAt(t) {
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  const dm = dumperAt(13.2);
  const keys = [
    [0, c(22, 6, 1, 1300)], [4.8, c(21, 6, 1, 1200)],
    [10.4, c(16.4, 5.9, 1.4, 520)], [12, c(16.6, 5.9, 1.4, 500)],
    [12.4, c(dm.x + 1.8, 9.6, 1, 460)], [13.8, c(dm.x + 1.8, 9.6, 1, 460)],
    [14, c(63.4, 3.4, 1.1, 440)], [15.4, c(63.4, 3.4, 1.1, 430)],
    [15.6, c(86.4, 9.4, 1.8, 560)], [17.6, c(86.4, 9.4, 1.8, 550)],
    [18.4, c(19.4, 7.4, 1, 820)], [24.6, c(19.6, 7.8, 1, 760)], [30.6, c(19.4, 7.8, 1, 740)],
    [31, c(46.6, 6.4, 1.2, 600)], [36, c(46.8, 6.4, 1.2, 580)],
    [36.4, MOBILE ? c(63.6, 3.6, 1.3, 400) : c(61.6, 4.6, 1.3, 520)], [42, MOBILE ? c(63.6, 3.6, 1.3, 400) : c(61.6, 4.6, 1.3, 510)],
    [42.4, c(31.8, 10, 1, 440)], [48.6, c(31.6, 10, 1, 420)],
    [49.2, c(62.4, 3.8, 1, 440)], [55.2, c(62.4, 3.8, 1, 430)],
    [55.6, c(36.4, 10.6, 1, 560)], [61, c(36.4, 10.6, 1, 540)],
    [61.8, c(30, 6, 1, 1400)], [68, c(31, 6, 1, 1380)],
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
  const busy = F.t > 4 && F.t < 61.5 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.14 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 62 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 61 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-6/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, 'Plant, vehicles, and pedestrian safety.'],
  [4.8, 1, 0, null, 'One of the biggest risks on our sites is people working around moving plant.'],
  [10.8, 2, 0, null, 'Excavators.'],
  [12.6, 3, 0, null, 'Dumpers.'],
  [14.2, 4, 0, null, 'Rollers.'],
  [15.8, 5, 0, null, 'And telehandlers.'],
  [18.6, 6, 0, null, 'Always keep clear of operating plant, and never assume the operator has seen you.'],
  [24.8, 7, 0, null, "Don't approach a machine until the operator has acknowledged you, and it's safe to do so."],
  [31.2, 8, 0, null, 'Never walk beneath a suspended load, or enter an exclusion zone.'],
  [36.8, 9, 0, null, 'Only trained, competent, and authorised people may operate plant.'],
  [42.6, 10, 0, null, 'Check the machine before you use it,'],
  [45.8, 11, 0, null, 'and wear your seat belt where one is fitted.'],
  [49.4, 12, 0, null, 'Report any defect straight away, and take unsafe equipment out of service.'],
  [55.8, 13, 0, null, 'Follow the traffic management plan, and the instructions of authorised banksmen.'],
  [62, 14, 0, null, 'See them. Be seen. Stay clear.'],
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
  items.push({ k: 21, s: excavator(8, excPose(t), t) });
  const d = dumperAt(t);
  items.push({ k: d.x + 1.8 + 9.6, s: dumper(d.x, 8.7, d.dir, t, d.parked, d.belt) });
  items.push({ k: 86, s: mixer(72, 8.75, t) });
  const rx = 61.6 + 1.6 * Math.sin(Math.min(t, ROLL_STOP) * .55), rollerOut = t >= OOS_AT;
  items.push({ k: rx + 4.9, s: roller(rx, 2.6, t, rollerOut) + (rollerOut ? defectTag(rx + 1.2, 3.8, 1.5) : '') });
  if (rollerOut) for (const [cx, cy] of [[rx - .6, 2.2], [rx + 4, 2.2], [rx - .6, 4.6], [rx + 4, 4.6]]) prop(cone(cx, cy), [cx - .3, cx + .3, cy - .3, cy + .3]);
  items.push(...liftWorks(LAYOUT, t));   // the excavator lifting area
  // telehandler working at the east end of the haul road
  items.push({ k: 88.5 + 9.8, s: telehandler(86, 8.6, t) });
  for (const p of CREW) {
    items.push({ k: p.at[0] + p.at[1], s: person({ x: p.at[0], y: p.at[1], dir: p.dir || 1, tool: p.tool, vest: p.vest, work: p.work, seed: p.seed, skin: p.skin, t }) });
  }
  // the person reporting the roller defect
  items.push({ k: 61.2 + 5.6, s: person({ x: 61.2, y: 5.6, dir: 1, tool: 'radio', talk: t > DEFECT_AT && t < OOS_AT, skin: SKINS[4], t }) });
  const cu = frac(t / 9), cx = cu < .5 ? lerp(33.4, 39.6, cu * 2) : lerp(39.6, 33.4, (cu - .5) * 2);
  items.push({ k: cx + 3.2, s: person({ x: cx, y: 3.2, moving: true, phase: t * 4.5, dir: cu < .5 ? 1 : -1, tool: 'cat', t }) });

  const w = walkerAt(t);
  if (w) items.push({ k: w.x + w.y, s: person({ ...w, dir: w.moving ? w.dir : -1, skin: SKINS[2], raise: ramp(t, WAVE_AT, WAVE_AT + .3) * (1 - ramp(t, ACK_AT + .6, ACK_AT + 1)), t }) });
  const lw = liftWalkerAt(t);
  if (lw && t < 37) items.push({ k: lw.x + lw.y, s: person({ ...lw, dir: lw.moving ? lw.dir : 1, skin: SKINS[0], t }) });
  const ck = checkerAt(t);
  if (ck && t < 45.4) items.push({ k: ck.x + ck.y, y: ck.y, s: person({ ...ck, dir: ck.moving ? ck.dir : -1, tool: 'tablet', skin: SKINS[3], t }) });
  // banksman guiding the reversing dumper
  if (t >= 54) items.push({ k: 35 + 12, y: 12.1, s: person({ x: 35, y: 12.1, dir: 1, skin: SKINS[1], raise: t > 56.4 && t < 60.6 ? .55 + .25 * Math.sin(t * 5) : 0, t }) });
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  let fx = '';
  // plant names as each is said
  const tagged = [[16.4, 5.9, 3.6], [d.x + 1.8, 9.6, 2.9], [rx + 1.8, 3.4, 3.1], [84.4, 9.5, 6]];
  ['Excavator', 'Dumper', 'Roller', 'Telehandler'].forEach((n, i) => { fx += tag(...tagged[i], n, BLUE, ramp(t, PLANT_AT[i], PLANT_AT[i] + .3) * (1 - ramp(t, PLANT_AT[i] + 1.6, PLANT_AT[i] + 1.9)), fs * 1.2); });
  // excavator exclusion zone, acknowledgement and approach
  const za = ramp(t, 18.6, 19.2) * (1 - ramp(t, 30.4, 30.9));
  if (za > 0) {
    const ok = t >= ACK_AT;
    fx += poly(isoCircle(ZONE[0], ZONE[1], ZONE[2], .02, 40), ok ? 'rgba(44,154,74,.10)' : 'rgba(229,72,59,.10)', `stroke="${ok ? '#2c9a4a' : '#e5483b'}" stroke-width="${f2(fs * .2)}" stroke-dasharray="${f1(fs * .7)} ${f1(fs * .45)}" opacity="${f2(za)}"`);
    fx += tag(ZONE[0] + 4.4, ZONE[1] + 4.6, .2, 'Keep clear', '#e5483b', za * (1 - ramp(t, ACK_AT - .3, ACK_AT)));
    fx += tag(16.1, 7.4, 3.4, 'Has the operator seen you?', '#e07a1a', ramp(t, 21.4, 21.7) * (1 - ramp(t, 24.6, 24.9)));
    const la = ramp(t, ACK_AT, ACK_AT + .3) * (1 - ramp(t, 30.2, 30.6));
    if (la > 0 && w) {
      const [ax, ay] = P(16.1, 7.4, 2.5), [bx, by] = P(w.x, w.y, 1.7);
      fx += `<line x1="${f1(ax)}" y1="${f1(ay)}" x2="${f1(bx)}" y2="${f1(by)}" stroke="#2c9a4a" stroke-width="${f2(fs * .2)}" stroke-dasharray="${f1(fs * .6)} ${f1(fs * .4)}" opacity="${f2(la)}"/>`;
      fx += tag(16.1, 7.4, 3.4, 'Acknowledged', '#2c9a4a', la);
    }
    fx += mark(w ? w.x : 22.2, w ? w.y : 7.6, 2.6, true, ramp(t, GO_AT, GO_AT + .3) * (1 - ramp(t, 30.2, 30.6)), .8);
  }
  // suspended load: the route under the ring is wrong, backing off is right
  const sa = ramp(t, 31.2, 31.6) * (1 - ramp(t, 35.8, 36.2));
  if (sa > 0) {
    const sp = liftSpots(LAYOUT), rxl = lerp(sp.pick[0], sp.land[0], .5 + .5 * Math.sin(t * .35));
    fx += line3([46.6, 5.6, .05], [rxl, sp.line, .05], '#e5483b', fs * .25, `stroke-dasharray="${f1(fs * .6)} ${f1(fs * .4)}" opacity="${f2(sa * (1 - ramp(t, 33.6, 34)))}"`);
    fx += mark(rxl, sp.line, .3, false, sa * (1 - ramp(t, 33.6, 34)));
    fx += tag(rxl, sp.line, 2.9, 'Suspended load', '#e5483b', sa);
    fx += tag(rxl, sp.line + 1.6, .1, 'Exclusion zone', '#e5483b', ramp(t, 33.4, 33.7) * sa);
    fx += mark(49.4, 4.4, 2.4, true, ramp(t, 34.2, 34.5) * sa, .8);
  }
  // pre-use checks, then seat belt
  if (t >= 42.6 && t < 48.8) {
    const out = 1 - ramp(t, 48.2, 48.6);
    [[30.4, 11, .6, 'Tyres'], [31.8, 11, 1.2, 'Lights'], [33.2, 11, .9, 'Brakes']].forEach(([x, y, z, n], i) => {
      fx += mark(x, y, z, true, ramp(t, CHECK_AT[i], CHECK_AT[i] + .25) * out, .7) + tag(x, y, z + .7, n, '#2c9a4a', ramp(t, CHECK_AT[i], CHECK_AT[i] + .25) * out, fs * .85);
    });
    fx += tag(30.6, 9.8, 3.1, 'Seat belt on', BLUE, ramp(t, BELT_AT, BELT_AT + .3) * out);
  }
  // defect reported, roller out of service
  if (t >= DEFECT_AT && t < 55.4) {
    const out = 1 - ramp(t, 55, 55.4);
    fx += tag(61.2, 5.6, 2.4, 'Defect reported', '#e07a1a', ramp(t, DEFECT_AT, DEFECT_AT + .3) * (1 - ramp(t, OOS_AT - .3, OOS_AT)));
    fx += tag(rx + 1.8, 3.4, 3.2, 'Out of service', '#e5483b', ramp(t, OOS_AT, OOS_AT + .3) * out);
  }
  // banksman and traffic management
  if (t >= 55.8 && t < 61.2) {
    const out = 1 - ramp(t, 60.8, 61.2);
    fx += tag(35, 12.1, 2.4, 'Banksman', BLUE, ramp(t, 56.4, 56.7) * out);
    fx += tag(30.03, 11.63, 2.6, 'Traffic management plan', '#2c9a4a', ramp(t, 55.9, 56.2) * (1 - ramp(t, 57.8, 58.2)));
  }
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 9.6, 10.2)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; $('chip').lastElementChild.style.display = ch[3] ? '' : 'none'; }
  const oc = $('opcard');
  show(oc, ramp(t, 36.6, 37.1) * (1 - ramp(t, 41.8, 42.3)), 1);
  oc.querySelectorAll('.row').forEach((r, i) => r.classList.toggle('ok', t >= OP_AT[i]));
  $('end').style.opacity = f2(ramp(t, 61.6, 62.3));
  $('end').querySelector('.line').style.width = (ramp(t, 62.4, 63.4) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 62.4, 63));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 63.2, 63.8));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 61.6, 63.6) * .7, ns: w || lw, reversing: d.reversing };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  [...PLANT_AT, ACK_AT, GO_AT, 34.2, ...CHECK_AT, BELT_AT, DEFECT_AT, OOS_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  OP_AT.forEach(tc => { if (cross(tc)) shot('card'); });
  // reversing alarm while the dumper backs up to the banksman
  if (F.reversing && Math.floor(F.t * 1.6) !== Math.floor(P0.t * 1.6)) shot('beep');
  if (cross(62.4)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 4) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
