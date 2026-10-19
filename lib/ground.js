/* ground.js: the painted ground (gravel, verge, walkways, road, slab, tank pad)
   Painted once to a canvas at start-up, then shown as an image under the scene.
   Shared by every section: change it here, not in a section file. */
'use strict';
// Two site layouts. 'welcome' runs the work areas in the order Section 1 names them
// (lifting before highways, concrete after); 'standard' puts lifting after concrete.
const LAYOUTS = {
  // hw = start of the highways works; lift = where the excavator lifting area's machine stands (its ox, oy)
  standard: { xEnd: 91, backN: 29, frontN: 23, slab: 43.2, hw: 67.5, tank: 84.2, kiosk: [80.2, 4.2, 0, 1.6, 1.1, 1.6], lift: { ox: 52, oy: 2.3 },
    GB: { x: -560, y: -240, w: 2780, h: 1640 }, GS: 1.45 },
  welcome: { xEnd: 92, backN: 29, frontN: 23, slab: 70.6, hw: 59.5, tank: 85.2, kiosk: [88.4, 4.6, 0, 1.4, 1.1, 1.6], lift: { ox: 44, oy: 2.3 },
    GB: { x: -560, y: -240, w: 2800, h: 1640 }, GS: 1.45 },
};
// 'compact': a small compound with only the cabins, gate and treatment tank, for a section that builds its own scene
LAYOUTS.compact = { ...LAYOUTS.standard, works: false, xEnd: 32, backN: 11, frontN: 4, tank: 27, kiosk: [22.8, 4.6, 0, 1.4, 1.1, 1.6],
  GB: { x: -560, y: -240, w: 1500, h: 1000 }, GS: 2 };

