"""Серия 5: музыка (синтез), звуковые эффекты по таймингу, озвучка с приглушением музыки -> mix.wav
python3 tools/mix_ep05.py"""
import json, os, re
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.path.join(ROOT, 'ep05-meteor'); SFX = os.path.join(ROOT, 'sfx')
SR = 48000; DUR = 180.0; N = int(SR * DUR)
rng = np.random.default_rng(3)

def load(p):
    sr, x = wavfile.read(p); x = x.astype(np.float32) / 32768
    if x.ndim == 1: x = np.stack([x, x], 1)
    assert sr == SR, p; return x
def place(buf, x, at, g=1.):
    i = int(at * SR); n = min(len(x), len(buf) - i)
    if n > 0 and i >= 0: buf[i:i + n] += x[:n] * g
def lp(x, f): return sosfilt(butter(2, f, 'lowpass', fs=SR, output='sos'), x, axis=0)
def t_(d): return np.arange(int(d * SR)) / SR

# ---------- тайминг реплик ----------
js = open(os.path.join(EP, 'vo_timing.js'), encoding='utf-8').read()
VO = json.loads(re.search(r'const VO = (\[.*?\]);', js, re.S).group(1)); VOI = {v['id']: v for v in VO}
def word_at(i, w): v = VOI[i]; k = v['text'].find(w); return v['at'] + v['dur'] * max(0, k) / len(v['text'])

# ---------- музыка ----------
M = np.zeros((N, 2))
NOTE = {n: 440 * 2 ** ((i - 9) / 12) for i, n in enumerate('C C# D D# E F F# G G# A A# B'.split())}
def hz(s): n, o = s[:-1], int(s[-1]); return NOTE[n] * 2 ** (o - 4)
def pad(notes, at, d, g=.12, att=1.2, bright=1800):
    t = t_(d); x = np.zeros_like(t)
    for n in notes:
        f = hz(n)
        for det in (-.004, .004): ph = (f * (1 + det) * t) % 1; x += (2 * ph - 1)
    e = np.minimum(1, t / att) * np.minimum(1, (d - t) / min(1.5, d / 2))
    y = lp(x * e, bright) * g / len(notes); place(M, np.stack([y, np.roll(y, 240)], 1), at)
def pluck(n, at, g=.18, d=.9):
    t = t_(d); f = hz(n); y = (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 5) * g
    pan = rng.uniform(-.5, .5); place(M, np.stack([y * (1 - pan), y * (1 + pan)], 1) * .7, at)
def kick(at, g=.5):
    t = t_(.35); y = np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-t * 30)) / SR) * np.exp(-t * 9) * g; place(M, np.stack([y, y], 1), at)
def hat(at, g=.05):
    y = sosfilt(butter(2, 7000, 'highpass', fs=SR, output='sos'), rng.standard_normal(int(.05 * SR))) * np.exp(-t_(.05) * 80) * g; place(M, np.stack([y, y], 1), at)
def bass(n, at, d, g=.2):
    t = t_(d); f = hz(n); y = lp(np.sign(np.sin(2 * np.pi * f * t)) * np.minimum(1, t / .02) * np.exp(-t * 2), 400) * g; place(M, np.stack([y, y], 1), at)

