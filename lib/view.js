/* view.js: camera framing, in-scene label sizing and the phone frame
   Desktop pages are a 16:9 film; mobile pages (MOBILE = true) fill a portrait screen and zoom in.
   Shared by every section: change it here, not in a section file. */
'use strict';
let ASPECT = 16 / 9, VIEW_W = 1000, VIEW_L = -1e9, VIEW_R = 1e9, VIEW_T = -1e9, VIEW_B = 1e9;
// fill whatever screen we're on: tall (portrait) screens zoom in on the action and lose the sides
function setView(cam) {
  const k = ASPECT >= 16 / 9 ? 1 : .5 + .5 * clamp((ASPECT - .46) / (16 / 9 - .46));
  const vw = cam.w * k, vh = vw / ASPECT;
  iso.setAttribute('viewBox', `${f1(cam.x - vw / 2)} ${f1(cam.y - vh / 2)} ${f1(vw)} ${f1(vh)}`);
  VIEW_W = vw; VIEW_L = cam.x - vw / 2; VIEW_R = cam.x + vw / 2; VIEW_T = cam.y - vh / 2; VIEW_B = cam.y + vh / 2;
}
// mobile only: a label shows only while its subject is in shot, and slides inward rather than off the edge
const inShot = (x, y) => !MOBILE || (x > VIEW_L && x < VIEW_R && y > VIEW_T && y < VIEW_B);
const keepIn = (x, w, pad) => MOBILE ? clamp(x, VIEW_L + w / 2 + pad, VIEW_R - w / 2 - pad) : x;
// in-scene label size: a fixed share of the view, enlarged on small phone screens so it stays legible
const labelSize = (base = 13) => base * VIEW_W / 1000 * (MOBILE ? clamp(900 / stage.clientWidth, 1, 2.4) : 1);

// mobile: in a list of hazards the camera moves to each one as it's named, instead of pulling back wide.
// shots: [[time, () => [x, y, z], width], ...]; returns a camera, or null outside [start, end)
function focusSeq(t, start, end, shots, after) {
  if (t < start || t >= end) return null;
  const c = (p, w) => { const [px, py] = P(...p); return { x: px, y: py, w }; };
  let i = 0; while (i < shots.length - 1 && t >= shots[i + 1][0]) i++;
  const cur = c(shots[i][1](), shots[i][2]);
  const prev = i > 0 ? c(shots[i - 1][1](), shots[i - 1][2]) : cur;
  let cam = { ...cur }, u = i > 0 ? smooth((t - shots[i][0]) / .9) : 1;
  cam = { x: lerp(prev.x, cur.x, u), y: lerp(prev.y, cur.y, u), w: lerp(prev.w, cur.w, u) };
  // hand back to the normal camera at the end of the sequence
  if (after && t > end - 1.2) { const a = c(after[0], after[1]), v = smooth((t - (end - 1.2)) / 1.2); cam = { x: lerp(cam.x, a.x, v), y: lerp(cam.y, a.y, v), w: lerp(cam.w, a.w, v) }; }
  return cam;
}

// phone frame: on a computer the mobile page opens inside an iPhone-sized frame (P toggles it)
let PHONE = '';
function cyclePhone() {
  PHONE = PHONE ? '' : 'portrait';
  document.body.classList.toggle('phone', !!PHONE);
  $('phone').className = PHONE;
  $('cPhone').textContent = PHONE ? 'Phone frame: on' : 'Phone frame: off';
  fit();
}
function fit() {
  let W = innerWidth, H = innerHeight;
  if (!MOBILE) {
    // desktop: a 16:9 film, letterboxed
    const w = Math.min(W, H * 16 / 9), h = w * 9 / 16;
    stage.style.width = w + 'px'; stage.style.height = h + 'px'; stage.style.fontSize = (w / 100) + 'px';
    return;
  }
  if (PHONE) {
    const [pw, ph] = [390, 844];
    const sc = Math.min(1, (W - 60) / (pw + 28), (H - 120) / (ph + 28));
    W = pw * sc; H = ph * sc;
    Object.assign($('phone').style, { width: W + 'px', height: H + 'px', left: (innerWidth - W) / 2 - 14 + 'px', top: (innerHeight - H) / 2 - 14 + 'px' });
    $('phoneLabel').textContent = `Phone preview · iPhone 15 (390 × 844) · portrait${sc < 1 ? ` · shown at ${Math.round(sc * 100)}%` : ''} · press P to hide the frame`;
  }
  // the stage always fills the screen; text sizes from the shorter side so it stays readable on phones
  stage.style.width = W + 'px'; stage.style.height = H + 'px';
  stage.style.fontSize = Math.max(Math.min(W, H * 16 / 9) / 100, Math.min(W, H) / 55) + 'px';
  stage.classList.toggle('portrait', W / H < .9);
  ASPECT = W / H;
}
