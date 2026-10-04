import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import captions from '../public/voice/captions.json';
import {INK, IVORY, UI} from './theme';
import {FPS} from './timeline';

type Word = {w: string; s: number; e: number};
type Line = {id: string; at: number; dur: number; words: Word[]};
const LINES = captions as Line[];

/** Splits a line into caption chunks: at sentence ends, or every six words. */
const chunks = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    if (/[.!?]$/.test(w.w) || cur.length >= 6) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

/** Seconds during which any line is being spoken (for ducking the music). */
export const voiceActive = (t: number) => LINES.some((l) => t >= l.at - 0.1 && t <= l.at + l.dur + 0.15);

/** Live captions: the current phrase in an ink pill, the spoken word filled ivory. */
export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let shown: {words: Word[]; at: number; from: number; to: number} | null = null;
  for (const l of LINES) {
    const cs = chunks(l.words);
    cs.forEach((c, i) => {
      const from = l.at + c[0].s - 0.08;
      const next = cs[i + 1];
      const to = next ? l.at + next[0].s - 0.08 : l.at + c[c.length - 1].e + 0.35;
      if (t >= from && t < to) shown = {words: c, at: l.at, from, to};
    });
  }
  if (!shown) return null;
  const s = shown as {words: Word[]; at: number; from: number; to: number};
  const pop = interpolate(t, [s.from, s.from + 0.12], [0.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fade = interpolate(t, [s.to - 0.1, s.to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 96, pointerEvents: 'none'}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 4,
          maxWidth: 1300,
          padding: '12px 14px',
          borderRadius: 1600,
          background: INK,
          border: `2px solid ${IVORY}`,
          outline: `2px solid ${INK}`,
          transform: `scale(${pop})`,
          opacity: fade,
        }}
      >
        {s.words.map((w, i) => {
          const on = t >= s.at + w.s && t < s.at + w.e + 0.05;
          return (
            <span
              key={i}
              style={{
                fontFamily: UI,
                fontWeight: 700,
                fontSize: 38,
                lineHeight: 1,
                letterSpacing: '-0.01em',
                padding: '10px 14px',
                borderRadius: 1600,
                background: on ? IVORY : INK,
                color: on ? INK : IVORY,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const VOICE_LINES = LINES;
