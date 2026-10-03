// Procedurally generated soundtrack for the North Frame film.
// Bright, upbeat nu-disco in D major at 96 BPM: four-on-the-floor kick, claps,
// 16th hats, a bouncing octave bass, sidechained supersaw chords, a plucked
// arpeggio and a lead hook with echo and reverb. One beat is 30 frames at
// 48 fps, so every scene cut lands on a beat.
// Writes public/audio/track.wav (44.1 kHz, 16-bit stereo).
import {writeFileSync} from 'node:fs';

const SR = 44100, FPS = 48, BPM = 96;
const BEAT = 60 / BPM;            // 0.625 s = 30 frames
const S16 = BEAT / 4;             // a 16th note
const TOTAL_FRAMES = 1980;
const LEN = Math.ceil((TOTAL_FRAMES / FPS + 1) * SR);
const sec = (frame) => frame / FPS;

// ---------- buses ----------
const bus = () => ({L: new Float32Array(LEN), R: new Float32Array(LEN)});
const DRUMS = bus(), MUSIC = bus(), SEND = bus(), ECHO = bus(), FX = bus();
const put = (b, i, l, r = l) => { if (i >= 0 && i < LEN) { b.L[i] += l; b.R[i] += r; } };
const DUCK = new Float32Array(LEN).fill(1); // sidechain gain, written by the kick

let seed = 11;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);
const onePole = (fc) => 1 - Math.exp((-2 * Math.PI * fc) / SR);

// ---------- drums ----------
function kick(t0, g = 1) {
  const s = Math.round(t0 * SR), n = Math.round(0.42 * SR);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = 46 + 150 * Math.exp(-t * 32);
    ph += (2 * Math.PI * f) / SR;
    const body = Math.sin(ph) * Math.exp(-t * 6.5);
    const click = i < 160 ? rnd() * 0.35 * (1 - i / 160) : 0;
    put(DRUMS, s + i, (body + click) * 0.62 * g);
  }
  // sidechain: everything melodic ducks under the kick
  for (let i = 0; i < Math.round(0.3 * SR); i++) {
    const k = s + i; if (k >= LEN) break;
    DUCK[k] = Math.min(DUCK[k], 1 - 0.62 * Math.exp(-(i / SR) / 0.085));
  }
}
function clap(t0, g = 1) {
  const s = Math.round(t0 * SR), n = Math.round(0.32 * SR);
  let lp = 0, hp = 0, prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const bursts = [0, 0.009, 0.018].reduce((a, b) => a + (t >= b ? Math.exp(-(t - b) * 160) : 0), 0);
    const env = bursts * 0.6 + Math.exp(-t * 14) * (t > 0.022 ? 1 : 0) * 0.7;
    const x = rnd(); lp += 0.35 * (x - lp); hp = 0.9 * (hp + lp - prev); prev = lp;
    const v = hp * env * 1.1 * g;
    put(DRUMS, s + i, v * 0.9, v * 1.05);
    put(SEND, s + i, v * 0.35);
  }
}
function snare(t0, g = 1) {
  const s = Math.round(t0 * SR), n = Math.round(0.2 * SR);
  let ph = 0, hp = 0, prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; ph += (2 * Math.PI * 185) / SR;
    const x = rnd(); hp = 0.8 * (hp + x - prev); prev = x;
    const v = (hp * Math.exp(-t * 20) * 0.6 + Math.sin(ph) * Math.exp(-t * 30) * 0.4) * g;
    put(DRUMS, s + i, v); put(SEND, s + i, v * 0.25);
  }
}
function hat(t0, g = 1, open = false, pan = 0) {
  const s = Math.round(t0 * SR), n = Math.round((open ? 0.3 : 0.05) * SR);
  let h1 = 0, h2 = 0, p1 = 0, p2 = 0;
  for (let i = 0; i < n; i++) {
    const x = rnd();
    h1 = 0.7 * (h1 + x - p1); p1 = x; h2 = 0.7 * (h2 + h1 - p2); p2 = h1;
    const v = h2 * Math.exp(-(i / SR) * (open ? 11 : 70)) * 0.42 * g;
    put(DRUMS, s + i, v * (1 - pan), v * (1 + pan));
  }
}
function shaker(t0, g = 1) {
  const s = Math.round(t0 * SR), n = Math.round(0.07 * SR);
  let hp = 0, prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, x = rnd(); hp = 0.6 * (hp + x - prev); prev = x;
    const env = Math.min(1, t / 0.012) * Math.exp(-t * 45);
    put(DRUMS, s + i, hp * env * 0.13 * g, hp * env * 0.19 * g);
  }
}
function crash(t0, g = 1) {
  const s = Math.round(t0 * SR), n = Math.round(2.4 * SR);
  let h = 0, p = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, x = rnd(); h = 0.85 * (h + x - p); p = x;
    const v = h * Math.exp(-t * 1.9) * 0.2 * g;
    put(FX, s + i, v * (0.9 + 0.1 * Math.sin(t * 7)), v * (0.9 + 0.1 * Math.cos(t * 7)));
    put(SEND, s + i, v * 0.3);
  }
}

