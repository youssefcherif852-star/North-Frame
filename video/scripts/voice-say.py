# Speaks each line of scripts/voiceover.json with Kokoro TTS into public/voice/.
# A line's optional "say" field is what gets spoken (e.g. a phonetic spelling of a
# name); "text" is what the captions show.
# Usage: KOKORO_DIR=... python3 scripts/voice-say.py scripts/voiceover.json public/voice
import json, sys, soundfile as sf
import os
from kokoro_onnx import Kokoro
# Kokoro model files (kokoro-v1.0.int8.onnx, voices-v1.0.bin) from
# github.com/thewh1teagle/kokoro-onnx/releases; set KOKORO_DIR to their folder.
D = os.environ.get('KOKORO_DIR', '.kokoro')
k = Kokoro(os.path.join(D, 'kokoro.onnx'), os.path.join(D, 'voices.bin'))
cfg = json.load(open(sys.argv[1])); out = sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else cfg['voice']
for ln in cfg['lines']:
    sp = ln.get('speed', cfg['speed'])
    s, sr = k.create(ln.get('say', ln['text']), voice=voice, speed=sp, lang='en-us')
    dur = len(s) / sr
    if dur > ln['max']:
        sp2 = min(1.35, sp * dur / ln['max'] * 1.02)
        s, sr = k.create(ln.get('say', ln['text']), voice=voice, speed=sp2, lang='en-us'); sp = sp2
    s = s / max(1e-6, abs(s).max()) * 0.95  # narration sits well above the ducked music
    sf.write(f"{out}/{ln['id']}.wav", s, sr)
    print(ln['id'], f"{len(s)/sr:.2f}s / {ln['max']}s  speed {sp:.2f}")
