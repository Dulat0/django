'use strict';
// Серия 5: общие кисти, герои и фоны. Используется и пробными кадрами, и фильмом.
// Герои рисуются в локальных координатах: (0,0) — центр линии плеч, вверх = -y.

const INK = '#231b26';
const C = {
  skin: '#f6c9a4', skinSh: '#e2a47f', blush: '#f08c84',
  temaHair: '#3b2a24', hoodie: '#3f7fd0', hoodieSh: '#2c5f9f', jeans: '#36456b', shoe: '#e9e2d4',
  veraHair: '#b8502c', veraHairSh: '#8c3a1f', cardigan: '#4f9a6e', cardiganSh: '#3a7653', tee: '#f4efe4', skirt: '#2f3550',
  cat: '#f0973d', catSh: '#c9702a', catBelly: '#fbe2bf',
  wall: '#f3dfb4', wallSh: '#e2c78f', floor: '#9b6a48', floorSh: '#7f5438', wood: '#c98b52', woodSh: '#a36c3c',
  frame: '#fbf6ec', sky: '#9ec9e8', snow: '#f7f9fc', block: '#c8ccd6', blockSh: '#9fa6b7', winLit: '#ffe39a',
  fire: '#ffb02e', fireCore: '#fff6d6', smoke: '#d9d4cc',
};

// ---------- кисти ----------
function inkLine(c, pts, w = 6, seed = 1, close = false, o = {}) {
  c.save(); c.strokeStyle = o.color || INK; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  wob(c, pts, o.amp ?? 1.4, seed, close, { pressure: o.pressure ?? .6, freq: 1.2 }); c.restore();
}
function shp(c, pts, fill, w = 6, seed = 1, o = {}) {
  const p = curvePath(pts, true, o.corner ?? .8);
  if (fill) { c.fillStyle = fill; c.fill(p); }
  if (o.shade) { c.save(); c.clip(p); o.shade(c); c.restore(); }
  if (w) inkLine(c, pts, w, seed, true, o);
  return p;
}
function limb(c, pts, thick, fill, seed = 1, w = 5) {   // трубка: контур тушью + заливка
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const q = smoothPts(pts, false, 4, .6);
  c.strokeStyle = INK; c.lineWidth = thick + w * 2; c.beginPath(); q.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.stroke();
  c.strokeStyle = fill; c.lineWidth = thick; c.stroke(); c.restore();
}
function hatchIn(c, path, box, o = {}) { hatch(c, path, box, { color: INK, alpha: .22, gap: 9, len: 16, width: 2, angle: .8, ...o }); }
function at(c, x, y, s, fn, flip = 1) { c.save(); c.translate(x, y); c.scale(s * flip, s); fn(); c.restore(); }

// ---------- лица ----------
// face: {look:[dx,dy], eyes:'open'|'wide'|'shut'|'happy', mouth:'smile'|'chew'|'O'|'tight'|'grin', brows:'up'|'calm'|'worry'|'angry'}
function eyes(c, f, sep = 38, ry = 26) {
  const [lx, ly] = f.look || [0, 0];
  for (const sx of [-1, 1]) {
    const x = sx * sep, y = -8;
    if (f.eyes === 'shut') { inkLine(c, [[x - 18, y - 4], [x - 6, y + 4], [x + 6, y + 4], [x + 18, y - 4]], 5, 30 + sx); continue; }
    if (f.eyes === 'happy') { inkLine(c, [[x - 16, y + 4], [x, y - 8], [x + 16, y + 4]], 5, 32 + sx); continue; }
    const k = f.eyes === 'wide' ? 1.25 : 1;
    shp(c, ellPts(x, y, 19 * k, ry * k), '#fff', 4, 40 + sx, { pressure: .3 });
    const pr = f.eyes === 'wide' ? 8 : 11;
    c.fillStyle = INK; c.beginPath(); c.ellipse(x + lx * 7, y + ly * 8 + 3, pr, pr * 1.15, 0, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x + lx * 7 + 4, y + ly * 8 - 3, 3.5, 0, TAU); c.fill();
  }
  const b = f.brows || 'calm', by = f.eyes === 'wide' ? -50 : -42;
  for (const sx of [-1, 1]) {
    const x = sx * sep, tilt = b === 'worry' ? -8 : b === 'angry' ? 9 : 0, lift = b === 'up' ? -10 : 0;
    inkLine(c, [[x - 18 * sx, by + lift - tilt * sx * sx], [x, by + lift - 4], [x + 18 * sx, by + lift + tilt]], 6, 50 + sx);
  }
}
function mouth(c, m, y = 44) {
  if (m === 'smile') inkLine(c, [[-22, y - 4], [0, y + 8], [22, y - 4]], 5, 61);
  else if (m === 'grin') shp(c, [[-28, y - 6], [28, y - 6], [14, y + 16], [-14, y + 16]], '#7a2b33', 4, 62);
  else if (m === 'O') shp(c, ellPts(0, y + 4, 14, 18), '#7a2b33', 4, 63);
  else if (m === 'tight') inkLine(c, [[-16, y + 2], [0, y], [16, y + 3]], 5, 64);
  else if (m === 'chew') { shp(c, [[-16, y], [16, y - 2], [8, y + 10], [-8, y + 10]], '#7a2b33', 4, 65); }
}
function cheeks(c, sep = 58) { c.save(); c.globalAlpha = .45; c.fillStyle = C.blush; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * sep, 28, 16, 9, 0, 0, TAU); c.fill(); } c.restore(); }

