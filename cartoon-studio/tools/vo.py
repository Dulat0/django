"""Озвучка через RHVoice (офлайн) + тайминг субтитров.
python3 tools/vo.py EPISODE_DIR  ->  EPISODE_DIR/vo/*.wav, vo_timing.js (для фильма), subtitles.srt"""
import json, os, re, subprocess, sys, wave
import numpy as np

ep = sys.argv[1]; cfg = json.load(open(os.path.join(ep, 'vo.json'), encoding='utf-8'))
out = os.path.join(ep, 'vo'); os.makedirs(out, exist_ok=True)
SHOW = [('Пятнадцатое февраля две тысячи тринадцатого года', '15 февраля 2013 года'), ('сто двенадцать', '112'),
        ('в двадцать двадцать втором году', 'в 2022 году'), ('Дарт', 'DART')]

def synth(line):
    """Реплика: фразы через « | » синтезируются отдельно и склеиваются паузой; затем сдвиг высоты и обработка голоса."""
    v = cfg['voices'][line['who']]; wav = os.path.join(out, line['id'] + '.wav'); parts = []
    rate, pitch = line.get('rate', v['rate']), line.get('pitch', v['pitch'])
    for k, piece in enumerate(p.strip() for p in line['text'].split('|')):
        raw = os.path.join(out, f"{line['id']}.{k}.raw.wav"); cut = raw.replace('.raw', '.cut')
        subprocess.run(['RHVoice-test', '-p', v['voice'], '-r', str(rate), '-t', str(pitch), '-o', raw], input=piece.encode(), check=True)
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af',
                        'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.38',
                        '-ar', '48000', '-ac', '1', cut], check=True)
        os.remove(raw); parts.append(cut)
    lst = os.path.join(out, line['id'] + '.txt'); open(lst, 'w').write(''.join(f"file '{os.path.abspath(q)}'\n" for q in parts))
    chain = (f"rubberband=pitch={v['shift']}:formant=preserved," if v.get('shift', 1) != 1 else '') + 'highpass=f=85,' + v.get('fx', 'anull') + \
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
lines = cfg['lines']
for i, ln in enumerate(lines):
    d = synth(ln); end = ln['at'] + d
    nxt = lines[i + 1]['at'] if i + 1 < len(lines) else 1e9
    report.append(f"{ln['id']} {ln['at']:6.1f}–{end:6.1f}  ({d:4.1f}s){'  !! НАЛЕЗАЕТ на ' + lines[i+1]['id'] if end > nxt - .2 else ''}")
    cs = chunks(ln['text']); tot = sum(len(c) for c in cs); t = ln['at']
    for c in cs:
        dd = d * len(c) / tot
        name = cfg['voices'][ln['who']]['name']
        cues.append({'start': round(t, 2), 'end': round(t + dd, 2), 'who': ln['who'], 'text': wrap(('— ' if ln['who'] != 'N' else '') + c), 'line': ln['id']})
        t += dd
    ln['dur'] = round(d, 2)

with open(os.path.join(ep, 'vo_timing.js'), 'w', encoding='utf-8') as f:
    f.write('// сгенерировано tools/vo.py\nconst VO = ' + json.dumps([{**{k: l[k] for k in ('id', 'who', 'at', 'dur')}, 'text': l['text'].replace(' | ', ' ')} for l in lines], ensure_ascii=False) +
            ';\nconst SUBS = ' + json.dumps(cues, ensure_ascii=False) + ';\n')
def ts(x): h, r = divmod(x, 3600); m, s = divmod(r, 60); return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)):03d}"
with open(os.path.join(ep, 'subtitles.srt'), 'w', encoding='utf-8') as f:
    for k, c in enumerate(cues, 1): f.write(f"{k}\n{ts(c['start'])} --> {ts(c['end'])}\n{c['text']}\n\n")
print('\n'.join(report))
