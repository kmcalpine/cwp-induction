/* Section 5: RAMS and safe systems of work.
   The scene for this section: timeline, camera, captions, voice cues. Everything it draws
   (site, plant, people, sound, player) comes from lib/; this file is shared by the desktop and mobile pages. */
'use strict';
const SIGNATURE = '<svg viewBox="0 0 220 60"><path class="pen" pathLength="100" d="M8 42 C 20 10, 30 10, 28 38 S 44 50, 52 28 S 66 12, 70 34 C 74 48, 84 46, 92 30 C 98 20, 104 22, 104 34 C 104 44, 116 44, 124 30 L 132 18 L 136 40 C 150 30, 170 26, 212 30" fill="none" stroke="#1a3f8f" stroke-width="3" stroke-linecap="round"/></svg>';
const SECTION = {
  overlays: `
  <div class="lower" id="title">
    <div class="logo"><img class="logoimg" alt="CWP"></div>
    <div class="txt">
      <div class="k">New starter induction &middot; 5</div>
      <div class="h">RAMS &amp; safe systems of work</div>
      <div class="s">Know the plan before you start, and stop if the job stops matching it.</div>
    </div>
  </div>
  <div id="chip"><div class="k"></div><div class="h"></div></div>
  <div id="rams"><div class="doc">
    <div class="hd"><img class="logoimg" alt="CWP"><div><b>Risk assessment &amp; method statement</b><span>Drainage run D3 &middot; 300 mm pipe at 2 m depth</span></div></div>
    <div class="sec s0"><h5>1 &middot; Work sequence</h5><ol><li>Scan with CAT &amp; Genny, permit to dig issued</li><li>Excavate in bays, trench box installed as you go</li><li>Lay and joint pipe from inside the box</li><li>Backfill and compact in layers</li></ol></div>
    <div class="sec s1"><h5>2 &middot; Hazards</h5><ul><li>Collapse of the excavation</li><li>Underground services</li><li>Moving plant beside the trench</li><li>Manual handling of pipes</li></ul></div>
    <div class="sec s2"><h5>3 &middot; Controls</h5><ul><li>No one in the trench outside the box</li><li>Edge protection and ladder access</li><li>Banksman and exclusion zone round plant</li></ul></div>
    <div class="sign"><h5>Briefed &amp; understood</h5>
      <div class="row"><span>J. Patel</span><i></i></div><div class="row"><span>M. Okoye</span><i></i></div><div class="row"><span>D. Kowalski</span><i></i></div>
      <div class="row you"><span>You</span>${SIGNATURE}<i></i></div></div>
  </div></div>
  <div id="dim"></div>
  <div id="sig"><div class="sigcard">
    <div class="k">Signing the RAMS</div>
    <p class="a">isn&rsquo;t just paperwork.</p>
    ${SIGNATURE}
    <p class="b">&ldquo;I understand how to do this job safely.&rdquo;</p>
  </div></div>
  <div id="end">
    <img class="logoimg" alt="CWP">
    <div class="line"></div>
    <p>Know the plan. Follow the plan.</p>
    <small>CWP Construction Ltd &middot; New starter induction</small>
  </div>`,
  start: `
    <div class="k">New starter induction &middot; Section 5</div>
    <h1>RAMS &amp; safe systems of work</h1>`,
  hint: 'About a minute &middot; Space play/pause &middot; F fullscreen &middot; M mute &middot; R restart',
};
const LAYOUT = LAYOUTS.standard;
const DUR = 64;
// the pedestrian gate stays shut: everyone is already on site
const GATE_OPEN = [];

