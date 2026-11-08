'use strict';
// Серия 5: фоны и эффекты (версия 2: детальнее). k — сила вспышки 0..1.

const WIN = [300, 300, 520, 720];   // окно кухни: x, y, w, h

function wallpaper(c, x, y, w, h, base, motif, seed) {
  c.fillStyle = base; c.fillRect(x, y, w, h);
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = motif;
  for (let yy = y + 20, row = 0; yy < y + h; yy += 56, row++) for (let xx = x + (row % 2) * 28; xx < x + w; xx += 56) {
    c.beginPath(); c.moveTo(xx, yy - 9); c.lineTo(xx + 6, yy); c.lineTo(xx, yy + 9); c.lineTo(xx - 6, yy); c.fill();
  }
  c.restore();
}

// ---------- город за окном ----------
let BALL = .7;   // положение болида на траектории 0..1
function cityOutside(c, k, [x, y, w, h], ball = true) {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, mix('#86b6dc', '#fffbe9', k)); g.addColorStop(1, mix('#dcebf5', '#ffe6a6', k));
  c.fillStyle = g; c.fillRect(x, y, w, h);
  const s = w / 520, by = y + h;   // масштаб города под окно
  if (ball && BALL > 0) fireball(c, x + w * lerp(.15, .9, BALL), y + h * lerp(-.08, .3, BALL), k, s);
  for (const [tx, th] of [[.12, .5], [.24, .42]]) {
    const X = x + w * tx, T = h * th;
    shp(c, [[X - 12 * s, by], [X - 8 * s, by - T], [X + 8 * s, by - T], [X + 12 * s, by]], mix('#b5bccb', '#fff1cc', k * .6), 3, tx * 100, { corner: .1 });
    c.fillStyle = '#c94a3a'; c.fillRect(X - 9 * s, by - T + 20 * s, 18 * s, 10 * s);
    for (let j = 0; j < 5; j++) shp(c, ellPts(X + (24 + j * 34) * s, by - T - (20 + j * 18) * s, (26 + j * 9) * s, (18 + j * 5) * s), mix(C.smoke, '#fff6dc', k), 2.5, tx * 100 + j, { pressure: .2, color: alpha(INK, .5) });
  }
  const r = rng(12);
  for (const [bx, bw, bh, far] of [[.0, .3, .38, 1], [.28, .26, .5, 0], [.5, .34, .34, 1], [.8, .3, .46, 0]]) {
    const X = x + w * bx, BW = w * bw, top = by - h * bh, col = mix(far ? '#c4cad6' : '#b3b9c8', '#fff0c6', k * .7);
    shp(c, [[X, by + 10], [X, top], [X + BW, top], [X + BW, by + 10]], col, 3.5, bx * 100, { corner: .1,
      shade: q => { q.fillStyle = mix('#949cb0', '#e8cf96', k * .7); q.fillRect(X + BW * .74, top, BW, h); for (let yy = top + 30 * s; yy < by; yy += 34 * s) { q.fillStyle = alpha('#000', .06); q.fillRect(X, yy - 3, BW, 2); } } });
    shp(c, [[X - 4, top + 3], [X + BW + 4, top + 3], [X + BW + 4, top + 12 * s], [X - 4, top + 12 * s]], '#f7f9fc', 3, bx * 100 + 1, { corner: .3 });
    for (let yy = top + 26 * s; yy < by - 16 * s; yy += 34 * s) for (let xx = X + 12 * s; xx < X + BW - 18 * s; xx += 30 * s) {
      const lit = r() < .22; c.fillStyle = lit ? mix('#ffdf8a', '#fff6d6', k) : mix('#5f6a86', '#f0d898', k); c.fillRect(xx, yy, 16 * s, 19 * s);
      c.fillStyle = alpha('#fff', .35); c.fillRect(xx, yy, 16 * s, 3 * s);
    }
  }
  // заснеженные деревья и сугробы
  for (let j = 0; j < 6; j++) { const X = x + w * (.05 + j * .18), Y = by - 6; inkLine(c, [[X, Y], [X + 4, Y - 60 * s]], 3, 900 + j, false, { color: '#5a4a44' });
    for (let b = 0; b < 4; b++) inkLine(c, [[X + 2, Y - (20 + b * 10) * s], [X + (b % 2 ? 22 : -20) * s, Y - (34 + b * 10) * s]], 2, 910 + j * 4 + b, false, { color: '#5a4a44' }); }
  shp(c, [[x - 10, by - 10], [x + w * .3, by - 22], [x + w * .6, by - 12], [x + w + 10, by - 20], [x + w + 10, by + 10], [x - 10, by + 10]], '#f6f8fb', 0, 5);
}
function fireball(c, x, y, k, s = 1) {
  c.save();
  for (let j = 11; j >= 0; j--) { const t = j / 11, px = lerp(x - 50 * s, x - 520 * s, t), py = lerp(y - 22 * s, y - 150 * s, t), rr = lerp(30, 90, t) * s;
    shp(c, warp(ellPts(px, py, rr * 1.5, rr, -.3), 300 + j, rr * .12, true, 24), mix('#ffd9a0', '#efe8de', t), 3, 300 + j, { pressure: .3, color: alpha('#8a5a3a', .5) }); }
  glow(c, x, y, 650 * k * s, '#ffb347', 1); glow(c, x, y, 260 * s, '#ffffff', 1);
  shp(c, warp(ellPts(x - 18 * s, y - 8 * s, 100 * s, 58 * s, -.3), 311, 12 * s, true, 20), '#ff8a1f', 4, 309, { color: '#c4441a' });
  shp(c, ellPts(x, y, 50 * s, 40 * s, -.3), C.fireCore, 0, 310);
  c.restore();
}
function windowFrame(c, [x, y, w, h], t = 26, transom = .26) {
  c.save(); c.fillStyle = '#f8f4ea';
  const ty = y + h * transom, bars = [[x - t, y - t, w + 2 * t, t], [x - t, y + h, w + 2 * t, t], [x - t, y, t, h], [x + w, y, t, h], [x + w / 2 - t / 2, ty, t, h * (1 - transom)], [x, ty - t / 2, w, t]];
  bars.forEach(([bx, by, bw, bh], j) => { c.fillRect(bx, by, bw, bh); c.fillStyle = alpha('#c9bfa9', .7); c.fillRect(bx + bw * .7, by, bw * .3, bh); c.fillStyle = '#f8f4ea'; inkLine(c, rectPts(bx, by, bw, bh), 4, 400 + j, true, { pressure: .3 }); });
  c.restore();
}

