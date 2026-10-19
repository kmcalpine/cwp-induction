/* site.js: site furniture and the site as a whole
   Fences, barriers, cones, trenches, pipes, cabins, stair, gates, signs and the site safety board.
   Shared by every section: change it here, not in a section file. */
'use strict';
function heras(a, b, n) {
  let s = '';
  const at = u => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  for (let i = 0; i < n; i++) {
    const p0 = at(i / n), p1 = at((i + 1) / n);
    const q = [[...p0, .12], [...p1, .12], [...p1, 2], [...p0, 2]];
    s += poly(q, 'url(#mesh)') + poly(q, 'none', `stroke="${col('#9aa0a4')}" stroke-width="1.5"`);
  }
  // feet + couplers at every join, including both ends
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
  for (let i = 0; i <= n; i++) {
    const [x, y] = at(i / n);
    s += poly([[x - ux * .35 - uy * .14, y - uy * .35 + ux * .14, 0], [x + ux * .35 - uy * .14, y + uy * .35 + ux * .14, 0], [x + ux * .35 + uy * .14, y + uy * .35 - ux * .14, 0], [x - ux * .35 + uy * .14, y - uy * .35 - ux * .14, 0]], col('#3a3a38'));
    s += box(x - .3, y - .12, 0, .6, .24, .16, '#e6b31e') + line3([x - .08, y, .17], [x + .08, y, .17], '#3a3a3a', 3);
    s += line3([x, y, .12], [x, y, 2.02], col('#8b9194'), 2.2);
    for (const z of [.45, 1.7]) s += line3([x - ux * .09, y - uy * .09, z], [x + ux * .09, y + uy * .09, z], '#5c6164', 3);
  }
  return s;
}
function barrier(a, b) {
  let s = '';
  const at = (u, z) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), z];
  s += box(a[0] - .05, a[1] - .05, 0, .1, .1, 1, '#6b6b6b') + box(b[0] - .05, b[1] - .05, 0, .1, .1, 1, '#6b6b6b');
  for (let k = 0; k < 4; k++) s += poly([at(k / 4, .55), at((k + 1) / 4, .55), at((k + 1) / 4, .95), at(k / 4, .95)], k % 2 ? '#e3e0d8' : '#b3392f');
  return s + poly([at(0, .08), at(1, .08), at(1, .18), at(0, .18)], '#e3e0d8');
}
const PROPS = [];
const prop = (svg, bb) => { PROPS.push({ k: (bb[0] + bb[1] + bb[2] + bb[3]) / 2, bb, s: svg }); return ''; };
const barrierRun = (x0, x1, y) => { for (let x = x0; x < x1 - .1; x += 2) { const xe = Math.min(x + 2, x1) - .04; prop(barrier([x, y], [xe, y]), [x, xe, y - .1, y + .1]); } return ''; };
function cone(x, y) {
  const [bx, by] = P(x, y), h = .75 * S;
  return `<ellipse cx="${f1(bx)}" cy="${f1(by)}" rx="7" ry="3.5" fill="#2a2a2a"/>` +
    `<path d="M${f1(bx - 5)} ${f1(by - 1)} L${f1(bx)} ${f1(by - h)} L${f1(bx + 5)} ${f1(by - 1)} Z" fill="#e0682a"/>` +
    `<path d="M${f1(bx - 3.2)} ${f1(by - h * .45)} L${f1(bx + 3.2)} ${f1(by - h * .45)} L${f1(bx + 2.4)} ${f1(by - h * .6)} L${f1(bx - 2.4)} ${f1(by - h * .6)} Z" fill="#eee"/>` +
    `<path d="M${f1(bx)} ${f1(by - h)} L${f1(bx + 5)} ${f1(by - 1)} L${f1(bx + 1)} ${f1(by - 1)} Z" fill="#000" opacity=".2"/>`;
}
function pit(id, x0, x1, y0, y1, depth, wall = '#6d4a2a') {
  const rim = [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]];
  return `<clipPath id="${id}"><polygon points="${pts(rim)}"/></clipPath><g clip-path="url(#${id})">` +
    poly([[x0, y0, -depth], [x1, y0, -depth], [x1, y1, -depth], [x0, y1, -depth]], '#3a2a1a') +
    poly([[x0, y0, 0], [x0, y1, 0], [x0, y1, -depth], [x0, y0, -depth]], col(wall)) +
    poly([[x0, y0, 0], [x1, y0, 0], [x1, y0, -depth], [x0, y0, -depth]], col(wall, .8)) + '</g>' +
    poly(rim, 'none', 'stroke="#3a2a1a" stroke-width="1.2"');
}
function pipeX(x0, x1, yc, zc, r, c, hi) {
  const [a, b] = [P(x0, yc, zc), P(x1, yc, zc)];
  const end = discYZ(x1, yc, zc, r);
  return `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${col(c, .85)}" stroke-width="${f1(2.45 * r * S)}"/>` +
    `<line x1="${f1(a[0])}" y1="${f1(a[1] - r * S * .55)}" x2="${f1(b[0])}" y2="${f1(b[1] - r * S * .55)}" stroke="${col(hi)}" stroke-width="${f1(Math.max(1, r * S * .7))}"/>` +
    poly(end, col(c, .65)) + poly(discYZ(x1, yc, zc, r * .72), '#1a1a1a');
}
function cylinderV(cx, cy, r, z0, h, c, top) {
  // vertical cylinder: side band then top disc
  const n = 28, ring = z => Array.from({ length: n }, (_, i) => { const a = i / n * 2 * Math.PI; return [cx + r * Math.cos(a), cy + r * Math.sin(a), z]; });
  const lo = ring(z0), hi = ring(z0 + h);
  // front half of the side: angles where the surface faces the viewer (+x,+y)
  const side = [];
  for (let i = 0; i <= n / 2; i++) { const a = -Math.PI / 4 + i / (n / 2) * Math.PI; side.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z0 + h]); }
  for (let i = n / 2; i >= 0; i--) { const a = -Math.PI / 4 + i / (n / 2) * Math.PI; side.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z0]); }
  return poly(side, col(c, .78)) + poly(hi, top || col(c, 1.05));
}
function signXZ(x, y, z, w, h, inner) {
  // a sign board on the x–z plane, content in local metres
  return `<g transform="${planeXZ(x, y, z)}">${inner}</g>`;
}
const CABIN = '#5b6a57';
function cabin(x, y, w, d, z, h) {
  // steel site cabin: body, darker frame rails and corner posts, ribbed cladding, roof cap
  let s = box(x, y, z, w, d, h, CABIN);
  const F = col('#3e4a3c');
  for (let u = x + .45; u < x + w - .2; u += .45) s += line3([u, y + d + .005, z + .15], [u, y + d + .005, z + h - .15], 'rgba(0,0,0,.09)', 1);
  for (let u = y + .45; u < y + d - .2; u += .45) s += line3([x + w + .005, u, z + .15], [x + w + .005, u, z + h - .15], 'rgba(0,0,0,.09)', 1);
  for (const zz of [z + .07, z + h - .07]) s += line3([x, y + d, zz], [x + w, y + d, zz], F, 3.2) + line3([x + w, y, zz], [x + w, y + d, zz], F, 3.2);
  for (const [cx, cy] of [[x, y + d], [x + w, y + d], [x + w, y]]) s += line3([cx, cy, z], [cx, cy, z + h], F, 3.2);
  s += poly([[x - .05, y - .05, z + h], [x + w + .05, y - .05, z + h], [x + w + .05, y + d + .05, z + h], [x - .05, y + d + .05, z + h]], col('#6f7b6a', 1.04));
  return s;
}
function cabinWindow(x, y, z, w = .95, h = .85) {
  // framed window on a front (+y) face, blinds half down
  const q = (a, b, c, e) => [[a, y + .01, c], [b, y + .01, c], [b, y + .01, e], [a, y + .01, e]];
  let s = poly(q(x, x + w, z, z + h), '#2e3438') + poly(q(x + .05, x + w - .05, z + .05, z + h - .05), '#8fa9bb');
  s += poly(q(x + .05, x + w - .05, z + h * .55, z + h - .05), '#d9d6cc');
  for (let k = 1; k < 4; k++) s += line3([x + .05, y + .012, z + h * .55 + k * h * .1], [x + w - .05, y + .012, z + h * .55 + k * h * .1], 'rgba(0,0,0,.15)', .8);
  s += line3([x + .05, y + .012, z + .3], [x + w - .05, y + .012, z + h - .3], 'rgba(255,255,255,.35)', 2);
  return s + line3([x - .04, y + .03, z - .02], [x + w + .04, y + .03, z - .02], '#2e3438', 2.2);
}
function cabinDoor(x, y, z, w = .95, h = 2.05) {
  const q = (a, b, c, e) => [[a, y + .01, c], [b, y + .01, c], [b, y + .01, e], [a, y + .01, e]];
  return poly(q(x, x + w, z, z + h), '#2e3438') + poly(q(x + .05, x + w - .05, z + .02, z + h - .05), '#4a5258') +
    poly(q(x + .25, x + w - .25, z + h * .62, z + h * .88), '#8fa9bb') + line3([x + w - .2, y + .02, z + 1.02], [x + w - .12, y + .02, z + 1.02], '#c9c9c4', 2.2);
}
function stair(xl, xs, xe, ya, yb, zt) {
  // galvanised external stair parallel to the cabin face (band ya..yb in front of it):
  // landing from xl to xs at height zt, flight running along the face down to the ground at xe
  const n = 12, run = (xe - xs) / n, rise = zt / n, G = '#9aa0a4', R = '#e0b13a';
  const zAt = x => zt * (1 - (x - xs) / (xe - xs));
  const stringer = y => poly([[xs, y, zt + .12], [xe, y, .12], [xe, y, 0], [xs + .3, y, zt - .3], [xs, y, zt - .3]], col(G, y === ya ? .6 : .82));
  let s = '';
  // landing on legs, guard rail round its open sides
  for (const x of [xl + .05, xs]) s += line3([x, yb, 0], [x, yb, zt - .1], col(G, .75), 3);
  s += line3([xl + .05, ya + .05, 0], [xl + .05, ya + .05, zt - .1], col(G, .65), 3);
  s += box(xl, ya, zt - .1, xs - xl, yb - ya, .1, G);
  s += line3([xl, ya, zt + 1], [xl, yb, zt + 1], R, 2.2) + line3([xl, yb, zt + 1], [xs, yb, zt + 1], R, 2.2);
  for (const [x, y] of [[xl, ya + .05], [xl, yb], [xs, yb]]) s += line3([x, y, zt], [x, y, zt + 1], col(G, .8), 1.6);
  // flight
  s += stringer(ya);
  for (let k = 1; k < n; k++) {
    const xa = xs + (k - 1) * run, z = zt - k * rise;
    s += box(xa, ya + .03, z - .05, run + .02, yb - ya - .06, .05, G) + line3([xa + run, ya + .03, z], [xa + run, yb - .03, z], R, 1.4);
  }
  s += stringer(yb);
  s += line3([xs, yb, zt + 1], [xe, yb, 1], R, 2.2);
  for (const x of [xs, (xs + xe) / 2, xe - .05]) s += line3([x, yb, zAt(x)], [x, yb, zAt(x) + 1], col(G, .8), 1.6);
  return s;
}
// the staircase is drawn once and reused every frame
let STAIR = '';
function siteBack(L) {
  let s = heras([-6, -2.6], [-6, 12.6], 5) + heras([-6, -2.6], [L.xEnd, -2.6], L.backN);
  // two-storey site office: stacked cabins, external stair to the upper door
  s += cabin(-5.6, -1.8, 5.6, 2.8, 0, 2.7) + cabin(-5.6, -1.8, 5.6, 2.8, 2.7, 2.7);
  for (const x of [-5.2, -4]) s += cabinWindow(x, 1, 1);
  s += cabinDoor(-.98, 1, 0);
  for (const x of [-3.6, -2.4, -1.2]) s += cabinWindow(x, 1, 3.7);
  s += cabinDoor(-5.35, 1, 2.7);
  s += signXZ(-5.4, 1.02, 5.25, 3.8, .45, `<rect width="3.8" height=".42" fill="${BLUE}"/><text x="1.9" y=".32" font-size=".3" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff">SITE OFFICE &#183; REPORT HERE</text>`);
  // welfare / canteen unit, door at the end of the walkway
  s += cabin(1.6, -1.6, 5.8, 2.6, 0, 2.6);
  for (const x of [1.9, 4.5, 5.9]) s += cabinWindow(x, 1, 1);
  s += cabinDoor(2.85, 1, .22) + box(2.7, 1, 0, 1.25, .55, .22, '#8a8a86');
  s += signXZ(4.25, 1.02, 2.42, 3, .4, `<rect width="3" height=".36" fill="#fff"/><text x="1.5" y=".27" font-size=".25" font-family="Arial" font-weight="700" text-anchor="middle" fill="${INK}">WELFARE &#183; CANTEEN</text>`);
  // fire assembly point: front-left corner, well clear of the cabins, plant, fuel and excavations
  s += poly([[-5.6, 9.4, .01], [-3.4, 9.4, .01], [-3.4, 12.2, .01], [-5.6, 12.2, .01]], 'rgba(31,138,67,.22)', 'stroke="#1f8a43" stroke-width="2" stroke-dasharray="6 4"');
  s += box(-4.5, 9.45, 0, .08, .08, 1.9, '#7d7d7d') + signXZ(-4.9, 9.55, 2.4, .9, .9, `<rect width=".9" height=".9" fill="#1f8a43"/><text x=".45" y=".38" font-size=".18" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff">FIRE</text><text x=".45" y=".58" font-size=".13" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff">ASSEMBLY</text><text x=".45" y=".75" font-size=".13" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff">POINT</text>`);

  // groundworks: trench + spoil + edge barrier
  s += pit('tr1', 10.6, 13.6, 5.05, 5.95, 1.4);
  prop([[1.3, 0, .72], [.9, .4, .86], [.45, .75, 1]].map(([r, z, k]) => poly(isoCircle(9, 5.5, r, z, 18), col('#7a5a36', k))).join(''), [7.7, 10.3, 4.2, 6.8]);
  s += barrierRun(10.4, 14.4, 6.7);

  // drainage: trench with trench box, pipe, rings, pipe stack
  s += pit('tr2', 21, 30, 3.2, 4.6, 2);
  // trench box: below ground it's only seen through the trench opening; panel tops and rails sit above
  let tb = '';
  for (let x = 21.2; x < 29.6; x += 2.8) {
    tb += poly([[x, 3.25, 0], [x + 2.6, 3.25, 0], [x + 2.6, 3.25, -1.9], [x, 3.25, -1.9]], col('#c9cfd4', .62));
    for (const xx of [x + .5, x + 2.1]) tb += line3([xx, 3.3, -.5], [xx, 4.55, -.5], '#e0a92a', 3) + line3([xx, 3.3, -1.3], [xx, 4.55, -1.3], '#e0a92a', 3);
  }
  tb += pipeX(21.1, 29.9, 3.9, -1.7, .3, '#c8662a', '#e98a46');
  s += `<clipPath id="tr2in"><polygon points="${pts([[21, 3.2, 0], [30, 3.2, 0], [30, 4.6, 0], [21, 4.6, 0]])}"/></clipPath><g clip-path="url(#tr2in)">${tb}</g>`;
  for (let x = 21.2; x < 29.6; x += 2.8) {
    s += poly([[x, 3.25, .2], [x + 2.6, 3.25, .2], [x + 2.6, 3.25, 0], [x, 3.25, 0]], col('#c9cfd4', .62)) + box(x, 3.25, .1, 2.6, .08, .12, '#7a8a98');
    s += poly([[x, 4.55, .2], [x + 2.6, 4.55, .2], [x + 2.6, 4.55, 0], [x, 4.55, 0]], col('#c9cfd4', .8));
  }
  s += box(21, 4.55, .1, 9, .08, .12, '#7a8a98');
  for (const [x, y, n] of [[26.6, 6.2, 3], [28.4, 6.2, 2]]) { let r = ''; for (let i = 0; i < n; i++) r += cylinderV(x, y, .65, i * .5, .45, '#a7a39b', col('#3e3a35')); prop(r, [x - .65, x + .65, y - .65, y + .65]); }
  prop([[6, .3], [6.6, .3], [6.3, .78]].map(([y, z]) => pipeX(21.4, 25.6, y, z, .25, '#c8662a', '#e98a46')).join(''), [21.4, 25.6, 5.75, 6.85]);
  s += barrierRun(20.8, 30.4, 5.05);

  // utilities: shallow trench, ducts, cable drum
  s += pit('tr3', 33, 40, 4, 5.2, .6);
  // ducts in the trench, seen only through its opening
  s += `<clipPath id="tr3in"><polygon points="${pts([[33, 4, 0], [40, 4, 0], [40, 5.2, 0], [33, 5.2, 0]])}"/></clipPath><g clip-path="url(#tr3in)">` +
    [[4.25, '#1f1f1f'], [4.5, '#2f7a3a'], [4.75, '#3a6fc0']].map(([y, c]) => line3([33, y, -.4], [40, y, -.4], c, 5)).join('') + '</g>';
  { // cable drum on jack stands, wound full of black power cable, its end running into the trench
    const cx = 37.6, cz = 1.1, R = .95, r = .84, y0 = 6.3, y1 = 6.95;
    const xy = p => P(...p).map(f1).join(' ');
    const stand = y => line3([cx, y, cz], [cx - .6, y, 0], '#7d8287', 3) + line3([cx, y, cz], [cx + .6, y, 0], '#7d8287', 3) + line3([cx - .7, y, .02], [cx + .7, y, .02], '#5f6468', 3);
    let d = stand(6.12) + line3([cx, 6.02, cz], [cx, 7.22, cz], '#8a8f93', 4);
    d += poly(wheelXZ(cx, y0, cz, R, 26), col('#9b7446', .7));
    for (let y = y0 + .03; y < y1 - .02; y += .045) d += poly(wheelXZ(cx, y, cz, r, 26), '#262626', 'stroke="#454545" stroke-width="1"');
    d += poly(wheelXZ(cx, y1, cz, R, 26), col('#b88b55')) + poly(wheelXZ(cx, y1 + .005, cz, R * .88, 26), 'none', 'stroke="rgba(0,0,0,.16)" stroke-width="1.2"');
    d += poly(wheelXZ(cx, y1 + .01, cz, .3, 14), '#73777b') + poly(wheelXZ(cx, y1 + .015, cz, .11, 10), '#2a2a2a');
    d += stand(7.12);
    // free end peels off the top of the coil and drops into the trench
    d += `<path d="M${xy([cx - .2, y0 + .3, cz + r - .05])} C${xy([cx - .9, y0, cz + r + .25])} ${xy([cx - 2, 4.7, .4])} ${xy([cx - 3.2, 4.6, -.3])}" stroke="#262626" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    prop(d, [36.6, 38.6, 6.05, 7.25]); }
  for (const x of [32.6, 34.6, 36.6, 38.6, 40.4]) prop(cone(x, 3.8), [x - .3, x + .3, 3.5, 4.1]);

  // concrete: formwork edges
  for (const [a, b] of [[[L.slab, 2.2], [L.slab + 7.6, 2.2]], [[L.slab, 2.2], [L.slab, 6.3]]]) s += poly([[...a, 0], [...b, 0], [...b, .3], [...a, .3]], col('#c09a62', .8));
  s += box(L.slab, 6.3, 0, 7.6, .08, .3, '#c09a62') + box(L.slab + 7.6, 2.2, 0, .08, 4.1, .3, '#c09a62');

  // highways: cones, sign
  for (let x = L.hw + .1; x < L.hw + 9.7; x += 1.6) prop(cone(x, 6.3), [x - .3, x + .3, 6, 6.6]);
  s += box(L.hw - 1.1, 6.5, 0, .06, .06, 1.4, '#777');
  const [tx, ty] = P(L.hw - 1.07, 6.53, 1.75);
  s += `<path d="M${f1(tx)} ${f1(ty - 14)} L${f1(tx + 13)} ${f1(ty + 8)} L${f1(tx - 13)} ${f1(ty + 8)} Z" fill="#fff" stroke="#c22" stroke-width="3" stroke-linejoin="round"/><path d="M${f1(tx - 4)} ${f1(ty + 4)} l3 -9 l3 2 l2 7" stroke="#111" stroke-width="1.6" fill="none"/>`;

  // water sector: tank, kiosk, handrail
  s += cylinderV(L.tank, 2.6, 2.7, 0, 2.3, '#b9b4a8', col('#a29d92'));
  s += poly(isoCircle(L.tank, 2.6, 2.45, 2.3, 28), col('#3e6d80'));
  for (let i = 0; i < 20; i++) { const a = -Math.PI / 4 + i / 19 * Math.PI; s += line3([L.tank + 2.7 * Math.cos(a), 2.6 + 2.7 * Math.sin(a), 2.3], [L.tank + 2.7 * Math.cos(a), 2.6 + 2.7 * Math.sin(a), 3.3], '#e0b13a', 1.2); }
  s += box(...L.kiosk, '#2f6d4c');
  return s;
}
// haul-road entrance: closed Heras gate leaves, signed
function vehicleGate() {
  let s = heras([12, 12.6], [15.5, 12.6], 1) + heras([15.5, 12.6], [19, 12.6], 1);
  s += line3([15.5, 12.62, 1], [15.5, 12.62, 1.25], '#c8a020', 5);
  s += signXZ(13.6, 12.64, 1.75, 3.8, .7, `<rect width="3.8" height=".72" fill="#fff" stroke="${INK}" stroke-width=".03"/><rect width="3.8" height=".26" fill="${BLUE}"/><text x="1.9" y=".2" font-size=".17" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff">SITE ENTRANCE</text><text x="1.9" y=".5" font-size=".16" font-family="Arial" font-weight="700" text-anchor="middle" fill="${INK}">KEEP GATES CLOSED</text>`);
  return s;
}
// pedestrian gate: two Heras leaves hinged at the hoarding, 0 = shut, 1 = swung open inwards
function pedGate(open) {
  const leaf = (hx, dir) => {
    const a = open * Math.PI / 2, ex = hx + dir * 1.1 * Math.cos(a), ey = 12.6 - 1.1 * Math.sin(a);
    const q = [[hx, 12.6, .1], [ex, ey, .1], [ex, ey, 2], [hx, 12.6, 2]];
    return poly(q, 'url(#mesh)') + poly(q, 'none', `stroke="${col('#9aa0a4')}" stroke-width="1.5"`) + line3([ex, ey, .1], [ex, ey, 2], col('#8b9194'), 2.2);
  };
  return leaf(2.2, 1) + leaf(4.4, -1);
}
// the pedestrian gate only stands open while people are coming or going (GATE_OPEN is set per section)
const gateOpen = t => Math.max(0, ...GATE_OPEN.map(([a, b]) => ramp(t, a - .8, a) * (1 - ramp(t, b, b + .8))));
// CWP "Site Safety" board, laid out as on site: logo, green header, then warning / prohibition /
// mandatory / first-aid rows in the standard sign colours. Local units are metres on the board face.
function safetyBoard(x, y, zTop) {
  const W = 1.6, rowH = .158, y0 = .78, cx = .18, R = .082;
  const txt = (tx, ty, t, size, fill, maxW) => `<text x="${tx}" y="${ty}" font-size="${size}" font-family="Arial" font-weight="700" fill="${fill}"${maxW ? ` textLength="${maxW}" lengthAdjust="spacingAndGlyphs"` : ''}>${t}</text>`;
  const mand = inner => `<circle r="${R}" fill="#1a5dab"/><g fill="#fff" stroke="#fff">${inner}</g>`;
  const prohib = inner => `<circle r="${R}" fill="#fff" stroke="#d52b1e" stroke-width=".018"/><g>${inner}</g><line x1="-.058" y1="-.058" x2=".058" y2=".058" stroke="#d52b1e" stroke-width=".018"/>`;
  const ICON = {
    warn: `<path d="M0 -.085 L.09 .07 H-.09 Z" fill="#f5c400" stroke="#111" stroke-width=".014" stroke-linejoin="round"/><text y=".055" font-size=".11" font-family="Arial" font-weight="700" text-anchor="middle" fill="#111">!</text>`,
    entry: prohib(`<path d="M-.03 .045 v-.05 l-.012 -.02 v-.02 l.02 .015 v-.04 a.008 .008 0 0 1 .016 0 v.03 v-.04 a.008 .008 0 0 1 .016 0 v.04 v-.035 a.008 .008 0 0 1 .016 0 v.04 l.012 -.012 a.008 .008 0 0 1 .012 .01 l-.02 .04 v.04 z" fill="#111"/>`),
    helmet: mand(`<path d="M-.045 -.005 a.045 .042 0 0 1 .09 0 z" stroke="none"/><rect x="-.055" y="-.008" width=".11" height=".012" stroke="none"/><path d="M-.03 .01 q.03 .06 .06 0" fill="none" stroke-width=".012"/>`),
    boot: mand(`<path d="M-.035 -.05 h.03 v.055 l.045 .015 v.025 h-.075 z" stroke="none"/>`),
    hivis: mand(`<circle cy="-.052" r=".013" stroke="none"/><path d="M-.022 -.035 h.044 l.022 .04 M.022 -.035 v.04 l.01 .045 M-.022 -.035 v.04 l-.01 .045 M-.022 -.035 l-.022 .04 M0 .005 v.04" fill="none" stroke-width=".014" stroke-linecap="round"/>`),
    eyes: mand(`<circle cx="-.025" r=".02" fill="none" stroke-width=".012"/><circle cx=".025" r=".02" fill="none" stroke-width=".012"/><path d="M-.005 0 h.01 M-.045 0 h-.015 M.045 0 h.015" stroke-width=".01"/>`),
    gloves: mand(`<path d="M-.04 .05 v-.06 l-.012 -.02 a.008 .008 0 0 1 .014 -.006 l.01 .014 v-.035 a.007 .007 0 0 1 .014 0 v-.008 a.007 .007 0 0 1 .014 0 v.008 a.007 .007 0 0 1 .014 0 v.04 v.07 z M.005 .05 v-.06 a.007 .007 0 0 1 .014 0 v-.012 a.007 .007 0 0 1 .014 0 v.012 a.007 .007 0 0 1 .014 0 v.004 a.007 .007 0 0 1 .014 0 v.056 z" stroke="none"/>`),
    smoke: prohib(`<rect x="-.05" y=".005" width=".085" height=".02" fill="#111"/><rect x=".035" y=".005" width=".015" height=".02" fill="#d52b1e"/><path d="M.04 0 q-.01 -.02 0 -.035 q.01 -.015 0 -.03" fill="none" stroke="#111" stroke-width=".008"/>`),
    aid: `<rect x="-.085" y="-.085" width=".17" height=".17" fill="#1f8a43"/><path d="M-.016 -.055 h.032 v.039 h.039 v.032 h-.039 v.039 h-.032 v-.039 h-.039 v-.032 h.039 z" fill="#fff"/>`,
  };
  const ROWS = [
    ['warn', '#f5c400', '#111', ['Construction work in progress.', 'Parents are advised to warn children of the dangers of entering this site.']],
    ['entry', '#d52b1e', '#fff', ['Unauthorised entry to this site is', 'strictly forbidden.']],
    ['helmet', '#1a5dab', '#fff', ['Safety helmets must be worn.']],
    ['boot', '#1a5dab', '#fff', ['Protective footwear must be worn.']],
    ['hivis', '#1a5dab', '#fff', ['High visibility clothing must be worn.']],
    ['eyes', '#1a5dab', '#fff', ['Eye protection must be worn.']],
    ['gloves', '#1a5dab', '#fff', ['Safety gloves must be worn.']],
    ['smoke', '#d52b1e', '#fff', ['This is a no smoking site.']],
    ['aid', null, '#1f8a43', ['AED &amp; FIRST AID IS AVAILABLE', 'FROM THE SITE OFFICE.']],
  ];
  let b = `<rect width="${W}" height="2.3" fill="#fff" stroke="#c9c9c9" stroke-width=".012"/>`;
  b += `<image href="${LOGO}" x=".2" y=".05" width="1.2" height=".42"/>`;
  b += `<rect x=".06" y=".53" width="1.48" height=".2" fill="#2f9a3e"/>` + txt(.18, .69, 'SITE SAFETY', .17, '#fff', 1.24);
  ROWS.forEach(([icon, band, ink, lines], i) => {
    const ry = y0 + i * rowH;
    if (band) b += `<rect x=".32" y="${(ry + .006).toFixed(3)}" width="1.22" height="${(rowH - .012).toFixed(3)}" fill="${band}"/>`;
    b += `<g transform="translate(${cx} ${(ry + rowH / 2).toFixed(3)})">${ICON[icon]}</g>`;
    if (lines.length === 1) b += txt(.36, (ry + rowH / 2 + .022).toFixed(3), lines[0], .062, ink, Math.min(1.14, lines[0].length * .03).toFixed(2));
    else if (icon === 'warn') b += txt(.36, (ry + .07).toFixed(3), lines[0], .066, ink, 1.14) + txt(.36, (ry + .125).toFixed(3), lines[1], .032, ink, 1.14);
    else b += txt(.36, (ry + .068).toFixed(3), lines[0], .058, ink, Math.min(1.14, lines[0].length * .031).toFixed(2)) + txt(.36, (ry + .13).toFixed(3), lines[1], .058, ink, Math.min(1.14, lines[1].length * .031).toFixed(2));
  });
  // cable ties holding it to the hoarding
  for (const [tx, ty] of [[.12, .03], [W - .12, .03], [.12, 2.27], [W - .12, 2.27]]) b += `<rect x="${tx - .015}" y="${ty - .02}" width=".03" height=".04" fill="#222"/>`;
  return signXZ(x, y, zTop, W, 2.3, b);
}
// red manual call point mounted beside the board
function fireAlarm(x, y, zTop) {
  return signXZ(x, y, zTop, .4, .5, `<rect width=".4" height=".5" rx=".05" fill="#c8102e"/><circle cx=".2" cy=".24" r=".13" fill="#ececec" stroke="#8a0a1f" stroke-width=".02"/><text x=".2" y=".22" font-size=".05" font-family="Arial" font-weight="700" text-anchor="middle" fill="#8a0a1f">TURN</text><text x=".2" y=".29" font-size=".07" font-family="Arial" font-weight="700" text-anchor="middle" fill="#c8102e">FIRE</text><rect x=".06" y=".43" width=".28" height=".04" fill="#fff"/>`);
}
function siteFront(L) {
  let s = '';
  // hoarding either side of the gate, CWP branded
  const hoard = (x0, x1) => {
    let h = poly([[x0, 12.6, 0], [x1, 12.6, 0], [x1, 12.6, 2.4], [x0, 12.6, 2.4]], col(CGREY, .95));
    h += poly([[x0, 12.6, .15], [x1, 12.6, .15], [x1, 12.6, .45], [x0, 12.6, .45]], col(BLUE));
    h += poly([[x0, 12.48, 2.4], [x1, 12.48, 2.4], [x1, 12.6, 2.4], [x0, 12.6, 2.4]], col(CGREY, 1.25));
    for (let x = x0 + 1.2; x < x1; x += 1.2) h += line3([x, 12.61, .45], [x, 12.61, 2.4], 'rgba(0,0,0,.18)', 1);
    return h;
  };
  s += hoard(-6, 2.2) + hoard(4.4, 10);
  s += signXZ(-4.6, 12.62, 2.2, 4.4, 1.6, `<rect width="4.4" height="1.6" fill="#fff"/><image href="${LOGO}" x=".25" y=".12" width="3.9" height="1.3"/>`);
  s += safetyBoard(5.1, 12.62, 2.36) + fireAlarm(7.3, 12.62, 1.8);
  // gate posts + open gate leaves
  s += box(2.1, 12.5, 0, .14, .14, 2.5, '#6a6a6a') + box(4.3, 12.5, 0, .14, .14, 2.5, '#6a6a6a');
  s += heras([10, 12.6], [12, 12.6], 1) + vehicleGate() + heras([19, 12.6], [L.xEnd, 12.6], L.frontN) + heras([L.xEnd, -2.6], [L.xEnd, 12.6], 5);
  // haul road speed sign
  s += box(30, 11.6, 0, .06, .06, 1.6, '#777');
  const [sx, sy] = P(30.03, 11.63, 1.9);
  s += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="9" fill="#fff" stroke="#c22" stroke-width="2.6"/><text x="${f1(sx)}" y="${f1(sy + 3.5)}" font-size="9.5" font-family="Arial" font-weight="700" text-anchor="middle" fill="#111">10</text>`;
  return s;
}
// briefing point: a freestanding toolbox-talk board on legs with RAMS sheets pinned up
function briefingBoard(x, y) {
  let s = '';
  for (const dx of [.1, 2.3]) s += line3([x + dx, y, 0], [x + dx, y, 1], '#5f6468', 3);
  s += signXZ(x, y + .02, 2.45, 2.4, 1.45, `<rect width="2.4" height="1.45" fill="#f4f4f0" stroke="#5f6468" stroke-width=".05"/><rect width="2.4" height=".3" fill="${BLUE}"/>` +
    `<text x="1.2" y=".22" font-size=".17" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff">TOOLBOX TALK &#183; RAMS</text>` +
    [[.15, .42], [.85, .42], [1.55, .42]].map(([sx, sy], i) => `<rect x="${sx}" y="${sy}" width=".62" height=".85" fill="#fff" stroke="#bbb" stroke-width=".02"/>` +
      [0, 1, 2, 3, 4].map(k => `<rect x="${sx + .07}" y="${sy + .12 + k * .13}" width="${(.48 - (k % 2) * .14).toFixed(2)}" height=".04" fill="${i === 1 && k === 0 ? '#e5483b' : '#9aa0a4'}"/>`).join('') +
      `<circle cx="${sx + .31}" cy="${sy + .03}" r=".04" fill="#c8102e"/>`).join(''));
  return s;
}
// standing water in a trench: a flat surface at depth `level`, seen only through the trench opening (clip id)
function trenchWater(x0, x1, y0, y1, level, clipId) {
  let s = `<g clip-path="url(#${clipId})">` + poly([[x0, y0, level], [x1, y0, level], [x1, y1, level], [x0, y1, level]], '#4f7590', 'opacity=".92"');
  for (let k = 0; k < 6; k++) { const xa = lerp(x0, x1, (k + .3) / 6); s += line3([xa, lerp(y0, y1, .35 + (k % 2) * .25), level], [xa + .9, lerp(y0, y1, .35 + (k % 2) * .25), level], 'rgba(220,235,245,.45)', 1.4); }
  return s + line3([x0, y0 + .05, level], [x1, y0 + .05, level], 'rgba(255,255,255,.35)', 2) + '</g>';
}
// dewatering: submersible pump hose from the trench to a silt bag, with a small control box
function dewatering(from, bag, t, flowing) {
  const [fx, fy] = from, [bx, by] = bag;
  let s = poly(isoCircle(bx, by, .9, .01, 16).map(([x, y, z]) => [x, y + (y - by) * -.25, z]), '#4a5a3a', 'opacity=".55"');
  s += poly([[bx - .7, by - .5, .02], [bx + .7, by - .5, .02], [bx + .7, by + .5, .02], [bx - .7, by + .5, .02]], '#6b5a3c') + box(bx - .6, by - .4, .02, 1.2, .8, .22, '#7d6a48');
  const xy = p => P(...p).map(f1).join(' ');
  s += `<path d="M${xy([fx, fy, -.2])} C${xy([fx, fy, .9])} ${xy([bx, by - .6, .9])} ${xy([bx, by - .3, .25])}" stroke="#1d1d1d" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  if (flowing) { const [px, py] = P(bx, by + .55, .1); s += `<path d="M${f1(px)} ${f1(py)} q${f1(4 + Math.sin(t * 6) * 1.5)} 3 ${f1(10)} 2" stroke="#6f8fa8" stroke-width="2" fill="none" opacity=".8"/>`; }
  s += box(fx + .6, fy + .9, 0, .4, .3, .5, '#e0b13a');
  return s;
}
// spray-painted line on the ground, drawn out to `u` (0..1) of its length
function sprayMark(a, b, u, colr = '#f05a28') {
  const e = [lerp(a[0], b[0], u), lerp(a[1], b[1], u), .02];
  return u > 0 ? line3([a[0], a[1], .02], e, colr, 2.6, 'stroke-dasharray="7 4" opacity=".9"') : '';
}

// red "DO NOT USE" defect tag hanging from a machine at (x, y, z)
function defectTag(x, y, z) {
  // text is fitted to the card width, so it can't spill over whatever font the browser uses
  const [px, py] = P(x, y, z), w = 16, h = 19;
  const word = (txt, yy) => `<text x="${f1(px)}" y="${f1(py + yy)}" font-size="5" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="${w - 4}" lengthAdjust="spacingAndGlyphs">${txt}</text>`;
  return `<path d="M${f1(px)} ${f1(py)} v5" stroke="#333" stroke-width="1"/><rect x="${f1(px - w / 2)}" y="${f1(py + 5)}" width="${w}" height="${h}" rx="1.5" fill="#d42a20" stroke="#fff" stroke-width="1"/>` +
    `<circle cx="${f1(px)}" cy="${f1(py + 7.5)}" r="1" fill="#fff"/>` + word('DO NOT', 15) + word('USE', 21.5);
}

// battered excavation: sides sloped back by `inset` over `depth`; only the faces seen from the camera are drawn.
// opts: water (depth of standing water above the bottom), cable (exposed service across the back slope),
// crack (cracks + slump on the near rim), drum (buried object in the left slope)
function batteredPit(id, x0, x1, y0, y1, depth, inset, opts = {}) {
  const rim = [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]];
  const bx0 = x0 + inset, bx1 = x1 - inset, by0 = y0 + inset, by1 = y1 - inset, z = -depth;
  let s = `<clipPath id="${id}"><polygon points="${pts(rim)}"/></clipPath><g clip-path="url(#${id})">`;
  s += poly([[bx0, by0, z], [bx1, by0, z], [bx1, by1, z], [bx0, by1, z]], '#4a3826');
  s += poly([[x0, y0, 0], [x1, y0, 0], [bx1, by0, z], [bx0, by0, z]], col('#7a5a36', .8));            // back slope
  s += poly([[x0, y0, 0], [bx0, by0, z], [bx0, by1, z], [x0, y1, 0]], col('#8a6a42', .95));           // left slope
  for (let k = 1; k < 4; k++) { const u = k / 4; s += line3([lerp(x0, bx0, u), lerp(y0, by0, u), -depth * u], [lerp(x1, bx1, u), lerp(y0, by0, u), -depth * u], 'rgba(0,0,0,.12)', 1); }
  if (opts.cable) { const u = .55, zz = -depth * u; s += line3([lerp(x0, bx0, u) + .2, lerp(y0, by0, u), zz], [lerp(x1, bx1, u) - .2, lerp(y0, by0, u), zz], '#e05a1a', 5) + line3([lerp(x0, bx0, u) + .2, lerp(y0, by0, u), zz + .06], [lerp(x1, bx1, u) - .2, lerp(y0, by0, u), zz + .06], '#ff8a4a', 1.6); }
  if (opts.drum) { const u = .5; s += cylinderV(lerp(x0, bx0, u) + .1, lerp(y0, y1, .55), .28, -depth * u - .2, .55, '#5a6a72', col('#46545b')); }
  if (opts.water > 0) s += poly([[bx0 - .2, by0 - .2, z + opts.water], [bx1 + .2, by0 - .2, z + opts.water], [bx1 + .2, by1 + .2, z + opts.water], [bx0 - .2, by1 + .2, z + opts.water]], '#4f7590', 'opacity=".9"') +
    line3([bx0, by0 + .2, z + opts.water], [bx1, by0 + .2, z + opts.water], 'rgba(220,235,245,.45)', 1.4);
  s += '</g>' + poly(rim, 'none', 'stroke="#3a2a1a" stroke-width="1.4"');
  if (opts.crack > 0) {
    const c = opts.crack;
    for (const [xa, xb] of [[x0 + .6, x0 + 1.6], [x0 + 2, x0 + 2.8]]) s += `<path d="M${pts([[xa, y1 + .35, 0]])} L${pts([[lerp(xa, xb, .4), y1 + .5, 0]])} L${pts([[lerp(xa, xb, .7), y1 + .3, 0]])} L${pts([[xb, y1 + .45, 0]])}" stroke="#2a1d10" stroke-width="1.6" fill="none" opacity="${f2(c)}"/>`;
    s += poly([[x0 + .7, y1, 0], [x0 + 2.4, y1, 0], [x0 + 2.2, y1 - .5 * c, -.4 * c], [x0 + .9, y1 - .5 * c, -.4 * c]], '#6d4f30', `opacity="${f2(c)}"`);
  }
  return s;
}
// spoil heap: stacked rounded layers
function spoilHeap(x, y, r) {
  return [[1, 0, .72], [.7, .3 * r, .86], [.35, .55 * r, 1]].map(([k, z, sh]) => poly(isoCircle(x, y, r * k, z, 18), col('#7a5a36', sh))).join('');
}
// green excavation inspection tag clipped to a barrier at (x, y, z)
function inspectionTag(x, y, z) {
  const [px, py] = P(x, y, z), w = 18, h = 15;
  const word = (txt, yy, size) => `<text x="${f1(px)}" y="${f1(py + yy)}" font-size="${size}" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff" textLength="${w - 4}" lengthAdjust="spacingAndGlyphs">${txt}</text>`;
  return `<rect x="${f1(px - w / 2)}" y="${f1(py)}" width="${w}" height="${h}" rx="1.5" fill="#1f8a43" stroke="#fff" stroke-width="1"/>` + word('INSPECTED', 6.5, 4.4) + word('SAFE TO ENTER', 12, 3.6);
}

