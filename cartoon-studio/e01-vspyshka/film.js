'use strict';
// «Сигнал тревоги», серия 1 «Вспышка в небе». 162 с, 30 к/с, 1080×1920.
// Каждая сцена — чистая функция времени: scene(c, t, u), t — время фильма, u — время от начала сцены.

const FPS = 30, DUR = 162;
const pr = (t, a, b, e = easeIO) => e(clamp((t - a) / (b - a), 0, 1));
// время: сцены живут во времени сценария (t), экран — в реальном (растянуто там, где реплика длиннее места)
function warpF(x, inv = false) { const P = WARP, a = inv ? 1 : 0, b = inv ? 0 : 1;
  for (let i = 1; i < P.length; i++) if (x <= P[i][a] || i === P.length - 1) { const u = (x - P[i - 1][a]) / ((P[i][a] - P[i - 1][a]) || 1); return P[i - 1][b] + u * (P[i][b] - P[i - 1][b]); } return x; }
const toScreen = x => warpF(x), toScript = x => warpF(x, true);
const DUR_REAL = toScreen(DUR);
const VOI = Object.fromEntries(VO.map(v => [v.id, v]));
function speaking(who, t) { const r = toScreen(t); return VO.some(v => v.who === who && r >= v.at && r < v.at + v.dur); }
function flap(t, open = 'O', closed = 'neutral') { return noise1(t * 11, 3) > -.1 ? open : closed; }
function blink(t, off = 0) { return ((t + off) % 3.9) < .12; }
function wordAt(id, word) { const v = VOI[id], i = v.text.indexOf(word); return toScript(v.at + v.dur * Math.max(0, i) / v.text.length); }
function camera(c, x, y, z = 1, shake = 0, t = 0) {
  resetT(c); c.translate(W / 2 + noise1(t * 37, 1) * shake, H / 2 + noise1(t * 41, 2) * shake); c.scale(z, z); c.translate(-x, -y);
}
function shakeAt(t, t0, amp = 30, decay = 3) { return t < t0 ? 0 : amp * Math.exp(-(t - t0) * decay); }
function txt(c, s, x, y, size, color = INK, o = {}) {
  c.save(); c.font = `800 ${size}px Rubik`; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.globalAlpha *= o.alpha ?? 1;
  s.split('\n').forEach((ln, k) => { const yy = y + k * size * 1.18; if (o.stroke) { c.strokeStyle = o.stroke; c.lineWidth = size * .22; c.strokeText(ln, x, yy); } c.fillStyle = color; c.fillText(ln, x, yy); });
  c.restore();
}
function fade(c, a, col = '#000') { if (a <= 0) return; resetT(c); c.save(); c.globalAlpha = Math.min(1, a); c.fillStyle = col; c.fillRect(0, 0, W, H); c.restore(); }
function paperBg(c, col = '#f4ecdc') { resetT(c); c.fillStyle = col; c.fillRect(0, 0, W, H); grain(c, rectPath(0, 0, W, H), [0, 0, W, H], 2200, '#7a6a50', .07, 9, 2); }