// ---------- Тёма ----------
function temaHead(c, f = {}, back = false) {
  const R = 100;
  for (const sx of [-1, 1]) shp(c, ellPts(sx * 98, 8, 18, 24), C.skin, 5, 70 + sx);       // уши
  if (back) {   // затылок
    shp(c, [[-104, 10], [-100, -60], [-60, -112], [0, -124], [62, -112], [100, -60], [104, 10], [80, 60], [0, 84], [-80, 60]], C.temaHair, 6, 71,
      { shade: q => hatchIn(q, rectPath(-110, -130, 220, 220), [-110, -130, 220, 220], { angle: 1.4, alpha: .18 }) });
    for (const [x, y] of [[-30, -60], [20, -40], [-5, 10], [40, -80]]) inkLine(c, [[x, y], [x + 14, y + 26]], 3, 72 + x, false, { pressure: .8 });
    return;
  }
  shp(c, ellPts(0, 0, R, R * 1.06), C.skin, 6, 73, { shade: q => { q.fillStyle = C.skinSh; q.globalAlpha = .5; q.beginPath(); q.ellipse(40, 40, 70, 70, 0, 0, TAU); q.fill(); } });
  cheeks(c); eyes(c, f); mouth(c, f.mouth || 'smile');
  inkLine(c, [[2, 6], [-6, 22], [6, 24]], 4, 74);                                           // нос
  // лохматая чёлка
  shp(c, [[-106, 10], [-112, -50], [-80, -104], [-30, -126], [26, -128], [78, -110], [112, -60], [108, 0], [94, -36], [80, -22], [70, -58], [46, -44],
    [30, -74], [8, -52], [-14, -80], [-36, -50], [-58, -74], [-72, -36], [-92, -50]], C.temaHair, 6, 75, { corner: .4,
    shade: q => hatchIn(q, rectPath(-115, -130, 230, 140), [-115, -130, 230, 140], { angle: 1.3, alpha: .2 }) });
}
// поза: 'sit' (за столом, видно до пояса), 'back' (со спины у окна, телефон вверх), 'crouch' (сидит у стены, закрыл голову)
function tema(c, pose, f = {}) {
  if (pose === 'crouch') {
    limb(c, [[-30, 170], [-70, 90], [-40, 20]], 46, C.jeans, 81); limb(c, [[30, 170], [70, 90], [50, 20]], 46, C.jeans, 82);   // колени к груди
    shp(c, [[-70, -10], [70, -10], [80, 120], [60, 175], [-60, 175], [-80, 120]], C.hoodie, 6, 83);
    for (const sx of [-1, 1]) shp(c, [[sx * 30 - 26, 170], [sx * 30 + 34 * sx, 178], [sx * 30 + 30 * sx, 198], [sx * 30 - 30, 198]], C.shoe, 5, 84 + sx);
    at(c, 0, -95, .9, () => temaHead(c, { eyes: 'shut', mouth: 'tight', brows: 'worry' }));
    limb(c, [[-66, 10], [-110, -100], [-40, -190]], 34, C.hoodie, 85); limb(c, [[66, 10], [112, -100], [40, -190]], 34, C.hoodie, 86);  // руки на голове
    for (const sx of [-1, 1]) shp(c, ellPts(sx * 30, -192, 26, 20), C.skin, 5, 87 + sx);
    return;
  }
  if (pose === 'back') {
    limb(c, [[-34, 230], [-40, 380], [-44, 480]], 54, C.jeans, 91); limb(c, [[34, 230], [42, 380], [48, 480]], 54, C.jeans, 92);
    for (const sx of [-1, 1]) shp(c, [[sx * 44 - 34, 470], [sx * 44 + 34, 470], [sx * 44 + 38, 505], [sx * 44 - 38, 505]], C.shoe, 5, 93 + sx);
    shp(c, [[-88, -4], [88, -4], [96, 130], [80, 240], [-80, 240], [-96, 130]], C.hoodie, 6, 95,
      { shade: q => { q.fillStyle = C.hoodieSh; q.fillRect(-100, 150, 200, 100); } });
    shp(c, [[-62, -10], [62, -10], [44, 60], [0, 80], [-44, 60]], C.hoodieSh, 5, 96);      // капюшон
    limb(c, [[-84, 20], [-120, 110], [-150, 30]], 36, C.hoodie, 97);
    limb(c, [[84, 20], [150, -40], [176, -170]], 36, C.hoodie, 98);                           // рука с телефоном
    shp(c, [[150, -270], [214, -262], [206, -146], [142, -154]], '#2b2f3a', 5, 99);           // телефон
    shp(c, ellPts(178, -160, 24, 20), C.skin, 5, 100);
    at(c, 0, -112, 1, () => temaHead(c, {}, true));
    return;
  }
  // sit: туловище, руки на столе, бутерброд
  shp(c, [[-92, -4], [92, -4], [104, 140], [-104, 140]], C.hoodie, 6, 101,
    { shade: q => { q.fillStyle = C.hoodieSh; q.globalAlpha = .9; q.fillRect(30, 0, 90, 150); } });
  inkLine(c, [[-24, 10], [-28, 70]], 4, 102); inkLine(c, [[24, 10], [28, 70]], 4, 103);      // шнурки
  shp(c, [[-64, -12], [64, -12], [36, 30], [-36, 30]], C.hoodieSh, 5, 104);
  at(c, 0, -112, 1, () => temaHead(c, f));
  limb(c, [[-88, 20], [-120, 110], [-60, 150]], 38, C.hoodie, 105);
  limb(c, [[88, 20], [128, 80], [92, 6]], 38, C.hoodie, 106);
  shp(c, ellPts(86, -4, 26, 22), C.skin, 5, 107);
  shp(c, [[60, -50], [128, -66], [136, -38], [66, -20]], '#e9b16a', 5, 108);                  // хлеб
  shp(c, [[62, -54], [132, -70], [130, -62], [64, -44]], '#ffd34d', 3, 109);                   // сыр
}