function noiseCanvas(w, h, seed, octaves = 5) {
  const r = rng(seed), cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  for (let o = 0; o < octaves; o++) {
    const gw = 4 << o, gh = Math.max(2, Math.round(gw * h / w));
    const t = document.createElement('canvas'); t.width = gw; t.height = gh;
    const tg = t.getContext('2d'), id = tg.createImageData(gw, gh);
    for (let i = 0; i < gw * gh; i++) { const v = r() * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
    tg.putImageData(id, 0, 0); g.globalAlpha = .55 / (o + 1); g.drawImage(t, 0, 0, w, h);
  }
  g.globalAlpha = 1; return cv;
}
function grainTile(size, seed) {
  const r = rng(seed), cv = document.createElement('canvas'); cv.width = cv.height = size;
  const g = cv.getContext('2d'), id = g.createImageData(size, size);
  for (let i = 0; i < size * size; i++) { const v = r() * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
  g.putImageData(id, 0, 0); return cv;
}
function paintGround(L) {
  const GB = L.GB, GS = L.GS;
  const cv = document.createElement('canvas'); cv.width = GB.w * GS; cv.height = GB.h * GS;
  const g = cv.getContext('2d');
  g.setTransform(GS, 0, 0, GS, -GB.x * GS, -GB.y * GS);
  const path = a => { g.beginPath(); a.forEach((p, i) => { const [x, y] = P(...p); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); };
  const fillP = (a, c, alpha = 1) => { g.globalAlpha = alpha; g.fillStyle = c; path(a); g.fill(); g.globalAlpha = 1; };
  const seg = (a, b, c, w) => { const [p, q] = [P(...a), P(...b)]; g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); };
  const big = noiseCanvas(400, 250, 31), fine = grainTile(256, 5);
  const texture = (a, alpha, img = 'fine', mode = 'source-over') => {
    g.save(); path(a); g.clip(); g.globalAlpha = alpha; g.globalCompositeOperation = mode;
    if (img === 'fine') { g.fillStyle = g.createPattern(fine, 'repeat'); g.fillRect(GB.x, GB.y, GB.w, GB.h); } else g.drawImage(big, GB.x, GB.y, GB.w, GB.h);
    g.restore();
  };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  // site: compacted formation
  g.fillStyle = '#a3916f'; g.fillRect(GB.x, GB.y, GB.w, GB.h);
  texture(rect(-40, -40, 120, 12.8), .75, 'big', 'multiply');
  // grass beyond the back fence
  const verge = rect(-40, -40, 120, -2.6);
  fillP(verge, '#6a9440'); texture(verge, .6, 'big', 'multiply');
  // haul road + gate apron
  const haul = rect(-3, 8.2, L.xEnd, 11.4);
  fillP(haul, '#b2a891'); texture(haul, .2); fillP(rect(2.2, 11.4, 4.4, 12.8), '#b2a891'); fillP(rect(12, 11.4, 19, 12.8), '#b2a891');
  for (const yy of [8.9, 9.9, 10.5]) fillP(rect(-3, yy, 77, yy + .3), '#8c826c', .35);
  // public footpath + road
  const foot = rect(-40, 12.9, 120, 14.8);
  fillP(foot, '#bdb8ac'); texture(foot, .14);
  for (let x = -40; x < 120; x += .9) seg([x, 12.9], [x, 14.8], 'rgba(90,86,78,.4)', .6);
  fillP(rect(-40, 14.8, 120, 15.05), '#d2cec3');
  fillP(rect(11.6, 12.9, 19.4, 15.05), '#9d9d98'); texture(rect(11.6, 12.9, 19.4, 15.05), .2);
  const road = rect(-40, 15.05, 120, 40);
  fillP(road, '#4b4d50'); texture(road, .22); texture(road, .3, 'big', 'multiply');
  for (let x = -40; x < 120; x += 4.5) fillP(rect(x, 18.3, x + 2.5, 18.45), '#e8e6df', .9);
  if (L.works !== false) {
  // concrete slab: part poured, part mesh
  fillP(rect(L.slab, 2.2, L.slab + 7.6, 6.3), '#8a8070');
  g.strokeStyle = 'rgba(120,70,40,.75)'; g.lineWidth = .7;
  for (let x = L.slab + 4.2; x <= L.slab + 7.6; x += .25) seg([x, 2.2, .05], [x, 6.3, .05], 'rgba(120,70,40,.75)', .7);
  for (let y = 2.2; y <= 6.3; y += .25) seg([L.slab + 4.2, y, .05], [L.slab + 7.6, y, .05], 'rgba(120,70,40,.75)', .7);
  fillP(rect(L.slab, 2.2, L.slab + 4.2, 6.3), '#a8a6a0'); texture(rect(L.slab, 2.2, L.slab + 4.2, 6.3), .1);
  // new road: tarmac laid over base course
  const h = L.hw;
  fillP(rect(h, 1.6, h + 9.5, 5.6), '#7c7a74'); texture(rect(h, 1.6, h + 9.5, 5.6), .3);
  fillP(rect(h, 1.6, h + 5.1, 5.6), '#2e3032'); texture(rect(h, 1.6, h + 5.1, 5.6), .25);
  seg([h, 1.6], [h + 9.5, 1.6], '#d6d2c8', 2.2); seg([h, 5.6], [h + 9.5, 5.6], '#d6d2c8', 2.2);
  }
  // tank pad
  fillP(rect(L.tank - 4.6, -1.2, L.tank + 4.8, 6.4), '#b9b6ae'); texture(rect(L.tank - 4.6, -1.2, L.tank + 4.8, 6.4), .15);
  for (let x = L.tank - 4.6; x < L.tank + 4.8; x += 2.35) seg([x, -1.2], [x, 6.4], 'rgba(90,90,90,.35)', .7);
  // puddles
  for (const [cx, cy, r] of [[20, 10.6, .8], [39, 9, .6], [55, 10.8, .9]]) {
    fillP(isoCircle(cx, cy, r * 1.1), '#6f6550', .45);
    fillP(isoCircle(cx, cy, r), '#9fb6c8', .7);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = .07; g.globalCompositeOperation = 'overlay'; g.fillStyle = g.createPattern(fine, 'repeat'); g.fillRect(0, 0, cv.width, cv.height);
  return cv;
}
