/* player.js: builds the page, runs the timeline and wires up the controls
   Loaded last: needs the section script (SECTION, DUR, render, triggers, audioUpdate) and VO_DATA.
   Shared by every section: change it here, not in a section file. */
'use strict';
function buildPage() {
  const S = SECTION;
  document.body.insertAdjacentHTML('afterbegin', `
${MOBILE ? '<div id="phone"></div><div id="phoneLabel"></div>' : ''}
<div id="stage">
  <svg id="iso" preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
      <filter id="soft" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3"/></filter>
      <clipPath id="siteClip"><polygon id="siteClipPoly"/></clipPath>
      <pattern id="mesh" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0 H5 M0 0 V5" stroke="#a7adb1" stroke-width=".6" opacity=".6"/></pattern>
    </defs>
    <g id="slab"></g>
    <g clip-path="url(#siteClip)"><g id="under"></g><image id="ground" preserveAspectRatio="none"/></g>
    <g id="back"></g><g id="dyn"></g><g id="front"></g><g id="gate"></g><g id="dyn2"></g><g id="fx"></g>
  </svg>
  <div id="tint"></div><div id="dusk"></div><div id="vig"></div><div id="grain"></div>
${S.overlays}
  <div id="black"></div>
  <button id="replay">&#8635; Replay</button>
  <div id="start">
    <img class="logoimg" alt="CWP">
${S.start}
    <button id="play">&#9654; Play</button>
    <div class="hint">${S.hint}</div>
  </div>
</div>
<div id="controls">
  <button id="cPlay">&#10073;&#10073;</button>
  <button id="cRestart">&#8635;</button>
  <div id="bar"><i></i></div>
  <span id="time">0.0 / ${DUR.toFixed(1)}</span>
  <button id="cMute">Sound on</button>
  ${MOBILE ? '<button id="cPhone">Phone frame</button>' : ''}
  <button id="cFull">Fullscreen</button>
</div>`);
}

let T = 0, playing = false, last = 0, prev = null, nextBird = 0;
// triggers(), render() and audioUpdate() come from the section script
function frame(now) {
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  if (playing) { T += dt; if (T >= DUR) { T = DUR; setPlaying(false); $('replay').style.display = 'block'; } }
  const F = render(T);
  if (playing) { audioUpdate(F); triggers(F, prev); voTick(F, prev); }
  prev = F;
  $('bar').firstElementChild.style.width = (T / DUR * 100).toFixed(2) + '%';
  $('time').textContent = `${T.toFixed(1)} / ${DUR.toFixed(1)}`;
  requestAnimationFrame(frame);
}
function setPlaying(p) { playing = p; if (!p && 'speechSynthesis' in window) speechSynthesis.cancel(); $('cPlay').innerHTML = p ? '&#10073;&#10073;' : '&#9654;'; if (A.ctx) p ? A.ctx.resume() : A.ctx.suspend(); }
function seek(t) {
  T = clamp(t, 0, DUR); prev = null; voStop();
  // landing part-way through a line picks it up from there
  if (playing) VO.forEach(([tc], i) => { if (T >= tc && T - tc < (V.bufs ? segLen(i) : 1.2)) voPlay(i, T - tc); });
  nextBird = T; $('replay').style.display = T >= DUR ? 'block' : 'none';
}
function restart() { setPlaying(true); seek(0); }
function setMuted(m) { A.muted = m; if (m && 'speechSynthesis' in window) speechSynthesis.cancel(); if (A.out) A.out.gain.value = m ? 0 : .9; $('cMute').textContent = m ? 'Muted' : 'Sound on'; }
function toggleFull() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); }
let hideT = 0;
function poke() { $('controls').classList.add('show'); clearTimeout(hideT); hideT = setTimeout(() => $('controls').classList.remove('show'), 2200); }
addEventListener('resize', () => stage && fit());
addEventListener('mousemove', poke);
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') { if (e.key === 'Enter') $('play').click(); return; }
  if ($('start').style.display !== 'none' && (e.code === 'Space' || e.code === 'Enter')) { e.preventDefault(); $('play').click(); return; }
  if (e.code === 'Space') { e.preventDefault(); if (T >= DUR) restart(); else setPlaying(!playing); }
  if (e.key === 'r' || e.key === 'R') restart();
  if (e.key === 'm' || e.key === 'M') setMuted(!A.muted);
  if (e.key === 'f' || e.key === 'F') toggleFull();
  if (MOBILE && (e.key === 'p' || e.key === 'P')) cyclePhone();
  if (e.key === 'ArrowRight') seek(T + 2);
  if (e.key === 'ArrowLeft') seek(T - 2);
  poke();
});
function wireControls() {
  $('play').onclick = () => { audioInit(); voLoad(); $('start').style.display = 'none'; restart(); };
  $('replay').onclick = restart;
  $('cPlay').onclick = () => { audioInit(); voLoad(); if (T >= DUR) restart(); else setPlaying(!playing); };
  $('cRestart').onclick = () => { audioInit(); voLoad(); restart(); };
  $('cMute').onclick = () => setMuted(!A.muted);
  $('cFull').onclick = toggleFull;
  $('bar').onclick = e => { const r = $('bar').getBoundingClientRect(); seek((e.clientX - r.left) / r.width * DUR); };
  if (MOBILE) $('cPhone').onclick = cyclePhone;
}

(function boot() {
  buildPage();
  stage = $('stage'); iso = $('iso');
  wireControls();
  // on a computer, the mobile page shows inside a phone frame
  if (MOBILE && innerWidth > innerHeight * 1.1) cyclePhone(); else fit();
  pickVoice();
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = pickVoice;
  document.querySelectorAll('.logoimg').forEach(i => i.src = LOGO);
  buildSite();
  $('grain').style.backgroundImage = `url(${grainTile(256, 77).toDataURL()})`;
  if (SECTION.onBoot) SECTION.onBoot();
  // ?t=12.5 opens paused on that frame (handy for checking shots)
  const q = new URLSearchParams(location.search);
  if (q.has('t')) { $('start').style.display = 'none'; seek(parseFloat(q.get('t')) || 0); }
  requestAnimationFrame(t => { last = t; frame(t); });
})();