// ---------- Вера ----------
function veraHead(c, f = {}) {
  shp(c, [[60, -60], [150, -40], [190, 40], [170, 140], [130, 90], [120, 20]], C.veraHair, 6, 120);   // хвост
  for (const sx of [-1, 1]) shp(c, ellPts(sx * 90, 10, 16, 22), C.skin, 5, 121 + sx);
  shp(c, ellPts(0, 0, 92, 100), C.skin, 6, 123);
  cheeks(c, 54); eyes(c, f, 36, 24); mouth(c, f.mouth || 'smile', 46);
  inkLine(c, [[0, 8], [-6, 22], [6, 24]], 4, 124);
  c.save(); c.strokeStyle = INK; c.lineWidth = 5; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * 36, -6, 30, 0, TAU); c.stroke(); } c.beginPath(); c.moveTo(-8, -8); c.lineTo(8, -8); c.stroke(); c.restore();
  shp(c, [[-98, 20], [-104, -50], [-60, -104], [0, -116], [64, -102], [102, -50], [96, 10], [70, -50], [10, -70], [-40, -52], [-80, -10]], C.veraHair, 6, 125,
    { corner: .5, shade: q => hatchIn(q, rectPath(-110, -120, 220, 140), [-110, -120, 220, 140], { angle: 2.2, alpha: .18 }) });
}
function vera(c, pose, f = {}) {
  if (pose === 'crouch') {
    limb(c, [[-30, 190], [-80, 100], [-40, 30]], 44, C.skirt, 131); limb(c, [[30, 190], [76, 100], [56, 30]], 44, C.skirt, 132);
    shp(c, [[-76, -10], [76, -10], [86, 140], [64, 196], [-64, 196], [-86, 140]], C.cardigan, 6, 133);
    shp(c, [[-30, -10], [30, -10], [20, 120], [-20, 120]], C.tee, 4, 134);
    for (const sx of [-1, 1]) shp(c, [[sx * 30 - 28, 190], [sx * 30 + 36 * sx, 198], [sx * 30 + 30 * sx, 218], [sx * 30 - 30, 218]], '#5a3a2e', 5, 135 + sx);
    at(c, 0, -100, .9, () => veraHead(c, f));
    limb(c, [[-70, 10], [-116, -110], [-40, -200]], 32, C.cardigan, 137); limb(c, [[70, 10], [116, -110], [40, -200]], 32, C.cardigan, 138);
    for (const sx of [-1, 1]) shp(c, ellPts(sx * 30, -202, 24, 19), C.skin, 5, 139 + sx);
    return;
  }
}

