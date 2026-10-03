// Procedurally generated soundtrack for the North Frame film.
// 120 BPM, A minor. Kick/hat/bass/pad/risers/impacts, every hit on the grid
// the video cuts on. Writes public/audio/track.wav (44.1 kHz, 16-bit stereo).
import {writeFileSync} from 'node:fs';

const SR = 44100, FPS = 30, BPM = 120;
const TOTAL_FRAMES = 1920;
const LEN = Math.ceil((TOTAL_FRAMES / FPS) * SR) + SR; // +1s tail
const L = new Float32Array(LEN), R = new Float32Array(LEN);
const beatSec = 60 / BPM;
const f2s = f => Math.round((f / FPS) * SR);
const cuts = [150, 330, 570, 780, 990, 1260, 1380, 1560, 1680];

let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const add = (i, l, r = l) => { if (i >= 0 && i < LEN) { L[i] += l; R[i] += r; } };
const hz = n => 440 * Math.pow(2, (n - 69) / 12);

function kick(t0, gain = 0.9) {
  const s = f2s(t0 * FPS), n = Math.round(0.45 * SR); let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = 48 + 110 * Math.exp(-t * 28);
    ph += (2 * Math.PI * f) / SR;
    const env = Math.exp(-t * 7.5) * (t < 0.003 ? t / 0.003 : 1);
    const click = i < 220 ? rnd() * 0.25 * (1 - i / 220) : 0;
    add(s + i, (Math.sin(ph) * env + click) * gain);
  }
}
function hat(t0, gain = 0.12, open = false) {
  const s = f2s(t0 * FPS), n = Math.round((open ? 0.22 : 0.06) * SR); let hp = 0, prev = 0;
  for (let i = 0; i < n; i++) {
    const x = rnd(); hp = 0.86 * (hp + x - prev); prev = x;
    const env = Math.exp(-(i / SR) * (open ? 14 : 60));
    add(s + i, hp * env * gain * 0.9, hp * env * gain);
  }
}
function bass(t0, dur, note, gain = 0.32) {
  const s = f2s(t0 * FPS), n = Math.round(dur * SR), f = hz(note); let lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const saw = 2 * ((t * f) % 1) - 1, sub = Math.sin(2 * Math.PI * f * t);
    lp += 0.08 * (saw - lp);
    const env = Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.08) * (0.75 + 0.25 * Math.exp(-t * 6));
    add(s + i, (sub * 0.75 + lp * 0.35) * env * gain);
  }
}
function pad(t0, dur, notes, gain = 0.07) {
  const s = f2s(t0 * FPS), n = Math.round(dur * SR);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.9) * Math.min(1, (dur - t) / 1.2);
    let l = 0, r = 0;
    notes.forEach((m, k) => {
      const f = hz(m);
      l += Math.sin(2 * Math.PI * f * 1.003 * t + k) + 0.3 * Math.sin(4 * Math.PI * f * t);
      r += Math.sin(2 * Math.PI * f * 0.997 * t + k * 2) + 0.3 * Math.sin(4 * Math.PI * f * t);
    });
    add(s + i, l * env * gain, r * env * gain);
  }
}
function riser(tEnd, dur = 1.0, gain = 0.22) {
  const n = Math.round(dur * SR), s = f2s(tEnd * FPS) - n; let lp = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n, cutoff = 0.01 + 0.5 * p * p;
    lp += cutoff * (rnd() - lp);
    add(s + i, lp * p * p * gain, lp * p * p * gain * 0.9);
  }
}
function impact(t0, gain = 0.55) {
  const s = f2s(t0 * FPS), n = Math.round(1.4 * SR); let ph = 0, lp = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR, f = 34 + 60 * Math.exp(-t * 9);
    ph += (2 * Math.PI * f) / SR;
    lp += 0.04 * (rnd() - lp);
    const env = Math.exp(-t * 3.2);
    add(s + i, (Math.sin(ph) * 0.9 + lp * 1.6 * Math.exp(-t * 10)) * env * gain);
  }
}
function tick(t0, gain = 0.18) { // small UI blip for type slams
  const s = f2s(t0 * FPS), n = Math.round(0.05 * SR);
  for (let i = 0; i < n; i++) add(s + i, Math.sin(2 * Math.PI * 1800 * (i / SR)) * Math.exp(-(i / SR) * 90) * gain);
}

// --- arrangement (frames) ---
const prog = [57, 53, 48, 55];                       // A, F, C, G (bass, MIDI)
const chords = [[69, 72, 76], [65, 69, 72], [60, 64, 67], [67, 71, 74]];

// Intro: pad swell + rising pulse, riser into the first cut
pad(0, 5.2, [57, 64, 69, 72], 0.06);
for (let f = 0; f < 150; f += 15) tick(f, 0.04 + 0.12 * (f / 150));
riser(150, 2.5, 0.25);

for (let bar = 0; bar * 60 + 150 < 1800; bar++) {
  const f0 = 150 + bar * 60, c = bar % 4;
  pad(f0 / FPS, 2.05, chords[c], 0.045);
  const groove = f0 >= 330;
  for (let b = 0; b < 4; b++) {
    const fb = f0 + b * 15;
    if (fb >= 1800) break;
    kick(fb / FPS, fb >= 990 && fb < 1260 ? 0.95 : 0.85);
    if (groove) { hat((fb + 7.5) / FPS, 0.1); if (b === 3) hat((fb + 11.25) / FPS, 0.07); }
    if (fb >= 570) bass(fb / FPS, beatSec * 0.9, prog[c] - 12 + (b === 2 ? 12 : 0), 0.26);
  }
}
cuts.forEach(f => impact(f / FPS, f === 150 || f === 990 || f === 1680 ? 0.6 : 0.32));
[990, 1680].forEach(f => riser(f / FPS, 1.0, 0.18));
// Outro: drums drop at 1800, final chord and logo hit at 1860
pad(1800 / FPS, 4.2, [57, 64, 69, 72, 76], 0.07);
impact(1860 / FPS, 0.5);

// --- master: soft clip + normalise, fade out ---
let peak = 0;
for (let i = 0; i < LEN; i++) {
  const fade = Math.min(1, (LEN - i) / (SR * 1.5));
  L[i] = Math.tanh(L[i] * 1.1) * fade; R[i] = Math.tanh(R[i] * 1.1) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const g = 0.89 / peak;
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
