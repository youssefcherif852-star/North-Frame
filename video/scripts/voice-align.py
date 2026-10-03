# Times every caption word: sentence pauses are found in the audio, words inside a
# sentence share its span by phoneme count. Writes public/voice/captions.json.
# Usage: KOKORO_DIR=... python3 scripts/voice-align.py scripts/voiceover.json public/voice
import json, re, sys, numpy as np, soundfile as sf
import os
from kokoro_onnx import Kokoro
# Kokoro model files (kokoro-v1.0.int8.onnx, voices-v1.0.bin) from
# github.com/thewh1teagle/kokoro-onnx/releases; set KOKORO_DIR to their folder.
D = os.environ.get('KOKORO_DIR', '.kokoro')
k = Kokoro(os.path.join(D, 'kokoro.onnx'), os.path.join(D, 'voices.bin'))
cfg = json.load(open(sys.argv[1])); vdir = sys.argv[2]
out = []
for ln in cfg['lines']:
    a, sr = sf.read(f"{vdir}/{ln['id']}.wav")
    hop = int(sr * 0.01)
    env = np.array([np.sqrt(np.mean(a[i:i+hop]**2)) for i in range(0, len(a)-hop, hop)])
    thr = max(env.max() * 0.04, 1e-4)
    voiced = env > thr
    idx = np.where(voiced)[0]
    s0, s1 = idx[0], idx[-1] + 1
    # silent runs of >= 9 frames inside the speech = sentence pauses
    gaps = []; run = None
    for i in range(s0, s1):
        if not voiced[i]:
            run = i if run is None else run
        else:
            if run is not None and i - run >= 6: gaps.append((run, i))
            run = None
    sents = [s for s in re.split(r'(?<=[.!?])\s+', ln['text'].strip()) if s]
    gaps = sorted(sorted(gaps, key=lambda g: g[0]-g[1])[:len(sents)-1])
    bounds = [s0] + [x for g in gaps for x in g] + [s1]
    spans = [(bounds[2*i], bounds[2*i+1]) for i in range(len(sents))] if len(gaps) == len(sents)-1 else None
    if spans is None:  # no reliable pauses: share by phoneme count
        w = [len(k.tokenizer.phonemize(s, 'en-us')) for s in sents]; tot = sum(w); t = s0; spans = []
        for x in w:
            d = (s1 - s0) * x / tot; spans.append((t, t + d)); t += d
    words = []
    for s, (a0, a1) in zip(sents, spans):
        ws = s.split()
        ph = [max(1, len(k.tokenizer.phonemize(re.sub(r"[^\w']", '', w) or w, 'en-us'))) + (2 if re.search(r'[,;:]$', w) else 0) for w in ws]
        tot = sum(ph); t = a0
        for w, p in zip(ws, ph):
            d = (a1 - a0) * p / tot
            words.append({'w': w, 's': round(t * 0.01, 3), 'e': round((t + d) * 0.01, 3)}); t += d
    out.append({'id': ln['id'], 'at': ln['at'], 'dur': round(len(a)/sr, 3), 'words': words})
    print(ln['id'], 'sentences', len(sents), 'gaps found', len(gaps), file=sys.stderr)
json.dump(out, open(f"{vdir}/captions.json", 'w'), indent=1)
