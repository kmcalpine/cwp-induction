/* people.js: workers and members of the public
   person() draws one figure; walkPath() moves people along timed routes.
   Shared by every section: change it here, not in a section file. */
'use strict';
const VEST = { cwp: '#ef9532', sub: '#d4dc2c' };
const SKINS = ['#c4946f', '#8d5a3b', '#e0b48f', '#6b4429', '#d1a07a'];
// Kit a worker wears unless told otherwise (w.kit can switch items off, e.g. for a kit-up scene).
// w.extra adds task PPE: ear (defenders), mask (respirator), visor, life (lifejacket), coverall.
const KIT_FULL = { helmet: true, vest: true, boots: true, gloves: true, glasses: true };
function person(w) {
  const [sx, sy] = P(w.x, w.y, w.z || 0), H = 1.8 * S;
  // casual = a member of the public: own clothes, no PPE
  const kit = w.casual ? {} : { ...KIT_FULL, ...(w.kit || {}) }, ex = w.extra || {};
  const vest = w.casual || (ex.coverall ? '#e9ecea' : kit.vest ? VEST[w.vest || 'cwp'] : (w.shirt || '#4a5a78'));
  const shoe = kit.boots || w.casual ? '#1b1712' : '#e2e2dc', glove = ex.coverall ? '#2f7a3a' : kit.gloves ? '#4a4a3a' : (w.skin || '#c4946f');
  const twoHand = ['carry', 'breaker', 'saw'].includes(w.tool);
  const walk = w.moving ? 1 : 0, sw = Math.sin(w.phase || 0) * walk;
  const bob = walk * (1 - Math.abs(Math.sin(w.phase || 0))) * 1.1;
  const work = w.work ? Math.sin(w.t * 5 + (w.seed || 0)) : 0;
  const lean = w.work ? 2.5 + work : 0;
  const hip = -.5 * H, sh = -.79 * H, hd = -.905 * H;
  let o = `<!--p:${f2(w.x)},${f2(w.y)}--><ellipse cx="${f1(sx + 6)}" cy="${f1(sy + 1.5)}" rx="10" ry="3.2" fill="#2a2010" opacity=".33"/>`;
  o += `<g transform="translate(${f1(sx)},${f1(sy - bob)}) scale(${w.dir || 1},1)">`;
  const leg = (fx, k) => `<path d="M0 ${f1(hip)} Q${f1(fx * .5 + 1)} ${f1(hip * .5)} ${f1(fx)} ${f1(-3 + bob)}" stroke="${col(ex.coverall ? '#dfe3e1' : w.casual ? '#3b4a66' : '#26304a', k)}" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    `<path d="M${f1(fx - 2.6)} ${f1(-4.4 + bob)} h4.8 q3 .6 3.6 3.4 v1 h-8.4 z" fill="${col(shoe, k)}"/>`;
  o += leg(-sw * 6.5, .72);
  o += `<path d="M-1 ${f1(sh + 3)} L${f1(w.work ? 5 + lean : twoHand ? 5.5 : -1.5 + sw * 3)} ${f1(w.work ? sh + 10 + work * 2 : twoHand ? hip - 1 : hip + 3)}" stroke="${col(vest, .72)}" stroke-width="4" stroke-linecap="round"/>`;
  o += leg(sw * 6.5, 1);
  o += `<g transform="translate(${f1(lean)} 0) skewX(${f1(-lean * 1.2)})">`;
  o += `<path d="M-7 ${f1(sh + 1)} Q0 ${f1(sh - 2.5)} 7 ${f1(sh + 1)} L6.4 ${f1(hip + 1.5)} L-6.4 ${f1(hip + 1.5)} Z" fill="${col(vest)}"/>`;
  if (kit.vest && !ex.coverall) o += `<rect x="-6.9" y="${f1(hip - 7.5)}" width="13.6" height="2" fill="#d8dcdc"/><rect x="-6.6" y="${f1(hip - 3)}" width="13" height="2" fill="#d8dcdc"/>` +
    `<rect x="-4.2" y="${f1(sh)}" width="1.8" height="${f1(hip - 7.5 - sh)}" fill="#d8dcdc"/><rect x="2.4" y="${f1(sh)}" width="1.8" height="${f1(hip - 7.5 - sh)}" fill="#d8dcdc"/>`;
  if (w.vest !== 'sub' && kit.vest && !ex.coverall) o += `<rect x="-2" y="${f1(sh + 3)}" width="4.6" height="2.4" fill="${BLUE}"/>`;
  // lifejacket: inflatable yoke over the shoulders and down the chest
  if (ex.life) o += `<path d="M-6.4 ${f1(sh + 1.5)} Q0 ${f1(sh - 4)} 6.4 ${f1(sh + 1.5)} L6 ${f1(sh + 11)} Q4.2 ${f1(sh + 12.5)} 2.6 ${f1(sh + 11)} L2.6 ${f1(sh + 3)} L-2.6 ${f1(sh + 3)} L-2.6 ${f1(sh + 11)} Q-4.2 ${f1(sh + 12.5)} -6 ${f1(sh + 11)} Z" fill="#f2c200" stroke="#b88f00" stroke-width=".8"/>` +
    `<rect x="-6.6" y="${f1(sh + 13)}" width="13.2" height="1.6" fill="#222"/>`;
  o += `<path d="M0 ${f1(sh - 1.8)} Q4 ${f1(sh - 1.5)} 7 ${f1(sh + 1)} L6.4 ${f1(hip + 1.5)} L0 ${f1(hip + 1.5)} Z" fill="#000" opacity=".14"/></g>`;
  // walking: the near arm swings against the near leg; the elbow sits behind the shoulder-hand line
  let hand = [2.2 - sw * 4, hip + 2], elbow = [1 - sw * 2.4, sh + 9];
  if (w.tool === 'tablet') { hand = [6, sh + 9]; elbow = [3.5, sh + 13]; }
  if (w.tool === 'cat') { hand = [6.5, hip + 1]; elbow = [4, sh + 10]; }
  if (w.tool === 'carry') { hand = [7, hip - 1]; elbow = [3, sh + 11]; }
  if (w.tool === 'breaker') { hand = [6.5, hip - 1]; elbow = [3.5, sh + 10]; }
  if (w.tool === 'saw') { hand = [7, hip + 1]; elbow = [3.5, sh + 11]; }
  if (w.tool === 'grinder') { hand = [7.5, hip - 3]; elbow = [4, sh + 10]; }
  if (w.tool === 'helmet') { hand = [6.5, hip - 2]; elbow = [3, sh + 11]; }
  if (w.work) { hand = [7 + lean, sh + 13 + work * 3]; elbow = [5 + lean * .5, sh + 10]; }
  if (w.tool === 'radio' && w.talk) { hand = [5.6, hd + 3.5]; elbow = [8.5, sh + 5]; }
  if (w.raise) { hand = [lerp(hand[0], 6.5, w.raise), lerp(hand[1], -1.1 * H, w.raise)]; elbow = [lerp(elbow[0], 8, w.raise), lerp(elbow[1], sh - 4, w.raise)]; }
  if (w.tool === 'rake' || w.tool === 'spade') {
    const tip = [hand[0] + 7, -2 + (w.work ? work * 2 : 0)];
    o += `<line x1="${f1(hand[0] - 3)}" y1="${f1(hand[1] - 9)}" x2="${f1(tip[0])}" y2="${f1(tip[1])}" stroke="#8a6a42" stroke-width="2"/>`;
    o += w.tool === 'rake' ? `<path d="M${f1(tip[0] - 4)} ${f1(tip[1])} h8" stroke="#666" stroke-width="2.4"/>` : `<path d="M${f1(tip[0] - 2.6)} ${f1(tip[1] - 2)} h5.2 l-.6 6 q-2 1.6 -4 0 Z" fill="#8d939a"/>`;
  }
  o += `<path d="M1.6 ${f1(sh + 2.5)} L${f1(elbow[0])} ${f1(elbow[1])} L${f1(hand[0])} ${f1(hand[1])}" stroke="${col(vest, 1.03)}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<circle cx="${f1(hand[0])}" cy="${f1(hand[1])}" r="2.3" fill="${glove}"/>`;
  const [hx, hy] = hand, buzz = Math.sin((w.t || 0) * 70) * .6;
  if (w.tool === 'breaker') o += `<g transform="translate(0 ${f1(buzz)})"><path d="M${f1(hx - 2)} ${f1(hy)} h9" stroke="#2a2a2a" stroke-width="2.4" stroke-linecap="round"/>` +
    `<rect x="${f1(hx + 1)}" y="${f1(hy + 1)}" width="4.6" height="${f1(-12 - hy - 1)}" rx="1" fill="#c8302a"/><rect x="${f1(hx + 1.6)}" y="${f1(hy + 4)}" width="3.4" height="3" fill="#8b8f93"/></g>` +
    `<path d="M${f1(hx + 3.3)} -11 V-1" stroke="#8b8f93" stroke-width="1.6"/>`;
  if (w.tool === 'saw') o += `<rect x="${f1(hx - 1.5)}" y="${f1(hy - 2.5)}" width="8" height="5" rx="1.2" fill="#e07a1a"/><path d="M${f1(hx + 6)} ${f1(hy)} L${f1(hx + 11)} ${f1(hy + 3)}" stroke="#555" stroke-width="2"/>` +
    `<circle cx="${f1(hx + 12)}" cy="${f1(hy + 4)}" r="4.6" fill="#9a9fa4" stroke="#555" stroke-width="1"/><path d="M${f1(hx + 7.4)} ${f1(hy + 3)} a4.8 4.8 0 0 1 9 -2" stroke="#e07a1a" stroke-width="2" fill="none"/>`;
  if (w.tool === 'grinder') o += `<rect x="${f1(hx - 1)}" y="${f1(hy - 1.6)}" width="7.5" height="3.2" rx="1.4" fill="#2c6fb0"/><ellipse cx="${f1(hx + 7.4)}" cy="${f1(hy + 1)}" rx="1.4" ry="3.6" fill="#8b8f93"/>`;
  if (w.tool === 'helmet') o += `<path d="M${f1(hx - 4)} ${f1(hy - 1)} Q${f1(hx - 3.4)} ${f1(hy - 8.5)} ${f1(hx + 1.2)} ${f1(hy - 8.6)} Q${f1(hx + 5.6)} ${f1(hy - 8.3)} ${f1(hx + 5.6)} ${f1(hy - 1.6)} L${f1(hx + 7.6)} ${f1(hy - 1)} L-0 ${f1(hy)} Z" fill="#f4f4ef"/>` +
    `<path d="M${f1(hx - 1)} ${f1(hy - 7.6)} l1.6 2.2 -1.4 1.4 1.8 2.4" stroke="#333" stroke-width=".9" fill="none"/>`;
  if (w.tool === 'tablet' && !w.raise) o += `<rect x="${f1(hand[0] - 1)}" y="${f1(hand[1] - 9)}" width="7" height="10" rx="1" fill="#1d1d1d"/><rect x="${f1(hand[0])}" y="${f1(hand[1] - 8)}" width="5" height="8" fill="#8fd0ff" opacity=".85"/>`;
  if (w.tool === 'radio' && w.talk) o += `<rect x="${f1(hand[0] - 1.6)}" y="${f1(hand[1] - 4)}" width="3.4" height="6" rx=".8" fill="#1d1d1d"/><path d="M${f1(hand[0] + .8)} ${f1(hand[1] - 4)} v-3" stroke="#1d1d1d" stroke-width="1"/>`;
  if (w.tool === 'cat') o += `<path d="M${f1(hand[0])} ${f1(hand[1])} L${f1(hand[0] + 3)} -2" stroke="#2a2a2a" stroke-width="2.4"/><rect x="${f1(hand[0] - 1)}" y="${f1(hand[1] - 1)}" width="6" height="7" rx="1.2" fill="#f2c200"/>`;
  o += `<g transform="translate(${f1(lean * 1.6)} 0)">`;
  o += `<rect x="-1.8" y="${f1(hd + 3)}" width="3.8" height="3.4" fill="${w.skin ? col(w.skin, .85) : '#9d7258'}"/>`;
  o += `<ellipse cx="1" cy="${f1(hd)}" rx="4.3" ry="4.9" fill="${w.skin || '#c4946f'}"/>`;
  if (ex.mask) o += `<path d="M1.6 ${f1(hd + 1)} Q5.2 ${f1(hd + .2)} 6.2 ${f1(hd + 2.4)} Q5.2 ${f1(hd + 5)} 1.6 ${f1(hd + 4.4)} Z" fill="#f2f2ee" stroke="#aaa" stroke-width=".6"/>`;
  if (kit.glasses) o += `<path d="M2.4 ${f1(hd - .6)} h3" stroke="#151515" stroke-width="1.3"/>`;
  if (!kit.helmet) return o + `<path d="M-4.6 ${f1(hd - .6)} Q-4.2 ${f1(hd - 7.4)} 1.2 ${f1(hd - 7.2)} Q5.8 ${f1(hd - 7)} 5.4 ${f1(hd - 2.6)} Q2 ${f1(hd - 4.6)} -4.6 ${f1(hd - .6)}Z" fill="${w.hair || '#3a2a1e'}"/></g></g>`;
  o += `<path d="M-4.6 ${f1(hd - 1.6)} Q-3.6 ${f1(hd - 9.6)} 1.4 ${f1(hd - 9.8)} Q6 ${f1(hd - 9.4)} 6 ${f1(hd - 2.2)} L8.4 ${f1(hd - 1.4)} L8.4 ${f1(hd - .7)} L-4.6 ${f1(hd - .9)} Z" fill="#f4f4ef"/>`;
  o += `<path d="M-4.6 ${f1(hd - 1.6)} L8.4 ${f1(hd - 1.2)}" stroke="#b3b3ab" stroke-width="1"/>`;
  if (ex.ear) o += `<path d="M-2.4 ${f1(hd - 2)} Q1 ${f1(hd - 10.6)} 4 ${f1(hd - 2)}" stroke="#222" stroke-width="1.2" fill="none"/><ellipse cx="-.4" cy="${f1(hd + .2)}" rx="2.4" ry="3" fill="#d8a400" stroke="#222" stroke-width=".8"/>`;
  if (ex.visor) o += `<path d="M-.5 ${f1(hd - 1.5)} L8.8 ${f1(hd - 1.1)} L8.2 ${f1(hd + 6)} L1.5 ${f1(hd + 6.4)} Z" fill="#bfe3f2" opacity=".5" stroke="#7fb3c8" stroke-width=".8"/>`;
  return o + '</g></g>';
}
function walkPath(path, t) {
  // path: [[t, x, y], ...]; returns position, walk phase and facing
  if (t < path[0][0]) return null;
  let d = 0, x = path[0][1], y = path[0][2], moving = false, dx = 0, dy = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const [s0, x0, y0] = path[i], [s1, x1, y1] = path[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (t >= s1) { d += len; x = x1; y = y1; if (len) { dx = x1 - x0; dy = y1 - y0; } continue; }
    if (t > s0) { const u = (t - s0) / (s1 - s0); x = lerp(x0, x1, u); y = lerp(y0, y1, u); d += len * u; if (len) { moving = true; dx = x1 - x0; dy = y1 - y0; } }
    break;
  }
  return { x, y, moving, phase: d / .7 * Math.PI, d, dir: (dx - dy) >= 0 ? 1 : -1, ang: Math.atan2(dy, dx) };
}
