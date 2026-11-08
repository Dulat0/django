'use strict';
// Серия 5: фоны и эффекты. k — сила вспышки/удара 0..1.

const WIN = [120, 220, 840, 800];   // окно кухни: x, y, w, h

function cityOutside(c, k) {
  const [x, y, w, h] = WIN;
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, mix('#7fb3dc', '#fffbe6', k)); g.addColorStop(1, mix('#d8e9f4', '#ffe9a8', k));
  c.fillStyle = g; c.fillRect(x, y, w, h);
  if (k > 0) fireball(c, 820, 330, k);
  // трубы ТЭЦ с дымом
  for (const [tx, th] of [[250, 330], [330, 280]]) {
    shp(c, [[tx - 16, 1020], [tx - 10, 1020 - th], [tx + 10, 1020 - th], [tx + 16, 1020]], mix('#b9bfcc', '#fff3cf', k * .6), 4, tx);
    for (let j = 0; j < 4; j++) shp(c, ellPts(tx + 30 + j * 40, 1020 - th - 30 - j * 22, 34 + j * 10, 22 + j * 6), mix(C.smoke, '#fff8e0', k), 3, tx + j, { pressure: .2 });
  }
  // панельные дома
  const r = rng(12);
  for (const [bx, bw, bh] of [[110, 230, 330], [360, 200, 420], [580, 260, 300], [820, 180, 380]]) {
    const top = 1020 - bh, col = mix(C.block, '#fff1c9', k * .7);
    shp(c, [[bx, 1030], [bx, top], [bx + bw, top], [bx + bw, 1030]], col, 5, bx, { corner: .1,
      shade: q => { q.fillStyle = mix(C.blockSh, '#e7cf94', k * .7); q.fillRect(bx + bw * .72, top, bw, bh + 20); } });
    shp(c, [[bx - 6, top + 4], [bx + bw / 2, top - 16], [bx + bw + 6, top + 4], [bx + bw + 6, top + 14], [bx - 6, top + 14]], C.snow, 4, bx + 1, { corner: .3 });
    for (let yy = top + 34; yy < 1000; yy += 46) for (let xx = bx + 18; xx < bx + bw - 20; xx += 40) {
      c.fillStyle = r() < .25 ? C.winLit : mix('#6d7894', '#ffe7a0', k); c.fillRect(xx, yy, 22, 26);
    }
  }
  // снег на земле
  shp(c, [[100, 1000], [400, 985], [700, 1000], [980, 990], [980, 1040], [100, 1040]], C.snow, 0, 5);
}
function fireball(c, x, y, k) {
  c.save();
  // дымный след уходит влево-вверх
  for (let j = 11; j >= 0; j--) { const t = j / 11, px = lerp(x - 60, -40, t), py = lerp(y - 30, 60, t), rr = lerp(40, 110, t);
    shp(c, warp(ellPts(px, py, rr * 1.5, rr, -.3), 300 + j, rr * .12, true, 24), mix('#ffd9a0', '#f2ebe0', t), 4, 300 + j, { pressure: .3, color: alpha('#8a5a3a', .55) }); }
  glow(c, x, y, 700 * k, '#ffb347', 1); glow(c, x, y, 300, '#ffffff', 1);
  shp(c, warp(ellPts(x - 20, y - 8, 120, 70, -.3), 311, 14, true, 20), '#ff8a1f', 5, 309, { color: '#c4441a' });
  shp(c, ellPts(x, y, 62, 50, -.3), C.fireCore, 0, 310);
  speedLines(c, x - 70, y - 20, Math.PI - .3, 7, 10, .7, '#c4441a');
  c.restore();
}
function windowFrame(c) {
  const [x, y, w, h] = WIN, t = 30;
  c.save(); c.fillStyle = C.frame;
  const bars = [[x - t, y - t, w + 2 * t, t], [x - t, y + h, w + 2 * t, t], [x - t, y, t, h], [x + w, y, t, h], [x + w / 2 - t / 2, y + 200, t, h - 200], [x, y + 200 - t / 2, w, t]];
  bars.forEach(([bx, by, bw, bh], j) => { c.fillRect(bx, by, bw, bh); inkLine(c, rectPts(bx, by, bw, bh), 5, 400 + j, true, { pressure: .3 }); });
  c.restore();
}
function kitchen(c, k) {
  c.fillStyle = C.wall; c.fillRect(0, 0, W, H);
  hatchIn(c, rectPath(0, 0, W, 1500), [0, 0, W, 1500], { alpha: .07, angle: 1.57, gap: 26, len: 40 });
  c.save(); c.beginPath(); c.rect(...WIN); c.clip(); cityOutside(c, k); c.restore();
  windowFrame(c);
  // подоконник и цветок
  shp(c, [[70, 1050], [1010, 1050], [1030, 1090], [50, 1090]], C.frame, 5, 410, { corner: .2 });
  shp(c, [[820, 1050], [900, 1050], [890, 980], [830, 980]], '#d9663f', 5, 411, { corner: .2 });
  for (const a of [-.5, -.1, .3]) shp(c, ellPts(860 + a * 60, 930, 18, 46, a), '#5f9b4a', 4, 412 + a * 10);
  // часы
  shp(c, ellPts(980, 120, 52, 52), '#fffaf0', 5, 420); inkLine(c, [[980, 120], [980, 86]], 5, 421); inkLine(c, [[980, 120], [1004, 130]], 5, 422);
  // пол
  c.fillStyle = C.floor; c.fillRect(0, 1500, W, H - 1500);
  for (let j = 0; j < 6; j++) inkLine(c, [[0, 1520 + j * j * 18], [W, 1520 + j * j * 18]], 3, 430 + j, false, { color: alpha(INK, .35) });
  inkLine(c, [[0, 1500], [W, 1500]], 6, 440);
  if (k > 0) {   // тень от рамы на полу
    c.save(); c.globalAlpha = .25 * k; c.fillStyle = '#fff6c8';
    c.beginPath(); c.moveTo(120, 1500); c.lineTo(960, 1500); c.lineTo(1080, 1920); c.lineTo(0, 1920); c.fill(); c.restore();
  }
}
function table(c, k = 0) {
  for (const x of [200, 880]) limb(c, [[x, 1330], [x + (x < 540 ? -10 : 10), 1700]], 30, C.woodSh, 500 + x);
  shp(c, [[120, 1290], [960, 1290], [990, 1350], [90, 1350]], C.wood, 6, 510, { corner: .2,
    shade: q => { q.fillStyle = C.woodSh; q.fillRect(80, 1330, 940, 30); } });
  if (!k) {
    shp(c, ellPts(330, 1300, 90, 22), '#fffaf0', 5, 520);                                  // тарелка
    shp(c, [[690, 1220], [760, 1220], [754, 1300], [696, 1300]], '#e85d5d', 5, 521, { corner: .2 });   // кружка
    inkLine(c, [[760, 1240], [790, 1250], [786, 1280], [756, 1286]], 6, 522);
    for (const sx of [0, 1]) inkLine(c, [[712 + sx * 18, 1205], [706 + sx * 18, 1180], [716 + sx * 18, 1160]], 3, 523 + sx, false, { color: alpha(INK, .5) });
  } else {
    shp(c, [[690, 1290], [770, 1268], [784, 1300], [704, 1316]], '#e85d5d', 5, 524, { corner: .2 });  // кружка опрокинута
  }
}
function floorShadow(c, x, y, k) {
  c.save(); c.globalAlpha = .35 * k; c.fillStyle = '#3a2016';
  c.beginPath(); c.moveTo(x - 70, y); c.lineTo(x + 70, y); c.lineTo(x + 260, H); c.lineTo(x - 120, H); c.fill(); c.restore();
}
function roomLight(c, k) {   // пересвет: комната залита светом, края кадра выжжены
  c.save(); c.globalCompositeOperation = 'screen';
  const g = c.createRadialGradient(780, 380, 100, 540, 900, 1300); g.addColorStop(0, alpha('#fff4c4', .75 * k)); g.addColorStop(1, alpha('#ffcf6a', .18 * k));
  c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
}