// ---------- иконки (вписаны в квадрат ~160 вокруг x,y) ----------
const RED = '#d63a2f', GREEN = '#3c9a5a';
function cross(c, x, y, r = 70) { c.save(); c.strokeStyle = RED; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.moveTo(x + r, y - r); c.lineTo(x - r, y + r); c.stroke(); c.restore(); }
function check(c, x, y, r = 60) { c.save(); c.strokeStyle = GREEN; c.lineWidth = 16; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x - r * .3, y + r * .7); c.lineTo(x + r, y - r * .7); c.stroke(); c.restore(); }
const ICON = {
  window(c, x, y) { shp(c, rectPts(x - 60, y - 70, 120, 140), '#cfe6f3', 6, 1001, { corner: .1 }); inkLine(c, [[x, y - 70], [x, y + 70]], 6, 1002); inkLine(c, [[x - 60, y - 20], [x + 60, y - 20]], 6, 1003); cross(c, x, y, 64); },
  corridor(c, x, y) { shp(c, rectPts(x - 50, y - 75, 100, 150), '#b9845a', 6, 1004, { corner: .1 }); c.fillStyle = INK; c.beginPath(); c.arc(x + 28, y, 7, 0, TAU); c.fill(); inkLine(c, [[x - 110, y + 40], [x - 64, y + 40]], 8, 1005); inkLine(c, [[x - 80, y + 22], [x - 62, y + 40], [x - 80, y + 58]], 8, 1006); },
  cover(c, x, y) { shp(c, ellPts(x, y - 10, 34, 38), C.skin, 5, 1007); shp(c, rectPts(x - 46, y + 30, 92, 50), C.hoodie, 5, 1008, { corner: .3 });
    for (const sx of [-1, 1]) { taper(c, [[sx * 46 + x, y + 36], [sx * 66 + x, y - 30], [sx * 16 + x, y - 54]], [20, 18, 16], C.hoodie, 1009 + sx); } },
  eye(c, x, y) { shp(c, [[x - 70, y], [x, y - 40], [x + 70, y], [x, y + 40]], '#fff', 6, 1011, { corner: .6 }); c.fillStyle = '#5b7a3c'; c.beginPath(); c.arc(x, y, 22, 0, TAU); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(x, y, 10, 0, TAU); c.fill();
    glow(c, x + 60, y - 60, 60, '#ffd56a', 1); c.save(); c.strokeStyle = RED; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 70, y + 60); c.lineTo(x + 70, y - 60); c.stroke(); c.restore(); },
  shoe(c, x, y) { shp(c, [[x - 70, y + 30], [x - 70, y - 20], [x - 20, y - 30], [x + 10, y], [x + 70, y + 10], [x + 74, y + 40], [x - 70, y + 40]], '#e9e3d6', 6, 1012, { corner: .5 }); inkLine(c, [[x - 70, y + 30], [x + 74, y + 30]], 4, 1013); for (let k = 0; k < 3; k++) inkLine(c, [[x - 30 + k * 14, y - 22], [x - 20 + k * 14, y - 4]], 3, 1014 + k); },
  glass(c, x, y) { shp(c, [[x, y - 70], [x + 74, y + 60], [x - 74, y + 60]], '#ffd34d', 6, 1017, { corner: .2 }); txt(c, '!', x, y + 14, 80, INK); for (const [dx, dy, a] of [[-80, -40, .4], [84, -30, -.5], [-70, 70, 1]]) shp(c, [[x + dx, y + dy - 18], [x + dx + 20, y + dy + 10], [x + dx - 14, y + dy + 14]], '#cfe9f7', 3, 1018 + dx); },
  gas(c, x, y) { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; shp(c, [[x + Math.cos(a) * 30, y + 20], [x + Math.cos(a) * 50, y - 40 - 20 * Math.sin(a * 3)], [x + Math.cos(a) * 8, y - 10]], '#4f8fe0', 3, 1020 + k, { corner: .6 }); } shp(c, ellPts(x, y + 40, 70, 18), '#555', 5, 1026); },
  phone112(c, x, y) { shp(c, rectPts(x - 50, y - 80, 100, 160), '#2b2f3a', 6, 1027, { corner: .2 }); c.fillStyle = '#e8f4ff'; c.fillRect(x - 38, y - 64, 76, 116); txt(c, '112', x, y - 6, 40, RED); },
  radio(c, x, y) { shp(c, rectPts(x - 76, y - 40, 152, 100), '#d9a441', 6, 1028, { corner: .2 }); inkLine(c, [[x + 40, y - 40], [x + 76, y - 100]], 5, 1029); shp(c, ellPts(x - 34, y + 10, 26, 26), '#555', 4, 1030); txt(c, 'МЧС', x + 34, y + 10, 26, INK); },
  flash(c, x, y) { glow(c, x, y, 120, '#ffd56a', 1); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; inkLine(c, [[x + Math.cos(a) * 46, y + Math.sin(a) * 46], [x + Math.cos(a) * 78, y + Math.sin(a) * 78]], 7, 1031 + k, false, { color: '#e08a1e' }); } shp(c, ellPts(x, y, 38, 38), '#ffe58a', 5, 1042); },
  water(c, x, y) { shp(c, [[x - 26, y - 50], [x + 26, y - 50], [x + 30, y + 70], [x - 30, y + 70]], '#bfe3f7', 5, 1043, { corner: .4 }); shp(c, rectPts(x - 14, y - 72, 28, 22), '#2f73c9', 4, 1044, { corner: .2 }); },
  docs(c, x, y) { shp(c, rectPts(x - 46, y - 64, 92, 128), '#8e2f45', 5, 1045, { corner: .2 }); shp(c, ellPts(x, y - 14, 22, 22), '#e8c35a', 3, 1046); txt(c, 'ПАСПОРТ', x, y + 36, 15, '#e8c35a'); },
  aid(c, x, y) { shp(c, rectPts(x - 60, y - 50, 120, 100), '#f4f1ea', 6, 1047, { corner: .2 }); c.fillStyle = RED; c.fillRect(x - 12, y - 34, 24, 68); c.fillRect(x - 34, y - 12, 68, 24); },
  torch(c, x, y) { shp(c, [[x - 70, y - 18], [x + 20, y - 18], [x + 50, y - 34], [x + 50, y + 34], [x + 20, y + 18], [x - 70, y + 18]], '#3a3f4a', 5, 1048, { corner: .2 }); glow(c, x + 90, y, 70, '#fff2b0', 1); },
};

// ---------- карточка «как правильно» ----------
function rulesCard(c, t, title, items, o = {}) {
  paperBg(c, o.bg || '#f4ecdc');
  txt(c, title, CX, 230, 66, o.titleColor || INK);
  inkLine(c, [[260, 290], [820, 292]], 6, 1100, false, { color: o.titleColor || RED });
  const y0 = o.y0 || 450, step = o.step || 225;
  items.forEach((it, k) => {
    const a = pr(t, it.at, it.at + .45, easeOutBack); if (a <= 0) return;
    const y = y0 + k * step, x = 190 + (1 - a) * 700;
    c.save(); c.globalAlpha = clamp(a, 0, 1);
    shp(c, ellPts(x, y, 92, 92), '#fffaf0', 5, 1110 + k);
    c.save(); c.translate(x, y); c.scale(.9, .9); c.translate(-x, -y); it.icon(c, x, y); c.restore();
    if (it.n) txt(c, String(it.n), x - 80, y - 80, 40, '#fff', { stroke: RED });
    txt(c, it.text, x + 130, y, 46, INK, { align: 'left' });
    c.restore();
  });
}

