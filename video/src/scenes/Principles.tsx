import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Bg, Icon, Label, Tone, fgOf, lerp, prog, useShake} from '../lib';
import {DISPLAY, UI} from '../theme';

const P = [
  {w: 'Clarity.', icon: 'clarity', line: 'Everything has a purpose.'},
  {w: 'Positioning.', icon: 'positioning', line: 'The digital presence should reflect the quality of the business.'},
  {w: 'Conversion.', icon: 'conversion', line: 'Design should guide people toward taking action.'},
  {w: 'Direction.', icon: 'direction', line: 'Every digital element should work toward the same objective.'},
];

const Card: React.FC<{i: number; tone: Tone}> = ({i, tone}) => {
  const f = useCurrentFrame();
  const p = P[i];
  const shake = useShake([0], 16);
  const x = lerp(260, 0, prog(f, 0, 12));
  return (
    <Bg tone={tone}>
      <AbsoluteFill style={{transform: shake, padding: '0 100px', justifyContent: 'center'}}>
        <Label style={{position: 'absolute', left: 100, top: 60}}>04 — Why North Frame</Label>
        <Label style={{position: 'absolute', right: 100, top: 60}}>0{i + 1} / 04</Label>
        <div style={{display: 'flex', alignItems: 'center', gap: 60}}>
          <div style={{width: 200, height: 200, borderRadius: '50%', border: `4px solid ${fgOf(tone)}`, display: 'grid', placeItems: 'center', flex: 'none'}}>
            <Icon name={p.icon} size={104} at={2} color={fgOf(tone)} stroke={2} dur={14} />
          </div>
          <div style={{fontFamily: DISPLAY, fontSize: 230, lineHeight: 0.85, textTransform: 'uppercase', whiteSpace: 'nowrap', transform: `translateX(${x}px)`}}>
            {p.w}
          </div>
        </div>
        <div style={{fontFamily: UI, fontWeight: 500, fontSize: 40, marginTop: 50, marginLeft: 260, opacity: prog(f, 6, 14)}}>{p.line}</div>
      </AbsoluteFill>
    </Bg>
  );
};

export const Principles: React.FC = () => (
  <AbsoluteFill>
    {P.map((_, i) => (
      <Sequence key={i} from={i * 30} durationInFrames={i === 3 ? 50 : 30}>
        <Card i={i} tone={i % 2 === 0 ? 'dark' : 'light'} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
