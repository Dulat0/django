'use strict';
// Серия 5 «Вспышка в небе: правило Челябинска». 180 с, 30 к/с, 1080×1920.
// Каждая сцена — чистая функция времени: scene(c, t, u), t — время фильма, u — время от начала сцены.

const FPS = 30, DUR = 180;
const pr = (t, a, b, e = easeIO) => e(clamp((t - a) / (b - a), 0, 1));
const VOI = Object.fromEntries(VO.map(v => [v.id, v]));
function speaking(who, t) { return VO.some(v => v.who === who && t >= v.at && t < v.at + v.dur); }
function flap(t, open = 'O', closed = 'neutral') { return noise1(t * 11, 3) > -.1 ? open : closed; }
function blink(t, off = 0) { return ((t + off) % 3.9) < .12; }
function wordAt(id, word) { const v = VOI[id], i = v.text.indexOf(word); return v.at + v.dur * Math.max(0, i) / v.text.length; }
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
  const a1 = pr(t, .9, 1.4), a2 = pr(t, 3.6, 4.0, easeOutBack), a3 = pr(t, 5.1, 5.6);
  txt(c, 'Если небо вспыхнуло\nярче солнца —', CX, 1180, 62, '#fff', { stroke: INK, alpha: a1 });
  if (a2 > 0) { c.save(); c.translate(CX, 1420); c.scale(a2, a2); c.rotate(-.04); txt(c, 'НЕ ПОДХОДИ\nК ОКНУ', 0, 0, 104, RED, { stroke: '#fff' }); c.restore(); }
  txt(c, 'Самое опасное придёт\nчерез минуту', CX, 1720, 50, '#fff', { stroke: INK, alpha: a3 });
  fade(c, pr(t, 8.1, 8.5), '#000');
}
// 2. 8.5–22: обычное утро
function s2(c, t, u) {
  if (u < 4.6) {   // снаружи: двор, камера наезжает на окно
    const z = lerp(1, 1.7, pr(u, 0, 4.6, easeInOutSine));
    camera(c, 540, 1000, z); BALL = 0; cityOutside(c, 0, [-200, -100, 1480, 2200], false);
    fade(c, 1 - pr(u, 0, .5), '#000');
    resetT(c); label(c, 'Челябинск · 15 февраля 2013 · 9:20', CX, 230, { size: 40 });
    fade(c, pr(u, 4.2, 4.6), '#fff'); return;
  }
  const v = u - 4.6; BALL = 0;
  camera(c, 560, 960, lerp(1.12, 1.0, pr(v, 0, 8.9, easeInOutSine)));
  kitchen(c, 0);
  at(c, 380, 1040, .5, () => bublik(c, 'sill'));
  const chew = speaking('N', t) ? (Math.floor(t * 4) % 2 ? 'chew' : 'neutral') : 'chew';
  at(c, 600, 1290 + Math.sin(t * 2) * 2, 1, () => temaSit(c, { eyes: blink(t) ? 'shut' : 'open', look: [.6, .3], mouth: chew, brows: 'calm' }));
  table(c);
  fade(c, 1 - pr(v, 0, .4), '#fff');
}
// 3. 22–40.3: вспышка
function s3(c, t, u) {
  const k = pr(t, 23, 25.5); BALL = lerp(.05, .75, pr(t, 22.4, 33, x => x));
  if (u < 5) {   // кухня заливается светом
    camera(c, 560, 960, 1, shakeAt(t, 24, 6, 1));
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
  if (u < 12.3) {   // схема: свет мгновенно, волна — минуты
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
  const v = u - 12.3; paperBg(c, '#f6e9e4');   // факты 2013 года
  const n = Math.round(pr(v, .2, 2.2, easeOutExpo) * 1500);
  txt(c, '15 февраля 2013', CX, 330, 48, INK);
  txt(c, '≈' + n.toLocaleString('ru-RU'), CX, 620, 190, RED);
  txt(c, 'человек пострадали', CX, 790, 58, INK);
  const a = pr(v, 3.6, 4.2); c.save(); c.globalAlpha = a; ICON.glass(c, CX, 1060); txt(c, 'большинство —\nпорезы осколками стекла', CX, 1300, 52, INK); c.restore();
}
// 5. 59.4–76.5: перемотка, Вера, правила
function s5(c, t, u) {
  if (u < 1.4) {   // перемотка назад по сцене 3
    const tb = 40.2 - u * 11; s3(c, tb, tb - 22);
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
  const B = 89.8;
  if (t < B) {
    const breath = Math.sin(t * 3) * 3;
    camera(c, 540, 1050, lerp(1.0, 1.25, pr(t, 76.5, 88.5, easeInOutSine)));
    corridor(c, 0);
    at(c, 300, 1560 + breath, 1.05, () => veraCrouch(c, { eyes: 'shut', mouth: 'tense', brows: 'worry' }));
    at(c, 560, 1580 - breath, 1.0, () => temaCrouch(c, { eyes: blink(t, 2) ? 'shut' : (t > 86 ? 'shut' : 'squint'), look: [.8, 0], mouth: 'tense', brows: 'worry' }));
    at(c, 430, 1700, .5, () => bublik(c, 'flat'));
    resetT(c);
    if (t < 88.5) { label(c, 'проходит минута…', CX, 230, { size: 40 }); }
    return;
  }
  if (t < 93.5) {   // крупный план: окно выбивает (замедленно)
    const v = (t - B) / 3.7;
    camera(c, 540, 960, 1, shakeAt(t, B, 40, 2.5), t);
    windowBlast(c, pr(v, 0, 1, x => Math.pow(x, .8)) * .95);
    resetT(c); label(c, 'замедленно', 880, 1640, { size: 30, rot: .03 });
    fade(c, 1 - pr(t, B, B + .25), '#fff'); return;
  }
  const v = (t - 93.5) / 1.8;   // коридор: осколки летят из проёма
  camera(c, 540, 1050, 1.1, shakeAt(t, 93.5, 24, 2), t);
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
// 8. 115.5–125.5: взлёт в космос
function spaceBg(c, t, o = {}) {
  resetT(c); c.fillStyle = '#0c0f2b'; c.fillRect(0, 0, W, H);
  const r = rng(5); for (let j = 0; j < 300; j++) { const tw = .5 + .5 * Math.sin(t * 2 + j); c.fillStyle = '#fff'; c.globalAlpha = (.25 + r() * .6) * (.7 + .3 * tw); c.fillRect(r() * W, r() * H, 2 + r() * 2.5, 2 + r() * 2.5); }
  c.globalAlpha = 1;
  const ey = o.earthY ?? 2800;
  glow(c, 540, ey - 100, 1500, '#5fb7ff', .9);
  const E = circPath(540, ey, 1300); c.fillStyle = '#2f73c9'; c.fill(E);
  c.save(); c.clip(E); c.translate(-t * 4 % 400, 0);
  for (const [x, y, rx, ry] of [[300, ey - 1180, 260, 90], [820, ey - 1100, 220, 120], [520, ey - 980, 300, 110], [1100, ey - 1150, 240, 90]]) shp(c, warp(ellPts(x, y, rx, ry), x, 18, true, 30), '#5ea85a', 5, x);
  c.restore(); inkLine(c, ellPts(540, ey, 1300, 1300, 0, 120), 7, 800, true);
}
function asteroid(c, x, y, s, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.translate(-600, -760);
  const A = warp(ellPts(600, 760, 330, 270, .3), 21, 34, true, 40);
  shp(c, A, '#8a7a6d', 7, 810, { shade: q => { hatchIn(q, rectPath(260, 480, 700, 600), [260, 480, 700, 600], { alpha: .35, angle: .5, gap: 10 }); q.fillStyle = alpha('#2a2230', .45); q.beginPath(); q.ellipse(720, 860, 300, 260, .3, 0, TAU); q.fill(); } });
  for (const [px, py, rr] of [[520, 660, 50], [680, 820, 70], [460, 860, 34], [760, 620, 28]]) shp(c, ellPts(px, py, rr, rr * .75, .3), '#6f6156', 4, px);
  c.restore();
}
function s8(c, t, u) {
  const p = pr(u, 0, 7, easeInOutSine);
  resetT(c);
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mix('#86b6dc', '#0c0f2b', clamp(p * 1.4, 0, 1))); g.addColorStop(1, mix('#dcebf5', '#1b2a5a', clamp(p * 1.2, 0, 1)));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const r = rng(31); for (let j = 0; j < 14; j++) { const x = r() * W, y0 = r() * H, sp = 1400 + r() * 1600, y = ((y0 + p * sp) % (H + 600)) - 300;
    c.save(); c.globalAlpha = 1 - clamp(p * 1.3, 0, 1); shp(c, warp(ellPts(x, y, 160 + r() * 140, 60 + r() * 40), j, 14, true, 30), '#fbfcff', 3, 1400 + j, { pressure: .2, color: alpha(INK, .3) }); c.restore(); }
  if (p > .45) { c.save(); c.globalAlpha = pr(p, .45, 1); spaceBg(c, t, { earthY: lerp(3400, 2800, pr(p, .45, 1)) }); c.restore(); }
  if (u > 6.5) { const a = pr(u, 6.5, 7, easeOutBack); resetT(c); c.save(); c.translate(CX, 300); c.scale(a, a); label(c, 'ФАНТАСТИКА: А ЧТО ЕСЛИ…', 0, 0, { size: 48, bg: RED, color: '#fff', rot: -.04 }); c.restore();
    asteroid(c, lerp(1300, 640, pr(u, 7, 10, easeOutQuint)), lerp(-300, 760, pr(u, 7, 10, easeOutQuint)), .8, u * .05); }
}
// 9. 125.5–160: гигант, правила, DART
function s9(c, t, u) {
  if (u < 7) {   // астероид замечают заранее
    spaceBg(c, t); asteroid(c, 640, 760, .8 + u * .01, (u + 3.5) * .05);
    resetT(c);
    const a = pr(u, 1.5, 2); c.save(); c.globalAlpha = a;
    shp(c, rectPts(120, 1180, 840, 230), alpha('#0c0f2b', .8), 5, 1500, { color: '#9fd0ff', corner: .1 });
    txt(c, 'ОБНАРУЖЕН АСТЕРОИД', CX, 1250, 50, '#9fd0ff'); txt(c, 'до сближения — 3 года', CX, 1340, 44, '#fff'); c.restore();
    return;
  }
  if (u < 13.5) {   // паника и слухи ✗ / официальные сообщения ✓
    paperBg(c, '#f1ece2'); const v = u - 7;
    shp(c, rectPts(130, 300, 380, 700), '#2b2f3a', 7, 1510, { corner: .15 }); c.fillStyle = '#eef3f7'; c.fillRect(156, 340, 328, 620);
    const msgs = ['ВСЕ БЕГИТЕ!!!', 'конец света завтра', 'скупайте всё!!', 'мне сказали…'];
    msgs.forEach((m, k) => { const a = pr(v, .2 + k * .4, .5 + k * .4); if (a <= 0) return; c.save(); c.globalAlpha = a; shp(c, rectPts(176, 370 + k * 140, 288, 100), k % 2 ? '#dfe9d6' : '#fff', 3, 1520 + k, { corner: .3 }); txt(c, m, 320, 420 + k * 140, 28, INK); c.restore(); });
    if (v > 2.2) cross(c, 320, 650, 160 * pr(v, 2.2, 2.5, easeOutBack));
    txt(c, 'паника\nи слухи', 320, 1110, 48, RED);
    c.save(); c.globalAlpha = pr(v, 2.6, 3.2); c.save(); c.translate(780, 620); c.scale(1.6, 1.6); c.translate(-780, -620); ICON.radio(c, 780, 620); c.restore();
    check(c, 780, 820, 70); txt(c, 'официальные\nсообщения МЧС', 780, 1110, 44, GREEN); c.restore();
    return;
  }
  if (u < 21.5) {   // тревожный чемоданчик
    paperBg(c, '#eef1e6'); const v = u - 13.5;
    txt(c, 'ТРЕВОЖНЫЙ ЧЕМОДАНЧИК', CX, 230, 56);
    shp(c, [[380, 700], [700, 700], [730, 1150], [350, 1150]], '#6d7f4a', 7, 1530, { corner: .3, shade: sideShade('#53633a', 720, 920, 50, 240) });
    shp(c, [[460, 700], [476, 620], [604, 620], [620, 700]], '#6d7f4a', 6, 1531, { corner: .4 });
    shp(c, rectPts(430, 860, 220, 130), '#5c6c3e', 5, 1532, { corner: .2 });
    const items = [['вода', ICON.water, 'вода'], ['документы', ICON.docs, 'документы'], ['аптечка', ICON.aid, 'аптечка'], ['фонарик', ICON.torch, 'фонарик'], ['радио', ICON.radio, 'радио']];
    items.forEach(([w, ic, name], k) => {
      const ta = wordAt('n16', w), a = pr(t, ta - .1, ta + .35, easeOutBack); if (a <= 0) return;
      const ang = -Math.PI * .9 + k * Math.PI * .45, R = 400, x = CX + Math.cos(ang) * R * .95, y = 1000 + Math.sin(ang) * R * .8 - 120;
      const xx = [175, 175, CX, 905, 905][k], yy = [560, 1000, 1330, 560, 1000][k];
      c.save(); c.globalAlpha = clamp(a, 0, 1); c.translate(xx, yy); c.scale(clamp(a, .3, 1.2), clamp(a, .3, 1.2)); c.translate(-xx, -yy); shp(c, ellPts(xx, yy, 100, 100), '#fffaf0', 5, 1540 + k); ic(c, xx, yy); txt(c, name, xx, yy + 140, 38); c.restore();
    });
    return;
  }
  if (u < 25.5) {   // эвакуация
    const v = u - 21.5; BALL = 0;
    resetT(c); cityOutside(c, 0, [-200, -300, 1480, 1700], false);
    c.fillStyle = '#e9eef3'; c.fillRect(0, 1380, W, H - 1380); inkLine(c, [[0, 1380], [W, 1380]], 5, 1550);
    const bx = lerp(-60, 120, pr(v, 0, 4, easeInOutSine));
    shp(c, rectPts(bx, 1060, 760, 300), '#f2c13d', 7, 1551, { corner: .12, shade: sideShade('#c99a22', bx + 740, 1220, 60, 160) });
    for (let j = 0; j < 5; j++) shp(c, rectPts(bx + 40 + j * 140, 1100, 110, 110), '#bfe0f2', 4, 1552 + j, { corner: .1 });
    for (const wx of [150, 600]) { shp(c, ellPts(bx + wx, 1370, 60, 60), '#2b2f3a', 6, 1560 + wx); shp(c, ellPts(bx + wx, 1370, 24, 24), '#aaa', 3, 1561 + wx); }
    txt(c, 'ЭВАКУАЦИЯ', bx + 380, 1300, 40, INK);
    for (let j = 0; j < 6; j++) { const px = 1000 - ((v * 60 + j * 120) % 700), bob = Math.abs(Math.sin(v * 7 + j)) * 8;   // люди с рюкзаками идут к автобусу
      at(c, px, 1520 - bob, .32, () => { taper(c, [[0, -330], [0, -60]], [70, 60], ['#3d6fa8', '#8e2f45', '#5a5a78', '#4f9a6e'][j % 4], 1570 + j); shp(c, ellPts(0, -400, 44, 54), C.skin, 5, 1580 + j); shp(c, rectPts(20, -320, 60, 120), '#6d7f4a', 4, 1590 + j, { corner: .3 }); }); }
    resetT(c); label(c, 'по указанию МЧС', CX, 260, { size: 44 });
    return;
  }
  // DART: аппарат врезается, орбита уходит мимо Земли
  const v = u - 25.5, hit = 4.3;
  spaceBg(c, t);
  const ax = 640 + (v > hit ? (v - hit) * 30 : 0), ay = 700 - (v > hit ? (v - hit) * 10 : 0);
  c.save(); c.setLineDash([20, 18]); c.lineWidth = 6;
  c.strokeStyle = alpha(RED, v > hit ? .3 : .9); c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(560, 1200, 520, 1550); c.stroke();
  if (v > hit) { c.strokeStyle = alpha(GREEN, pr(v, hit + .6, hit + 1.6)); c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(900, 1100, 1250, 1300); c.stroke(); }
  c.restore();
  asteroid(c, ax, ay, .7, t * .05);
  if (v < hit) at(c, lerp(80, ax - 160, pr(v, 0, hit, x => x)), lerp(1300, ay + 150, pr(v, 0, hit, x => x)), .8, () => {
    c.rotate(-.9); shp(c, rectPts(-30, -60, 60, 120), '#e6e9ef', 5, 820, { corner: .2 });
    shp(c, rectPts(-120, -20, 86, 40), '#3a5bd8', 4, 821, { corner: .1 }); shp(c, rectPts(34, -20, 86, 40), '#3a5bd8', 4, 822, { corner: .1 });
    glow(c, 0, 90, 90, '#ff9b2e', 1); shp(c, [[-16, 62], [16, 62], [0, 140]], '#ffcf33', 3, 823); });
  if (v > hit && v < hit + 1.2) { resetT(c); glow(c, ax - 120, ay + 110, 400 * (1 - (v - hit) / 1.2), '#ffffff', 1); }
  resetT(c);
  if (v > hit + 1.2) { const a = pr(v, hit + 1.2, hit + 1.6, easeOutBack); c.save(); c.translate(900, 1180); c.scale(a, a); txt(c, 'МИМО!', 0, 0, 90, GREEN, { stroke: '#fff' }); c.restore(); }
  label(c, 'по-настоящему: NASA, миссия DART, 2022', CX, 230, { size: 34 });
}
// 10. 160–180: финал
function s10(c, t, u) {
  if (u < 9) {
    BALL = 0; camera(c, 560, 1000, 1.05);
    kitchen(c, 0);
    const g = 163.4, glint = pr(t, g, g + .6, x => x);
    if (t > g && t < g + .6) { resetT(c); c.save(); c.beginPath(); c.rect(WIN[0], WIN[1], WIN[2], WIN[3]); c.clip(); glow(c, lerp(WIN[0] - 100, WIN[0] + WIN[2] + 100, glint), 800, 260, '#fff6c8', 1); c.restore(); camera(c, 560, 1000, 1.05); }
    at(c, 380, 1040, .5, () => bublik(c, t > 167 && t < 168.3 ? 'hiss' : 'sill'));
    const jump = pr(t, g + .15, g + .45, easeOutBack), tx = lerp(560, 400, jump), hop = Math.sin(pr(t, g + .15, g + .5) * Math.PI) * -50;
    const talkT = speaking('T', t);
    at(c, tx, 1560 + hop, .95, () => temaStand(c, { eyes: t > g + .1 && t < 166 ? 'wide' : (blink(t) ? 'shut' : 'open'), look: [.6, 0], brows: t > g + .1 && t < 165.4 ? 'up' : 'calm',
      mouth: talkT ? flap(t, 'shout', 'neutral') : (t > 167 ? 'smile' : (t > g + .1 ? 'O' : 'neutral')), armsUp: pr(t, g + .1, g + .3) * (1 - pr(t, 165, 165.6)) }));
    const laugh = t > 166.9;
    at(c, 860, 1800, 1.05, () => veraShout(c, { eyes: laugh ? 'squint' : (blink(t, 2) ? 'shut' : 'open'), look: [-1, 0], brows: laugh ? 'up' : 'calm', mouth: laugh ? flap(t, 'shout', 'smile') : 'smile' }, 0));
    return;
  }
  const v = u - 9;   // итоговая карточка
  paperBg(c, '#f4ecdc');
  txt(c, 'ПРАВИЛО\nЧЕЛЯБИНСКА', CX, 250, 80, RED);
  const steps = [[ICON.flash, 'Вспышка в небе'], [ICON.window, 'Прочь от окон'], [ICON.cover, 'Закрой голову'], [ICON.phone112, 'Раненые — звони 112']];
  const T0 = [wordAt('n19', 'вспышка'), wordAt('n19', 'прочь'), wordAt('n19', 'закрой'), wordAt('n19', 'звони')];
  steps.forEach(([ic, s], k) => { const a = pr(t, T0[k] - .1, T0[k] + .35, easeOutBack); if (a <= 0) return; const y = 560 + k * 260;
    c.save(); c.globalAlpha = clamp(a, 0, 1); shp(c, ellPts(250, y, 100, 100), '#fffaf0', 5, 1600 + k); ic(c, 250, y); txt(c, s, 390, y, 52, INK, { align: 'left' }); c.restore();
    if (k < 3) txt(c, '↓', 250, y + 132, 54, RED, { alpha: a }); });
  const e = pr(v, 8.2, 9.2);
  if (e > 0) { c.save(); c.globalAlpha = e; c.fillStyle = INK; c.fillRect(0, 1580, W, 340); txt(c, 'Экстренная служба: 112', CX, 1680, 56, '#fff'); txt(c, 'Серия 5 · «Вспышка в небе»', CX, 1790, 38, '#e8c35a'); c.restore(); }
  fade(c, pr(t, 179.2, 180), '#000');
}

const SCENES = [[0, 8.5, s1], [8.5, 22, s2], [22, 40.3, s3], [40.3, 59.4, s4], [59.4, 76.5, s5], [76.5, 95.3, s6], [95.3, 115.5, s7], [115.5, 125.5, s8], [125.5, 160, s9], [160, 180, s10]];
const NO_SUBS = new Set(['n01']);
function subtitlesAt(c, t) {
  const cue = SUBS.find(s => t >= s.start && t < s.end + .15 && !NO_SUBS.has(s.line)); if (!cue) return;
  resetT(c); const lines = cue.text.split('\n'), y = 1640 - (lines.length - 1) * 33;
  c.save(); c.font = '800 50px Rubik'; c.textAlign = 'center'; c.lineJoin = 'round';
  lines.forEach((ln, k) => { const yy = y + k * 64; c.strokeStyle = 'rgba(20,14,20,.92)'; c.lineWidth = 13; c.strokeText(ln, CX, yy); c.fillStyle = cue.who === 'V' ? '#ffd8c9' : cue.who === 'T' ? '#d6e8ff' : '#fff'; c.fillText(ln, CX, yy); });
  c.restore();
}
function drawFilm(c, t) {
  const sc = SCENES.find(s => t >= s[0] && t < s[1]) || SCENES[SCENES.length - 1];
  resetT(c); c.clearRect(0, 0, W, H); sc[2](c, t, t - sc[0]);
  subtitlesAt(c, t);
}
