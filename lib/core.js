/* core.js: isometric projection, colours and drawing primitives
   World units are metres, x along the site, y towards the road, z up.
   Shared by every section: change it here, not in a section file. */
'use strict';
const S = 26, C = Math.cos(Math.PI / 6), N = 0.5;
const P = (x, y, z = 0) => [(x - y) * C * S, (x + y) * N * S - z * S];
const BLUE = '#1d9ad6', INK = '#231f20', CGREY = '#58595b';
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = u => { u = clamp(u); return u * u * (3 - 2 * u); };
const ramp = (t, a, b) => smooth((t - a) / (b - a));
const frac = v => v - Math.floor(v);
const f1 = v => v.toFixed(1);
// on-screen width of bold label text at a given size (cached; uses whichever font the browser picks)
const textW = (() => {
  const g = document.createElement('canvas').getContext('2d'), cache = {};
  return (text, size, spacing = 0) => {
    if (!(text in cache)) { g.font = '700 100px "Arial Narrow", Arial, sans-serif'; cache[text] = g.measureText(text).width / 100; }
    return cache[text] * size + spacing * text.length;
  };
})();
const f2 = v => v.toFixed(2);
function rng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function col(h, k = 1) { const c = v => Math.round(clamp(v * k, 0, 255)); const [r, g, b] = hexRgb(h); return `rgb(${c(r)},${c(g)},${c(b)})`; }
const LIGHT = { top: 1.08, left: .86, right: .6 };
const pts = a => a.map(p => { const q = P(...p); return f1(q[0]) + ',' + f1(q[1]); }).join(' ');
const poly = (a, fill, extra = '') => `<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;
function line3(a, b, stroke, w, extra = '') {
  const [x1, y1] = P(...a), [x2, y2] = P(...b);
  return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
}
function box(x, y, z, w, d, h, base) {
  return poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], col(base, LIGHT.left)) +
         poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], col(base, LIGHT.right)) +
         poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], col(base, LIGHT.top));
}
const isoCircle = (cx, cy, r, z = 0, n = 20) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(i / n * 2 * Math.PI), cy + r * Math.sin(i / n * 2 * Math.PI), z]);
// circle standing in the x–z plane (a wheel seen side-on on a +y face)
const wheelXZ = (cx, y, cz, r, n = 16) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(i / n * 2 * Math.PI), y, cz + r * Math.sin(i / n * 2 * Math.PI)]);
// circle standing in the y–z plane (an end seen on a +x face)
const discYZ = (x, cy, cz, r, n = 16) => Array.from({ length: n }, (_, i) => [x, cy + r * Math.cos(i / n * 2 * Math.PI), cz + r * Math.sin(i / n * 2 * Math.PI)]);
// transform mapping local metres onto the x–z plane at y (for signs and the logo)
const planeXZ = (x, y, z) => { const [ex, ey] = P(x, y, z); return `matrix(${f2(C * S)},${f2(N * S)},0,${S},${f1(ex)},${f1(ey)})`; };

// Round shading for cylinders: a gradient across the cylinder's axis, from the shadowed side
// through the base colour to a soft highlight near the lit side. axisA/axisB are two screen points
// along the axis, centre a screen point on it, radius its on-screen half-width.
let GID = 0;
function cylGrad(axisA, axisB, centre, radius, base) {
  let dx = axisB[0] - axisA[0], dy = axisB[1] - axisA[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
  let nx = -dy, ny = dx; if (ny > 0) { nx = -nx; ny = -ny; }          // the side facing up the screen is lit
  const id = 'cg' + (GID++), [cx, cy] = centre;
  const stops = [[0, .5], [.35, .82], [.68, 1.12], [.82, 1.2], [1, .92]];
  return { fill: `url(#${id})`, def: `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${f1(cx - nx * radius)}" y1="${f1(cy - ny * radius)}" x2="${f1(cx + nx * radius)}" y2="${f1(cy + ny * radius)}">` +
    stops.map(([o, k]) => `<stop offset="${o}" stop-color="${col(base, k)}"/>`).join('') + '</linearGradient>' };
}

// DOM helpers; stage and iso are assigned once the page is built (lib/player.js)
const $ = id => document.getElementById(id);
let stage, iso;

// painter's order: footprints that overlap along one axis are ordered by the other; otherwise by depth key
function footprint(it) {
  if (it.bb) return it.bb;
  const m = /^<!--p:(-?[\d.]+),(-?[\d.]+)-->/.exec(it.s);
  return m ? [+m[1] - .25, +m[1] + .25, +m[2] - .25, +m[2] + .25] : null;
}
function sortDepth(items) {
  for (const it of items) it.fp = footprint(it);
  items.sort((a, b) => {
    const A = a.fp, B = b.fp;
    if (A && B) {
      const ox = A[0] < B[1] && B[0] < A[1], oy = A[2] < B[3] && B[2] < A[3];
      if (oy && !ox) return (A[0] + A[1]) - (B[0] + B[1]);
      if (ox && !oy) return (A[2] + A[3]) - (B[2] + B[3]);
    }
    return a.k - b.k;
  });
}
