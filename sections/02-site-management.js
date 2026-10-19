/* Section 2: site management & reporting.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 2</div>
      <div class="h">Site management &amp; reporting</div>
      <div class="s">Who runs the site, what they expect from you, and how to raise a problem.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="riskTitle">What to report</div>
  <div id="dim"></div>
  <div id="quote"><div class="q"><div class="mark">&ldquo;</div>
    <p><span class="a">We'd rather you raise a concern that turns out to be nothing&hellip;</span><span class="b">&hellip;than stay quiet about something that causes an incident.</span></p>
    <small>If in doubt, report it</small></div></div>
  <div id="contact"><div class="cc">
    <div class="hd"><img class="logoimg" alt="CWP"><span>Your site supervisor</span></div>
    <div class="row"><label>Name</label><div class="v" id="ccName"></div></div>
    <div class="row"><label>Phone</label><div class="v" id="ccPhone"></div></div>
    <div class="row"><label>If they're not on site, report to</label><div class="v" id="ccAlt"></div></div>
    <small>Your inductor will confirm these details with you.</small>
  </div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>If in doubt, speak up.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 2</div>
    <h1>Site management &amp; reporting</h1>
    <div class="fields"><input id="fName" placeholder="Supervisor's name" autocomplete="off"><input id="fPhone" placeholder="Phone number" autocomplete="off"><input id="fAlt" placeholder="If absent, report to" autocomplete="off"></div>
    <div class="hint">Optional &ndash; shown on the &ldquo;Your site supervisor&rdquo; card. Remembered on this computer.</div>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
  // supervisor details typed on the start screen, kept between sessions
  onBoot() {
    const FIELDS = [['fName', 'ccName'], ['fPhone', 'ccPhone'], ['fAlt', 'ccAlt']];
    const store = (k, v) => { try { v === undefined ? (v = localStorage.getItem(k)) : localStorage.setItem(k, v); } catch (e) {} return v; };
    const sync = () => FIELDS.forEach(([f, c]) => { $(c).textContent = $(f).value.trim(); });
    FIELDS.forEach(([f]) => { $(f).value = store('cwp-induction-' + f) || ''; $(f).addEventListener('input', () => { store('cwp-induction-' + f, $(f).value); sync(); }); });
    sync();
  },
};
const LAYOUT = LAYOUTS.standard;
const DUR = 66;
// the gate only stands open while people are coming or going
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
const CREW = [
  // at work around the site
  { at: [23.2, 5.4], dir: -1, skin: SKINS[1] }, { at: [29.9, 5.45], dir: -1, skin: SKINS[2] },
  { at: [44.2, 4.2], vest: 'sub', tool: 'rake', work: true, seed: 0 }, { at: [45.6, 3], vest: 'sub', tool: 'rake', work: true, seed: 2, skin: SKINS[3] }, { at: [45, 5.6], vest: 'sub', tool: 'rake', work: true, seed: 4, skin: SKINS[2] },
  { at: [69.2, 6.9], dir: 1, skin: SKINS[4] }, { at: [78.6, 5.6], tool: 'tablet', dir: -1 },
];
// chip captions [from, to, kicker, text]
const CHIPS = [
  [7.6, 11, 'The site supervisor', 'Coordinates our work'],
  [11.6, 15.6, 'The site supervisor', 'Makes sure the right safety arrangements are in place'],
  [16.2, 20.6, 'The site supervisor', 'Deals with issues as they come up'],
  [21, 24.6, 'Your part', 'Follow reasonable instructions from site management'],
  [24.6, 28.8, 'Your part', 'Cooperate with other contractors'],
  [38.6, 43, 'Your part', 'Report it &ndash; straight away'],
];
// things that need reporting, flagged as they're named
const HAZARDS = [
  { name: 'Hazard', pos: [31.4, 7.7, .4] },
  { name: 'Damaged equipment', pos: [41.4, 6.4, .5] },
  { name: 'Unsafe behaviour', pos: [21.1, 5.8, 2.2] },
  { name: 'Could cause an accident', pos: [3.3, 11.2, 1.1] },
];
// where the site supervisor is in each scene
function supAt(t) {
  if (t < 7) return walkPath([[0, -.5, 1.3], [1.2, -.5, 1.3], [4.4, 1.6, 5.2], [7, 1.6, 5.2]], t);
  if (t < 11) return { x: 13.8, y: 7.9, dir: -1, raise: ramp(t, 8.1, 8.4) * (1 - ramp(t, 9.8, 10.1)), tool: 'tablet' };
  if (t < 15.6) return { ...walkPath([[11, 24.2, 5.4], [15.6, 29.2, 5.4]], t), tool: 'tablet' };
  if (t < 20.6) return { x: 36.2, y: 6.2, dir: 1, tool: 'tablet' };
  if (t < 29) return { x: 1.6, y: 5.1, dir: -1, raise: .55 * Math.max(0, Math.sin((t - 21) * 1.7)) * ramp(t, 21, 21.5) };
  return { x: 13.8, y: 7.9, dir: 1, tool: 'radio', talk: t > 39.2 && t < 43 };
}
const BRIEF = [[0, 6.6], [.9, 7.3], [1.9, 7.6], [2.9, 7.3], [3.6, 6.5], [-.6, 5.9]];
const BRIEF_SUB = [3, 4];
function cameraAt(t) {
  const f = MOBILE && focusSeq(t, 28.8, 43, [
    [28.8, () => [18, 7.6, 1], 820],
    ...HAZARDS.map((h, i) => [HAZARD_AT[i] - .35, () => h.pos, 640]),
    [38.4, () => [29.6, 9.6, 1.4], 600],
    [40.4, () => [13.8, 7.9, 1.4], 600],
  ], [[4, 9, 1], 900]);
  if (f) return f;
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  const keys = [
    [0, c(.6, 3.4, 1.4, 540)], [6.9, c(1.4, 4.6, 1.2, 600)],
    [7, c(14.6, 6.4, 1.3, 640)], [10.9, c(14.2, 6.6, 1.3, 600)],
    [11, c(24.2, 4.8, .8, 620)], [15.5, c(27.4, 4.8, .8, 600)],
    [15.6, c(37.2, 5.8, 1, 600)], [20.5, c(37, 6, 1, 560)],
    [20.6, c(1.4, 6.2, 1, 560)], [28.7, c(1.4, 6.4, 1, 520)],
    [28.8, c(21, 7.4, .8, 1450)], [38.2, c(20.5, 7.4, .8, 1380)], [39.4, c(23.5, 8.6, 1, 1200)],
    [42.8, c(4, 9, 1, 900)], [66, c(6, 8, 1, 1000)],
  ];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, a] = keys[i], [t1, b] = keys[i + 1];
    if (t <= t1) { const u = t1 - t0 < .2 ? 1 : smooth((t - t0) / (t1 - t0)); return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), w: lerp(a.w, b.w, u) }; }
  }
  return keys[keys.length - 1][1];
}
function dumperAt(t) {
  const a = 6, b = 40, v = 3.2, per = 2 * (b - a) / v;   // turns before the mixer parked at x 44.6
  const u = frac((t + 4) / per) * per, half = per / 2;
  return u < half ? { x: a + v * u, dir: 1 } : { x: b - v * (u - half), dir: -1 };
}
function ladder(x, y) {
  // aluminium ladder lying flat, one rung snapped and a stile bent
  let s = line3([x, y, .05], [x + 3, y, .05], '#b9bec2', 3) + line3([x, y + .45, .05], [x + 1.6, y + .45, .05], '#b9bec2', 3) + line3([x + 1.6, y + .45, .05], [x + 3, y + .7, .05], '#b9bec2', 3);
  for (let k = .2; k < 3; k += .3) s += Math.abs(k - 1.7) < .1 ? line3([x + k, y, .05], [x + k + .1, y + .2, .12], '#9aa0a4', 2) : line3([x + k, y, .05], [x + k, y + (k > 1.6 ? .45 + (k - 1.6) / 1.4 * .25 : .45), .05], '#9aa0a4', 2);
  return s;
}
function blockedRoute() {
  let s = box(2.5, 10.6, 0, 1.1, 1, .15, '#9b7446') + box(2.55, 10.65, .15, 1, .9, .7, '#c7c2b6');
  s += pipeX(2.3, 4.8, 11.75, .16, .16, '#c8662a', '#e98a46');
  return s;
}

/* ---------------------------------------------------------------- sound */
function audioUpdate(F) {
  const ctx = A.ctx; if (!ctx) return;
  const n = ctx.currentTime;
  const busy = F.t < 43 ? 1 : .35;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 61.5 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 44 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-2/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
// Lines are recorded as whole sentences and split at their pauses, so each item lands on its picture.
const VO = [
  [.6, 0, 0, null, 'On site, your first point of contact is the C.W.P. Site Supervisor.'],
  [7.6, 1, 0, 1.63, 'They coordinate our work,'],
  [11.6, 1, 1.63, 4.55, 'make sure the right safety arrangements are in place,'],
  [16.2, 1, 4.55, null, 'and deal with any issues that come up.'],
  [21, 2, 0, 3.04, 'Follow reasonable instructions from site management,'],
  [24.6, 2, 3.04, null, 'and cooperate with any other contractors working in the area.'],
  [29.4, 3, 0, 1.36, 'If you spot a hazard,'],
  [31.4, 3, 1.36, 2.59, 'damaged equipment,'],
  [33.3, 3, 2.59, 3.85, 'unsafe behaviour,'],
  [35.2, 3, 3.85, 6.1, 'or anything that could cause an accident,'],
  [38.6, 3, 6.1, null, 'report it, straight away.'],
  [43.6, 4, 0, 3.18, "We'd rather you raise a concern that turns out to be nothing,"],
  [47.6, 4, 3.18, null, 'than stay quiet about something that causes an incident.'],
  [52.2, 5, 0, null, "Your inductor will now give you your supervisor's name and number, and who to report to if they're not on site."],
  [62.6, 6, 0, null, 'If in doubt, speak up.'],
];
const HAZARD_AT = [30.2, 31.4, 33.3, 36];
const QUOTE_B = 47.6;

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
  const bubble = (x, y, z, glyph, colr, a) => {
    const [px, py] = P(x, y, z), r = fs * 1.2;
    return `<g opacity="${f2(a)}"><circle cx="${f1(px)}" cy="${f1(py - r)}" r="${f1(r)}" fill="#fff" stroke="${colr}" stroke-width="${f2(fs * .18)}"/><path d="M${f1(px - r * .3)} ${f1(py - r * .15)} l${f1(r * .1)} ${f1(r * .7)} l${f1(r * .35)} ${f1(-r * .55)}z" fill="#fff"/><text x="${f1(px)}" y="${f1(py - r * .6)}" font-size="${f1(r * 1.3)}" font-weight="700" text-anchor="middle" fill="${colr}" font-family="Arial">${glyph}</text></g>`;
  };

  const items = [];
  items.push({ k: -1.2, bb: [-5.6, -1.2, 1, 2], s: STAIR || (STAIR = stair(-5.6, -4.2, -1.2, 1, 2, 2.7)) });
  items.push({ k: 21, s: excavator(8, excavatorPose(t), t) });
  const d = dumperAt(t); items.push({ k: d.x + 1.8 + 9.6, s: dumper(d.x, 8.7, d.dir, t) });
  items.push({ k: 58, s: mixer(44.6, 8.75, t) });
  const rx = 69.6 + 1.6 * Math.sin(t * .55); items.push({ k: rx + 4.9, s: roller(rx, 2.6, t) });
  items.push(...liftWorks(LAYOUT, t));   // the excavator lifting area
  for (const p of CREW) items.push({ k: p.at[0] + p.at[1], s: person({ x: p.at[0], y: p.at[1], dir: p.dir || 1, tool: p.tool, vest: p.vest, work: p.work, seed: p.seed, skin: p.skin, t }) });
  const cu = frac(t / 9), cx = cu < .5 ? lerp(33.4, 39.6, cu * 2) : lerp(39.6, 33.4, (cu - .5) * 2);
  if (t < 15.6 || t > 20.6) items.push({ k: cx + 3.2, s: person({ x: cx, y: 3.2, moving: true, phase: t * 4.5, dir: cu < .5 ? 1 : -1, tool: 'cat', t }) });

  // the site supervisor
  const sp = supAt(t);
  items.push({ k: sp.x + sp.y, y: sp.y, s: person({ ...sp, skin: '#c4946f', t }) });
  // a worker brings an issue to the supervisor
  if (t >= 15.6 && t < 20.6) {
    const w = walkPath([[15.6, 39.6, 7.4], [17.1, 37.3, 6.5], [20.6, 37.3, 6.5]], t);
    items.push({ k: w.x + w.y, s: person({ ...w, dir: w.moving ? w.dir : -1, skin: SKINS[1], raise: ramp(t, 17.3, 17.5) * (1 - ramp(t, 18.2, 18.4)) * .6, t }) });
  }
  // toolbox briefing
  if (t >= 20.6 && t < 28.8) BRIEF.forEach(([x, y], i) => {
    const [sx] = P(1.6, 5.1), [px] = P(x, y);
    items.push({ k: x + y, s: person({ x, y, dir: sx > px ? 1 : -1, vest: BRIEF_SUB.includes(i) ? 'sub' : 'cwp', skin: SKINS[i % 5], tool: i === 2 ? 'tablet' : null, t }) });
  });
  // things that need reporting
  if (t >= 28.8 && t < 43) {
    items.push({ k: 39, s: pit('hzpit', 30.9, 31.9, 7.2, 8.2, 1.1) });
    items.push({ k: 47.6, s: ladder(40, 6.1) });
    items.push({ k: 27, s: person({ x: 21.1, y: 5.8, dir: 1, tool: 'radio', talk: true, skin: SKINS[3], t }) });
    items.push({ k: 14, y: 11.6, s: blockedRoute() });
    items.push({ k: 39.2, s: person({ x: 29.6, y: 9.6, dir: -1, tool: 'radio', talk: t > 38.7, skin: SKINS[2], t }) });
  }
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');

  // labels and markers
  let fx = '';
  if (t > .8 && t < 43) fx += tag(sp.x, sp.y, 2.45, 'Site supervisor', BLUE, ramp(t, 1, 1.5) * (1 - ramp(t, 42.4, 42.8)) * (t > 28.8 && t < 39.6 ? .85 : 1), fs * (t > 28.8 ? .8 : 1));
  if (t > 11.8 && t < 15.6) [22.8, 25, 27.2].forEach((x, i) => { const tc = 12.4 + i * 1.1; fx += bubble(x, 5.05, 1.25, '&#10003;', '#2c9a4a', ramp(t, tc, tc + .25) * (1 - ramp(t, 15.2, 15.5))); });
  if (t > 17.2 && t < 20.6) {
    fx += bubble(37.3, 6.5, 2.2, '!', '#e5a320', ramp(t, 17.3, 17.6) * (1 - ramp(t, 18.6, 18.9)));
    fx += bubble(36.2, 6.2, 2.2, '&#10003;', '#2c9a4a', ramp(t, 18.8, 19.1) * (1 - ramp(t, 20.2, 20.5)));
  }
  if (t > 24.6 && t < 28.8) BRIEF_SUB.forEach((i, j) => { fx += tag(BRIEF[i][0], BRIEF[i][1], 2.2 + j * .6, 'Other contractor', '#7a7f1c', ramp(t, 24.8 + i * .15, 25.1 + i * .15) * (1 - ramp(t, 28.4, 28.8)), fs * .85); });
  if (t > 29 && t < 43) HAZARDS.forEach((hz, i) => {
    const a = ramp(t, HAZARD_AT[i], HAZARD_AT[i] + .35) * (1 - ramp(t, 42.4, 42.8));
    if (a <= 0) return;
    const [px, py] = P(...hz.pos), pulse = frac(t * 1.2 + i * .2);
    fx += `<g opacity="${f2(a)}"><circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(fs * (1.6 + pulse * 3.5))}" fill="none" stroke="#e5483b" stroke-width="${f2(fs * .25)}" opacity="${f2(1 - pulse)}"/>` +
      `<circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(fs * .9)}" fill="#e5483b" stroke="#fff" stroke-width="${f2(fs * .2)}"/></g>`;
    fx += tag(hz.pos[0], hz.pos[1], hz.pos[2] + 1.1, hz.name, 'rgba(35,31,32,.92)', a);
  });
  if (t > 38.8 && t < 43) {
    // radio call from the worker to the supervisor
    const [ax, ay] = P(29.6, 9.6, 2), [bx, by] = P(13.8, 7.9, 2), a = ramp(t, 38.9, 39.3) * (1 - ramp(t, 42.4, 42.8));
    const mx = (ax + bx) / 2, my = Math.min(ay, by) - 90 * cam.w / 1000;
    fx += `<path d="M${f1(ax)} ${f1(ay)} Q${f1(mx)} ${f1(my)} ${f1(bx)} ${f1(by)}" fill="none" stroke="${BLUE}" stroke-width="${f2(fs * .28)}" stroke-dasharray="${f1(fs)} ${f1(fs * .6)}" stroke-dashoffset="${f1(-t * 60)}" opacity="${f2(a)}"/>`;
  }
  $('gate').innerHTML = pedGate(gateOpen(t));
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 6.4, 6.9)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  show($('riskTitle'), ramp(t, 29.2, 29.7) * (1 - ramp(t, 38.2, 38.6)));
  $('dim').style.opacity = f2(ramp(t, 43, 43.6) * (1 - ramp(t, 61.2, 61.8)));
  show($('quote'), ramp(t, 43.4, 44) * (1 - ramp(t, 51.4, 51.9)), 1);
  $('quote').querySelector('.b').style.opacity = f2(ramp(t, QUOTE_B, QUOTE_B + .4));
  $('quote').querySelector('small').style.opacity = f2(ramp(t, QUOTE_B + 2.2, QUOTE_B + 2.6));
  show($('contact'), ramp(t, 52, 52.6) * (1 - ramp(t, 61, 61.6)), 1);
  document.querySelectorAll('#contact .row').forEach((r, i) => { const a = ramp(t, 53 + i * 1.6, 53.4 + i * 1.6); r.style.opacity = f2(a); r.style.transform = `translateX(${f2((a - 1) * .8)}em)`; });
  $('end').style.opacity = f2(ramp(t, 61.4, 62.1));
  $('end').querySelector('.line').style.width = (ramp(t, 62.2, 63.2) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 62.6, 63.2));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 63.3, 63.9));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 61.4, 63.4) * .7, ns: sp };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  HAZARD_AT.forEach(tc => { if (cross(tc)) shot('ping'); });
  [12.4, 13.5, 14.6, 18.8].forEach(tc => { if (cross(tc)) shot('ping'); });
  for (const tc of [43.4, 52]) if (cross(tc)) shot('card');
  if (cross(62.2)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 12) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