pad(['A2', 'E3'], 0.4, 8.0, .10, 2, 600)                                     # 1. зацепка: тёмный гул
cozy = [['C3', 'E3', 'G3'], ['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3']]
for k in range(4): pad(cozy[k], 8.6 + k * 3.35, 3.6, .09, .8, 2200)          # 2. уютное утро
arp = ['E4', 'G4', 'C5', 'G4', 'C4', 'E4', 'A4', 'E4', 'C4', 'F4', 'A4', 'F4', 'D4', 'G4', 'B4', 'G4']
for k in range(36): pluck(arp[k % 16], 9.0 + k * .37, .12)
pad(['A2', 'C3', 'E3'], 22.0, 18.3, .11, 4, 900)                              # 3. тревога нарастает
for k in range(30): bass('A1', 25.5 + k * .5, .45, .10 + k * .004)
for k in range(36): hat(31 + k * .25, .03 + k * .001)
pad(['D3', 'F3', 'A3'], 41.2, 18.0, .07, 1.5, 1200)                           # 4. разбор: ровный пульс
for k in range(72): hat(41.2 + k * .25, .025)
for k in range(17): bass(['D2', 'D2', 'F2', 'C2'][k % 4], 43 + k * 1.0, .8, .08)
pad(['A2', 'C3', 'E3'], 60.8, 15.7, .08, .5, 1500)                            # 5. действуем: ритм
for k in range(31): kick(60.8 + k * .5, .30); hat(61.05 + k * .5, .04)
for k in range(16): bass(['A1', 'A1', 'F1', 'G1'][k % 4], 60.8 + k * 1.0, .9, .12)
pad(['D2', 'A2'], 76.5, 12.0, .09, 3, 400)                                    # 6. ожидание: гул, потом тишина
for k in range(8): kick(82 + k * .8, .22 + k * .02); kick(82.22 + k * .8, .14 + k * .015)   # сердцебиение
sad = [['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['C3', 'E3', 'G3'], ['G2', 'B2', 'D3']]
for k in range(5): pad(sad[k % 4], 96 + k * 3.9, 4.2, .07, 1.5, 1400)         # 7. после: тихо
pad(['E3', 'B3', 'E4'], 115.5, 10, .07, 4, 3000)                              # 8. взлёт: воздух
epic = [['D3', 'F3', 'A3'], ['A#2', 'D3', 'F3'], ['F2', 'A2', 'C3'], ['C3', 'E3', 'G3']]
for k in range(8): pad(epic[k % 4], 125.5 + k * 3.7, 4.0, .09, 1, 1600)       # 9. гигант: эпичнее
for k in range(48): kick(129 + k * .6, .22)
pad(['D3', 'F#3', 'A3', 'D4'], 155.6, 4.4, .13, .1, 2600)                     # разрешение после удара DART
for k in range(5): pad(cozy[k % 4], 160 + k * 3.8, 4.2, .09, .8, 2200)        # 10. финал: тема утра
for k in range(44): pluck(arp[k % 16], 160.3 + k * .4, .11)
pad(['C3', 'E3', 'G3', 'C4'], 176, 4, .1, .3, 2400)

# ---------- эффекты ----------
S = {k[:-4]: load(os.path.join(SFX, k)) for k in os.listdir(SFX) if k.endswith('.wav') and k != 'demo-track.wav'}
FX = np.zeros((N, 2)); cue = lambda k, at, g=1.: place(FX, S[k], at, g)
cue('whoosh', .3, .7); cue('rumble', .5, .5); cue('surprise-tuk', 3.6)
for k in range(18): cue('clock-tick', 13.2 + k * .5, .8)
cue('cat-meow', 19.0, .45)
cue('whoosh', 22.3); cue('rumble', 22.6, .9); cue('rumble', 26.0, .6); cue('cat-hiss', 24.6, .8)
cue('surprise-tuk', 27.0); cue('cat-hiss', 31.0, .7)
cue('surprise-tuk', 40.35, .9)
for k in range(8): cue('clock-tick', 52.8 + k * .25, .6)                       # счётчик пострадавших
cue('whoosh', 59.4, .6)
for k in range(5): cue('step', 60.8 + k * .14, .9)
for w in ['Первое', 'Второе', 'Третье', 'Четвёртое']: cue('clock-tick', word_at('n09', w), 1.5)
cue('boom', 89.8); cue('glass-shatter', 89.85); cue('glass-shatter', 93.5, .55); cue('glass-settle', 95.3); cue('cat-hiss', 97.7, .6); cue('cat-meow-scared', 99.3, .5)
for w in ['Надень', 'Не подходи', 'Проверь', 'Если кто-то', 'И слушай']: cue('clock-tick', word_at('n12', w), 1.5)
cue('whoosh', 116, .6); cue('rumble', 122.5, .8); cue('rumble', 126, .5)
for k in range(4): cue('clock-tick', 132.7 + k * .4, 1.2)
cue('surprise-tuk', 134.7, .8)
for w in ['вода', 'документы', 'аптечка', 'фонарик', 'радио']: cue('clock-tick', word_at('n16', w), 1.5)
cue('rumble', 147.0, .5)
cue('whoosh', 151.0, .8); cue('boom', 155.3, .55); cue('surprise-tuk', 156.5, .8)
for k in range(10): cue('clock-tick', 160.2 + k * .5, .7)
cue('whoosh', 163.3, .35); cue('surprise-tuk', 163.55); cue('cat-meow', 167.0, .5)
for w in ['вспышка', 'прочь', 'закрой', 'звони']: cue('clock-tick', word_at('n19', w), 1.5)

# ---------- озвучка и приглушение музыки ----------
V = np.zeros((N, 2)); duck = np.zeros(N)
for v in VO:
    x = load(os.path.join(EP, 'vo', v['id'] + '.wav')); place(V, x, v['at'])
    i, j = int((v['at'] - .25) * SR), int((v['at'] + v['dur'] + .35) * SR); duck[max(0, i):j] = 1
k = int(.25 * SR); cs = np.concatenate([[0], np.cumsum(duck)]); idx = np.arange(N)
duck = (cs[np.minimum(N, idx + k // 2)] - cs[np.maximum(0, idx - k // 2)]) / k   # скользящее среднее
M *= (1 - .65 * duck)[:, None]
M[int(88.5 * SR):int(89.8 * SR)] = 0                                          # тишина перед ударом
MIX = M * .8 + FX * .55 + V * 1.0
peak = np.max(np.abs(MIX)); MIX = MIX / peak * .95
wavfile.write(os.path.join(EP, 'out', 'mix.wav'), SR, (MIX * 32767).astype(np.int16))
print('mix ok, peak was', round(float(peak), 2))
