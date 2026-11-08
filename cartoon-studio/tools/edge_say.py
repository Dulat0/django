"""Нейроголос Microsoft Edge (бесплатно, без ключа): python3 tools/edge_say.py VOICE TEXT OUT.mp3 [RATE] [PITCH]
Сервис иногда отвечает пустым звуком — повторяем запрос до 15 раз."""
import sys, os, asyncio, time
if os.path.exists('/root/.ccr/ca-bundle.crt'):   # облачная сессия: прокси со своим корневым сертификатом
    import certifi; certifi.where = lambda: '/root/.ccr/ca-bundle.crt'
import edge_tts
async def main(voice, text, out, rate='+0%', pitch='+0Hz'):
    text = text.strip().rstrip('—-').strip()
    if text[-1] not in '.!?…': text += '.'
    for k in range(15):
        r, p = rate, pitch
        try:
            await edge_tts.Communicate(text, voice, rate=r, pitch=p).save(out)
            if os.path.getsize(out) > 0:
                return
        except edge_tts.exceptions.NoAudioReceived: pass
        time.sleep(min(6, 1 + k * .5))
    sys.exit(f'нет звука от сервиса: {text}')
asyncio.run(main(*sys.argv[1:]))
