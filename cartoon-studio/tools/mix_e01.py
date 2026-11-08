"""«Сигнал тревоги», серия 1: музыка (синтез), звуковые эффекты по таймингу, озвучка с приглушением музыки -> mix.wav
python3 tools/mix_e01.py"""
import json, os, re
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EP = os.path.join(ROOT, 'e01-vspyshka'); SFX = os.path.join(ROOT, 'sfx')
SR = 48000
rng = np.random.default_rng(3)

def load(p):
    sr, x = wavfile.read(p); x = x.astype(np.float32) / 32768
    if x.ndim == 1: x = np.stack([x, x], 1)
    assert sr == SR, p; return x
def place(buf, x, at, g=1., real=False):   # at — время по сценарию; переводим в экранное
    i = int((at if real else G(at)) * SR); n = min(len(x), len(buf) - i)
    if n > 0 and i >= 0: buf[i:i + n] += x[:n] * g
def lp(x, f): return sosfilt(butter(2, f, 'lowpass', fs=SR, output='sos'), x, axis=0)
def t_(d): return np.arange(int(d * SR)) / SR

# ---------- тайминг реплик ----------
js = open(os.path.join(EP, 'vo_timing.js'), encoding='utf-8').read()
VO = json.loads(re.search(r'const VO = (\[.*?\]);', js, re.S).group(1)); VOI = {v['id']: v for v in VO}
WARP = np.array(json.loads(re.search(r'const WARP = (\[.*?\]);', js, re.S).group(1)))
G = lambda x: float(np.interp(x, WARP[:, 0], WARP[:, 1]))      # сценарий -> экран
Ginv = lambda x: float(np.interp(x, WARP[:, 1], WARP[:, 0]))   # экран -> сценарий
def word_at(i, w): v = VOI[i]; k = v['text'].find(w); return Ginv(v['at'] + v['dur'] * max(0, k) / len(v['text']))

# ---------- музыка ----------
DUR = float(WARP[-1, 1]) + .5; N = int(SR * DUR)
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

def siren(at, d=3.2, g=.16):   # сирена заставки: тон плавает 620↔980 Гц
    t = t_(d); f = 800 + 180 * np.sin(2 * np.pi * .9 * t - np.pi / 2); ph = np.cumsum(f) / SR
    y = (2 * np.abs(2 * (ph % 1) - 1) - 1) * np.minimum(1, t / .3) * np.minimum(1, (d - t) / .6) * g; place(M, np.stack([y, np.roll(y, 600)], 1), at)
