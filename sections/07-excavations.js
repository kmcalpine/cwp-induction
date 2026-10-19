/* Section 7: excavations and underground services.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 7</div>
      <div class="h">Excavations &amp; underground services</div>
      <div class="s">Find what&rsquo;s below before you dig, and keep every excavation safe.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="digcard"><div class="oc">
    <div class="hd"><img class="logoimg" alt="CWP"><span>Before you dig</span></div>
    <div class="row"><b>Service information</b><small>Drawings and records checked</small><i></i></div>
    <div class="row"><b>Permit to dig</b><small>Issued for this excavation</small><i></i></div>
    <div class="row"><b>Area scanned</b><small>CAT &amp; Genny by a trained operator</small><i></i></div>
  </div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Know what&rsquo;s below. Keep the edge clear.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 7</div>
    <h1>Excavations &amp; underground services</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
const LAYOUT = LAYOUTS.standard;
const DUR = 72;
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
const CREW = [
  { at: [44.2, 4.2], vest: 'sub', tool: 'rake', work: true, seed: 0 }, { at: [45.6, 3], vest: 'sub', tool: 'rake', work: true, seed: 2, skin: SKINS[3] }, { at: [45, 5.6], vest: 'sub', tool: 'rake', work: true, seed: 4, skin: SKINS[2] },
  { at: [69.2, 6.9], dir: 1, skin: SKINS[4] }, { at: [78.6, 5.6], tool: 'tablet', dir: -1 },
];
// chip captions [from, to, kicker, text]
const CHIPS = [
  [4.6, 9.6, 'Excavations', 'A major part of our work, treated seriously'],
  [19.4, 22.8, 'Locating services', 'CAT &amp; Genny: trained users only'],
  [23.4, 29.4, 'Find them safely', 'Locate · mark · expose by the agreed method'],
  [30, 34.2, 'Drawings are a guide', 'Never assume a service is exactly where it&rsquo;s shown'],
  [42.4, 47.6, 'Entering excavations', 'Only once inspected and confirmed safe'],
  [48, 52.6, 'Edges', 'Keep spoil, materials and plant well back'],
  [62.2, 65.2, 'Something not right?', 'Stop work and tell your supervisor'],
];
const PIT = { x0: 1.2, x1: 5.6, y0: 3.8, y1: 7.2, depth: 1.6, inset: .85 };   // the battered excavation
const CHECK_AT = [11, 15.1, 17.3];
const LOC_AT = 24.6, MARK_AT = 25.5, EXPOSE_AT = 26.4, DRAW_AT = 30.2, ACTUAL_AT = 31.8;
const SAFE_AT = [34.9, 37.9, 39.7];                                          // supported · battered · made safe
const INSPECT_AT = 44.8, CONFIRM_AT = 46.2;
const BACK_AT = [48.3, 49.2, 50.7];                                          // spoil · materials · plant
const FIND_AT = [53.4, 56.1, 58.1, 60.1], STOP_AT = 62.3;
const SERVICE_X = 34.1, DRAWN_X = 32.9;                                      // where the gas main really is, and where the drawing puts it

function catAt(t) {
  const cu = frac(t / 9);
  return { x: cu < .5 ? lerp(33.4, 39.6, cu * 2) : lerp(39.6, 33.4, (cu - .5) * 2), y: 3.2, moving: true, phase: t * 4.5, dir: cu < .5 ? 1 : -1 };
}
function cameraAt(t) {
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  const keys = [
    [0, c(20, 5, 1, 1300)], [4.4, c(19, 5, 1, 1200)], [9.6, c(10, 5.6, .6, 760)],
    [10.4, MOBILE ? c(37, 4, 1, 420) : c(38.6, 3, 1, 560)], [18.8, MOBILE ? c(37, 4, 1, 410) : c(38.6, 3, 1, 540)],
    [19.4, c(36.6, 3.6, 1, 420)], [22.8, c(36.6, 3.6, 1, 410)],
    [23.4, c(33.6, 6.8, .3, 420)], [34.2, c(33.8, 6.8, .3, 400)],
    [34.8, c(25.6, 4.4, 0, 520)], [37.4, c(25.6, 4.4, 0, 500)],
    [37.9, c(3.4, 5.4, 0, 480)], [39.4, c(3.4, 5.4, 0, 470)],
    [39.8, c(12.1, 5.8, .2, 440)], [41.9, c(12.1, 5.8, .2, 430)],
    [42.4, c(28.2, 4.8, .6, 440)], [47.6, c(28.2, 4.8, .6, 420)],
    [48, c(4, 6, 0, 680)], [52.8, c(4, 6, 0, 660)],
    [53.2, c(3.6, 5.8, -.2, 420)], [65.4, c(3.8, 5.8, -.2, 400)],
    [66, c(20, 5, 1, 1300)], [72, c(21, 5, 1, 1280)],
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
  const busy = F.t > 4 && F.t < 65.5 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 66 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 65 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-7/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
const VO = [
  [.6, 0, 0, null, 'Excavations, and underground services.'],
  [4.6, 1, 0, null, 'Digging is a major part of our work, and it must be treated seriously.'],
  [10.2, 2, 0, null, 'Before any excavation starts, check the service information,'],
  [15, 3, 0, null, 'get the permit to dig,'],
  [17.1, 4, 0, null, 'and scan the area.'],
  [19.4, 5, 0, null, 'Only trained people may use the CAT and Genny.'],
  [23.4, 6, 0, null, 'Services must be located, marked, and exposed using the agreed safe method.'],
  [30, 7, 0, null, 'Never assume a service is exactly where the drawing shows it.'],
  [34.8, 8, 0, null, 'Excavations must be supported,'],
  [37.9, 9, 0, null, 'battered back,'],
  [39.6, 10, 0, null, 'or otherwise made safe.'],
  [42.4, 11, 0, null, "Don't enter an excavation unless it's been inspected, and confirmed safe."],
  [48, 12, 0, null, 'Keep spoil, materials, and plant well back from the edge.'],
  [53.2, 13, 0, null, 'If you find an unexpected service,'],
  [56, 14, 0, null, 'unstable ground,'],
  [58, 15, 0, null, 'water coming in,'],
  [59.8, 16, 0, null, 'or anything unusual:'],
  [62.2, 17, 0, null, 'stop work, and tell your supervisor.'],
  [66, 18, 0, null, "Know what's below. Keep the edge clear."],
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
  items.push({ k: 21, s: excavator(8, excavatorPose(t), t) });
  // dumper parked on the haul road a safe distance from the battered excavation
  items.push({ k: 8.6 + 9.6, s: dumper(8.6, 8.7, 1, t, true) });
  items.push({ k: 58, s: mixer(44.6, 8.75, t) });
  const rx = 69.6 + 1.6 * Math.sin(t * .55); items.push({ k: rx + 4.9, s: roller(rx, 2.6, t) });
  items.push(...liftWorks(LAYOUT, t));   // the excavator lifting area
  for (const p of CREW) items.push({ k: p.at[0] + p.at[1], s: person({ x: p.at[0], y: p.at[1], dir: p.dir || 1, tool: p.tool, vest: p.vest, work: p.work, seed: p.seed, skin: p.skin, t }) });
  const cat = catAt(t);
  items.push({ k: cat.x + cat.y, s: person({ ...cat, tool: 'cat', t }) });
  // supervisor with the drawings and permit, beside the utilities corridor
  if (t < 23) items.push({ k: 41 + 2.4, s: person({ x: 41, y: 2.4, dir: -1, tool: 'tablet', skin: SKINS[1], t }) });

  // the battered excavation: an unexpected cable, a slumping edge, water, then a buried drum show up in turn
  const water = ramp(t, FIND_AT[2], FIND_AT[2] + 1.4) * .5;
  items.push({ k: -50, bb: [PIT.x0, PIT.x1, PIT.y0, PIT.y1], s: batteredPit('bpit', PIT.x0, PIT.x1, PIT.y0, PIT.y1, PIT.depth, PIT.inset,
    { cable: t >= FIND_AT[0] - .2, crack: ramp(t, FIND_AT[1], FIND_AT[1] + .6), water, drum: t >= FIND_AT[3] - .2 }) });
  prop(spoilHeap(-2.2, 5.6, 1.1), [-3.3, -1.1, 4.5, 6.7]);
  // stored pipes: well back from the excavation and clear of the canteen door
  for (const zz of [.25, .7]) prop(pipeX(-3.6, -.3, 2.9, zz, .22, '#c8662a', '#e98a46'), [-3.6, -.3, 2.65, 3.15]);
  // the worker at the excavation, who stops and calls it in
  items.push({ k: 6.5 + 5.4, s: person({ x: 6.5, y: 5.4, dir: -1, tool: t >= STOP_AT + .5 ? 'radio' : 'spade', talk: t >= STOP_AT + .5, work: t > 53 && t < 62.2,
    raise: ramp(t, STOP_AT, STOP_AT + .3) * (1 - ramp(t, STOP_AT + .4, STOP_AT + .6)), skin: SKINS[2], t }) });

  // trial hole exposing the service where it really runs
  if (t >= 23) {
    const dug = ramp(t, EXPOSE_AT, EXPOSE_AT + .8);
    if (dug > 0) {
      const id = 'trialhole';
      let s = pit(id, SERVICE_X - .55, SERVICE_X + .55, 6.3, 7.3, .9 * dug);
      if (dug > .7) s += `<g clip-path="url(#${id})">` + line3([SERVICE_X, 6.2, -.62], [SERVICE_X, 7.4, -.62], '#d9a400', 9) + line3([SERVICE_X - .04, 6.2, -.56], [SERVICE_X - .04, 7.4, -.56], '#ffd24a', 3) + '</g>';
      items.push({ k: -40, bb: [SERVICE_X - .55, SERVICE_X + .55, 6.3, 7.3], s });
      prop(spoilHeap(SERVICE_X - 1.2, 7.6, .35 * dug + .05), [SERVICE_X - 1.6, SERVICE_X - .8, 7.2, 8]);
    }
  }
  // the inspection at the trench box: worker waits until the supervisor tags it safe
  if (t >= 41.8 && t < 48) {
    items.push({ k: 29.6 + 5.7, s: person({ x: 29.6, y: 5.7, dir: -1, skin: SKINS[0], t }) });
    items.push({ k: 30.8 + 5.6, s: person({ x: 30.8, y: 5.6, dir: -1, tool: 'tablet', t }) });
  }
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  let fx = '';
  // CAT & Genny: trained operator, and the signal as it finds the service
  fx += tag(cat.x, cat.y, 2.3, 'Trained operator', '#2c9a4a', ramp(t, 20.6, 20.9) * (1 - ramp(t, 22.6, 23)));
  if (t > LOC_AT - .2 && t < 27) {
    const [px, py] = P(SERVICE_X, 7.6, 0), u = frac(t * 2.4);
    fx += `<ellipse cx="${f1(px)}" cy="${f1(py)}" rx="${f1(fs * (1 + u * 3))}" ry="${f1(fs * (.5 + u * 1.5))}" fill="none" stroke="#f2c200" stroke-width="${f2(fs * .2)}" opacity="${f2((1 - u) * (1 - ramp(t, 26.6, 27)))}"/>`;
  }
  // paint marks on the actual line; the drawing's line beside it
  if (t >= 23.4 && t < 42) {
    const out = 1 - ramp(t, 41.4, 42);
    fx += `<g opacity="${f2(out)}">` + sprayMark([SERVICE_X, 5.4], [SERVICE_X, 8.1], ramp(t, MARK_AT, MARK_AT + .7), '#f2c200') + '</g>';
    fx += tag(SERVICE_X, 7.9, .1, 'Located', '#2c9a4a', ramp(t, LOC_AT, LOC_AT + .3) * (1 - ramp(t, MARK_AT - .1, MARK_AT + .1)));
    fx += tag(SERVICE_X, 7.9, .1, 'Marked', '#2c9a4a', ramp(t, MARK_AT, MARK_AT + .3) * (1 - ramp(t, EXPOSE_AT - .1, EXPOSE_AT + .1)));
    fx += tag(SERVICE_X, 6.8, 1.1, 'Exposed by hand', '#2c9a4a', ramp(t, EXPOSE_AT + .6, EXPOSE_AT + .9) * (1 - ramp(t, 29.6, 30)));
    const da = ramp(t, DRAW_AT, DRAW_AT + .4) * (1 - ramp(t, 33.9, 34.3));
    if (da > 0) {
      fx += line3([DRAWN_X, 5.4, .03], [DRAWN_X, 8.1, .03], '#2f6fd0', fs * .22, `stroke-dasharray="${f1(fs * .6)} ${f1(fs * .4)}" opacity="${f2(da)}"`);
      fx += tag(DRAWN_X, 8.1, .1, 'Shown on drawing', '#2f6fd0', da);
      fx += tag(SERVICE_X, 6.8, 1.1, 'Actual position', '#e07a1a', ramp(t, ACTUAL_AT, ACTUAL_AT + .3) * (1 - ramp(t, 33.9, 34.3)));
    }
  }
  // supported · battered · made safe
  fx += tag(25.5, 3.9, .5, 'Supported: trench box', '#2c9a4a', ramp(t, SAFE_AT[0], SAFE_AT[0] + .3) * (1 - ramp(t, 37.2, 37.6)));
  fx += tag(3.4, 5.5, .3, 'Battered back', '#2c9a4a', ramp(t, SAFE_AT[1], SAFE_AT[1] + .3) * (1 - ramp(t, 39.2, 39.6)));
  fx += tag(12.1, 6.7, 1.4, 'Made safe: edge protection', '#2c9a4a', ramp(t, SAFE_AT[2], SAFE_AT[2] + .3) * (1 - ramp(t, 41.6, 42)));
  // inspection
  if (t >= 42.2 && t < 48) {
    const out = 1 - ramp(t, 47.4, 47.8);
    fx += mark(29.6, 5.7, 2.4, false, ramp(t, 42.6, 42.9) * (1 - ramp(t, CONFIRM_AT - .3, CONFIRM_AT)));
    if (t >= INSPECT_AT) fx += `<g opacity="${f2(ramp(t, INSPECT_AT, INSPECT_AT + .3) * out)}">${inspectionTag(27.4, 5.05, 1.05)}</g>`;
    fx += mark(29.6, 5.7, 2.4, true, ramp(t, CONFIRM_AT, CONFIRM_AT + .3) * out);
  }
  // keep back from the edge
  if (t >= 47.8 && t < 53) {
    const za = ramp(t, 48, 48.4) * (1 - ramp(t, 52.6, 53));
    const m = 1.2;
    fx += poly([[PIT.x0 - m, PIT.y0 - m, .02], [PIT.x1 + m, PIT.y0 - m, .02], [PIT.x1 + m, PIT.y1 + m, .02], [PIT.x0 - m, PIT.y1 + m, .02]], 'rgba(229,72,59,.08)',
      `stroke="#e5483b" stroke-width="${f2(fs * .2)}" stroke-dasharray="${f1(fs * .6)} ${f1(fs * .4)}" opacity="${f2(za)}"`);
    fx += tag(PIT.x1 + m, PIT.y0 - m, .1, 'Keep back from the edge', '#e5483b', za);
    [[-2.2, 5.6, 1.6, 'Spoil'], [-1.9, 2.9, 1.4, 'Materials'], [10.4, 9.6, 2.9, 'Plant']].forEach(([x, y, z, n], i) => {
      const a = ramp(t, BACK_AT[i], BACK_AT[i] + .3) * (1 - ramp(t, 52.6, 53));
      fx += tag(x, y, z + .7, n, '#2c9a4a', a) + mark(x, y, z, true, a, .75);
    });
  }
  // what to stop for
  [['Unexpected service', 3.4, 4.6, -.5], ['Unstable ground', 2.2, 7.6, .1], ['Water coming in', 3.4, 5.5, -1], ['Anything unusual', 1.8, 5.6, -.4]].forEach(([n, x, y, z], i) => {
    fx += tag(x, y, z + .9, n, '#e07a1a', ramp(t, FIND_AT[i], FIND_AT[i] + .3) * (1 - ramp(t, (FIND_AT[i + 1] || STOP_AT) - .3, FIND_AT[i + 1] || STOP_AT)));
  });
  fx += tag(6.5, 5.4, 2.4, 'Stop work', '#e5483b', ramp(t, STOP_AT, STOP_AT + .3) * (1 - ramp(t, 65, 65.4)));
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 4.2, 4.6)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  const dc = $('digcard');
  show(dc, ramp(t, 10.2, 10.7) * (1 - ramp(t, 18.8, 19.3)), 1);
  dc.querySelectorAll('.row').forEach((r, i) => r.classList.toggle('ok', t >= CHECK_AT[i]));
  $('end').style.opacity = f2(ramp(t, 65.6, 66.3));
  $('end').querySelector('.line').style.width = (ramp(t, 66.4, 67.4) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 66.4, 67));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 67.2, 67.8));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 65.6, 67.6) * .7, ns: null };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  [LOC_AT, MARK_AT, EXPOSE_AT, ACTUAL_AT, ...SAFE_AT, INSPECT_AT, CONFIRM_AT, ...BACK_AT, ...FIND_AT, STOP_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  CHECK_AT.forEach(tc => { if (cross(tc)) shot('card'); });
  if (cross(66.4)) shot('chime');
  if (F.t > nextBird && F.t < 4) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
