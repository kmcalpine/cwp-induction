/* Section 15: final message & understanding.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 15</div>
      <div class="h">Final message</div>
      <div class="s">One thing to take with you onto site.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="weigh"><div class="wc">
    <div class="ws"><span>Programme</span><span>Deadline</span><span>Job</span></div>
    <div class="wl">Nothing is more important than <b>somebody&rsquo;s safety</b></div>
  </div></div>
  <div id="ticks"><div class="oc">
    <div class="hd"><img class="logoimg" alt="CWP"><span>Getting the job done</span></div>
    <div class="row"><b>Follow the procedures</b><small>The plan, the permit, the method</small><i></i></div>
    <div class="row"><b>Communicate properly</b><small>Briefed, heard and understood</small><i></i></div>
    <div class="row"><b>Deal with problems</b><small>As soon as they arise</small><i></i></div>
    <div class="ft">The job done safely</div>
  </div></div>
  <div id="banner"><div><small></small><span></span></div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>No job is more important than your safety</p>
    <div class="ask">Any questions?</div>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 15</div>
    <h1>Final message</h1>`,
  hint: 'About 50 seconds &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
const LAYOUT = LAYOUTS.standard;
const DUR = 49;
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
// the whole team at work, every area busy and safe
const CREW = [
  { at: [44.2, 4.2], vest: 'sub', tool: 'rake', work: true, seed: 0 }, { at: [45.6, 3], vest: 'sub', tool: 'rake', work: true, seed: 2, skin: SKINS[3] }, { at: [45, 5.6], vest: 'sub', tool: 'rake', work: true, seed: 4, skin: SKINS[2] },
  { at: [78.6, 5.6], tool: 'tablet', dir: -1 },
];
// chip captions [from, to, kicker, text]
const CHIPS = [
  [10.8, 20.6, 'Before you carry on', 'Understood · briefed · right equipment · safe'],
  [20.8, 24.4, 'Not sure? Not safe?', 'Stop and speak to your supervisor'],
  [24.8, 31.2, 'Everyone on site', 'Look after yourself and the people around you'],
];
// the story: a groundworker by the drainage run with doubts, and the supervisor nearby
const HERO = [27.4, 2.2], SUP = [23.6, 1.4], MEET = [24.6, 1.6];
const DOUBTS = ["Don't understand the task?", 'Not been briefed?', 'Not the right equipment?', "Doesn't look safe?"];
const DOUBT_AT = [11.1, 13.06, 14.32, 16];
const HOPE_AT = 18.08, WALK_AT = 20.4, TALK_AT = 22.2;
// look after yourself / the people around you
// on open ground behind the utilities run: one worker checking their own kit, two sharing a heavy lift
const SELF = [34.6, 1.4], BUDDY = [[38.2, 1.5], [40, 1.5]], CARE_AT = [25.2, 29.5];
// the job done safely
const TICK_AT = [32.1, 34.42, 35.78], SAFE_AT = 38.08, ROLLER_STOP = 35.4, ROLLER_OP = [69.2, 6.9];

function dumperAt(t) {
  const a = 6, b = 40, v = 3.2, per = 2 * (b - a) / v;   // turns before the mixer parked at x 44.6
  const u = frac((t + 4) / per) * per, half = per / 2;
  return u < half ? { x: a + v * u, dir: 1 } : { x: b - v * (u - half), dir: -1 };
}
function heroAt(t) {
  // works, stops when in doubt, walks over to the supervisor
  if (t < WALK_AT) return { x: HERO[0], y: HERO[1], dir: -1, tool: 'spade', work: t < HOPE_AT - .2, seed: 1 };
  const w = walkPath([[WALK_AT, HERO[0], HERO[1]], [WALK_AT + Math.hypot(HERO[0] - MEET[0], HERO[1] - MEET[1]) / 1.3, MEET[0], MEET[1]]], t);
  return { ...w, dir: -1, tool: 'spade' };
}
const rollerX = t => 69.6 + 1.6 * Math.sin(Math.min(t, ROLLER_STOP) * .55);
function cameraAt(t) {
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  const sp = liftSpots(LAYOUT);
  // mobile: step to each part of the look-after and job-done scenes in turn
  const f = MOBILE && (focusSeq(t, 24.6, 31.4, [
    [24.6, () => [SELF[0], SELF[1], 1], 520],
    [CARE_AT[1] - .4, () => [(BUDDY[0][0] + BUDDY[1][0]) / 2, BUDDY[0][1], 1], 520],
  ]) || focusSeq(t, 31.6, 38, [
    [31.6, () => [sp.pick[0] + 1, sp.line, 1], 620],
    [TICK_AT[1] - .4, () => [sp.signaller[0], sp.signaller[1], 1], 520],
    [TICK_AT[2] - .4, () => [rollerX(t) + 1, 3.6, 1], 560],
  ]));
  if (f) return f;
  const keys = [
    [0, MOBILE ? c(18, 3, 1, 1100) : c(40, 6, 1, 2480)], [10, MOBILE ? c(24, 3, 1, 1000) : c(36, 6, 1, 2300), 'lin'],
    [10.8, c(25.8, 2.2, 1.2, MOBILE ? 520 : 620)], [20.4, c(26, 2.2, 1.2, MOBILE ? 500 : 600)],
    [21.4, c(24.6, 1.6, 1.2, MOBILE ? 480 : 580)], [24, c(24.8, 1.6, 1.2, MOBILE ? 470 : 570)],
    [24.8, c(37, 1.6, 1, 640), 'lin'], [31.2, c(37.2, 1.6, 1, 620)],
    [32, c(56, 6.8, 1, 1100), 'lin'], [38, c(64, 5.6, 1, 1300), 'lin'],
    [40.4, c(40, 6, 1, 2480), 'lin'], [49, c(42, 6, 1, 2440)],
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
  const busy = F.t < 40.6 ? 1 : .35;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 40.6 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 38 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-15/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, 'Before we finish, I want to make one thing clear.'],
  [4.6, 1, 0, null, "No programme, deadline, or job, is more important than somebody's safety."],
  [11, 2, 0, null, "If you don't understand the task, haven't been briefed, don't have the correct equipment, or think something isn't safe... don't carry on, and hope for the best."],
  [21, 3, 0, null, 'Stop, and speak to your supervisor.'],
  [25, 4, 0, null, 'We expect everyone working for C.W.P. to look after themselves, and the people around them.'],
  [32, 5, 0, null, 'If we all follow the correct procedures, communicate properly, and deal with problems when they arise, we can get the job done safely.'],
  [42, 6, 0, null, 'Has anyone got any questions, before we go through the site-specific arrangements?'],
];
// programme · deadline · job, struck through as each is named; then safety
const WEIGH_AT = [4.65, 5.68, 6.46], SAFETY_AT = 7.3;

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
  const d = dumperAt(t); items.push({ k: d.x + 1.8 + 9.6, s: dumper(d.x, 8.7, d.dir, t) });
  items.push({ k: 58, s: mixer(44.6, 8.75, t) });
  // the roller works until its operator spots a fault, then it's stopped and tagged
  const rx = rollerX(t), rOut = t >= ROLLER_STOP;
  items.push({ k: rx + 4.9, s: roller(rx, 2.6, t, rOut) + (t >= TICK_AT[2] ? defectTag(rx + 1.2, 3.8, 1.5) : '') });
  if (rOut) items.push({ k: ROLLER_OP[0] + ROLLER_OP[1], s: person({ x: ROLLER_OP[0], y: ROLLER_OP[1], dir: -1, tool: 'radio', talk: t > TICK_AT[2] && t < SAFE_AT + 1, skin: SKINS[4], t }) });
  else items.push({ k: ROLLER_OP[0] + ROLLER_OP[1], s: person({ x: ROLLER_OP[0], y: ROLLER_OP[1], dir: 1, skin: SKINS[4], t }) });
  items.push(...liftWorks(LAYOUT, t));   // the excavator lifting area
  for (const p of CREW) items.push({ k: p.at[0] + p.at[1], s: person({ x: p.at[0], y: p.at[1], dir: p.dir || 1, tool: p.tool, vest: p.vest, work: p.work, seed: p.seed, skin: p.skin, t }) });
  const cu = frac(t / 9), cx = cu < .5 ? lerp(33.4, 39.6, cu * 2) : lerp(39.6, 33.4, (cu - .5) * 2);
  items.push({ k: cx + 3.2, s: person({ x: cx, y: 3.2, moving: true, phase: t * 4.5, dir: cu < .5 ? 1 : -1, tool: 'cat', t }) });
  // the groundworker and the supervisor
  const h = heroAt(t);
  items.push({ k: h.x + h.y, s: person({ ...h, skin: SKINS[2], raise: t > TALK_AT && t < 24 ? .3 + .15 * Math.sin(t * 4) : 0, t }) });
  items.push({ k: SUP[0] + SUP[1], s: person({ x: SUP[0], y: SUP[1], dir: 1, tool: 'tablet', talk: t > TALK_AT && t < 24.4, raise: ramp(t, TALK_AT - .3, TALK_AT) * (1 - ramp(t, 23.6, 24)) * .5, t }) });
  // look after yourself (kit on, checks his footing), and the people around you (a hand with a heavy load)
  items.push({ k: SELF[0] + SELF[1], s: person({ x: SELF[0], y: SELF[1], dir: 1, tool: 'spade', work: true, seed: 3, skin: SKINS[1], t }) });
  BUDDY.forEach(([x, y], i) => items.push({ k: x + y, s: person({ x, y, dir: i ? -1 : 1, tool: 'carry', carrying: [], skin: SKINS[i ? 0 : 3], t }) }));
  items.push({ k: (BUDDY[0][0] + BUDDY[1][0]) / 2 + BUDDY[0][1] + 2, s: pipeX(BUDDY[0][0] - .3, BUDDY[1][0] + .3, BUDDY[0][1] + .25, 1.05, .16, '#d9732c', '#f2a36a') });   // a length of pipe between them
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  let fx = '';
  // doubts, one at a time over the groundworker
  DOUBTS.forEach((q, i) => {
    const end = i < DOUBTS.length - 1 ? DOUBT_AT[i + 1] : HOPE_AT;
    fx += tag(HERO[0], HERO[1], 2.5, q, '#e07a1a', ramp(t, DOUBT_AT[i], DOUBT_AT[i] + .3) * (1 - ramp(t, end - .25, end)));
  });
  const oHope = ramp(t, HOPE_AT, HOPE_AT + .3) * (1 - ramp(t, WALK_AT + .3, WALK_AT + .6));
  fx += mark(HERO[0], HERO[1], 2.2, false, oHope) + tag(HERO[0], HERO[1], 3, "Don't carry on and hope", '#e5483b', oHope);
  const oTalk = ramp(t, TALK_AT, TALK_AT + .3) * (1 - ramp(t, 24.2, 24.6));
  fx += mark((MEET[0] + SUP[0]) / 2, SUP[1], 2.2, true, oTalk) + tag((MEET[0] + SUP[0]) / 2, SUP[1], 3, 'Stop · speak to your supervisor', '#2c9a4a', oTalk);
  // look after yourself, and the people around you
  fx += tag(SELF[0], SELF[1], 2.4, 'Look after yourself', '#2c9a4a', ramp(t, CARE_AT[0], CARE_AT[0] + .3) * (1 - ramp(t, 31, 31.3)), fs * .9);
  fx += tag((BUDDY[0][0] + BUDDY[1][0]) / 2, BUDDY[0][1], 2.6, '…and the people around you', '#2c9a4a', ramp(t, CARE_AT[1], CARE_AT[1] + .3) * (1 - ramp(t, 31, 31.3)), fs * .9);
  // the job done safely
  const sp = liftSpots(LAYOUT), oJob = MOBILE ? 1 - ramp(t, 37.7, 38) : 1 - ramp(t, 39.8, 40.2);   // mobile pulls back at 38: drop the tags first so they don't crowd
  fx += tag(sp.pick[0] + 1.1, sp.line, 3.6, 'Lift plan followed', '#2c9a4a', ramp(t, TICK_AT[0], TICK_AT[0] + .3) * oJob, fs * .9);
  fx += tag(sp.signaller[0], sp.signaller[1], 2.4, 'Signaller on the radio', '#2c9a4a', ramp(t, TICK_AT[1], TICK_AT[1] + .3) * oJob, fs * .9);
  fx += tag(ROLLER_OP[0], ROLLER_OP[1], 2.4, 'Fault reported', '#2c9a4a', ramp(t, TICK_AT[2], TICK_AT[2] + .3) * oJob, fs * .9);
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.25 + .2 * ramp(t, 38, 41));
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 4, 4.4)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  const wg = $('weigh');
  show(wg, ramp(t, 4.4, 4.8) * (1 - ramp(t, 10.2, 10.6)), 1);
  wg.querySelectorAll('.ws span').forEach((s, i) => { s.style.opacity = f2(ramp(t, WEIGH_AT[i], WEIGH_AT[i] + .25)); s.classList.toggle('x', t >= WEIGH_AT[i] + .45); });
  wg.querySelector('.wl').style.opacity = f2(ramp(t, SAFETY_AT, SAFETY_AT + .4));
  const tk = $('ticks');
  show(tk, ramp(t, 31.8, 32.2) * (1 - ramp(t, 40.2, 40.6)), 1);
  tk.querySelectorAll('.row').forEach((r, i) => r.classList.toggle('ok', t >= TICK_AT[i]));
  tk.querySelector('.ft').classList.toggle('ok', t >= SAFE_AT);
  $('end').style.opacity = f2(ramp(t, 40.6, 41.3));
  $('end').querySelector('.line').style.width = (ramp(t, 41.3, 42.3) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 41.4, 42));
  $('end').querySelector('.ask').style.opacity = f2(ramp(t, 42.2, 42.8));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 43, 43.6));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 40.6, 42.6) * .7, ns: t > WALK_AT && t < WALK_AT + 3 ? h : null };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  if (cross(4.4)) shot('whoosh');
  [...WEIGH_AT, ...DOUBT_AT, HOPE_AT, TALK_AT, ...CARE_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  [...TICK_AT, SAFE_AT].forEach(tc => { if (cross(tc)) shot('card'); });
  if (cross(41.3)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 4) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
