/* plant.js: machines and their operators
   20 t 360 excavator, site dumper, concrete mixer, roller, telehandler; seated operators; beacons.
   Shared by every section: change it here, not in a section file. */
'use strict';
const Y = '#e0a92a';
function excavator(ox, pose, t) {
  const X = x => x + ox, root = [8.3 + ox, 1.75];
  let o = poly([[6.9, 4.6], [13.2, 4.6], [14.6, 5.4], [14.6, 8.4], [8.3, 8.4], [6.9, 7.7]].map(([x, y]) => [X(x) + .9, y + .1, 0]), '#2a2010', `opacity=".35" filter="url(#blur)"`);
  const track = y => {
    let s = box(X(6.6), y, 0, 4.8, .62, .9, '#2b2b2b');
    const fy = y + .62;
    for (let k = 0; k < 16; k++) { const x = 6.75 + k * .3; s += line3([X(x), fy, .06], [X(x), fy, .3], '#171717', 1.1); }
    for (const [cx, r] of [[7.05, .38], [10.95, .4]]) s += poly(wheelXZ(X(cx), fy + .01, .45, r, 14), '#3a3a3a', 'stroke="#151515" stroke-width="1.4"');
    return s;
  };
  o += track(4.4) + box(X(7.5), 5.02, .3, 3, 1.76, .75, '#333333') + track(6.78);
  o += box(X(7.2), 4.5, 1, 4.6, 2.9, .35, Y) + box(X(11.8), 4.55, .95, .55, 2.8, 1.3, '#c08d1e') + box(X(9.1), 4.5, 1.35, 2.7, 2.9, .95, Y);
  for (let i = 0; i < 6; i++) o += line3([X(9.5 + i * .3), 7.41, 1.6], [X(9.5 + i * .3), 7.41, 2.1], col(Y, .4), 1.2);
  o += box(X(10.6), 5, 2.3, .12, .12, .45, '#4a4a4a');
  const limb = (px, pz, ang, L, h0, hm, h1, bend, y0, y1, base) => {
    const a = ang * Math.PI / 180, ux = Math.cos(a), uz = Math.sin(a), nx = -uz, nz = ux;
    const p = (u, v) => [px + ux * u + nx * v, pz + uz * u + nz * v];
    const top = [p(0, h0), p(L * .55, hm + bend), p(L, h1)], bot = [p(L, -h1), p(L * .55, -hm + bend), p(0, -h0)];
    const side = top.concat(bot);
    let r = poly(side.map(([x, z]) => [x, y0, z]), col(base, .45));
    const edge = nz > 0 ? top : bot.slice().reverse();
    for (let i = 0; i < 2; i++) r += poly([[edge[i][0], y0, edge[i][1]], [edge[i + 1][0], y0, edge[i + 1][1]], [edge[i + 1][0], y1, edge[i + 1][1]], [edge[i][0], y1, edge[i][1]]], col(base, LIGHT.top));
    r += poly(side.map(([x, z]) => [x, y1, z]), col(base, LIGHT.left));
    return { r, tip: p(L, 0), at: p };
  };
  const ikr = ik(root, pose.x, pose.z);
  const boom = limb(root[0], root[1], ikr.tb, 5.2, .3, .42, .26, .3, 5.2, 5.85, Y);
  const arm = limb(boom.tip[0], boom.tip[1], ikr.ta, 3.6, .27, .23, .16, 0, 5.3, 5.75, Y);
  const bucket = limb(arm.tip[0], arm.tip[1], pose.tk, 1.15, .34, .5, .08, 0, 5.12, 5.93, '#4a4a4a');
  o += boom.r;
  const br1 = boom.at(2.6, -.42);
  o += line3([X(8.95), 6, 1.45], [br1[0], 6, br1[1]], '#3c3c3c', 6);
  o += arm.r + bucket.r;
  if (pose.spill > 0) { const [px, py] = P(arm.tip[0] - .2, 5.5, arm.tip[1] - 1); o += `<path d="M${f1(px - 6)} ${f1(py)} q6 ${f1(14 * pose.spill)} 12 0" fill="#7a5a36" opacity="${f2(pose.spill)}"/>`; }
  const cx0 = X(7.25), cy0 = 6.2, cz0 = 1.35;
  o += box(cx0, cy0, cz0, 1.75, 1.2, 1.75, '#2f3338');
  o += operator(cx0 + .8, cy0 + .95, cz0 + .18, -1, { clip: [[cx0 + .12, cy0 + 1.2, cz0 + .35], [cx0 + 1.63, cy0 + 1.2, cz0 + .35], [cx0 + 1.63, cy0 + 1.2, cz0 + 1.63], [cx0 + .12, cy0 + 1.2, cz0 + 1.63]] });
  o += poly([[cx0 + .12, 7.4, cz0 + .35], [cx0 + 1.63, 7.4, cz0 + .35], [cx0 + 1.63, 7.4, cz0 + 1.63], [cx0 + .12, 7.4, cz0 + 1.63]], '#4d6475', 'opacity=".5"');
  o += poly([[cx0 + 1.75, 6.3, cz0 + .35], [cx0 + 1.75, 7.3, cz0 + .35], [cx0 + 1.75, 7.3, cz0 + 1.63], [cx0 + 1.75, 6.3, cz0 + 1.63]], '#33414c');
  o += beacon(X(11.2), 6.9, 2.3, t);
  return o;
}
function ik(root, tx, tz) {
  const dx = tx - root[0], dz = tz - root[1];
  const d = Math.min(Math.hypot(dx, dz), 8.75);
  const phi = Math.atan2(dz, dx);
  const a = Math.acos(clamp((27.04 + d * d - 12.96) / (10.4 * d), -1, 1));
  const tb = phi - a, bx = root[0] + 5.2 * Math.cos(tb), bz = root[1] + 5.2 * Math.sin(tb);
  return { tb: tb * 180 / Math.PI, ta: Math.atan2(tz - bz, tx - bx) * 180 / Math.PI };
}
let OPC = 0;   // unique ids for operator clip paths
function operator(x, y, z, face = 1, opt = {}) {
  // seated operator, hips at (x, y, z), facing screen-right (+1) or screen-left (-1);
  // same kit as the walking crew. opt.legs for open seats, opt.wheel for a steering wheel,
  // opt.clip = the cab's windscreen (only what's seen through the glass is drawn).
  const [sx, sy] = P(x, y, z), H = 1.8 * S, V = '#ef9532';
  const sh = -.3 * H, hd = -.415 * H, hand = [opt.wheel ? 11.5 : 10.5, -.17 * H];
  let o = `<g transform="translate(${f1(sx)},${f1(sy)}) scale(${face},1)">`;
  if (opt.legs) {
    o += `<path d="M-.5 -1 L8.5 -1.5 L9.5 ${f1(.2 * H)}" stroke="#202838" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    o += `<path d="M1 -1 L9.5 -1.5 L10.5 ${f1(.2 * H)}" stroke="#26304a" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    o += `<path d="M8 ${f1(.2 * H - 1.4)} h5 q2.8 .6 3.2 3 v.9 h-8.2 z" fill="#1b1712"/>`;
  }
  // far arm, then body, then near arm reaching to the controls
  o += `<path d="M-1 ${f1(sh + 3)} L5 ${f1(-.14 * H)} L${f1(hand[0] - 1)} ${f1(hand[1] + 1)}" stroke="${col(V, .72)}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<path d="M-6 .5 L-6.8 ${f1(sh + 1)} Q-.5 ${f1(sh - 2.5)} 5.6 ${f1(sh + 1.8)} L6.6 .5 Z" fill="${V}"/>`;
  o += `<rect x="-6.6" y="${f1(-.13 * H)}" width="13" height="1.9" fill="#d8dcdc"/><rect x="-6.4" y="${f1(-.06 * H)}" width="12.8" height="1.9" fill="#d8dcdc"/>`;
  o += `<rect x="-4.1" y="${f1(sh + .5)}" width="1.7" height="${f1(-.13 * H - sh - .5)}" fill="#d8dcdc"/><rect x="2" y="${f1(sh + 1)}" width="1.7" height="${f1(-.13 * H - sh - 1)}" fill="#d8dcdc"/>`;
  o += `<rect x="-2.2" y="${f1(sh + 3)}" width="4.4" height="2.3" fill="${BLUE}"/>`;
  o += `<path d="M0 ${f1(sh - 1.6)} Q3.5 ${f1(sh - 1.2)} 5.6 ${f1(sh + 1.8)} L6.6 .5 L0 .5 Z" fill="#000" opacity=".14"/>`;
  o += `<path d="M1.5 ${f1(sh + 2.5)} L6.5 ${f1(-.13 * H)} L${f1(hand[0])} ${f1(hand[1])}" stroke="${col(V, 1.03)}" stroke-width="3.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<circle cx="${f1(hand[0])}" cy="${f1(hand[1])}" r="2.2" fill="#4a4a3a"/>`;
  if (opt.wheel) o += `<path d="M${f1(hand[0] + 2.5)} ${f1(hand[1] + 1)} L${f1(hand[0] + 4.5)} ${f1(-.03 * H)}" stroke="#2a2a2a" stroke-width="1.6"/><ellipse cx="${f1(hand[0] + 1)}" cy="${f1(hand[1])}" rx="1.8" ry="5.2" fill="none" stroke="#1d1d1d" stroke-width="1.8"/>`;
  // head, glasses, hard hat
  o += `<rect x="-1.8" y="${f1(hd + 3)}" width="3.8" height="3.2" fill="#9d7258"/>`;
  o += `<ellipse cx="1" cy="${f1(hd)}" rx="4.3" ry="4.9" fill="#c4946f"/>`;
  o += `<path d="M2.4 ${f1(hd - .6)} h3" stroke="#151515" stroke-width="1.3"/>`;
  o += `<path d="M-4.6 ${f1(hd - 1.6)} Q-3.6 ${f1(hd - 9.6)} 1.4 ${f1(hd - 9.8)} Q6 ${f1(hd - 9.4)} 6 ${f1(hd - 2.2)} L8.4 ${f1(hd - 1.4)} L8.4 ${f1(hd - .7)} L-4.6 ${f1(hd - .9)} Z" fill="#f4f4ef"/>`;
  o += `<path d="M-4.6 ${f1(hd - 1.6)} L8.4 ${f1(hd - 1.2)}" stroke="#b3b3ab" stroke-width="1"/>`;
  o += '</g>';
  if (!opt.clip) return o;
  const id = 'opclip' + (OPC++);
  return `<clipPath id="${id}"><polygon points="${pts(opt.clip)}"/></clipPath><g clip-path="url(#${id})">${o}</g>`;
}
function beacon(x, y, z, t) {
  const [bx, by] = P(x, y, z), flash = Math.pow(Math.max(0, Math.sin(t * 9)), 3);
  return box(x - .08, y - .08, z, .16, .16, .17, '#c46f00') + `<circle cx="${f1(bx)}" cy="${f1(by - 6)}" r="${f1(5 + flash * 7)}" fill="#ffab3a" opacity="${f2(.1 + flash * .4)}" filter="url(#soft)"/>`;
}
function excavatorPose(t) {
  const K = [[0, 11.6, 3.2, 330, 0], [1.5, 12.2, .6, 268, 0], [3, 12.9, .5, 330, 0], [4.3, 11.2, 3.6, 335, 0], [5.6, 9.3, 2.7, 340, 0], [6.5, 9.3, 2.5, 225, 1], [8, 11.6, 3.2, 330, 0]];
  const u = frac(t / 8) * 8;
  let i = 0; while (i < K.length - 2 && u > K[i + 1][0]) i++;
  const [t0, x0, z0, k0, s0] = K[i], [t1, x1, z1, k1, s1] = K[i + 1], v = smooth((u - t0) / (t1 - t0));
  return { x: lerp(x0, x1, v), z: lerp(z0, z1, v), tk: lerp(k0, k1, v), spill: i === 5 ? Math.sin(v * Math.PI) : 0 };
}
function dumper(x, y, dir, t, empty) {
  // forward-tipping site dumper, footprint 3.6 x 1.9; skip leads in the direction of travel
  const L = 3.6, W = 1.9, front = dir > 0 ? x + L : x;
  const fx = u => dir > 0 ? x + u : x + L - u;   // u measured from the rear
  let o = poly([[x + .5, y + .2, 0], [x + L + .6, y + .2, 0], [x + L + .6, y + W + .3, 0], [x + .5, y + W + .3, 0]], '#2a2010', 'opacity=".3" filter="url(#blur)"');
  const wheel = (u, side) => poly(wheelXZ(fx(u), side, .55, .55, 14), '#1d1d1d', 'stroke="#0c0c0c" stroke-width="1"') + poly(wheelXZ(fx(u), side + .01, .55, .22, 10), '#5a5a5a');
  o += wheel(.7, y) + wheel(2.9, y);
  const x0 = Math.min(fx(.2), fx(3.4));
  o += box(x0, y + .25, .45, 3.2, W - .5, .5, Y);
  const sx0 = Math.min(fx(2), fx(3.6));
  o += box(sx0, y + .05, .95, 1.6, W - .1, .95, '#d39a1e');
  o += poly([[sx0 + .1, y + .1, 1.9], [sx0 + 1.5, y + .1, 1.9], [sx0 + 1.5, y + W - .1, 1.9], [sx0 + .1, y + W - .1, 1.9]], '#6b4f2c');
  const rx = fx(.6);
  o += box(Math.min(fx(.4), fx(1.1)), y + .55, .95, .7, .8, .45, '#2c2c2c');
  if (!empty) o += operator(rx, y + 1.15, 1.4, dir > 0 ? 1 : -1, { legs: true, wheel: true });
  for (const yy of [y + .3, y + W - .3]) o += line3([rx, yy, .95], [rx, yy, 2.6], '#2b2b2b', 2.4);
  o += line3([rx, y + .3, 2.6], [rx, y + W - .3, 2.6], '#2b2b2b', 2.4);
  o += beacon(rx, y + W / 2, 2.62, t);
  o += wheel(.7, y + W) + wheel(2.9, y + W);
  return o;
}
function mixer(x0, y0, t) {
  // 8-wheel truck mixer along x: cab at +x, drum tilting up to its opening, hopper and ladder at the rear (-x).
  // Drawn back to front: far tyres, chute, chassis, mountings, drum, hopper, cab, near tyres.
  const yF = y0 + .1, yN = y0 + 2.3, yc = y0 + 1.2;
  let o = poly([[x0 + .4, y0 + .3, 0], [x0 + 8.6, y0 + .3, 0], [x0 + 8.6, y0 + 2.8, 0], [x0 + .4, y0 + 2.8, 0]], '#2a2010', 'opacity=".3" filter="url(#blur)"');
  const tyre = (x, side, out) => {
    const r = .52, w = .36, y1 = side + out * w;
    const shape = hull([...wheelXZ(x, side, r, r, 22), ...wheelXZ(x, y1, r, r, 22)].map(p => P(...p)));
    let d = `<polygon points="${shape.map(q => q.map(f1).join(',')).join(' ')}" fill="#191919"/>`;
    if (out > 0) d += poly(wheelXZ(x, y1, r, r, 22), '#222') + poly(wheelXZ(x, y1 + .01, r, .26, 14), '#8b8f93') + poly(wheelXZ(x, y1 + .02, r, .08, 8), '#3a3a3a');
    return d;
  };
  const AXLES = [x0 + 1.15, x0 + 2.3, x0 + 6.45, x0 + 7.5];
  for (const x of AXLES) o += tyre(x, yF, -1);
  // chute from the drum opening down to the pour, behind the truck
  const top = [x0 + .45, yc - .2, 2.4], end = [x0 - .5, y0 - 1.9, .5];
  o += line3(top, end, '#5a5a5a', 7) + line3([top[0], top[1], top[2] + .05], [end[0], end[1], end[2] + .05], '#9a9890', 3);
  const [cx, cy] = P(...end);
  o += `<path d="M${f1(cx)} ${f1(cy)} q${f1(Math.sin(t * 7) * 1.5)} 6 0 12" stroke="#9a9890" stroke-width="4" fill="none"/>`;
  // chassis rails, side skirt and the drum mountings
  o += box(x0 - .1, yF, .62, 8.2, 2.2, .28, '#2b2b2b');
  o += box(x0 + .9, y0 + .55, .9, .35, 1.3, .9, '#353535');                       // rear roller frame
  o += box(x0 + 5.2, y0 + .65, .9, .55, 1.1, 1.35, '#353535');                   // front gearbox pedestal
  o += cylinderV(x0 + 5.95, y0 + .55, .26, .9, 1.25, '#dcdcd6', col('#c9c9c3'));  // water tank
  // drum: narrow raised mouth at the rear, widest just forward of the middle, cone down to the gearbox
  const N = 26, discs = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, r = u < .62 ? .44 + .64 * Math.sin(u / .62 * Math.PI / 2) : 1.08 - (u - .62) / .38 * .52;
    discs.push({ x: x0 + .55 + u * 4.95, z: lerp(2.7, 2.05, u), r });
  }
  const ring = d => discYZ(d.x, yc, d.z, d.r, 36);
  o += `<clipPath id="drumclip">${discs.map(d => poly(ring(d), '#000')).join('')}</clipPath><g clip-path="url(#drumclip)">`;
  const wide = discs[Math.round(N * .62)];
  const g = cylGrad(P(discs[0].x, yc, discs[0].z), P(discs[N].x, yc, discs[N].z), P(wide.x, yc, wide.z), wide.r * S * 1.25, '#c2c2bc');
  o += g.def + discs.map(d => poly(ring(d), g.fill)).join('');
  for (let k = 0; k < 7; k++) {
    const u = frac(k / 7 + t * .22) * 1.3 - .15, x = x0 + .55 + u * 4.95;
    o += line3([x - .55, yc + 1.4, 3.7], [x + .55, yc + 1.4, .7], BLUE, 8, 'opacity=".85"');
  }
  // the two steel rolling rings the drum turns on
  for (const u of [.2, .66]) { const d = discs[Math.round(u * N)]; o += line3([d.x, yc + d.r * .95, d.z - d.r * .3], [d.x, yc + d.r * .95, d.z + d.r * .3], '#8b8f93', 3); }
  o += '</g>';
  const f = discs[N];
  o += poly(ring(f), col('#cfcfca', .6)) + poly(discYZ(f.x + .01, yc, f.z, f.r * .4, 18), '#4a4a4a');
  // feed hopper over the mouth, with ladder and platform up to it
  const hx = x0 + .5, hz0 = 2.95, hz1 = 3.5;
  const hq = (a, b, c, d) => poly([a, b, c, d], col('#c9c9c4', .7));
  o += hq([hx - .22, yc + .22, hz0], [hx + .22, yc + .22, hz0], [hx + .42, yc + .42, hz1], [hx - .42, yc + .42, hz1]);
  o += poly([[hx + .22, yc - .22, hz0], [hx + .22, yc + .22, hz0], [hx + .42, yc + .42, hz1], [hx + .42, yc - .42, hz1]], col('#c9c9c4', .55));
  o += poly([[hx - .42, yc - .42, hz1], [hx + .42, yc - .42, hz1], [hx + .42, yc + .42, hz1], [hx - .42, yc + .42, hz1]], '#3a3530');
  o += box(hx + .45, yc + .6, 3.2, .7, .55, .06, '#7d8287');                       // platform
  for (const x of [hx + .55, hx + 1.05]) o += line3([x, yN + .02, .75], [x, yc + .85, 3.25], '#7d8287', 2.2);
  for (let k = 1; k < 7; k++) { const u = k / 7; o += line3([hx + .55, lerp(yN + .02, yc + .85, u), lerp(.75, 3.25, u)], [hx + 1.05, lerp(yN + .02, yc + .85, u), lerp(.75, 3.25, u)], '#9a9fa4', 1.6); }
  // cab: square-fronted, windscreen over grille and bumper, side window, door and step
  const X0 = x0 + 6.2, X1 = x0 + 8.15;
  o += box(X0, yF, .7, X1 - X0, 2.2, 2.25, '#eceae4');
  o += poly([[X1, yF + .12, 1.95], [X1, yN - .12, 1.95], [X1, yN - .12, 2.8], [X1, yF + .12, 2.8]], '#4d6475');                 // windscreen
  o += line3([X1 + .01, yc, 1.95], [X1 + .01, yc, 2.8], '#ddd', 1.4);
  o += poly([[X1, yF + .45, 1.05], [X1, yN - .45, 1.05], [X1, yN - .45, 1.65], [X1, yF + .45, 1.65]], '#3a3a3a');                // grille
  for (let k = 1; k < 5; k++) o += line3([X1 + .01, yF + .45, 1.05 + k * .12], [X1 + .01, yN - .45, 1.05 + k * .12], '#5a5a5a', 1.2);
  for (const yy of [yF + .25, yN - .25]) o += poly([[X1 + .01, yy - .15, 1.2], [X1 + .01, yy + .15, 1.2], [X1 + .01, yy + .15, 1.4], [X1 + .01, yy - .15, 1.4]], '#f4f1d8');
  o += box(X1 - .05, yF - .05, .6, .25, 2.3, .32, '#3a3a3a');                                                                     // bumper
  o += poly([[X0 + .55, yN, 1.95], [X1 - .1, yN, 1.95], [X1 - .1, yN, 2.75], [X0 + .55, yN, 2.75]], '#5c7586');                  // side window
  o += poly([[X0 + .4, yN + .01, .8], [X1 - .05, yN + .01, .8], [X1 - .05, yN + .01, 2.85], [X0 + .4, yN + .01, 2.85]], 'none', 'stroke="rgba(0,0,0,.22)" stroke-width="1.2"');
  o += box(X0 + .6, yN, .45, .8, .12, .08, '#555');                                                                               // step
  o += box(X0 + .05, yF + .05, 2.95, X1 - X0 - .1, 2.1, .08, '#d8d6d0');                                                          // roof cap
  o += line3([X1 + .05, yN + .05, 2.4], [X1 + .25, yN + .3, 2.5], '#2a2a2a', 1.8);
  const [mx, my] = P(X1 + .25, yN + .3, 2.5); o += `<rect x="${f1(mx - 2.5)}" y="${f1(my - 6)}" width="5" height="9" fill="#2a2a2a"/>`;  // mirror
  o += beacon(X0 + .3, yc, 2.98, t);
  // near tyres and mudguards
  for (const x of AXLES) o += tyre(x, yN, 1);
  for (const [xa, xb] of [[x0 + .55, x0 + 2.9], [x0 + 5.9, X0 - .02]]) o += poly([[xa, yN + .38, 1.08], [xb, yN + .38, 1.08], [xb, yN + .38, 1.22], [xa, yN + .38, 1.22]], '#1d1d1d');
  return o;
}
// convex outline of a set of screen points (monotone chain)
function hull(ps) {
  const p = ps.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function roller(x, y, t) {
  const drum = (cx) => {
    // steel drum: round at both ends, the body is the outline wrapping the two end discs
    const r = .55, y0 = y, y1 = y + 1.6, n = 28;
    const ends = [...wheelXZ(cx, y0, r, r, n), ...wheelXZ(cx, y1, r, r, n)].map(p => P(...p));
    const g = cylGrad(P(cx, y0, r), P(cx, y1, r), P(cx, (y0 + y1) / 2, r), r * S * 1.2, '#7a7a7a');
    let d = g.def + `<polygon points="${hull(ends).map(q => q.map(f1).join(',')).join(' ')}" fill="${g.fill}"/>`;
    return d + poly(wheelXZ(cx, y1, r, r, n), col('#858585', .8)) + poly(wheelXZ(cx, y1 + .01, r, .2, 12), '#3a3a3a');
  };
  let o = poly([[x + .2, y + .2, 0], [x + 3.6, y + .2, 0], [x + 3.6, y + 2, 0], [x + .2, y + 2, 0]], '#000', 'opacity=".25" filter="url(#blur)"');
  o += drum(x + .55);
  o += box(x + 1.05, y + .2, .45, 1.4, 1.2, 1.1, Y);
  o += drum(x + 2.95);
  o += operator(x + 1.75, y + .8, 1.6, 1, { legs: true, wheel: true });
  for (const yy of [y + .3, y + 1.3]) o += line3([x + 1.2, yy, 1.55], [x + 1.2, yy, 2.9], '#2b2b2b', 2.2);
  o += line3([x + 1.2, y + .3, 2.9], [x + 1.2, y + 1.3, 2.9], '#2b2b2b', 2.2);
  o += beacon(x + 1.2, y + .8, 2.92, t);
  return o;
}
function telehandler(x0, y0, t) {
  const sway = Math.sin(t * 1.1) * .08;
  let o = poly([[x0, y0 + .3, 0], [x0 + 5, y0 + .3, 0], [x0 + 5, y0 + 2.4, 0], [x0, y0 + 2.4, 0]], '#000', 'opacity=".25" filter="url(#blur)"');
  const wheel = (x, side) => poly(wheelXZ(x, side, .62, .62, 16), '#1d1d1d') + poly(wheelXZ(x, side + .01, .62, .26, 10), '#8a8a8a');
  o += wheel(x0 + .9, y0) + wheel(x0 + 3.7, y0);
  o += box(x0 + .2, y0 + .2, .5, 4.4, 1.8, .9, '#d9b124');
  // boom from the rear pivot out over the load
  const piv = [x0 + 4, y0 + .9, 1.9], head = [x0 - 2.2, y0 + .9, 5.4];
  o += line3(piv, head, col('#c8a020', .7), 13) + line3([piv[0], piv[1] + .2, piv[2] + .12], [head[0], head[1] + .2, head[2] + .12], '#e9c43b', 7);
  o += box(x0 + 1.3, y0 + 1.25, 1.1, 1.1, .85, 1.7, '#2f3338');
  o += operator(x0 + 1.85, y0 + 1.85, 1.3, -1, { clip: [[x0 + 1.35, y0 + 2.1, 1.5], [x0 + 2.35, y0 + 2.1, 1.5], [x0 + 2.35, y0 + 2.1, 2.7], [x0 + 1.35, y0 + 2.1, 2.7]] });
  o += poly([[x0 + 1.35, y0 + 2.1, 1.5], [x0 + 2.35, y0 + 2.1, 1.5], [x0 + 2.35, y0 + 2.1, 2.7], [x0 + 1.35, y0 + 2.1, 2.7]], '#4d6475', 'opacity=".5"');
  o += beacon(x0 + 1.85, y0 + 1.7, 2.82, t);
  o += wheel(x0 + .9, y0 + 2) + wheel(x0 + 3.7, y0 + 2);
  // hook, chains, precast chamber section
  const hx = head[0] + sway, hz = 3.1;
  o += line3(head, [hx, head[1], hz], '#333', 1.4);
  for (const [dx, dy] of [[-.45, -.45], [.45, -.45], [-.45, .45], [.45, .45]]) o += line3([hx, head[1], hz], [hx + dx, head[1] + dy, 2.05], '#555', 1);
  o += cylinderV(hx, head[1], .6, .95, 1.1, '#a7a39b', col('#4a4640'));
  return o;
}