// ---------- кухня ----------
function kitchen(c, k) {
  wallpaper(c, 0, 0, W, 1500, '#ecdcb8', alpha('#b3946a', .22), 1);
  c.fillStyle = '#f4ead4'; c.fillRect(0, 0, W, 70); inkLine(c, [[0, 70], [W, 70]], 4, 401);
  // лампа
  inkLine(c, [[560, 0], [560, 120]], 3, 402);
  shp(c, [[490, 180], [500, 130], [540, 118], [580, 118], [620, 130], [630, 180]], '#c9593f', 4, 403, { shade: sideShade('#a2412e', 620, 150, 30, 40) });
  // часы
  shp(c, ellPts(120, 250, 56, 56), '#fffaf0', 5, 404); for (let h = 0; h < 12; h++) { const a = h / 12 * TAU; c.fillStyle = INK; c.fillRect(120 + Math.cos(a) * 44 - 2, 250 + Math.sin(a) * 44 - 2, 4, 4); }
  inkLine(c, [[120, 250], [120 + 30 * Math.cos(-1.05), 250 + 30 * Math.sin(-1.05)]], 4, 405); inkLine(c, [[120, 250], [120 + 22 * Math.cos(.35 + Math.PI * .5), 250 + 22 * Math.sin(.35 + Math.PI * .5)]], 5, 406);
  // окно и город
  c.save(); c.beginPath(); c.rect(...WIN); c.clip(); cityOutside(c, k, WIN);
  c.globalAlpha = .18; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(WIN[0] + 40, WIN[1]); c.lineTo(WIN[0] + 140, WIN[1]); c.lineTo(WIN[0] + 20, WIN[1] + 300); c.lineTo(WIN[0], WIN[1] + 300); c.fill(); c.restore();
  windowFrame(c, WIN);
  // радиатор
  for (let j = 0; j < 9; j++) shp(c, [[370 + j * 44, 1100], [406 + j * 44, 1100], [406 + j * 44, 1250], [370 + j * 44, 1250]], '#f0ece2', 3, 420 + j, { corner: .3, shade: sideShade('#cfc6b4', 404 + j * 44, 1175, 10, 80) });
  // подоконник, цветок
  shp(c, [[260, 1046], [860, 1046], [880, 1084], [240, 1084]], '#f8f4ea', 4, 430, { corner: .2, shade: q => { q.fillStyle = '#d9d0bd'; q.fillRect(230, 1072, 660, 20); } });
  shp(c, [[730, 1046], [800, 1046], [792, 984], [738, 984]], '#c8623f', 4, 431, { corner: .2 });
  for (const a of [-.6, -.25, .1, .45]) shp(c, ellPts(765 + a * 50, 930, 14, 42, a), '#5c9147', 3.5, 432 + a * 10, { shade: sideShade('#3f6d33', 775 + a * 50, 940, 8, 40) });
  // шторы: тюль и плотные
  inkLine(c, [[200, 262], [920, 262]], 7, 440);
  for (const [x0, x1] of [[230, 360], [760, 890]]) {
    c.save(); c.globalAlpha = .55; shp(c, [[x0, 262], [x1, 262], [x1 + (x0 < 500 ? -10 : 10), 1040], [x0 + (x0 < 500 ? 10 : -10), 1040]], '#fbf8f0', 0, x0); c.restore();
    for (let f = 0; f < 5; f++) inkLine(c, [[x0 + 12 + f * 24, 270], [x0 + 14 + f * 24, 1030]], 1.4, x0 + f, false, { color: alpha('#bfb5a0', .7), pressure: 0 });
  }
  for (const [x0, x1, sd] of [[190, 290, 1], [830, 930, -1]]) shp(c, [[x0, 262], [x1, 262], [x1 + 10 * sd, 700], [x1 - 6 * sd, 1100], [x0 + 6 * sd, 1100], [x0 - 10 * sd, 700]], '#c99b3f', 4, 450 + x0,
    { shade: q => { for (let f = 0; f < 4; f++) { q.fillStyle = alpha('#8f6a24', .35); q.fillRect(x0 + 10 + f * 24, 262, 8, 840); } } });
  // холодильник
  shp(c, [[14, 390], [236, 390], [240, 1500], [10, 1500]], '#f3f1ea', 5, 460, { corner: .15, shade: sideShade('#d5d1c4', 236, 940, 40, 560) });
  inkLine(c, [[12, 720], [238, 720]], 4, 461); inkLine(c, [[210, 560], [210, 660]], 7, 462); inkLine(c, [[210, 760], [210, 880]], 7, 463);
  for (const [mx, my, col] of [[60, 450, '#e05a4f'], [150, 470, '#4e8fd1'], [90, 820, '#f2c94c']]) shp(c, ellPts(mx, my, 12, 12), col, 3, mx + my);
  shp(c, [[50, 500], [170, 496], [174, 620], [54, 626]], '#fffdf6', 3, 465, { corner: .2 });
  c.save(); c.font = '800 20px Rubik'; c.fillStyle = '#c0392b'; c.textAlign = 'center'; c.fillText('ФЕВРАЛЬ', 112, 528); c.restore();
  for (let r = 0; r < 4; r++) for (let q = 0; q < 6; q++) { c.fillStyle = (r === 2 && q === 4) ? '#c0392b' : alpha(INK, .35); c.fillRect(66 + q * 16, 544 + r * 18, 9, 9); }
  // кухонный гарнитур справа
  shp(c, [[900, 120], [1090, 120], [1090, 600], [900, 600]], '#b9845a', 5, 470, { corner: .1, shade: sideShade('#946540', 1080, 360, 40, 260) });
  inkLine(c, [[995, 130], [995, 590]], 3, 471); inkLine(c, [[975, 330], [975, 390]], 6, 472);
  c.fillStyle = '#f5f1e8'; c.fillRect(890, 600, 200, 512);
  for (let yy = 600; yy < 1112; yy += 42) inkLine(c, [[890, yy], [1080, yy]], 1.5, 473 + yy, false, { color: alpha(INK, .3), pressure: 0 });
  for (let xx = 910; xx < 1080; xx += 42) inkLine(c, [[xx, 600], [xx, 1110]], 1.5, 474 + xx, false, { color: alpha(INK, .3), pressure: 0 });
  shp(c, [[880, 1110], [1090, 1110], [1090, 1146], [880, 1146]], '#7b5a44', 4, 475, { corner: .1 });
  shp(c, [[892, 1146], [1090, 1146], [1090, 1500], [892, 1500]], '#b9845a', 5, 476, { corner: .1, shade: sideShade('#946540', 1080, 1320, 40, 200) });
  inkLine(c, [[910, 1200], [960, 1200]], 6, 477);
  shp(c, [[950, 1110], [944, 1030], [960, 1000], [1030, 1000], [1040, 1030], [1036, 1110]], '#e6e3dc', 4, 478, { shade: sideShade('#bdb8ac', 1036, 1060, 18, 60) });   // чайник
  inkLine(c, [[1040, 1020], [1062, 1040], [1056, 1090], [1036, 1094]], 6, 479);
  // пол
  c.fillStyle = '#a77553'; c.fillRect(0, 1500, W, H - 1500);
  for (let j = 1; j < 8; j++) { const yy = 1500 + j * j * 8.5; inkLine(c, [[0, yy], [W, yy]], 2, 480 + j, false, { color: alpha('#5a3a26', .45), pressure: 0 }); }
  for (let j = -8; j <= 8; j++) inkLine(c, [[540 + j * 70, 1500], [540 + j * 260, H]], 2, 490 + j, false, { color: alpha('#5a3a26', .35), pressure: 0 });
  inkLine(c, [[0, 1500], [W, 1500]], 5, 499);
  if (k > 0) {
    c.save(); c.globalAlpha = .3 * k; c.fillStyle = '#fff3c4';
    c.beginPath(); c.moveTo(WIN[0] - 40, 1500); c.lineTo(WIN[0] + WIN[2] + 40, 1500); c.lineTo(W + 140, H); c.lineTo(-60, H); c.fill(); c.restore();
  }
}
function table(c, k = 0) {
  c.save(); c.globalAlpha = .25; c.fillStyle = '#3a2016'; c.beginPath(); c.ellipse(540, 1720, 470, 50, 0, 0, TAU); c.fill(); c.restore();
  for (const x of [170, 910]) taper(c, [[x, 1330], [x + (x < 540 ? -6 : 6), 1710]], [30, 24], '#8a5a34', 500 + x);
  shp(c, [[110, 1286], [970, 1286], [996, 1346], [84, 1346]], '#c08a58', 5, 510, { corner: .2,
    shade: q => { q.fillStyle = '#9b6a3e'; q.fillRect(80, 1326, 940, 30); for (let j = 0; j < 4; j++) inkLine(q, [[140, 1296 + j * 8], [940, 1294 + j * 9]], 1.2, 511 + j, false, { color: alpha('#7a4d2a', .5), pressure: 0 }); } });
  if (!k) {
    shp(c, ellPts(300, 1300, 92, 20), '#fbf8f2', 4, 520, { shade: sideShade('#d8d2c4', 340, 1306, 40, 10) });
    shp(c, [[690, 1216], [758, 1216], [752, 1298], [696, 1298]], '#d64f4f', 4, 521, { corner: .2, shade: sideShade('#a83838', 752, 1258, 14, 40) });
    inkLine(c, [[758, 1236], [786, 1246], [782, 1276], [754, 1282]], 6, 522);
    c.save(); c.globalAlpha = .5; for (const sx of [0, 1]) inkLine(c, [[712 + sx * 18, 1200], [706 + sx * 18, 1176], [716 + sx * 18, 1152]], 2.5, 523 + sx, false, { color: '#fff' }); c.restore();
  } else shp(c, [[690, 1290], [770, 1266], [784, 1298], [704, 1316]], '#d64f4f', 4, 524, { corner: .2 });
}
function roomLight(c, k) {
  c.save(); c.globalCompositeOperation = 'screen';
  const g = c.createRadialGradient(700, 420, 80, 540, 900, 1300); g.addColorStop(0, alpha('#fff4c4', .7 * k)); g.addColorStop(1, alpha('#ffcf6a', .15 * k));
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}
function floorShadow(c, x, y, k, len = 420) {
  c.save(); c.globalAlpha = .32 * k; c.fillStyle = '#3a2016';
  c.beginPath(); c.moveTo(x - 60, y); c.lineTo(x + 60, y); c.lineTo(x + 200, y + len); c.lineTo(x - 90, y + len); c.fill(); c.restore();
}

