"""Синтез звуковых эффектов без внешних сервисов.
python3 tools/sfx.py OUT_DIR  ->  WAV-файлы (48 кГц, стерео) для повторного использования в сериях."""
import sys, os
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
rng = np.random.default_rng(7)

def t_(d): return np.arange(int(d * SR)) / SR
def env(d, a=.005, r=.3, curve=4):
    t = t_(d); e = np.minimum(1, t / max(a, 1e-4)); return e * np.exp(-curve * np.maximum(0, t - a) / max(r, 1e-4))
def filt(x, kind, f, order=4):
    sos = butter(order, f, btype=kind, fs=SR, output='sos'); return sosfilt(sos, x)
def noise(d): return rng.standard_normal(int(d * SR))
def norm(x, peak=.9): m = np.max(np.abs(x)) or 1; return x / m * peak
def st(x, pan=0.):   # моно -> стерео с панорамой -1..1
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); return np.stack([x * l, x * r], 1)
def place(buf, x, at):
    i = int(at * SR); n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += x[:n]
def reverb(x, d=1.6, mix=.25):   # простая диффузная реверберация: свёртка с затухающим шумом
    ir = noise(d) * np.exp(-5 * t_(d) / d); ir = filt(ir, 'lowpass', 6000)
    wet = np.stack([np.convolve(x[:, k], ir * (.9 + .2 * k))[:len(x)] for k in range(2)], 1)
    return x + norm(wet, np.max(np.abs(x)) * .8) * mix

# ---------- эффекты ----------
def boom(d=4.):
    t = t_(d); f = 55 * np.exp(-t * .9) + 22
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, .003, .9, 1.4)
    body = filt(noise(d), 'lowpass', 180) * env(d, .002, .6, 2.2) * 3
    crack = filt(noise(d), 'bandpass', [300, 2500]) * env(d, .001, .05, 6) * .8
    rumble = filt(noise(d), 'lowpass', 70) * env(d, .2, 1.8, 1.2) * 4
    x = np.tanh(1.6 * norm(sub * 1.2 + body + crack + rumble))
    return reverb(st(norm(x)), 2.4, .35)

def tinkle(f0):
    d = .25 + rng.random() * .5; t = t_(d); x = np.zeros_like(t)
    for k, ratio in enumerate([1, 2.76, 5.4, 8.9]):
        x += np.sin(2 * np.pi * f0 * ratio * t + rng.random() * 6) * np.exp(-t * (12 + k * 10) / d) / (k + 1)
    return x * env(d, .0005, d, 1)

def shatter(d=3.):
    out = np.zeros((int(d * SR), 2))
    crack = filt(noise(.35), 'highpass', 1800) * env(.35, .0005, .06, 4)
    place(out, st(norm(crack) * .9), 0)
    for _ in range(140):   # сотни осколков: звон плотнее в начале
        at = abs(rng.normal(0, .45)) + rng.random() * .05
        if at > d - .8: continue
        place(out, st(tinkle(2200 + rng.random() * 6500) * (.15 + rng.random() * .35) * np.exp(-at * .9), rng.uniform(-.9, .9)), at)
    debris = filt(noise(d), 'bandpass', [2000, 9000]) * env(d, .01, .8, 2.5) * .25
    out += st(debris)
    return reverb(norm(out), 1.2, .2)

def settle(d=3.):   # оседающие осколки и пыль
    out = np.zeros((int(d * SR), 2))
    for _ in range(26):
        place(out, st(tinkle(2500 + rng.random() * 5000) * (.05 + rng.random() * .15), rng.uniform(-1, 1)), rng.random() * (d - .6))
    for _ in range(40):
        c = filt(noise(.03), 'bandpass', [400, 3000]) * env(.03, .001, .01, 3) * rng.random() * .2
        place(out, st(c, rng.uniform(-1, 1)), rng.random() * (d - .1))
    return norm(out, .5)

def surprise():   # «тук»: глухой удар сердца + деревянный щелчок + короткий звон
    d = .7; t = t_(d)
    thump = np.sin(2 * np.pi * (90 * np.exp(-t * 6) + 50) * t) * env(d, .002, .12, 3)
    wood = filt(noise(d), 'bandpass', [700, 1300], 2) * env(d, .0005, .03, 5) * 1.5
    ping = np.sin(2 * np.pi * 1760 * t) * env(d, .002, .35, 3) * .25
    return reverb(st(norm(thump + wood + ping, .85)), .8, .2)