// ---------- synths ----------
/** Supersaw chord: five detuned saws per note through a filter that closes after the hit. */
function chord(t0, dur, notes, g = 1, {open = 5200, close = 1400, decay = 5, attack = 0.004} = {}) {
  const s = Math.round(t0 * SR), n = Math.round((dur + 0.25) * SR);
  const det = [-0.11, -0.05, 0, 0.05, 0.11];
  const voices = notes.flatMap((m) => det.map((d, k) => ({f: hz(m + d), ph: (rnd() + 1) / 2, pan: (k - 2) / 2.5})));
  let lL = 0, lR = 0, l2L = 0, l2R = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let L = 0, R = 0;
    for (const v of voices) {
      v.ph += v.f / SR; if (v.ph >= 1) v.ph -= 1;
      const x = 2 * v.ph - 1;
      L += x * (1 - v.pan * 0.6); R += x * (1 + v.pan * 0.6);
    }
    const fc = close + (open - close) * Math.exp(-t * decay);
    const a = onePole(fc);
    lL += a * (L - lL); lR += a * (R - lR); l2L += a * (lL - l2L); l2R += a * (lR - l2R);
    const env = Math.min(1, t / attack) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / 0.25));
    const k = (0.085 * g * env) / voices.length * 5;
    put(MUSIC, s + i, l2L * k, l2R * k);
    put(SEND, s + i, (l2L + l2R) * k * 0.18);
  }
}
/** Karplus-Strong pluck: bright, short, a little ring. */
function pluck(t0, note, g = 1, pan = 0) {
  const s = Math.round(t0 * SR), n = Math.round(0.5 * SR), f = hz(note);
  const len = Math.max(2, Math.round(SR / f)), buf = new Float32Array(len);
  for (let i = 0; i < len; i++) buf[i] = rnd();
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const nxt = (idx + 1) % len;
    const v = buf[idx];
    buf[idx] = 0.4985 * (buf[idx] + buf[nxt]);
    idx = nxt;
    const out = v * 0.2 * g * Math.min(1, (n - i) / 2000);
    put(MUSIC, s + i, out * (1 - pan), out * (1 + pan));
    put(ECHO, s + i, out * 0.3);
  }
}
/** Bass: saw + square through an envelope filter. */
function bass(t0, dur, note, g = 1) {
  const s = Math.round(t0 * SR), n = Math.round(dur * SR), f = hz(note);
  let ph = 0, lp = 0, lp2 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR; ph += f / SR; if (ph >= 1) ph -= 1;
    const x = (2 * ph - 1) * 0.6 + (ph < 0.5 ? 0.5 : -0.5) * 0.5 + Math.sin(2 * Math.PI * ph) * 0.6;
    const a = onePole(220 + 2600 * Math.exp(-t * 16));
    lp += a * (x - lp); lp2 += a * (lp - lp2);
    const env = Math.min(1, t / 0.003) * Math.min(1, (dur - t) / 0.02);
    put(MUSIC, s + i, lp2 * 0.17 * g * env);
  }
}
/** Lead: pulse + saw with delayed vibrato; sent to echo and reverb. */
function lead(t0, dur, note, g = 1) {
  const s = Math.round(t0 * SR), n = Math.round((dur + 0.08) * SR), f = hz(note);
  let ph = 0, ph2 = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const vib = 1 + 0.006 * Math.sin(2 * Math.PI * 5.6 * t) * Math.min(1, Math.max(0, (t - 0.12) / 0.15));
    ph += (f * vib) / SR; if (ph >= 1) ph -= 1;
    ph2 += (f * vib * 1.004) / SR; if (ph2 >= 1) ph2 -= 1;
    const x = (ph < 0.3 ? 0.7 : -0.3) + (2 * ph2 - 1) * 0.5;
    lp += onePole(6500) * (x - lp);
    const env = Math.min(1, t / 0.006) * (t < dur ? 1 : Math.max(0, 1 - (t - dur) / 0.08));
    const v = lp * 0.16 * g * env;
    put(MUSIC, s + i, v * 0.95, v * 1.05);
    put(ECHO, s + i, v * 0.45);
    put(SEND, s + i, v * 0.35);
  }
}
function riser(tEnd, dur, g = 1) {
  const n = Math.round(dur * SR), s = Math.round(tEnd * SR) - n;
  let lp = 0, ph = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n, x = rnd();
    lp += (0.02 + 0.6 * p * p) * (x - lp);
    ph += (200 + 1800 * p * p) / SR;
    const v = (lp * 0.8 + Math.sin(2 * Math.PI * ph) * 0.15) * p * p * 0.3 * g;
    put(FX, s + i, v * (1 - 0.3 * p), v * (1 + 0.3 * p));
  }
}
function impact(t0, g = 1) {
  const s = Math.round(t0 * SR), n = Math.round(1.2 * SR);
  let ph = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = 32 + 70 * Math.exp(-t * 10);
    ph += (2 * Math.PI * f) / SR;
    const x = rnd(); lp += 0.05 * (x - lp);
    const v = (Math.sin(ph) * 0.8 + lp * 0.6) * Math.exp(-t * 3.4) * 0.45 * g;
    put(FX, s + i, v);
  }
}