// ---------- Бублик ----------
// поза: 'sill' (лежит клубком), 'hiss' (шерсть дыбом), 'flat' (прижался, уши назад)
function bublik(c, pose) {
  const puff = pose === 'hiss' ? 1 : 0, flat = pose === 'flat' ? 1 : 0;
  const body = pose === 'sill' ? ellPts(0, 0, 130, 62) : warp(ellPts(0, 10 * flat, 120 + 10 * puff, 70 - 18 * flat + 14 * puff), 7, 7 * puff, true, 14);
  shp(c, [[110, 20], [190, 0], [230, -50 - 40 * puff], [214, -60 - 40 * puff], [180, -16], [110, -6]], C.cat, 6, 150, { corner: .3 });     // хвост
  shp(c, body, C.cat, 6, 151, { shade: q => { q.fillStyle = C.catSh; for (let k = 0; k < 4; k++) q.fillRect(-60 + k * 38, -80, 14, 70); } });
  shp(c, ellPts(-40, 34 - 10 * flat, 60, 26), C.catBelly, 0, 152);
  const hx = -110, hy = pose === 'sill' ? -20 : -30 + 24 * flat;
  at(c, hx, hy, 1, () => {
    const ear = flat ? [[-50, -30], [-90, -26], [-56, -6]] : [[-46, -40], [-40, -100], [-6, -56]];
    shp(c, ear, C.cat, 5, 153); shp(c, ear.map(([x, y]) => [-x, y]), C.cat, 5, 154);
    shp(c, ellPts(0, 0, 64, 54), C.cat, 6, 155);
    if (pose === 'sill') { inkLine(c, [[-34, -2], [-22, 4], [-10, -2]], 4, 156); inkLine(c, [[10, -2], [22, 4], [34, -2]], 4, 157); }
    else {
      for (const sx of [-1, 1]) { shp(c, ellPts(sx * 22, -4, 13, 16), '#f7f59a', 4, 158 + sx, { pressure: .2 }); c.fillStyle = INK; c.fillRect(sx * 22 - 2.5, -14, 5, 20); }
    }
    shp(c, [[-6, 12], [6, 12], [0, 19]], '#e0707a', 3, 160);
    if (pose === 'hiss') shp(c, [[-14, 24], [14, 24], [0, 40]], '#7a2b33', 3, 161);
    for (const sx of [-1, 1]) for (const k of [-1, 1]) inkLine(c, [[sx * 28, 18 + k * 4], [sx * 78, 12 + k * 12]], 2.5, 162 + sx + k * 3, false, { pressure: .9 });
  });
}

// ---------- текст ----------
function subtitle(c, text, y = 1560) {
  c.save(); c.font = '800 54px Rubik'; c.textAlign = 'center'; c.lineJoin = 'round';
  const lines = text.split('\n');
  lines.forEach((ln, k) => { const yy = y + k * 68; c.strokeStyle = INK; c.lineWidth = 14; c.strokeText(ln, CX, yy); c.fillStyle = '#fff'; c.fillText(ln, CX, yy); });
  c.restore();
}
function label(c, text, x, y, o = {}) {
  c.save(); c.font = `800 ${o.size || 46}px Rubik`; const w = c.measureText(text).width + 56, h = (o.size || 46) * 1.6;
  c.translate(x, y); c.rotate(o.rot ?? -.03);
  shp(c, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], o.bg || '#fffaf0', 5, 170, { corner: .2, pressure: .3 });
  c.fillStyle = o.color || INK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 3); c.restore();
}