// ================= СЦЕНЫ =================
// 1. 0–8.5: зацепка
function s1(c, t) {
  BALL = .55; kitchen(c, 1); roomLight(c, 1);
  at(c, 560, 1500, 1, () => temaBack(c, 1));
  resetT(c); c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = '#4a3a52'; c.globalAlpha = .55; c.fillRect(0, 0, W, H); c.restore();
  glow(c, 760, 330, 500, '#fff1b8', 1);
  fade(c, 1 - pr(t, .5, 1.6), '#fff'); fade(c, 1 - pr(t, 0, .5), '#000');
  const a1 = pr(t, .9, 1.4), a2 = pr(t, 3.3, 3.7, easeOutBack), a3 = pr(t, 5.1, 5.6);
  txt(c, 'Если небо вспыхнуло\nярче солнца —', CX, 1180, 62, '#fff', { stroke: INK, alpha: a1 });
  if (a2 > 0) { c.save(); c.translate(CX, 1420); c.scale(a2, a2); c.rotate(-.04); txt(c, 'НЕ ПОДХОДИ\nК ОКНУ', 0, 0, 104, RED, { stroke: '#fff' }); c.restore(); }
  txt(c, 'Самое опасное придёт\nчерез минуту', CX, 1720, 50, '#fff', { stroke: INK, alpha: a3 });
  fade(c, pr(t, 8.2, 8.6), '#000');
}
// 2. 8.5–22: обычное утро
function s2(c, t, u) {
  if (u < 2.8) {   // снаружи: двор, камера наезжает на окно
    const z = lerp(1, 1.7, pr(u, 0, 2.8, easeInOutSine));
    camera(c, 540, 1000, z); BALL = 0; cityOutside(c, 0, [-200, -100, 1480, 2200], false);
    fade(c, 1 - pr(u, 0, .5), '#000');
    resetT(c); label(c, 'Челябинск · 15 февраля 2013 · 9:20', CX, 230, { size: 40 });
    fade(c, pr(u, 2.4, 2.8), '#fff'); return;
  }
  const v = u - 2.8; BALL = 0;
  camera(c, 560, 960, lerp(1.12, 1.0, pr(v, 0, 8.2, easeInOutSine)));
  kitchen(c, 0);
  at(c, 380, 1040, .5, () => bublik(c, 'sill'));
  const chew = speaking('N', t) ? (Math.floor(t * 4) % 2 ? 'chew' : 'neutral') : 'chew';
  at(c, 600, 1290 + Math.sin(t * 2) * 2, 1, () => temaSit(c, { eyes: blink(t) ? 'shut' : 'open', look: [.6, .3], mouth: chew, brows: 'calm' }));
  table(c);
  const vx = lerp(860, 1350, pr(t, 22.2, 23.8, easeInOutSine)), step = t > 22.2 && t < 23.8 ? Math.abs(Math.sin(t * 9)) * -12 : 0;
  at(c, vx, 1800 + step, 1.05, () => veraShout(c, { eyes: blink(t, 1.3) ? 'shut' : 'open', look: [-1, .2], brows: 'calm', mouth: 'smile' }, 0));
  fade(c, 1 - pr(v, 0, .4), '#fff');
}
// заставка сериала
function sTitle(c, t, u) {
  resetT(c); c.fillStyle = '#140d14'; c.fillRect(0, 0, W, H);
  for (let k = 0; k < 2; k++) { const a = u * 3.2 + k * Math.PI; c.save(); c.translate(CX, 640); c.rotate(a); c.globalCompositeOperation = 'screen';
    const g = c.createLinearGradient(0, 0, 1400, 0); g.addColorStop(0, alpha('#ff2a2a', .55)); g.addColorStop(1, alpha('#ff2a2a', 0)); c.fillStyle = g;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(1400, -260); c.lineTo(1400, 260); c.fill(); c.restore(); }
  glow(c, CX, 640, 160, '#ff5a4a', 1); shp(c, ellPts(CX, 640, 70, 70), '#ff4a3a', 6, 1700, { color: '#fff' });
  const a = pr(u, .2, .7, easeOutBack); c.save(); c.translate(CX, 1000); c.scale(a, a); txt(c, 'СИГНАЛ\nТРЕВОГИ', 0, 0, 150, '#fff', { stroke: '#c0172b' }); c.restore();
  txt(c, 'СЕРИЯ 1', CX, 1330, 50, '#e8c35a', { alpha: pr(u, 1.2, 1.6) });
  txt(c, '«Вспышка в небе»', CX, 1410, 60, '#fff', { alpha: pr(u, 1.6, 2.0) });
  fade(c, 1 - pr(u, 0, .3), '#000'); fade(c, pr(u, 4.0, 4.4), '#000');
}
// 3. 22–40.3: вспышка
function s3(c, t, u) {
  const k = pr(t, 25, 27.5); BALL = lerp(.05, .75, pr(t, 24.4, 35, x => x));
  if (u < 5) {   // кухня заливается светом
    camera(c, 560, 960, 1, shakeAt(t, 26, 6, 1));
    kitchen(c, k); roomLight(c, k);
    at(c, 380, 1040, .5, () => bublik(c, u > 2.5 ? 'hiss' : 'sill'));
    at(c, 600, 1290, 1, () => temaSit(c, { eyes: u > 2.6 ? 'wide' : 'open', look: [.6, -1], mouth: u > 2.6 ? 'O' : 'chew', brows: u > 2.6 ? 'up' : 'calm' }));
    table(c); return;
  }
  if (u < 7) {   // крупно: удивление («тук»)
    camera(c, 600, 900, lerp(2.2, 2.5, pr(u, 5, 7)), shakeAt(u, 5, 8, 5), t);
    kitchen(c, 1); roomLight(c, 1);
    at(c, 600, 1290, 1, () => temaSit(c, { eyes: 'wide', look: [.9, -1], mouth: 'O', brows: 'up' }));
    resetT(c); for (let j = 0; j < 8; j++) { const a = j / 8 * TAU, r0 = 330 + pr(u, 5, 5.4) * 60; inkLine(c, [[CX + Math.cos(a) * r0, 860 + Math.sin(a) * r0], [CX + Math.cos(a) * (r0 + 60), 860 + Math.sin(a) * (r0 + 60)]], 8, 1200 + j, false, { color: alpha('#fff', 1 - pr(u, 5.4, 6.4)) }); }
    return;
  }
  // у окна, рука с телефоном; затем камера через плечо
  const v = u - 7, z = lerp(1, 1.75, pr(v, 4, 11.3, easeInOutSine));
  camera(c, 560, lerp(960, 640, pr(v, 4, 11.3, easeInOutSine)), z, 4, t);
  kitchen(c, 1); roomLight(c, 1); floorShadow(c, 560, 1500, 1);
  at(c, 560, 1500, 1, () => temaBack(c, pr(v, .2, 1.2, easeOutBack)));
  table(c, 1);
  at(c, 860, 1820, .55, () => bublik(c, 'hiss'));
}
// 4. 40.3–59.4: стоп, разбор, факты
function s4(c, t, u) {
  if (u < 2.2) {   // стоп-кадр
    BALL = .75; camera(c, 560, 640, 1.75); kitchen(c, 1); roomLight(c, 1); at(c, 560, 1500, 1, () => temaBack(c, 1)); table(c, 1);
    resetT(c); c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = '#888'; c.fillRect(0, 0, W, H); c.restore();
    const a = pr(u, .1, .45, easeOutBack); c.save(); c.translate(CX, 760); c.rotate(-.12); c.scale(a, a);
    shp(c, rectPts(-330, -90, 660, 180), alpha('#fff', .85), 10, 1300, { color: RED, corner: .1 }); txt(c, 'ОШИБКА', 0, 6, 120, RED); c.restore(); return;
  }
  if (u < 11.2) {   // схема: свет мгновенно, волна — минуты
    const v = u - 2.2; paperBg(c, '#eaf2f7');
    const gy = 1360, ex = 200, ey = 430, cx2 = 860;
    c.fillStyle = '#d8e6c8'; c.fillRect(0, gy, W, H - gy); inkLine(c, [[0, gy], [W, gy]], 6, 1310);
    for (let j = 0; j < 5; j++) shp(c, rectPts(740 + j * 46, gy - 60 - (j % 3) * 30, 40, 60 + (j % 3) * 30), '#b3b9c8', 4, 1311 + j, { corner: .1 });
    txt(c, 'город', cx2, gy + 50, 38);
    ICON.flash(c, ex, ey); txt(c, 'взрыв высоко\nв небе', ex + 60, ey + 150, 36);
    const lr = pr(v, .3, .6);   // свет
    c.save(); c.strokeStyle = '#f2b51e'; c.lineWidth = 8; c.setLineDash([24, 14]); c.beginPath(); c.moveTo(ex + 50, ey + 30); c.lineTo(lerp(ex + 50, cx2, lr), lerp(ey + 30, gy - 120, lr)); c.stroke(); c.restore();
    txt(c, 'свет — мгновенно', 640, 560, 44, '#c98a00', { alpha: pr(v, .5, .9) });
    const D = Math.hypot(cx2 - ex, gy - 100 - ey), wr = D * pr(v, 1.5, 9.5, x => x);   // волна
    c.save(); c.beginPath(); c.rect(0, 0, W, gy); c.clip();
    for (let j = 0; j < 3; j++) { const r = wr - j * 26; if (r <= 0) continue; c.strokeStyle = alpha('#3a6fd8', .8 - j * .25); c.lineWidth = 10 - j * 3; c.beginPath(); c.arc(ex, ey, r, 0, TAU); c.stroke(); }
    c.restore();
    txt(c, 'ударная волна —\nсо скоростью звука', 330, 1000, 44, '#2b58b8', { alpha: pr(v, 1.6, 2.2) });
    const secs = Math.round(pr(v, 1.5, 9.5, x => x) * 140);
    shp(c, rectPts(640, 760, 340, 120), '#fffaf0', 5, 1320, { corner: .2 }); txt(c, `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, 810, 822, 80, '#2b58b8');
    txt(c, 'до удара по окнам', 810, 920, 34, INK);
    return;
  }
  const v = u - 11.2; paperBg(c, '#f6e9e4');   // факты 2013 года
  const n = Math.round(pr(v, .2, 2.2, easeOutExpo) * 1500);
  txt(c, '15 февраля 2013', CX, 330, 48, INK);
  txt(c, '≈' + n.toLocaleString('ru-RU'), CX, 620, 190, RED);
  txt(c, 'человек пострадали', CX, 790, 58, INK);
  const a = pr(v, 3.6, 4.2); c.save(); c.globalAlpha = a; ICON.glass(c, CX, 1060); txt(c, 'большинство —\nпорезы осколками стекла', CX, 1300, 52, INK); c.restore();
}
// 5. 59.4–76.5: перемотка, Вера, правила
function s5(c, t, u) {
  if (u < 1.4) {   // перемотка назад по сцене 3
    const tb = 40.9 - u * 11; s3(c, tb, tb - 24);
    resetT(c); c.save(); c.globalAlpha = .25; c.fillStyle = '#000'; for (let y = (t * 900) % 24; y < H; y += 24) c.fillRect(0, y, W, 6); c.restore();
    txt(c, '◀◀', CX, 300, 140, '#fff', { stroke: INK }); return;
  }
  if (u < 3.8) {   // Вера вбегает
    const v = u - 1.4; BALL = .6; camera(c, 560, 960, 1);
    kitchen(c, .6); roomLight(c, .6);
    at(c, 470, 1500, .95, () => temaBack(c, 1));
    table(c, 1);
    const x = lerp(1250, 830, pr(v, 0, .7, easeOutQuint)), bob = v < .7 ? Math.abs(Math.sin(v * 18)) * -18 : 0;
    const talk = speaking('V', t);
    at(c, x, 1840 + bob, 1.12, () => veraShout(c, { eyes: blink(t, 1) ? 'shut' : 'wide', look: [-1, 0], brows: 'urgent', mouth: talk ? flap(t, 'shout', 'O') : 'tense' }, pr(v, .5, .9, easeOutBack)));
    return;
  }
  rulesCard(c, t, 'КАК ПРАВИЛЬНО', [
    { at: wordAt('n09', 'Первое'), icon: ICON.window, text: 'Сразу уйди\nот окон', n: 1 },
    { at: wordAt('n09', 'Второе'), icon: ICON.corridor, text: 'В коридор или комнату\nбез окон, к стене', n: 2 },
    { at: wordAt('n09', 'Третье'), icon: ICON.cover, text: 'Пригнись\nи закрой голову', n: 3 },
    { at: wordAt('n09', 'Четвёртое'), icon: ICON.eye, text: 'Не смотри\nна вспышку', n: 4 }]);
}
// 6. 76.5–95.3: ожидание, удар
function s6(c, t, u) {
  const B = 86.8;
  if (t < B) {
    const breath = Math.sin(t * 3) * 3;
    camera(c, 470, 1100, lerp(1.0, 1.45, pr(t, 75.5, 85.5, easeInOutSine)));
    corridor(c, 0);
    const vt = speaking('V', t), tt = speaking('T', t);
    at(c, 300, 1560 + breath, 1.05, () => veraCrouch(c, { eyes: vt || (t > 81.6 && t < 84.2) ? 'open' : 'shut', look: [1, .3], mouth: vt ? flap(t, 'O', 'neutral') : 'tense', brows: 'worry' }));
    at(c, 560, 1580 - breath, 1.0, () => temaCrouch(c, { eyes: tt ? 'squint' : (blink(t, 2) ? 'shut' : (t > 84 ? 'shut' : 'squint')), look: [-.8, 0], mouth: tt ? flap(t, 'O', 'tense') : 'tense', brows: 'worry' }));
    at(c, 430, 1700, .5, () => bublik(c, 'flat'));
    resetT(c);
    if (t < 85.5) { label(c, 'проходит минута…', CX, 230, { size: 40 }); }
    return;
  }
  if (t < 90.5) {   // крупный план: окно выбивает (замедленно)
    const v = (t - B) / 3.7;
    camera(c, 540, 960, 1, shakeAt(t, B, 40, 2.5), t);
    windowBlast(c, pr(v, 0, 1, x => Math.pow(x, .8)) * .95);
    resetT(c); label(c, 'замедленно', 880, 1520, { size: 30, rot: .03 });
    fade(c, 1 - pr(t, B, B + .25), '#fff'); return;
  }
  const v = (t - 90.5) / 1.8;   // коридор: осколки летят из проёма
  camera(c, 540, 1050, 1.1, shakeAt(t, 90.5, 24, 2), t);
  const imp = corridor(c, 1);
  at(c, 300, 1560, 1.05, () => veraCrouch(c, { eyes: 'shut', mouth: 'tense', brows: 'worry' }));
  at(c, 560, 1580, 1.0, () => temaCrouch(c, { eyes: 'shut', mouth: 'tense', brows: 'worry' }));
  at(c, 430, 1700, .5, () => bublik(c, 'flat'));
  drawShards(c, shardsOf([imp[0] - 120, imp[1] - 160, 240, 300], imp, 90), imp, .3 + v * .5, { spread: 700, fall: 300 });
  dust(c, 860, 900, 260, .3 + v * .6, 92);
}
// 7. 95.3–115.5: после волны
function s7(c, t, u) {
  if (u < 3.7) {
    camera(c, 540, 1050, 1.1, shakeAt(u, 0, 6, 3), t);
    corridor(c, 1);
    const down = u > 1.2, look = u > 2 ? [.9, .2] : [0, 0];
    at(c, 300, 1560, 1.05, () => veraCrouch(c, { eyes: down ? (blink(t) ? 'shut' : 'open') : 'shut', look, mouth: speaking('N', t) ? 'neutral' : 'tense', brows: 'worry' }, down));
    at(c, 560, 1580, 1.0, () => temaCrouch(c, { eyes: u > 1.6 ? 'open' : 'shut', look: [-.8, .2], mouth: 'tense', brows: 'worry' }, u > 1.6));
    at(c, 430, 1700, .5, () => bublik(c, u > 2.4 ? 'hiss' : 'flat'));
    resetT(c); dust(c, 860, 900, 300, .9 + u * .1, 92); return;
  }
  rulesCard(c, t, 'ПОСЛЕ УДАРА', [
    { at: wordAt('n12', 'Надень'), icon: ICON.shoe, text: 'Надень обувь —\nвезде стекло' },
    { at: wordAt('n12', 'Не подходи'), icon: ICON.glass, text: 'Не подходи\nк разбитым окнам' },
    { at: wordAt('n12', 'Проверь'), icon: ICON.gas, text: 'Проверь, нет ли\nзапаха газа' },
    { at: wordAt('n12', 'Если кто-то'), icon: ICON.phone112, text: 'Есть раненые —\nзвони 112' },
    { at: wordAt('n12', 'И слушай'), icon: ICON.radio, text: 'Слушай МЧС,\nа не слухи' }], { y0: 430, step: 215 });
}
// 8+. финал-крючок
function darkCorridor(c, d = .4) { resetT(c); c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = mix('#ffffff', '#3a3f66', d); c.fillRect(0, 0, W, H); c.restore(); }
function phoneScreen(c, t, noNet) {
  paperBg(c, '#1a1620');
  shp(c, rectPts(220, 260, 640, 1260), '#111318', 10, 1800, { corner: .08, color: '#000' });
  c.fillStyle = '#20324f'; c.fillRect(250, 300, 580, 1180);
  for (let k = 0; k < 4; k++) { c.fillStyle = noNet ? alpha('#ffffff', .25) : '#fff'; c.fillRect(290 + k * 18, 350 - k * 8, 12, 12 + k * 8); }
  if (noNet) cross(c, 320, 345, 30);
  txt(c, '10:01', 760, 345, 30, '#fff');
  shp(c, ellPts(CX, 640, 120, 120), '#c99b8a', 5, 1801); txt(c, 'М', CX, 646, 110, '#fff');
  txt(c, 'Мама', CX, 860, 70, '#fff');
  if (!noNet) txt(c, 'Вызов' + '.'.repeat(1 + Math.floor(t * 3) % 3), CX, 950, 44, '#b9d0f0');
  else { const a = pr(t, 114.8, 115.1, easeOutBack); c.save(); c.translate(CX, 960); c.scale(a, a); txt(c, 'НЕТ СЕТИ', 0, 0, 76, '#ff5a4a'); c.restore(); }
  shp(c, ellPts(CX, 1330, 70, 70), '#e0443a', 5, 1802); inkLine(c, [[CX - 34, 1336], [CX + 34, 1336]], 12, 1803, false, { color: '#fff' });
}
function corridorPair(c, t, zx, zy, z, look = [1, .3], tLook = [.3, 1]) {
  const tf = { eyes: blink(t, 2) ? 'shut' : 'open', look: tLook, mouth: speaking('T', t) ? flap(t, 'O', 'neutral') : 'tense', brows: 'worry' };
  const vf = { eyes: blink(t, 1) ? 'shut' : 'open', look, mouth: speaking('V', t) ? flap(t, 'O', 'neutral') : 'tense', brows: 'worry' };
  camera(c, zx, zy, z); corridor(c, 0);
  at(c, 300, 1560, 1.05, () => veraCrouch(c, vf, true));
  at(c, 560, 1580, 1.0, () => temaCrouch(c, tf, true));
  at(c, 430, 1700, .5, () => bublik(c, 'sill'));
  at(c, 610, 1255, 1, () => { c.rotate(-.25); shp(c, rectPts(-26, -52, 52, 98), '#22252e', 4, 1810, { corner: .2 }); c.fillStyle = '#9fc4f0'; c.fillRect(-20, -44, 40, 80); });
  darkCorridor(c, .45);
}
// 8. 110.5–124: нет сети, сирена
function s8(c, t, u) {
  if (t < 113) { corridorPair(c, t, 470, 1150, lerp(1.1, 1.3, pr(t, 110.5, 113))); return; }
  if (t < 116.2) { phoneScreen(c, t, t > 114.8); return; }
  if (t < 118.6) { corridorPair(c, t, 430, 1060, lerp(2.0, 2.1, pr(t, 116.2, 118.6))); return; }
  const sir = .5 + .5 * Math.sin(t * 5);   // сирена: красные отсветы
  corridorPair(c, t, 470, 1100, lerp(1.4, 1.6, pr(t, 118.6, 123)), [1, -.3], [1, -.3]);
  resetT(c); c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = alpha('#ff2a2a', .22 * sir); c.fillRect(0, 0, W, H); c.restore();
  fade(c, pr(t, 123.2, 124), '#fff');
}
// 9. 124–147: улица — больные соседи, спасатели, автобус
const NEIGH = [
  { x: 450, y: 1600, s: .62, o: { coat: '#5a4a3a', coatSh: '#433629', pants: '#33333c', hat: '#3a3a44', pose: 'cough', f: { eyes: 'squint', brows: 'worry', mouth: 'tense' } } },
  { x: 880, y: 1520, s: .56, o: { coat: '#7a3d52', coatSh: '#5c2c3d', hat: '#d9d2c4', female: true, f: { eyes: 'open', look: [-1, 0], brows: 'worry', mouth: 'O' }, k: 1 } },
  { x: 700, y: 1660, s: .66, o: { coat: '#40566b', coatSh: '#2f4152', hair: '#bdbdbd', f: { eyes: 'squint', brows: 'worry', mouth: 'tense' } } },
];
function s9(c, t, u) {
  if (t < 128.4) {   // общий план двора
    camera(c, 540, 1100, lerp(1.0, 1.12, pr(t, 124, 128.4)));
    yard(c, t, { doorOpen: true });
    for (const n of NEIGH) at(c, n.x, n.y, n.s, () => person(c, { ...n.o, k: n.o.k ? pr(t, 124, 126) : (n.o.pose === 'cough' ? 1 : 0) }));
    at(c, 140, 1260, .42, () => temaStand(c, { eyes: 'wide', look: [1, 0], brows: 'up', mouth: 'O' }));
    at(c, 250, 1250, .42, () => veraShout(c, { eyes: 'open', look: [1, 0], brows: 'worry', mouth: 'tense' }, 0));
    fade(c, 1 - pr(t, 124, 124.6), '#fff'); return;
  }
  if (t < 131.5) {   // крупно: сосед кашляет кровью
    const n = NEIGH[0]; camera(c, n.x + 20, n.y - 430 * n.s, 2.6, 3 + 6 * Math.max(0, Math.sin(t * 9)), t);
    yard(c, t, { doorOpen: true }); at(c, n.x, n.y, n.s, () => person(c, { ...n.o, k: 1 }));
    return;
  }
  if (t < 137) {   // спасатель с дозиметром, подъезжает автобус
    camera(c, 540, 1060, 1.15); yard(c, t, { doorOpen: true });
    bus(c, lerp(1300, 560, pr(t, 131.5, 135.5, easeOutQuint)), 1500, .62);
    for (const n of NEIGH.slice(1)) at(c, n.x - 120, n.y, n.s, () => person(c, { ...n.o, k: 1 }));
    at(c, 330, 1760, 1.0, () => rescuer(c, { dose: pr(t, 131.5, 136.5, x => x) }));
    return;
  }
  if (t < 139.4) {   // Вере плохо
    camera(c, 540, 1020, 2.2); yard(c, t, { doorOpen: true });
    at(c, 540, 1820, 1.2, () => veraShout(c, { eyes: blink(t, .4) ? 'shut' : 'squint', look: [0, .3], brows: 'worry', mouth: speaking('V', t) ? flap(t, 'O', 'neutral') : 'tense', k: pr(t, 137.4, 138.8) }, 0));
    return;
  }
  if (t < 141) {   // Тёма: «Вера?!»
    camera(c, 540, 1050, 2.4, shakeAt(t, 139.5, 8, 4), t); yard(c, t, { doorOpen: true });
    at(c, 540, 1760, 1.05, () => temaStand(c, { eyes: 'wide', look: [-1, 0], brows: 'up', mouth: speaking('T', t) ? 'shout' : 'O', armsUp: .3 }));
    return;
  }
  if (t < 144.2) {   // спасатель уводит Веру к автобусу
    camera(c, 560, 1180, 1.05); yard(c, t, { doorOpen: true });
    bus(c, 560, 1500, .62);
    const vx = lerp(560, 900, pr(t, 141.6, 144.2, easeInOutSine));
    at(c, vx, 1720, .78, () => veraShout(c, { eyes: 'squint', look: [-1, 0], brows: 'worry', mouth: 'tense', k: 1 }, 0));
    at(c, 260, 1800, .85, () => temaStand(c, { eyes: 'wide', look: [1, 0], brows: 'worry', mouth: 'O', armsUp: .4 }));
    at(c, 540, 1800, .9, () => rescuer(c, { point: true }));
    return;
  }
  // автобус уезжает, Вера у окна
  const bx = lerp(80, 1300, pr(t, 145, 147, easeIn));
  camera(c, 540, 1100, 1.1, 4, t); yard(c, t, { doorOpen: true });
  bus(c, bx, 1560, .9, (q, i, x, y) => { if (i === 2) { veraHead(q, x, y + 20, { eyes: 'open', look: [-1, 0], brows: 'worry', mouth: 'O', k: 1 }, .9); hand(q, x - 40, y + 40, 18, 0, 2300); } else if (i % 2) shp(q, ellPts(x, y + 40, 40, 50), '#d9a888', 3, 2301 + i); });
  at(c, 240, 1880, .9, () => temaStand(c, { eyes: 'wide', look: [1, 0], brows: 'worry', mouth: speaking('T', t) ? 'shout' : 'O', armsUp: .7 }));
}
// 10. 147–156: Тёма один
function s10(c, t, u) {
  const z = lerp(2.0, 1.0, pr(t, 147, 153.4, easeInOutSine));
  camera(c, 540, lerp(1150, 1050, pr(t, 147, 153.4)), z); yard(c, t, { doorOpen: true });
  at(c, 540, 1600, .9, () => { temaStand(c, { eyes: blink(t) ? 'shut' : 'open', look: [.6, 0], brows: 'worry', mouth: 'tense' }); at(c, 0, -470, .45, () => bublik(c, 'flat')); });
  resetT(c); const g = c.createRadialGradient(CX, 960, 260, CX, 960, 1100); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, alpha('#000', .85 * pr(t, 150, 155)));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const a = pr(t, 153.4, 154, easeOutBack); if (a > 0) { c.save(); c.translate(CX, 360); c.scale(a, a); txt(c, 'ЧТО ТЫ\nБУДЕШЬ ДЕЛАТЬ?', 0, 0, 92, '#fff', { stroke: '#c0172b' }); c.restore(); }
  fade(c, pr(t, 155.6, 156), '#000');
}
// 11. 156–162: продолжение следует
function s11(c, t, u) {
  resetT(c); c.fillStyle = '#140d14'; c.fillRect(0, 0, W, H);
  txt(c, 'СИГНАЛ ТРЕВОГИ', CX, 230, 52, '#ff5a4a');
  txt(c, 'ПРОДОЛЖЕНИЕ СЛЕДУЕТ…'.slice(0, Math.floor(pr(u, .2, 1.4, x => x) * 20)), CX, 470, 62, '#fff');
  const a = pr(u, 1.2, 1.7, easeOutBack); c.save(); c.globalAlpha = clamp(a, 0, 1);
  txt(c, 'СЕРИЯ 2', CX, 700, 50, '#e8c35a'); txt(c, '«Не беги»', CX, 800, 96, '#fff');
  c.restore();
  const b = pr(u, 2.4, 2.9, easeOutBack); if (b > 0) { c.save(); c.translate(CX, 1180); c.scale(b, b);
    shp(c, rectPts(-380, -110, 760, 220), '#c0172b', 6, 2400, { corner: .25, color: '#fff' }); txt(c, 'ПОДПИШИСЬ,', 0, -34, 64, '#fff'); txt(c, 'чтобы узнать, что было дальше', 0, 44, 38, '#ffe1d9');
    c.restore(); }
  c.fillStyle = '#2a2430'; c.fillRect(0, 1780, W, 140); txt(c, 'Экстренная служба: 112', CX, 1850, 46, '#fff');
  fade(c, 1 - pr(u, 0, .4), '#000'); fade(c, pr(t, 161.3, 162), '#000');
}

const SCENES = [[0, 8.6, s1], [8.6, 13, sTitle], [13, 24, s2], [24, 41, s3], [41, 59, s4], [59, 75.5, s5], [75.5, 92.3, s6], [92.3, 110.5, s7], [110.5, 124, s8], [124, 147, s9], [147, 156, s10], [156, 162, s11]];
const NO_SUBS = new Set(['n01', 'n00', 'n15']);
function subtitlesAt(c, t) {
  const cue = SUBS.find(s => t >= s.start && t < s.end + .15 && !NO_SUBS.has(s.line)); if (!cue) return;
  resetT(c); const lines = cue.text.split('\n'), y = 1640 - (lines.length - 1) * 33;
  c.save(); c.font = '800 50px Rubik'; c.textAlign = 'center'; c.lineJoin = 'round';
  lines.forEach((ln, k) => { const yy = y + k * 64; c.strokeStyle = 'rgba(20,14,20,.92)'; c.lineWidth = 13; c.strokeText(ln, CX, yy); c.fillStyle = cue.who === 'V' ? '#ffd8c9' : cue.who === 'T' ? '#d6e8ff' : '#fff'; c.fillText(ln, CX, yy); });
  c.restore();
}
function drawFilm(c, real) {
  const t = toScript(real);
  const sc = SCENES.find(s => t >= s[0] && t < s[1]) || SCENES[SCENES.length - 1];
  resetT(c); c.clearRect(0, 0, W, H); sc[2](c, t, t - sc[0]);
  if (t > 118.6 && t < 156) { resetT(c); label(c, 'ДАЛЬШЕ — ВЫМЫСЕЛ', 220, 110, { size: 28, bg: '#fff3c4', rot: -.03 }); }
  subtitlesAt(c, real);
}