// paint the ground and lay out the static site for the section's LAYOUT
function buildSite() {
  const L = LAYOUT, GB = L.GB, g = paintGround(L), im = $('ground');
  im.setAttribute('x', GB.x); im.setAttribute('y', GB.y); im.setAttribute('width', GB.w); im.setAttribute('height', GB.h);
  im.setAttribute('href', g.toDataURL('image/jpeg', .88));
  $('under').innerHTML = poly([[-90, -90], [180, -90], [180, -2.6], [-90, -2.6]], '#5c7a39') + poly([[-90, -2.6], [180, -2.6], [180, 12.9], [-90, 12.9]], '#8c7c5c') +
    poly([[-90, 12.9], [180, 12.9], [180, 15.05], [-90, 15.05]], '#aca79b') + poly([[-90, 15.05], [180, 15.05], [180, 90], [-90, 90]], '#45474a');
  // the site as a cut-out block on a dark background: fenced area plus a small buffer
  // (3.5 m at the back and sides, 3.8 m at the front so the footpath and kerb stay in)
  const SITE = { x0: -9.5, x1: L.xEnd + 3.5, y0: -6.1, y1: 16.4, depth: .9 };
  $('siteClipPoly').setAttribute('points', pts([[SITE.x0, SITE.y0], [SITE.x1, SITE.y0], [SITE.x1, SITE.y1], [SITE.x0, SITE.y1]]));
  const face = (a, b, k) => poly([[...a, 0], [...b, 0], [...b, -.18], [...a, -.18]], col('#3d3f42', k)) + poly([[...a, -.18], [...b, -.18], [...b, -SITE.depth], [...a, -SITE.depth]], col('#5a4632', k)) +
    poly([[...a, -.55], [...b, -.55], [...b, -SITE.depth], [...a, -SITE.depth]], col('#463626', k));
  $('slab').innerHTML = face([SITE.x0, SITE.y1], [SITE.x1, SITE.y1], .95) + face([SITE.x1, SITE.y0], [SITE.x1, SITE.y1], .72);
  $('back').innerHTML = siteBack(L);
  $('front').innerHTML = siteFront(L);
}