// ---------- коридор ----------
function corridor(c, k) {
  c.fillStyle = '#c7b48a'; c.fillRect(0, 0, W, H);
  hatchIn(c, rectPath(0, 0, W, 1450), [0, 0, W, 1450], { alpha: .1, angle: 1.57, gap: 30, len: 50 });
  // вешалка с куртками
  inkLine(c, [[60, 360], [420, 360]], 10, 600);
  shp(c, [[90, 370], [190, 370], [210, 700], [70, 700]], '#7b4b8f', 5, 601);
  shp(c, [[250, 370], [360, 370], [380, 640], [240, 640]], '#c24c3c', 5, 602);
  // дверной проём на кухню: яркий свет и осколки
  const dx = 660, dy = 380, dw = 360, dh = 1080;
  c.save(); c.beginPath(); c.rect(dx, dy, dw, dh); c.clip();
  c.fillStyle = mix('#fff2c2', '#ffffff', k * .5); c.fillRect(dx, dy, dw, dh);
  glow(c, dx + dw / 2, dy + 300, 500, '#ffffff', 1); c.restore();
  shp(c, [[dx - 26, dy + dh], [dx - 26, dy - 26], [dx + dw + 26, dy - 26], [dx + dw + 26, dy + dh], [dx + dw, dy + dh], [dx + dw, dy], [dx, dy], [dx, dy + dh]], '#efe6d2', 5, 610, { corner: .1 });
  // пол
  c.fillStyle = '#8a5d40'; c.fillRect(0, 1450, W, H - 1450); inkLine(c, [[0, 1450], [W, 1450]], 6, 611);
  c.save(); c.globalAlpha = .3; c.fillStyle = '#fff3c0'; c.beginPath(); c.moveTo(dx, 1460); c.lineTo(dx + dw, 1460); c.lineTo(W + 100, H); c.lineTo(dx - 120, H); c.fill(); c.restore();
}
function shards(c, k) {
  const r = rng(77);
  for (let j = 0; j < 26; j++) {
    const x = 700 + r() * 380, y = 360 + r() * 800, s = 18 + r() * 34, a = r() * TAU;
    const p = [[0, -s], [s * .7, s * .4], [-s * .5, s * .6]].map(([px, py]) => [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)]);
    shp(c, p, alpha('#cfeaff', .85), 3, 700 + j, { corner: .1, pressure: .2 });
    if (j % 3 === 0) speedLines(c, x + 30, y, 0, 710 + j, 3, .45, INK);
  }
}
function boomText(c, t, x, y) {
  c.save(); c.translate(x, y); c.rotate(-.12); c.font = '800 150px Rubik'; c.textAlign = 'center'; c.lineJoin = 'round';
  c.strokeStyle = INK; c.lineWidth = 26; c.strokeText(t, 0, 0); c.fillStyle = '#ffcf33'; c.fillText(t, 0, 0);
  c.lineWidth = 0; c.restore();
}

