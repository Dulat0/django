"""Озвучка: нейроголоса Microsoft (edge) или RHVoice (офлайн) + тайминг субтитров.
python3 tools/vo.py EPISODE_DIR  ->  EPISODE_DIR/vo/*.wav, vo_timing.js (для фильма), subtitles.srt"""
import json, os, re, subprocess, sys, wave
import numpy as np

ep = sys.argv[1]; cfg = json.load(open(os.path.join(ep, 'vo.json'), encoding='utf-8'))
out = os.path.join(ep, 'vo'); os.makedirs(out, exist_ok=True)
SHOW = [('Пятнадцатое февраля две тысячи тринадцатого года', '15 февраля 2013 года'), ('сто двенадцать', '112'),
        ('в двадцать двадцать втором году', 'в 2022 году'), ('Дарт', 'DART')]

def synth(line):
    wav = os.path.join(out, line['id'] + '.wav'); sig = os.path.join(out, line['id'] + '.sig')
    key = json.dumps([line, cfg['voices'][line['who']]], ensure_ascii=False, sort_keys=True)
    if os.path.exists(wav) and os.path.exists(sig) and open(sig, encoding='utf-8').read() == key:
        with wave.open(wav) as w: return w.getnframes() / w.getframerate()
    d = _synth(line); open(sig, 'w', encoding='utf-8').write(key); return d

def _synth(line):
    """Реплика: фразы через « | » синтезируются отдельно и склеиваются паузой; затем сдвиг высоты и обработка голоса."""
    v = cfg['voices'][line['who']]; wav = os.path.join(out, line['id'] + '.wav'); parts = []
    rate, pitch = line.get('rate', v['rate']), line.get('pitch', v['pitch'])
    pieces = [p.strip() for p in line['text'].split('|')]
    if v.get('engine') == 'edge':   # сервис плохо принимает короткие куски: одна реплика, паузы — точками
        pieces = [' '.join((q.rstrip('—- ') + ('' if q.rstrip('—- ')[-1:] in '.!?…,:' else '.')) for q in pieces)]
    for k, piece in enumerate(pieces):
        raw = os.path.join(out, f"{line['id']}.{k}.raw.wav"); cut = raw.replace('.raw', '.cut')
        if v.get('engine') == 'edge':   # нейроголоса Microsoft
            mp3 = raw.replace('.wav', '.mp3'); r, pt = rate - 100, int((pitch - 100) * 1.5)
            subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), 'edge_say.py'), v['voice'], piece, mp3, '+0%', '+0Hz'], check=True)   # с просодией сервис часто молчит
            post = 'anull' if (rate, pitch) == (100, 100) else f'rubberband=tempo={rate / 100:.3f}:pitch={2 ** ((pitch - 100) / 2 / 12):.4f}:formant=preserved'   # pitch: 2 пункта = 1 полутон
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', mp3, '-af', post, raw], check=True); os.remove(mp3)
        else:
            subprocess.run(['RHVoice-test', '-p', v['voice'], '-r', str(rate), '-t', str(pitch), '-o', raw], input=piece.encode(), check=True)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af',
                        'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.38',
                        '-ar', '48000', '-ac', '1', cut], check=True)
        os.remove(raw); parts.append(cut)
    lst = os.path.join(out, line['id'] + '.txt'); open(lst, 'w').write(''.join(f"file '{os.path.abspath(q)}'\n" for q in parts))
    chain = (f"rubberband=pitch={v['shift']}:formant={v.get('formant', 'preserved')}," if v.get('shift', 1) != 1 else '') + 'highpass=f=85,' + v.get('fx', 'anull') + \
            ',areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-16:TP=-1.5'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-af', chain, '-ar', '48000', '-ac', '1', wav], check=True)
    for q in parts: os.remove(q)
    os.remove(lst)
    with wave.open(wav) as w: return w.getnframes() / w.getframerate()

def chunks(text, maxc=60):   # реплика -> фразы для субтитров по ≤2 строки
    text = text.replace(' | ', ' ').replace('|', ' ')
    for a, b in SHOW: text = text.replace(a, b)
    parts = re.split(r'(?<=[.!?:])\s+', text); res, cur = [], ''
    for p in parts:
        if cur and len(cur) + len(p) + 1 > maxc: res.append(cur); cur = p
        else: cur = (cur + ' ' + p).strip()
    if cur: res.append(cur)
    return res

def wrap(s, w=30):
    words, lines, cur = s.split(), [], ''
    for x in words:
        if cur and len(cur) + len(x) + 1 > w: lines.append(cur); cur = x
        else: cur = (cur + ' ' + x).strip()
    lines.append(cur); return '\n'.join(lines)

cues, report = [], []
lines = cfg['lines']; GAP = .3
# 1) синтез; 2) растяжка времени: если реплика длиннее своего места, картинка до следующей реплики идёт медленнее
for ln in lines: ln['dur'] = round(synth(ln), 2)
shift, prev_end, warp = 0., -1e9, [[0, 0]]
for ln in lines:
    ra = max(ln['at'] + shift, prev_end + GAP); shift = ra - ln['at']
    ln['sat'], ln['real'] = ln['at'], round(ra, 3); prev_end = ra + ln['dur']; warp.append([ln['at'], round(ra, 3)])
DUR = cfg.get('duration', 0)
if DUR: warp.append([DUR, round(DUR + shift, 3)])
for ln in lines:
    d = ln['dur']
    report.append(f"{ln['id']} сценарий {ln['sat']:6.1f} → экран {ln['real']:6.1f}–{ln['real'] + d:6.1f}  ({d:4.1f}s, сдвиг {ln['real'] - ln['sat']:+.1f})")
    cs = chunks(ln['text']); tot = sum(len(c) for c in cs); t = ln['real']
    for c in cs:
        dd = d * len(c) / tot
        name = cfg['voices'][ln['who']]['name']
        cues.append({'start': round(t, 2), 'end': round(t + dd, 2), 'who': ln['who'], 'text': wrap(('— ' if ln['who'] != 'N' else '') + c), 'line': ln['id']})
        t += dd

with open(os.path.join(ep, 'vo_timing.js'), 'w', encoding='utf-8') as f:
    f.write('// сгенерировано tools/vo.py. at — время на экране, sat — время по сценарию; WARP — пары (сценарий, экран)\nconst VO = ' +
            json.dumps([{'id': l['id'], 'who': l['who'], 'at': l['real'], 'sat': l['sat'], 'dur': l['dur'], 'text': l['text'].replace(' | ', ' ')} for l in lines], ensure_ascii=False) +
            ';\nconst SUBS = ' + json.dumps(cues, ensure_ascii=False) + ';\nconst WARP = ' + json.dumps(warp) + ';\n')
def ts(x): h, r = divmod(x, 3600); m, s = divmod(r, 60); return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)):03d}"
with open(os.path.join(ep, 'subtitles.srt'), 'w', encoding='utf-8') as f:
    for k, c in enumerate(cues, 1): f.write(f"{k}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n\n")
print('\n'.join(report))