// ---------- score ----------
// D major, I–V–vi–IV: D, A/C#, Bm, G. One chord per bar.
const CHORDS = [[62, 66, 69, 74], [61, 64, 69, 73], [62, 66, 71, 74], [62, 67, 71, 74]];
const ROOTS = [38, 33, 35, 31];
// Lead hook, two bars of 8ths (null = rest, number = MIDI note, held to the next event)
const HOOK = [69, null, 71, 69, 74, null, 73, 71, 69, null, 66, null, 64, 66, 69, null];
const HOOK2 = [74, null, 76, 74, 78, null, 76, 74, 73, null, 69, null, 71, 73, 74, null];

const BAR = 120;          // frames per bar
const ORIGIN = 150;       // the drop at the hero starts bar 0
const cuts = [330, 570, 780, 1260, 1380, 1560];
const drops = [150, 990, 1680];
const inR = (f, a, b) => f >= a && f < b;

// Intro (0-150): a filtered chord swell and a rising arp, riser and snare roll into the drop
chord(0, sec(150), [62, 66, 69, 74], 0.7, {open: 500, close: 4200, decay: 0.7, attack: 1.4});
for (let f = 0; f < 150; f += 7.5) pluck(sec(f), [74, 78, 81, 86][(f / 7.5) % 4], 0.35 + 0.65 * (f / 150), ((f / 7.5) % 2) * 0.6 - 0.3);
riser(sec(150), 2.2, 1);
for (let f = 90; f < 150; f += f < 120 ? 7.5 : 3.75) snare(sec(f), 0.25 + 0.6 * ((f - 90) / 60));

for (let bar = 0; ORIGIN + bar * BAR < 1860; bar++) {
  const b0 = ORIGIN + bar * BAR, c = bar % 4;
  const big = inR(b0, 990, 1260) || inR(b0, 1680, 1860);
  const lean = inR(b0, 1260, 1380); // principles: drums and bass only
  // chords: stabs on the beat and the "and" of 2 and 4 → a pumping, bright bed
  if (!lean) {
    [0, 45, 60, 105].forEach((o, k) => {
      const f = b0 + o; if (f >= 1860) return;
      chord(sec(f), k % 2 ? S16 * 2 : S16 * 3, CHORDS[c], big ? 1.25 : 0.95, {open: big ? 7000 : 5000, close: 1300, decay: 9});
    });
  }
  for (let beat = 0; beat < 4; beat++) {
    const f = b0 + beat * 30; if (f >= 1860) break;
    const preDrop = drops.some((d) => d > f && d - f <= 30 && d !== 150);
    if (!preDrop) kick(sec(f), big ? 1.05 : 1);
    if (beat % 2 === 1) clap(sec(f), big ? 1.1 : 1);
    // 16th hats with accents, open hat on every offbeat 8th
    for (let s16 = 0; s16 < 4; s16++) {
      const fh = f + s16 * 7.5;
      hat(sec(fh), s16 === 2 ? 1 : s16 === 0 ? 0.45 : 0.7, false, s16 % 2 ? 0.35 : -0.35);
      if (fh >= 570) shaker(sec(fh), s16 % 2 ? 1 : 0.6);
    }
    if (big || inR(f, 570, 990)) hat(sec(f + 15), 0.75, true, 0.2);
    // octave-bouncing bass in 8ths
    const root = ROOTS[c];
    bass(sec(f), S16 * 1.8, root, 1);
    bass(sec(f + 15), S16 * 1.6, root + 12, 0.85);
    if (beat === 3) bass(sec(f + 22.5), S16 * 0.9, root + 12, 0.7);
  }
  // plucked arpeggio in 16ths (from the services on)
  if (!lean && b0 >= 510) {
    const tones = CHORDS[c].map((m) => m + 12);
    for (let s16 = 0; s16 < 16; s16++) {
      const f = b0 + s16 * 7.5; if (f >= 1860) break;
      pluck(sec(f), tones[[0, 1, 2, 3, 2, 1, 2, 3][s16 % 8]], 0.75, s16 % 2 ? 0.4 : -0.4);
    }
  }
}
// The hook: over the hero/gap, again an octave up over the showcase and the final chorus
function playHook(from, bars, hook, g) {
  for (let r = 0; r < bars / 2; r++) {
    for (let k = 0; k < 16; k++) {
      const note = hook[k]; if (note == null) continue;
      let len = 1; while (k + len < 16 && hook[k + len] == null) len++;
      const f = from + r * 240 + k * 15;
      if (f >= 1860) return;
      lead(sec(f), len * BEAT / 2 * 0.92, note, g);
    }
  }
}
playHook(150, 4, HOOK, 1);
playHook(630, 2, HOOK, 0.8);
playHook(990, 2, HOOK2, 1.1);
playHook(1470, 2, HOOK, 0.85);
playHook(1710, 2, HOOK2, 1.15);

