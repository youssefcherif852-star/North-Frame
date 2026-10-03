import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {DISPLAY, INK, IVORY, UI} from './theme';

export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const back = Easing.bezier(0.34, 1.56, 0.64, 1);

/** 0→1 between frames a and b, clamped. */
export const prog = (f: number, a: number, b: number, easing = outExpo) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic pseudo-random in [0,1). */
export const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export type Tone = 'dark' | 'light';
export const bgOf = (t: Tone) => (t === 'dark' ? INK : IVORY);
export const fgOf = (t: Tone) => (t === 'dark' ? IVORY : INK);

export const Bg: React.FC<{tone: Tone; children?: React.ReactNode}> = ({tone, children}) => (
  <AbsoluteFill style={{background: bgOf(tone), color: fgOf(tone), overflow: 'hidden'}}>{children}</AbsoluteFill>
);

/** A display line that rises out of a mask. */
export const Rise: React.FC<{
  at: number;
  size: number;
  children: React.ReactNode;
  dur?: number;
  style?: React.CSSProperties;
  out?: number;
}> = ({at, size, children, dur = 14, style, out}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + dur);
  const o = out === undefined ? 0 : prog(f, out, out + 10, inOut);
  return (
    <div style={{overflow: 'hidden', lineHeight: 0.85, paddingTop: size * 0.06, ...style}}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: size,
          lineHeight: 0.85,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          transform: `translateY(${(1 - p) * 140 - o * 140}%)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** A display line that slams in from a larger scale. */
export const Slam: React.FC<{at: number; size: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  at,
  size,
  children,
  style,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 9);
  if (f < at) return null;
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 0.85,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        transform: `scale(${lerp(1.6, 1, p)})`,
        opacity: Math.min(1, p * 3),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Label: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      fontFamily: UI,
      fontWeight: 700,
      fontSize: 22,
      letterSpacing: '0.032em',
      textTransform: 'uppercase',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{children: React.ReactNode; tone: Tone; filled?: boolean; style?: React.CSSProperties}> = ({
  children,
  tone,
  filled,
  style,
}) => {
  const fg = fgOf(tone);
  const bg = bgOf(tone);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: '22px 34px',
        borderRadius: 1600,
        border: `2px solid ${fg}`,
        background: filled ? fg : bg,
        color: filled ? bg : fg,
        fontFamily: UI,
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: '0.032em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** SVG path that draws itself between frames a and b. */
export const Draw: React.FC<
  {d: string; a: number; b: number; easing?: (t: number) => number} & React.SVGProps<SVGPathElement>
> = ({d, a, b, easing, ...rest}) => {
  const f = useCurrentFrame();
  const p = prog(f, a, b, easing);
  return (
    <path
      d={d}
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
      fill="none"
      opacity={p > 0 ? 1 : 0}
      {...rest}
    />
  );
};

/** Clip-path reveal used when a scene enters over the previous one. */
export type Reveal = 'up' | 'left' | 'right' | 'iris' | 'cut' | 'blinds';
export const RevealIn: React.FC<{kind: Reveal; dur?: number; children: React.ReactNode}> = ({kind, dur = 12, children}) => {
  const f = useCurrentFrame();
  const p = prog(f, 0, dur, inOut);
  let clip = 'none';
  if (kind === 'up') clip = `inset(${(1 - p) * 100}% 0 0 0)`;
  if (kind === 'left') clip = `inset(0 0 0 ${(1 - p) * 100}%)`;
  if (kind === 'right') clip = `inset(0 ${(1 - p) * 100}% 0 0)`;
  if (kind === 'iris') clip = `circle(${p * 120}% at 50% 50%)`;
  if (kind === 'blinds') {
    const n = 8;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const q = prog(f, i * 1.2, i * 1.2 + dur * 0.7, inOut);
      const x0 = (i / n) * 100;
      const x1 = x0 + (q * 100) / n;
      pts.push(`M${x0} 0H${x1}V100H${x0}Z`);
    }
    return (
      <AbsoluteFill>
        <svg width={0} height={0} style={{position: 'absolute'}}>
          <defs>
            <clipPath id={`blinds-${f}`} clipPathUnits="objectBoundingBox">
              <path d={pts.join('')} transform="scale(0.01)" />
            </clipPath>
          </defs>
        </svg>
        <AbsoluteFill style={{clipPath: `url(#blinds-${f})`}}>{children}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill style={{clipPath: clip}}>{children}</AbsoluteFill>;
};

/** Small offset on the beats that carry an impact. */
export const useShake = (hits: number[], amp = 14) => {
  const f = useCurrentFrame();
  let x = 0;
  let y = 0;
  for (const h of hits) {
    const d = f - h;
    if (d >= 0 && d < 10) {
      const k = (1 - d / 10) ** 2 * amp;
      x += Math.sin(d * 2.7 + h) * k;
      y += Math.cos(d * 3.1 + h) * k;
    }
  }
  return `translate(${x}px, ${y}px)`;
};

/** The ink marquee strip. */
export const Marquee: React.FC<{tone: Tone; speed?: number; size?: number; items?: string[]; style?: React.CSSProperties}> = ({
  tone,
  speed = 6,
  size = 30,
  items = ['Digital growth, framed properly', 'Websites', 'Social strategy', 'Paid growth', 'The Ticket to Scale'],
  style,
}) => {
  const f = useCurrentFrame();
  const group = (k: number) =>
    items.flatMap((t, i) => [
      <span key={`${k}t${i}`}>{t}</span>,
      <span key={`${k}s${i}`}>★</span>,
    ]);
  return (
    <div
      style={{
        background: bgOf(tone),
        color: fgOf(tone),
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: `${size * 0.5}px 0`,
        borderTop: `2px solid ${fgOf(tone)}`,
        borderBottom: `2px solid ${fgOf(tone)}`,
        ...style,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          gap: size * 1.3,
          transform: `translateX(${-((f * speed) % 2400)}px)`,
          fontFamily: UI,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: '0.032em',
          textTransform: 'uppercase',
        }}
      >
        {group(0)}
        {group(1)}
        {group(2)}
        {group(3)}
      </div>
    </div>
  );
};

/** Icons from the site sprite, as path data on a 24-unit grid. */
export const ICONS: Record<string, string[]> = {
  web: ['M3 3h18v18H3z', 'M3 8h18', 'M7 13h10'],
  social: ['M7.6 11 16.4 6.5', 'M7.6 13 16.4 17.5', 'M3.2 12a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0', 'M16.2 5.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0', 'M16.2 18.5a2.3 2.3 0 1 0 4.6 0a2.3 2.3 0 1 0 -4.6 0'],
  growth: ['M3 21h18', 'M3 21 21 3', 'M13 3h8v8'],
  clarity: ['M3 6h18v12H3z', 'M9.8 12a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0'],
  positioning: ['M3 12h18', 'M7 4h10v6H7z', 'M7 14h10v6H7z'],
  conversion: ['M3 12h13', 'M12 8l4 4-4 4', 'M20 3v18'],
  direction: ['M5 6h13', 'M15.5 3.5l2.5 2.5-2.5 2.5', 'M5 12h13', 'M15.5 9.5l2.5 2.5-2.5 2.5', 'M5 18h13', 'M15.5 15.5l2.5 2.5-2.5 2.5'],
};

export const Icon: React.FC<{name: string; size: number; at: number; color: string; stroke?: number; dur?: number}> = ({
  name,
  size,
  at,
  color,
  stroke = 1.6,
  dur = 18,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{overflow: 'visible'}}>
    {ICONS[name].map((d, i) => (
      <Draw key={i} d={d} a={at + i * 3} b={at + i * 3 + dur} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </svg>
);

/** The North Frame mark: open frame + diagonal. */
export const Mark: React.FC<{size: number; color: string; at: number; stroke?: number}> = ({size, color, at, stroke = 2.6}) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{overflow: 'visible'}}>
    <Draw d="M6 26V6h20v20" a={at} b={at + 20} stroke={color} strokeWidth={stroke} strokeLinecap="square" />
    <Draw d="M6 26 26 6" a={at + 10} b={at + 26} stroke={color} strokeWidth={stroke} strokeLinecap="square" />
  </svg>
);