def whoosh(d=1.8):   # пролёт болида: шум с поднимающимся фильтром и нарастанием
    t = t_(d); x = noise(d); out = np.zeros_like(x); seg = 2048
    for i in range(0, len(x), seg):
        f = 200 + 3800 * (i / len(x)) ** 1.5
        out[i:i + seg] = filt(x[i:i + seg + 512], 'bandpass', [f, f * 2.2], 2)[:len(x[i:i + seg])]
    e = np.sin(np.pi * np.minimum(1, t / d)) ** 1.5
    pan = np.linspace(.8, -.8, len(t))
    s = np.stack([out * e * np.cos((pan + 1) * np.pi / 4), out * e * np.sin((pan + 1) * np.pi / 4)], 1)
    return norm(s, .7)

def rumble(d=4.):
    t = t_(d); x = filt(noise(d), 'lowpass', 90) * np.minimum(1, t / (d * .7)) * env(d, .001, 4, .2)
    return st(norm(x, .7))

def meow(d=.75, p0=520, p1=780, scared=False):
    t = t_(d); u = t / d
    f0 = p0 + (p1 - p0) * np.sin(np.pi * np.minimum(1, u * 1.2)) - 120 * u
    if scared: f0 = f0 * 1.15 + 40 * np.sin(2 * np.pi * 9 * t)   # дрожащий
    ph = np.cumsum(f0) / SR; src = 2 * (ph % 1) - 1 + .05 * noise(d)
    out = np.zeros_like(t); seg = 1024
    for i in range(0, len(t), seg):   # форманты: «м» -> «я» -> «у»
        v = i / len(t); F1 = 400 + 600 * np.sin(np.pi * min(1, v * 1.3)); F2 = 1300 + 1000 * np.sin(np.pi * min(1, v * 1.1))
        blk = src[i:i + seg + 256]
        y = filt(blk, 'bandpass', [F1 * .7, F1 * 1.3], 2) + .6 * filt(blk, 'bandpass', [F2 * .8, F2 * 1.2], 2)
        out[i:i + seg] = y[:len(out[i:i + seg])]
    e = np.minimum(1, u / .08) * np.minimum(1, (1 - u) / .25)
    return reverb(st(norm(out * e, .6)), .5, .15)

def hiss(d=.9):
    x = filt(noise(d), 'bandpass', [2500, 9000]) * np.sin(np.pi * np.minimum(1, t_(d) / d)) ** .5
    return st(norm(x, .45))

def tick(d=.06):
    x = filt(noise(d), 'bandpass', [2500, 6000], 2) * env(d, .0003, .006, 4) + np.sin(2 * np.pi * 3200 * t_(d)) * env(d, .0003, .01, 4) * .4
    return st(norm(x, .3))

def step(d=.18):
    x = filt(noise(d), 'lowpass', 400) * env(d, .002, .05, 4) * 2 + filt(noise(d), 'bandpass', [1500, 4000]) * env(d, .001, .02, 4) * .3
    return st(norm(x, .6))

LIB = {'boom': boom, 'glass-shatter': shatter, 'glass-settle': settle, 'surprise-tuk': surprise, 'whoosh': whoosh, 'rumble': rumble,
       'cat-meow': meow, 'cat-meow-scared': lambda: meow(.9, 600, 900, True), 'cat-hiss': hiss, 'clock-tick': tick, 'step': step}

def save(path, x): wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    S = {k: f() for k, f in LIB.items()}
    for k, x in S.items(): save(os.path.join(out, k + '.wav'), x)
    # демо-дорожка к пробным кадрам: 6 кадров по 4 с
    D = np.zeros((SR * 24, 2))
    for k in range(8): place(D, S['clock-tick'], .3 + k * .5)
    place(D, S['cat-meow'] * .8, 2.3)
    place(D, S['rumble'] * .6, 3.4); place(D, S['whoosh'], 4.0); place(D, S['surprise-tuk'], 5.1); place(D, S['cat-hiss'], 6.4)
    for k in range(6): place(D, S['step'], 8.2 + k * .28)
    place(D, S['boom'], 12.9); place(D, S['glass-shatter'] * .9, 12.95)
    place(D, S['glass-settle'], 16.2); place(D, S['cat-meow-scared'] * .8, 18.3)
    place(D, S['rumble'] * .8, 20.0)
    save(os.path.join(out, 'demo-track.wav'), norm(D, .95))
    print('ok', sorted(S))