// builds into the second and third drops
[990, 1680].forEach((d) => {
  riser(sec(d), 2.4, 1);
  for (let f = d - 60; f < d; f += f < d - 30 ? 7.5 : 3.75) snare(sec(f), 0.3 + 0.7 * ((f - (d - 60)) / 60));
});
drops.forEach((d) => { crash(sec(d), 1); impact(sec(d), 0.8); });
cuts.forEach((f) => { crash(sec(f), 0.45); impact(sec(f), 0.35); });

// Ending: the logo hit at 1860 — a big held chord, crash and sub, then it rings out
chord(sec(1860), 2.1, [50, 62, 66, 69, 74, 78], 1.3, {open: 6500, close: 1800, decay: 1.4});
bass(sec(1860), 1.8, 38, 1.2);
kick(sec(1860), 1.1);
crash(sec(1860), 1.2);
impact(sec(1860), 1);
pluck(sec(1860), 86, 0.8, -0.3);
pluck(sec(1867.5), 90, 0.7, 0.3);
pluck(sec(1875), 93, 0.6, -0.2);

// ---------- effects ----------
// Ping-pong echo, dotted 8th
const dly = Math.round(BEAT * 0.75 * SR);
for (let i = dly; i < LEN; i++) {
  ECHO.L[i] += ECHO.R[i - dly] * 0.42;
  ECHO.R[i] += ECHO.L[i - dly] * 0.42;
}
// Schroeder reverb on the send bus
function reverb(x, offs) {
  const out = new Float32Array(LEN);
  [1557, 1617, 1491, 1422, 1277, 1356].forEach((d0) => {
    const d = d0 + offs, buf = new Float32Array(d); let idx = 0, lp = 0;
    for (let i = 0; i < LEN; i++) {
      const y = buf[idx]; lp = y * 0.75 + lp * 0.25;
      buf[idx] = x[i] + lp * 0.86; idx = (idx + 1) % d; out[i] += y / 6;
    }
  });
  [556, 441, 341].forEach((d0) => {
    const d = d0 + offs, buf = new Float32Array(d); let idx = 0;
    for (let i = 0; i < LEN; i++) {
      const b = buf[idx], v = out[i];
      buf[idx] = v + b * 0.5; out[i] = b - v * 0.5; idx = (idx + 1) % d;
    }
  });
  return out;
}
const revL = reverb(SEND.L, 0), revR = reverb(SEND.R, 23);

// ---------- mix ----------
const L = new Float32Array(LEN), R = new Float32Array(LEN);
let peak = 0;
for (let i = 0; i < LEN; i++) {
  const d = DUCK[i];
  let l = DRUMS.L[i] + (MUSIC.L[i] + ECHO.L[i] * 0.5) * d + revL[i] * 0.9 + FX.L[i];
  let r = DRUMS.R[i] + (MUSIC.R[i] + ECHO.R[i] * 0.5) * d + revR[i] * 0.9 + FX.R[i];
  const fade = Math.min(1, (LEN - i) / (SR * 1.4));
  l = Math.tanh(l * 1.25) * fade; r = Math.tanh(r * 1.25) * fade;
  L[i] = l; R[i] = r; peak = Math.max(peak, Math.abs(l), Math.abs(r));
}
const g = 0.92 / peak;
const buf = Buffer.alloc(44 + LEN * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + LEN * 4, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(LEN * 4, 40);
for (let i = 0; i < LEN; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
writeFileSync(new URL('../public/audio/track.wav', import.meta.url), buf);
console.log('track.wav', (LEN / SR).toFixed(1) + 's', 'peak gain', g.toFixed(2));
