import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Bg, Label, inOut, lerp, prog, back, useShake} from '../lib';
import {DISPLAY, INK, IVORY, UI} from '../theme';

const STEPS = [
  {w: 'Discover', line: 'Understand the business, its positioning and its goals.'},
  {w: 'Frame', line: 'Define how the business should be presented digitally.'},
  {w: 'Build', line: 'Design and develop the experience.'},
  {w: 'Grow', line: 'Connect the website, social presence and advertising into a clearer growth system.'},
];
const STEP = 45;

/** The frame assembling: corners → closed frame → composition → arrow out. */
const Assembly: React.FC<{f: number}> = ({f}) => {
  const S = 520;
  const c = prog(f, 0, 16, back);
  const close = prog(f, STEP, STEP + 18, inOut);
  const fill = [0, 1, 2].map((i) => prog(f, STEP * 2 + i * 5, STEP * 2 + i * 5 + 14, back));
  const grow = prog(f, STEP * 3, STEP * 3 + 22, inOut);
  const k = 90; // corner length
  const off = (1 - c) * 160;
  const corner = (x: number, y: number, sx: number, sy: number) =>
    `M${x + sx * (k - off * 0)} ${y} H${x} V${y + sy * k}`;
  void corner;
  const pathCorner = (x: number, y: number, sx: number, sy: number) => {
    const ox = x - sx * off;
    const oy = y - sy * off;
    return `M${ox + sx * lerp(k, S / 2, close)} ${oy} H${ox} V${oy + sy * lerp(k, S / 2, close)}`;
  };
  return (
    <svg width={S + 400} height={S + 400} viewBox={`-200 -200 ${S + 400} ${S + 400}`} style={{overflow: 'visible'}}>
      <g stroke={INK} strokeWidth={10} fill="none" strokeLinecap="square" opacity={c}>
        <path d={pathCorner(0, 0, 1, 1)} />
        <path d={pathCorner(S, 0, -1, 1)} />
        <path d={pathCorner(S, S, -1, -1)} />
        <path d={pathCorner(0, S, 1, -1)} />
      </g>
      {/* composition */}
      <g fill={INK}>
        <rect x={60} y={60} width={250} height={180} rx={24} transform={`translate(${(1 - fill[0]) * -400} 0)`} opacity={fill[0] > 0 ? 1 : 0} />
        <circle cx={400} cy={150} r={lerp(0, 70, fill[1])} />
        <rect x={60} y={300} width={400} height={30} rx={15} transform={`scale(${fill[2]} 1)`} transform-origin="60 300" />
        <rect x={60} y={360} width={280} height={30} rx={15} transform={`scale(${fill[2]} 1)`} transform-origin="60 360" />
        <rect x={60} y={420} width={180} height={30} rx={15} transform={`scale(${fill[2]} 1)`} transform-origin="60 420" />
      </g>
      {/* arrow out */}
      {grow > 0 && (
        <g stroke={INK} strokeWidth={14} fill="none" strokeLinecap="square">
          <path d={`M${S / 2} ${S / 2} L${lerp(S / 2, S + 170, grow)} ${lerp(S / 2, -170, grow)}`} />
          {grow > 0.95 && <path d={`M${S + 40} -170 H${S + 170} V-40`} />}
        </g>
      )}
    </svg>
  );
};

export const Approach: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(3, Math.floor(f / STEP));
  const local = f - i * STEP;
  const shake = useShake([0, 45, 90, 135], 12);
  return (
    <Bg tone="light">
      <AbsoluteFill style={{transform: shake}}>
        <Label style={{position: 'absolute', left: 100, top: 60}}>05 — Approach</Label>
        <Label style={{position: 'absolute', right: 100, top: 60}}>Four steps, one direction.</Label>
        <div style={{position: 'absolute', left: 30, top: 80}}>
          <Assembly f={f} />
        </div>
        <div style={{position: 'absolute', left: 1000, top: 250, width: 860}}>
          <div style={{overflow: 'hidden', height: 220}}>
            <div style={{fontFamily: DISPLAY, fontSize: 250, lineHeight: 0.85, transform: `translateY(${(1 - prog(local, 0, 12)) * 100}%)`}}>
              0{i + 1}
            </div>
          </div>
          <div style={{overflow: 'hidden', paddingTop: 12}}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontSize: 200,
                lineHeight: 0.85,
                textTransform: 'uppercase',
                transform: `translateY(${(1 - prog(local, 2, 14)) * 110}%)`,
              }}
            >
              {STEPS[i].w}
            </div>
          </div>
          <div style={{fontFamily: UI, fontWeight: 500, fontSize: 36, lineHeight: 1.3, marginTop: 34, opacity: prog(local, 8, 18), maxWidth: 760}}>
            {STEPS[i].line}
          </div>
        </div>
        <div style={{position: 'absolute', left: 1000, bottom: 200, display: 'flex', gap: 14}}>
          {STEPS.map((s, j) => (
            <div
              key={s.w}
              style={{
                padding: '16px 26px',
                borderRadius: 1600,
                border: `3px solid ${INK}`,
                background: j <= i ? INK : IVORY,
                color: j <= i ? IVORY : INK,
                fontFamily: UI,
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: '0.032em',
                textTransform: 'uppercase',
              }}
            >
              {s.w}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