/* ---------------------------------------------------------------- scene */
const CREW = [
  // at work elsewhere on site
  { at: [44.2, 4.2], vest: 'sub', tool: 'rake', work: true, seed: 0 }, { at: [45.6, 3], vest: 'sub', tool: 'rake', work: true, seed: 2, skin: SKINS[3] }, { at: [45, 5.6], vest: 'sub', tool: 'rake', work: true, seed: 4, skin: SKINS[2] },
  { at: [69.2, 6.9], dir: 1, skin: SKINS[4] }, { at: [78.6, 5.6], tool: 'tablet', dir: -1 },
];
// chip captions [from, to, kicker, text]
const CHIPS = [
  [4.4, 12.4, 'Before any job', 'Get briefed on its RAMS'],
  [23.4, 28.6, 'Sign-off', 'Confirm you&rsquo;ve read and understood it'],
  [40.2, 44.2, 'Stop', 'Speak to your supervisor'],
  [44.4, 50.4, 'No improvising', 'Changes need a revised, authorised method'],
];
const BOARD = [.2, 3.6];                                            // briefing board (x, y of its face)
const BRIEF_CREW = [[.7, 5.6, SKINS[1]], [1.5, 6.1, SKINS[2]], [2.4, 6.2, SKINS[3]], [3.2, 5.8, SKINS[4]]];
const SEC_AT = [16.3, 18.5, 20.1];                                  // RAMS sections highlighted as they're named
const SIGN_AT = [24.6, 25.3, 26, 26.9];                             // sign-off ticks; the last is "you"
const CHANGE_AT = [30.8, 33.1, 36.8];                               // work changes · conditions · RAMS no longer fit
const STOP_AT = 40.4, OK_AT = 48, SIG_AT = 51.2, SIG_B = 54.1;
// the trench crew, and the supervisor who is called over
const PAIR = [[29.6, 5.5, SKINS[0]], [30.7, 4.85, SKINS[3]]];
function supAt(t) {
  if (t < 29) return { x: 2.9, y: 4.1, dir: -1, tool: 'tablet', raise: ramp(t, 5, 5.3) * (1 - ramp(t, 6.4, 6.7)) * .4 };
  const w = walkPath([[29, 35.6, 6.6], [41.6, 35.6, 6.6], [44.4, 31.8, 5.9], [64, 31.8, 5.9]], t);
  return { ...w, dir: w.moving ? w.dir : -1, tool: 'tablet' };
}
function waterLevel(t) {
  // groundwater seeps in and stays: the revised RAMS deals with it
  return lerp(-2.05, -.35, ramp(t, 33, 35.8));
}
function dumperAt(t) {
  const a = 6, b = 40, v = 3.2, per = 2 * (b - a) / v;
  const u = frac((t + 4) / per) * per, half = per / 2;
  return u < half ? { x: a + v * u, dir: 1 } : { x: b - v * (u - half), dir: -1 };
}
function cameraAt(t) {
  const c = (x, y, z, w) => { const [px, py] = P(x, y, z); return { x: px, y: py, w }; };
  const keys = [
    [0, c(1.6, 5.6, 1.1, 560)], [4.4, c(1.7, 4.8, 1.1, 360)], [12.6, c(1.8, 4.8, 1.1, 350)],
    // RAMS panel on the right: scene shifts left to make room
    [13.6, MOBILE ? c(1.8, 4.8, 1.1, 350) : c(4.4, 3, 1.1, 440)], [28.4, MOBILE ? c(1.8, 4.8, 1.1, 350) : c(4.5, 3, 1.1, 440)],
    [30, c(29.6, 4.6, .2, 420)], [32, c(30.6, 4.2, .2, 400)],
    [33.6, c(26.6, 4, -.3, 380)], [36, c(26.8, 4, -.3, 370)],
    [36.9, c(29.6, 5, .6, 360)], [40, c(29.8, 5, .6, 360)],
    [41, c(31.4, 5.4, .6, 420)], [44.2, c(31, 5.4, .6, 400)], [50.2, c(30.4, 5.2, .5, 420)],
    [51, c(20, 6, 1, 1100)], [64, c(21, 6, 1, 1080)],
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
  const busy = F.t > 29 && F.t < 51 ? 1 : .4;
  A.eng.gain.setTargetAtTime(.1 * busy * F.on, n, .3);
  const duck = V.speaking ? .45 : 1;
  A.site.gain.setTargetAtTime(.32 * busy * F.on * duck, n, .15);
  A.pad.gain.setTargetAtTime((.035 * F.on + (F.t > 58.5 ? .01 : 0)) * duck, n, .3);
  A.padF.frequency.setTargetAtTime(F.t > 50 ? 1500 : 800, n, 1);
  const chord = CHORDS[Math.floor(Math.max(0, F.t) / 4) % 4];
  A.voices.forEach((pair, i) => pair.forEach(o => o.frequency.setTargetAtTime(mtof(chord[i]), n, .25)));
}

/* ---------------------------------------------------------------- voiceover cues (clips are in audio-5/voice.js) */
// [cue time, clip, segment start, segment end (null = to the end), text]
// Clips 10, 11 and 13 end early: the generator's next-line context left the start of the next line on their tails.
const VO = [
  [.6, 0, 0, null, 'RAMS, and safe systems of work.'],
  [4.6, 1, 0, null, 'Before you start any job, you must be briefed on its risk assessment and method statement, known as the RAMS.'],
  [13, 2, 0, null, 'The RAMS explain three things.'],
  [16.3, 3, 0, null, 'The work sequence.'],
  [18.5, 4, 0, null, 'The hazards.'],
  [20.1, 5, 0, null, 'And the controls you must follow.'],
  [23.6, 6, 0, null, "You'll be asked to confirm that you've read and understood the RAMS for your work."],
  [30.6, 7, 0, null, 'If the work changes,'],
  [33, 8, 0, null, "the conditions aren't what was expected,"],
  [36.4, 9, 0, 2.58, "or the RAMS no longer match what you're doing:"],
  [40.2, 10, 0, 2.44, 'stop, and speak to your supervisor.'],
  [44.4, 11, 0, null, 'Never improvise, or work outside the agreed method, without authorisation.'],
  [51.2, 12, 0, 6.1, "Signing the RAMS isn't just paperwork. It confirms you understand how to do the job safely."],
  [59.4, 13, 0, null, 'Know the plan. Follow the plan.'],
];

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
  const mark = (x, y, z, ok, a, scale = 1) => {
    // green tick or red cross badge
    const [px, py] = P(x, y, z), r = fs * 1.25 * scale, c = ok ? '#2c9a4a' : '#e5483b';
    const g = ok ? `M${f1(px - r * .45)} ${f1(py)} l${f1(r * .3)} ${f1(r * .32)} l${f1(r * .6)} ${f1(-r * .62)}` : `M${f1(px - r * .38)} ${f1(py - r * .38)} l${f1(r * .76)} ${f1(r * .76)} m0 ${f1(-r * .76)} l${f1(-r * .76)} ${f1(r * .76)}`;
    return `<g opacity="${f2(a)}"><circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(r)}" fill="${c}" stroke="#fff" stroke-width="${f2(fs * .2)}"/><path d="${g}" stroke="#fff" stroke-width="${f2(r * .28)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  };
  // a small RAMS sheet icon above someone's head (crossed out when it no longer fits)
  const sheet = (x, y, z, a, crossed) => {
    if (a <= 0) return '';
    const [px, py] = P(x, y, z), w = fs * 1.9, h = fs * 2.5;
    let o = `<g opacity="${f2(a)}"><rect x="${f1(px - w / 2)}" y="${f1(py - h)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(fs * .15)}" fill="#fff" stroke="#888" stroke-width="${f2(fs * .08)}"/>`;
    for (let k = 0; k < 4; k++) o += `<rect x="${f1(px - w * .35)}" y="${f1(py - h + h * (.18 + k * .2))}" width="${f1(w * (k % 2 ? .5 : .7))}" height="${f1(fs * .18)}" fill="${k ? '#9aa0a4' : BLUE}"/>`;
    if (crossed) o += `<path d="M${f1(px - w * .7)} ${f1(py - h * 1.1)} L${f1(px + w * .7)} ${f1(py + h * .1)} M${f1(px + w * .7)} ${f1(py - h * 1.1)} L${f1(px - w * .7)} ${f1(py + h * .1)}" stroke="#e5483b" stroke-width="${f2(fs * .35)}" stroke-linecap="round"/>`;
    return o + '</g>';
  };

  const items = [];
  items.push({ k: -1.2, bb: [-5.6, -1.2, 1, 2], s: STAIR || (STAIR = stair(-5.6, -4.2, -1.2, 1, 2, 2.7)) });
  items.push({ k: BOARD[0] + BOARD[1] + 1, bb: [BOARD[0], BOARD[0] + 2.4, BOARD[1] - .1, BOARD[1] + .1], s: briefingBoard(...BOARD) });
  items.push({ k: 21, s: excavator(8, excavatorPose(t), t) });
  const d = dumperAt(t); items.push({ k: d.x + 1.8 + 9.6, s: dumper(d.x, 8.7, d.dir, t) });
  items.push({ k: 58, s: mixer(44.6, 8.75, t) });
  const rx = 69.6 + 1.6 * Math.sin(t * .55); items.push({ k: rx + 4.9, s: roller(rx, 2.6, t) });
  items.push(...liftWorks(LAYOUT, t));   // the excavator lifting area
  for (const p of CREW) items.push({ k: p.at[0] + p.at[1], s: person({ x: p.at[0], y: p.at[1], dir: p.dir || 1, tool: p.tool, vest: p.vest, work: p.work, seed: p.seed, skin: p.skin, t }) });
  const cu = frac(t / 9), cx = cu < .5 ? lerp(33.4, 39.6, cu * 2) : lerp(39.6, 33.4, (cu - .5) * 2);
  items.push({ k: cx + 3.2, s: person({ x: cx, y: 3.2, moving: true, phase: t * 4.5, dir: cu < .5 ? 1 : -1, tool: 'cat', t }) });

  // 1-3 · the briefing at the board
  if (t < 29) BRIEF_CREW.forEach(([x, y, skin], i) => items.push({ k: x + y, s: person({ x, y, dir: 1, skin, raise: i < 3 ? ramp(t, SIGN_AT[i], SIGN_AT[i] + .25) * (1 - ramp(t, SIGN_AT[i] + .7, SIGN_AT[i] + .95)) * .5 : 0, t }) }));
  const sp = supAt(t);
  items.push({ k: sp.x + sp.y, s: person({ ...sp, t }) });
  // 4-6 · the drainage trench: extension marked, groundwater, the crew stop, then the revised method
  if (t >= 29) {
    items.push({ k: 25.6 + 3.9, bb: [21, 30, 3.2, 4.6], s: trenchWater(21, 30, 3.2, 4.6, waterLevel(t), 'tr2in') });
    PAIR.forEach(([x, y, skin], i) => items.push({ k: x + y, s: person({ x, y, dir: i ? -1 : 1, skin, tool: i ? 'radio' : null, talk: i && t > STOP_AT + .2 && t < 43.4,
      raise: i ? 0 : ramp(t, STOP_AT, STOP_AT + .3) * (1 - ramp(t, 42.6, 43)), t }) }));
  }
  items.push(...PROPS);
  sortDepth(items);
  $('dyn').innerHTML = items.filter(i => !(i.y > 12.6)).map(i => i.s).join('');
  $('dyn2').innerHTML = items.filter(i => i.y > 12.6).map(i => i.s).join('');
  $('gate').innerHTML = pedGate(gateOpen(t));

  // marks, tags and badges
  let fx = '';
  if (t >= 30.4 && t < 51) {
    const u = ramp(t, 30.6, 31.6), out = 1 - ramp(t, 50.4, 51);
    fx += `<g opacity="${f2(out)}">` + sprayMark([30.1, 3.2], [33, 3.2], u) + sprayMark([30.1, 4.6], [33, 4.6], u) + sprayMark([33, 3.2], [33, 4.6], ramp(t, 31.4, 31.8)) + '</g>';
    fx += tag(31.6, 3.9, .5, 'Work changes', '#e07a1a', ramp(t, CHANGE_AT[0], CHANGE_AT[0] + .3) * (1 - ramp(t, 32.8, 33.2)));
    fx += tag(25.6, 3.9, .4, 'Conditions not as expected', '#e07a1a', ramp(t, CHANGE_AT[1], CHANGE_AT[1] + .3) * (1 - ramp(t, 36.2, 36.6)));
    fx += sheet(30.2, 5.2, 2.6, ramp(t, CHANGE_AT[2], CHANGE_AT[2] + .3) * (1 - ramp(t, 40, 40.4)), t > CHANGE_AT[2] + .6);
    fx += tag(30.2, 5.2, 3.6, 'RAMS no longer fit', '#e5483b', ramp(t, CHANGE_AT[2] + .4, CHANGE_AT[2] + .7) * (1 - ramp(t, 40, 40.4)));
    fx += tag(29.6, 5.5, 2.4, 'Stop', '#e5483b', ramp(t, STOP_AT, STOP_AT + .3) * (1 - ramp(t, 43.4, 43.8)));
    fx += sheet(sp.x, sp.y, 2.7, ramp(t, 45.4, 45.7) * out, false);
    fx += mark(sp.x + .5, sp.y - .5, 2.9, true, ramp(t, OK_AT, OK_AT + .3) * out, .8);
    fx += tag(sp.x, sp.y, 3.9, 'Revised RAMS \u00b7 authorised', '#2c9a4a', ramp(t, OK_AT, OK_AT + .3) * out);
  }
  $('fx').innerHTML = fx;

  $('tint').style.background = '#ffd28a';
  $('tint').style.opacity = f2(.45 * (1 - ramp(t, 4, 9)) + .15);
  $('grain').style.backgroundPosition = `${(Math.random() * 256) | 0}px ${(Math.random() * 256) | 0}px`;

  const show = (el, a, dy = .6) => { el.style.opacity = f2(a); el.style.transform = `translateY(${f2((1 - a) * dy)}em)`; };
  show($('title'), ramp(t, 1.2, 1.8) * (1 - ramp(t, 4, 4.4)));
  const ch = CHIPS.find(c => t >= c[0] && t < c[1]);
  show($('chip'), ch ? ramp(t, ch[0], ch[0] + .35) * (1 - ramp(t, ch[1] - .3, ch[1])) : 0);
  if (ch) { $('chip').firstElementChild.innerHTML = ch[2]; $('chip').lastElementChild.innerHTML = ch[3]; }
  // the RAMS document: opens, highlights each section, then the sign-off
  const rams = $('rams');
  show(rams, ramp(t, 13, 13.6) * (1 - ramp(t, 28.4, 29)), 1);
  rams.querySelectorAll('.sec').forEach((s, i) => {
    const on = t >= SEC_AT[i] && t < (i < 2 ? SEC_AT[i + 1] : 23.4);
    s.classList.toggle('on', on); s.classList.toggle('off', t >= SEC_AT[0] && t < 23.4 && !on);
  });
  rams.querySelectorAll('.sign .row').forEach((r, i) => r.classList.toggle('ok', t >= SIGN_AT[i] + (i === 3 ? 1.1 : 0)));
  rams.querySelector('.sign').classList.toggle('on', t >= 23.4);
  rams.querySelector('.you .pen').style.strokeDashoffset = f1(100 - ramp(t, SIGN_AT[3], SIGN_AT[3] + 1) * 100);
  $('dim').style.opacity = f2(ramp(t, 50.6, 51.2) * (1 - ramp(t, 58.6, 59.2)));
  const sig = $('sig');
  show(sig, ramp(t, SIG_AT, SIG_AT + .5) * (1 - ramp(t, 58.4, 59)), 1);
  sig.querySelector('.pen').style.strokeDashoffset = f1(100 - ramp(t, SIG_B - .6, SIG_B + .6) * 100);
  sig.querySelector('.b').style.opacity = f2(ramp(t, SIG_B, SIG_B + .4));
  $('end').style.opacity = f2(ramp(t, 58.8, 59.5));
  $('end').querySelector('.line').style.width = (ramp(t, 59.6, 60.6) * 30).toFixed(1) + '%';
  $('end').querySelector('p').style.opacity = f2(ramp(t, 59.8, 60.4));
  $('end').querySelector('small').style.opacity = f2(ramp(t, 60.6, 61.2));
  $('black').style.opacity = f2(1 - ramp(t, 0, .9));
  return { t, on: 1 - ramp(t, 58.8, 60.8) * .7, ns: t > 29 && t < 51 ? sp : null };
}
function triggers(F, P0) {
  if (!P0 || F.t < P0.t || F.t - P0.t > .25) return;
  const cross = tb => P0.t < tb && F.t >= tb;
  if (cross(1.2)) shot('whoosh');
  CHIPS.forEach(c => { if (cross(c[0])) shot('whoosh'); });
  [...SEC_AT, ...SIGN_AT, ...CHANGE_AT, STOP_AT, OK_AT].forEach(tc => { if (cross(tc)) shot('ping'); });
  [13, SIG_AT].forEach(tc => { if (cross(tc)) shot('card'); });
  if (cross(59.6)) shot('chime');
  if (F.ns && P0.ns && F.ns.moving && Math.floor(F.ns.d / .7) !== Math.floor(P0.ns.d / .7)) shot('step');
  if (F.t > nextBird && F.t < 8) { shot('bird'); nextBird = F.t + .7 + Math.random() * 1.8; }
}