// ---------- космос ----------
function space(c, k) {
  c.fillStyle = '#0c0f2b'; c.fillRect(0, 0, W, H);
  const r = rng(5); c.fillStyle = '#fff';
  for (let j = 0; j < 260; j++) { c.globalAlpha = .3 + r() * .7; c.fillRect(r() * W, r() * H, 2 + r() * 2.5, 2 + r() * 2.5); }
  c.globalAlpha = 1;
  // Земля
  glow(c, 540, 2700, 1500, '#5fb7ff', .9);
  const E = circPath(540, 2800, 1300); c.fillStyle = '#2f73c9'; c.fill(E);
  c.save(); c.clip(E);
  for (const [x, y, rx, ry] of [[300, 1620, 260, 90], [820, 1700, 220, 120], [520, 1820, 300, 110]]) shp(c, warp(ellPts(x, y, rx, ry), x, 18, true, 30), '#5ea85a', 5, x);
  for (const [x, y] of [[180, 1560], [700, 1580], [960, 1650]]) shp(c, ellPts(x, y, 120, 26), alpha('#ffffff', .8), 0, x);
  c.restore(); inkLine(c, ellPts(540, 2800, 1300, 1300, 0, 120), 7, 800, true);
  // астероид
  const A = warp(ellPts(600, 760, 330, 270, .3), 21, 34, true, 40);
  shp(c, A, '#8a7a6d', 7, 810, { shade: q => {
    hatchIn(q, rectPath(260, 480, 700, 600), [260, 480, 700, 600], { alpha: .35, angle: .5, gap: 10 });
    q.fillStyle = alpha('#2a2230', .45); q.beginPath(); q.ellipse(720, 860, 300, 260, .3, 0, TAU); q.fill(); } });
  for (const [x, y, rr] of [[520, 660, 50], [680, 820, 70], [460, 860, 34], [760, 620, 28]]) { shp(c, ellPts(x, y, rr, rr * .75, .3), '#6f6156', 4, x); }
  // аппарат-перехватчик
  at(c, 230, 1180, 1, () => {
    c.rotate(-.75);
    shp(c, [[-30, -60], [30, -60], [30, 60], [-30, 60]], '#e6e9ef', 5, 820, { corner: .2 });
    shp(c, [[-120, -20], [-34, -20], [-34, 20], [-120, 20]], '#3a5bd8', 4, 821, { corner: .1 });
    shp(c, [[34, -20], [120, -20], [120, 20], [34, 20]], '#3a5bd8', 4, 822, { corner: .1 });
    glow(c, 0, 90, 90, '#ff9b2e', 1); shp(c, [[-16, 62], [16, 62], [0, 140]], '#ffcf33', 3, 823);
  });
  c.save(); c.setLineDash([16, 18]); inkLine(c, [[270, 1130], [400, 1000], [470, 920]], 4, 830, false, { color: alpha('#ffffff', .7), pressure: 0 }); c.restore();
}