// ---------- осколки: трещины лучами от точки удара, разлёт с перспективой ----------
function shardsOf([x, y, w, h], [ix, iy], seed) {
  const r = rng(seed), N = 13, rings = [0, .08, .2, .38, .62, .9, 1.4], R = Math.hypot(w, h);
  const ang = Array.from({ length: N }, (_, i) => (i + (r() - .5) * .6) / N * TAU), rad = ang.map(() => rings.map(v => v * R * (.85 + r() * .3)));
  const P = (i, k) => { const ii = i % N; return [clamp(ix + Math.cos(ang[ii]) * rad[ii][k], x, x + w), clamp(iy + Math.sin(ang[ii]) * rad[ii][k], y, y + h)]; };
  const out = [];
  for (let i = 0; i < N; i++) for (let k = 0; k < rings.length - 1; k++) {
    const pts = [P(i, k), P(i + 1, k), P(i + 1, k + 1), P(i, k + 1)];
    const area = Math.abs(pts.reduce((a, p, j) => { const q = pts[(j + 1) % 4]; return a + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
    if (area < 60) continue;
    const cx = pts.reduce((a, p) => a + p[0], 0) / 4, cy = pts.reduce((a, p) => a + p[1], 0) / 4;
    const edge = Math.min(cx - x, x + w - cx, cy - y, y + h - cy) < Math.min(w, h) * .08;
    out.push({ pts, cx, cy, speed: edge ? 0 : .6 + r() * .8, z: .5 + r() * 1.5, rot: (r() - .5) * 4, tilt: r() });
  }
  return out;
}
function drawShards(c, shards, [ix, iy], t, o = {}) {
  const spread = o.spread ?? 900, fall = o.fall ?? 500;
  const at_ = (s, tt) => { const dx = s.cx - ix, dy = s.cy - iy, l = Math.hypot(dx, dy) || 1, d = tt * s.speed * spread;
    return { x: s.cx + dx / l * d * .6 + (s.cx - CX) * tt * s.z * .9, y: s.cy + dy / l * d * .6 + fall * tt * tt * s.speed, sc: 1 + tt * s.z * s.speed * 1.6, rot: tt * s.rot * s.speed }; };
  // трещины на оставшемся стекле
  if (t < .02) for (const s of shards) inkLine(c, s.pts, 1.4, 1000 + s.cx, true, { color: alpha('#ffffff', .8), pressure: 0, amp: .6 });
  const list = shards.map(s => ({ s, p: at_(s, t), q: at_(s, Math.max(0, t - .07)) })).sort((a, b) => a.p.sc - b.p.sc);
  for (const { s, p, q } of list) {
    const loc = s.pts.map(([px, py]) => { const ux = (px - s.cx) * p.sc, uy = (py - s.cy) * p.sc, cr = Math.cos(p.rot), sr = Math.sin(p.rot) * (.3 + s.tilt * .7);
      return [p.x + ux * cr - uy * sr, p.y + ux * sr + uy * cr]; });
    if (s.speed && t > .03) {   // след движения
      c.save(); c.strokeStyle = alpha('#ffffff', .22); c.lineCap = 'round'; c.lineWidth = Math.min(40, 6 + p.sc * 6);
      c.beginPath(); c.moveTo(q.x, q.y); c.lineTo(p.x, p.y); c.stroke(); c.restore();
    }
    const path = polyPath(loc);
    c.save(); c.fillStyle = `rgba(${200 - s.tilt * 40},${228 - s.tilt * 20},${240},${.28 + s.tilt * .25})`; c.fill(path); c.clip(path);
    const g = c.createLinearGradient(p.x - 60 * p.sc, p.y - 60 * p.sc, p.x + 60 * p.sc, p.y + 60 * p.sc);
    g.addColorStop(.35, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${.35 + s.tilt * .5})`); g.addColorStop(.62, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fill(path); c.restore();
    c.save(); c.lineJoin = 'round'; c.strokeStyle = alpha('#24323a', .55); c.lineWidth = 1.2; c.stroke(path);
    c.strokeStyle = alpha('#ffffff', .95); c.lineWidth = 2; c.beginPath(); c.moveTo(...loc[0]); c.lineTo(...loc[1]); c.stroke(); c.restore();
  }
}
function dust(c, x, y, R, t, seed, col = '#efe6d6') {
  const r = rng(seed);
  for (let j = 0; j < 40; j++) { const a = r() * TAU, d = R * (.2 + r()) * (.4 + t), rr = 30 + r() * 70 * (.5 + t);
    c.save(); c.globalAlpha = (.12 + r() * .12) * (1 - t * .5); c.fillStyle = col; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * .7, rr, 0, TAU); c.fill(); c.restore(); }
  c.fillStyle = '#fff'; for (let j = 0; j < 120; j++) { c.globalAlpha = .4 + r() * .5; const a = r() * TAU, d = R * r() * (1 + t * 1.5); c.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d * .8, 2 + r() * 3, 2 + r() * 3); }
  c.globalAlpha = 1;
}
// крупный план: окно выбивает ударной волной
function windowBlast(c, t) {
  const WB = [110, 260, 860, 1160];
  wallpaper(c, 0, 0, W, H, '#e2cfa6', alpha('#a88a5e', .22), 2);
  c.save(); c.beginPath(); c.rect(...WB); c.clip(); cityOutside(c, .55, WB, false); c.restore();
  windowFrame(c, WB, 40, .24);
  const ty = WB[1] + WB[3] * .24, mid = WB[0] + WB[2] / 2;
  const panes = [[WB[0], ty, WB[2] / 2 - 20, WB[1] + WB[3] - ty], [mid + 20, ty, WB[2] / 2 - 20, WB[1] + WB[3] - ty], [WB[0], WB[1], WB[2], ty - WB[1] - 20]];
  const imp = [[WB[0] + 250, ty + 380], [mid + 200, ty + 300], [WB[0] + 600, WB[1] + 120]];
  panes.forEach((pn, j) => drawShards(c, shardsOf(pn, imp[j], 50 + j), imp[j], t, { spread: 1100, fall: 700 }));
  // тюль выдувает внутрь
  c.save(); c.globalAlpha = .6;
  shp(c, [[60, 220], [260, 220], [420 + t * 200, 700], [380 + t * 260, 1300], [150 + t * 120, 1500], [40, 1460]], '#fbf8f0', 0, 61);
  c.restore();
  for (let f = 0; f < 6; f++) inkLine(c, [[80 + f * 30, 230], [180 + f * 40 + t * 200, 800], [120 + f * 30 + t * 120, 1460]], 1.5, 62 + f, false, { color: alpha('#bfb5a0', .8), pressure: 0 });
  dust(c, CX, 900, 520, t, 71);
  // подоконник
  shp(c, [[40, 1440], [1040, 1440], [1060, 1500], [20, 1500]], '#f8f4ea', 5, 72, { corner: .2 });
  c.fillStyle = '#d9cdb4'; c.fillRect(0, 1500, W, H - 1500);
}

// ---------- коридор ----------
function corridor(c, t) {
  // обои в полоску и деревянная панель
  c.fillStyle = '#d6cba8'; c.fillRect(0, 0, W, 1450);
  for (let x = 0; x < W; x += 48) { c.fillStyle = alpha('#b6a77e', .45); c.fillRect(x, 0, 14, 1100); }
  shp(c, [[-10, 1100], [W + 10, 1100], [W + 10, 1450], [-10, 1450]], '#9a6c47', 4, 600, { corner: .1, shade: q => { for (let x = 30; x < W; x += 170) { q.strokeStyle = alpha('#5a3a26', .5); q.lineWidth = 3; q.strokeRect(x, 1130, 130, 290); } } });
  shp(c, [[-10, 1090], [W + 10, 1090], [W + 10, 1112], [-10, 1112]], '#7d5538', 3, 601, { corner: .1 });
  // лампа
  inkLine(c, [[420, 0], [420, 90]], 3, 602); shp(c, ellPts(420, 110, 60, 28), '#efe4c8', 4, 603);
  // вешалка и куртки
  shp(c, [[40, 330], [470, 330], [470, 362], [40, 362]], '#7d5538', 4, 604, { corner: .1 });
  const coat = (x, col, sh, len, seed) => {
    shp(c, [[x - 20, 350], [x + 20, 350], [x + 70, 420], [x + 80, 420 + len], [x - 80, 420 + len], [x - 70, 420]], col, 4, seed, { shade: q => { sideShade(sh, x + 70, 420 + len / 2, 30, len)(q); inkLine(q, [[x, 420], [x, 420 + len]], 2, seed + 1, false, { color: alpha(INK, .5) }); } });
    for (const sx of [-1, 1]) taper(c, [[x + sx * 66, 424], [x + sx * 84, 420 + len * .6]], [34, 30], col, seed + 2 + sx);
    shp(c, [[x - 24, 350], [x + 24, 350], [x + 30, 400], [x - 30, 400]], sh, 3, seed + 5);
  };
  coat(140, '#5a5a78', '#41415a', 420, 610); coat(330, '#b9473a', '#8e3328', 330, 620);
  shp(c, [[300, 400], [330, 396], [326, 640], [300, 644]], '#e9c45a', 3, 630);   // шарф
  // зеркало
  shp(c, ellPts(560, 560, 70, 120), '#cfe1e8', 6, 631, { shade: q => { q.fillStyle = alpha('#fff', .6); q.beginPath(); q.moveTo(520, 470); q.lineTo(560, 450); q.lineTo(510, 620); q.lineTo(495, 610); q.fill(); } });
  // дверной проём на кухню
  const dx = 690, dy = 330, dw = 340, dh = 1120;
  c.save(); c.beginPath(); c.rect(dx, dy, dw, dh); c.clip();
  c.fillStyle = '#ecd9ae'; c.fillRect(dx, dy, dw, dh);
  const kw = [dx + 40, dy + 220, 260, 420];
  cityOutside(c, .6, kw, false); windowFrame(c, kw, 14, .26);
  glow(c, dx + dw / 2, dy + 400, 520, '#ffffff', .9);
  c.fillStyle = '#a77553'; c.fillRect(dx, dy + 900, dw, dh);
  c.restore();
  shp(c, [[dx - 30, dy + dh], [dx - 30, dy - 30], [dx + dw + 30, dy - 30], [dx + dw + 30, dy + dh], [dx + dw, dy + dh], [dx + dw, dy], [dx, dy], [dx, dy + dh]], '#efe6d2', 4, 640, { corner: .1 });
  // пол
  c.fillStyle = '#8a5d40'; c.fillRect(0, 1450, W, H - 1450);
  for (let j = 0; j < 14; j++) inkLine(c, [[j * 90 - 200, 1450], [j * 130 - 500, H]], 2, 650 + j, false, { color: alpha('#4a2e1c', .35), pressure: 0 });
  inkLine(c, [[0, 1450], [W, 1450]], 5, 664);
  c.save(); c.globalAlpha = .28; c.fillStyle = '#fff3c0'; c.beginPath(); c.moveTo(dx, 1450); c.lineTo(dx + dw, 1450); c.lineTo(W + 200, H); c.lineTo(dx - 160, H); c.fill(); c.restore();
  shp(c, [[80, 1640], [520, 1640], [560, 1820], [40, 1820]], '#6d8a6a', 4, 665, { corner: .2 });   // коврик
  return [kw[0] + kw[2] / 2, kw[1] + kw[3] * .6];
}

// ---------- космос ----------
function space(c, k) {
  c.fillStyle = '#0c0f2b'; c.fillRect(0, 0, W, H);
  const r = rng(5); c.fillStyle = '#fff';
  for (let j = 0; j < 260; j++) { c.globalAlpha = .3 + r() * .7; c.fillRect(r() * W, r() * H, 2 + r() * 2.5, 2 + r() * 2.5); }
  c.globalAlpha = 1;
  glow(c, 540, 2700, 1500, '#5fb7ff', .9);
  const E = circPath(540, 2800, 1300); c.fillStyle = '#2f73c9'; c.fill(E);
  c.save(); c.clip(E);
  for (const [x, y, rx, ry] of [[300, 1620, 260, 90], [820, 1700, 220, 120], [520, 1820, 300, 110]]) shp(c, warp(ellPts(x, y, rx, ry), x, 18, true, 30), '#5ea85a', 5, x);
  for (const [x, y] of [[180, 1560], [700, 1580], [960, 1650]]) shp(c, ellPts(x, y, 120, 26), alpha('#ffffff', .8), 0, x);
  c.restore(); inkLine(c, ellPts(540, 2800, 1300, 1300, 0, 120), 7, 800, true);
  const A = warp(ellPts(600, 760, 330, 270, .3), 21, 34, true, 40);
  shp(c, A, '#8a7a6d', 7, 810, { shade: q => {
    hatchIn(q, rectPath(260, 480, 700, 600), [260, 480, 700, 600], { alpha: .35, angle: .5, gap: 10 });
    q.fillStyle = alpha('#2a2230', .45); q.beginPath(); q.ellipse(720, 860, 300, 260, .3, 0, TAU); q.fill(); } });
  for (const [x, y, rr] of [[520, 660, 50], [680, 820, 70], [460, 860, 34], [760, 620, 28]]) shp(c, ellPts(x, y, rr, rr * .75, .3), '#6f6156', 4, x);
  at(c, 230, 1180, 1, () => {
    c.rotate(-.75);
    shp(c, [[-30, -60], [30, -60], [30, 60], [-30, 60]], '#e6e9ef', 5, 820, { corner: .2 });
    shp(c, [[-120, -20], [-34, -20], [-34, 20], [-120, 20]], '#3a5bd8', 4, 821, { corner: .1 });
    shp(c, [[34, -20], [120, -20], [120, 20], [34, 20]], '#3a5bd8', 4, 822, { corner: .1 });
    glow(c, 0, 90, 90, '#ff9b2e', 1); shp(c, [[-16, 62], [16, 62], [0, 140]], '#ffcf33', 3, 823);
  });
  c.save(); c.setLineDash([16, 18]); inkLine(c, [[270, 1130], [400, 1000], [470, 920]], 4, 830, false, { color: alpha('#ffffff', .7), pressure: 0 }); c.restore();
}