cozy = [['C3', 'E3', 'G3'], ['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['G2', 'B2', 'D3']]
arp = ['E4', 'G4', 'C5', 'G4', 'C4', 'E4', 'A4', 'E4', 'C4', 'F4', 'A4', 'F4', 'D4', 'G4', 'B4', 'G4']
motif = ['A4', 'C5', 'E5', 'D5', 'C5', 'B4', 'A4', 'E4']
pad(['A2', 'E3'], 0.4, 8.2, .10, 2, 600)                                      # 1. зацепка
siren(8.8); kick(8.7, .6); pad(['A2', 'C3', 'E3'], 8.7, 4.3, .08, .2, 1400)    # заставка
for k, n in enumerate(motif): pluck(n, 9.6 + k * .4, .14)
for k in range(4): pad(cozy[k], 13.0 + k * 2.75, 3.0, .09, .6, 2200)          # 2. утро
for k in range(28): pluck(arp[k % 16], 13.4 + k * .37, .12)
pad(['A2', 'C3', 'E3'], 24.0, 17.0, .11, 4, 900)                              # 3. тревога
for k in range(27): bass('A1', 27.5 + k * .5, .45, .10 + k * .004)
for k in range(32): hat(33 + k * .25, .03 + k * .001)
pad(['D3', 'F3', 'A3'], 41.6, 17.2, .07, 1.5, 1200)                           # 4. разбор
for k in range(68): hat(41.6 + k * .25, .025)
for k in range(15): bass(['D2', 'D2', 'F2', 'C2'][k % 4], 43 + k * 1.0, .8, .08)
pad(['A2', 'C3', 'E3'], 60.4, 15.1, .08, .5, 1500)                            # 5. действуем
for k in range(30): kick(60.4 + k * .5, .30); hat(60.65 + k * .5, .04)
for k in range(15): bass(['A1', 'A1', 'F1', 'G1'][k % 4], 60.4 + k * 1.0, .9, .12)
pad(['D2', 'A2'], 75.5, 10.0, .09, 3, 400)                                    # 6. ожидание
for k in range(8): kick(79 + k * .8, .22 + k * .02); kick(79.22 + k * .8, .14 + k * .015)
sad = [['A2', 'C3', 'E3'], ['F2', 'A2', 'C3'], ['C3', 'E3', 'G3'], ['G2', 'B2', 'D3']]
for k in range(5): pad(sad[k % 4], 93 + k * 3.6, 4.0, .07, 1.5, 1400)          # 7. после
pad(['A1', 'E2'], 110.5, 13.5, .10, 3, 350)                                    # 8. нет сети: гул и сердце
for k in range(6): kick(112 + k * 1.0, .18 + k * .012); kick(112.25 + k * 1.0, .11 + k * .01)
pad(['A2', 'D#3'], 118.6, 5.4, .07, 3, 900)                                    # тревожный тритон
pad(['D2', 'A2'], 124, 23, .10, 2, 500); pad(['A#4'], 124, 23, .02, 4, 5000)  # 9. улица: тёмный гул и тонкий звон
for k in range(23): kick(124.5 + k * 1.0, .22)
pad(['D3', 'F3', 'A3'], 137, 10, .08, 2, 1600); pad(['A#2', 'D3', 'F3', 'A3'], 144, 3.6, .11, .5, 2000)
minor = ['A4', 'E4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3']
pad(['A2', 'C3', 'E3'], 147, 8.6, .08, 2, 1200)                                # 10. один
for k, n in enumerate(minor): pluck(n, 147.6 + k * .8, .13, 1.4)
for k, n in enumerate(motif): pluck(n, 156.6 + k * .45, .13)                   # 11. продолжение следует
pad(['A2', 'C3', 'E3'], 156.4, 5.6, .07, 1, 1400)
# ---------- эффекты ----------
S = {k[:-4]: load(os.path.join(SFX, k)) for k in os.listdir(SFX) if k.endswith('.wav') and k != 'demo-track.wav'}
FX = np.zeros((N, 2)); cue = lambda k, at, g=1.: place(FX, S[k], at, g)
def tone(fs, on, off, reps, g=.25):   # телефонные сигналы
    seg = []
    for _ in range(reps):
        for f in fs: tt = t_(on); seg.append(np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / .01) * np.minimum(1, (on - tt) / .01) * g)
        seg.append(np.zeros(int(off * SR)))
    y = lp(np.concatenate(seg), 3400); return np.stack([y, y], 1)
cue('whoosh', .3, .7); cue('rumble', .5, .5); cue('surprise-tuk', 3.3)
for k in range(16): cue('clock-tick', 15.8 + k * .5, .8)
cue('cat-meow', 19.0, .45)
for k in range(6): cue('step', 22.2 + k * .28, .6)
cue('whoosh', 24.3); cue('rumble', 24.6, .9); cue('rumble', 28.0, .6); cue('cat-hiss', 26.6, .8)
cue('surprise-tuk', 29.0); cue('cat-hiss', 33.0, .7)
cue('surprise-tuk', 41.05, .9)
for k in range(8): cue('clock-tick', 52.5 + k * .25, .6)
place(FX, S['whoosh'][::-1], 59.0, .6)
for k in range(5): cue('step', 60.4 + k * .14, .9)
for w in ['Первое', 'Второе', 'Третье', 'Четвёртое']: cue('clock-tick', word_at('n09', w), 1.5)
cue('boom', 86.8); cue('glass-shatter', 86.85); cue('glass-shatter', 90.5, .55); cue('glass-settle', 92.3); cue('cat-hiss', 94.7, .6)
for w in ['Надень', 'Не подходи', 'Проверь', 'Если кто-то', 'И слушай']: cue('clock-tick', word_at('n12', w), 1.5)
cue('clock-tick', 111.3, 1.2)
place(FX, tone([425], 1.0, .2, 1), 113.6)                                     # гудок вызова
place(FX, tone([950, 1400, 1800], .33, .9, 1, .2), 114.8)                     # «абонент недоступен»
def siren_fx(d, g):
    t = t_(d); f = 760 + 260 * np.sin(2 * np.pi * .35 * t); ph = np.cumsum(f) / SR
    y = (2 * np.abs(2 * (ph % 1) - 1) - 1) * np.minimum(1, t / 1.5) * g; return np.stack([y, np.roll(y, 900)], 1)
place(FX, lp(siren_fx(5.4, .25), 900), 118.6)                                 # сирена за стеной
place(FX, siren_fx(23, .12), 124)                                             # сирена на улице
def geiger(at, d, r0, r1, g=.5):
    n = int(d * SR); y = np.zeros(n); tt = 0.
    while tt < d:
        rate = r0 + (r1 - r0) * tt / d; tt += rng.exponential(1 / rate); i = int(tt * SR)
        if i < n - 60: y[i:i + 60] += rng.standard_normal(60) * np.exp(-np.arange(60) / 10)
    y = sosfilt(butter(2, 2000, 'highpass', fs=SR, output='sos'), y) * g; place(FX, np.stack([y, y], 1), at)
geiger(131.5, 5.5, 3, 40); geiger(147, 8.6, 6, 30, .35)
def cough(at, g=.6):
    for k in range(3):
        d = .2; y = sosfilt(butter(2, [300, 2400], 'bandpass', fs=SR, output='sos'), rng.standard_normal(int(d * SR))) * np.exp(-t_(d) * 14) * np.minimum(1, t_(d) / .01)
        place(FX, np.stack([y, y], 1) * g * (1 - k * .2), at + k * .28)
for at in (124.8, 128.6, 129.9, 131.0, 133.4): cough(at, .7 if 128 < at < 131.5 else .35)
murmur = lp(rng.standard_normal(int(23 * SR)), 700) * .05; place(FX, np.stack([murmur, np.roll(murmur, 4000)], 1), 124)
cue('rumble', 131.5, .4); cue('rumble', 135.5, .3)
hiss = sosfilt(butter(2, 3000, 'highpass', fs=SR, output='sos'), rng.standard_normal(int(.7 * SR))) * np.exp(-t_(.7) * 5) * .3; place(FX, np.stack([hiss, hiss], 1), 144.4)   # двери автобуса
cue('rumble', 145, .7); cue('surprise-tuk', 139.5)
cue('boom', 153.4, .35)
for k in range(20): cue('clock-tick', 156.4 + k * .06, .5)
# ---------- озвучка и приглушение музыки ----------
V = np.zeros((N, 2)); duck = np.zeros(N)
for v in VO:
    x = load(os.path.join(EP, 'vo', v['id'] + '.wav')); place(V, x, v['at'], real=True)
    i, j = int((v['at'] - .25) * SR), int((v['at'] + v['dur'] + .35) * SR); duck[max(0, i):j] = 1
k = int(.25 * SR); cs = np.concatenate([[0], np.cumsum(duck)]); idx = np.arange(N)
duck = (cs[np.minimum(N, idx + k // 2)] - cs[np.maximum(0, idx - k // 2)]) / k   # скользящее среднее
M *= (1 - .65 * duck)[:, None]
M[int(G(85.5) * SR):int(G(86.8) * SR)] = 0                                          # тишина перед ударом
M[int(G(155.6) * SR):int(G(156.3) * SR)] *= 0
MIX = M * .8 + FX * .55 + V * 1.0
peak = np.max(np.abs(MIX)); MIX = MIX / peak * .95
wavfile.write(os.path.join(EP, 'out', 'mix.wav'), SR, (MIX * 32767).astype(np.int16))
print('mix ok, peak was', round(float(peak), 2))
