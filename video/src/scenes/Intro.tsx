import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Bg, Label, Rise, inOut, lerp, prog} from '../lib';
import {Field, Mark3D} from '../three-bits';
import {Cam} from '../three-bits';
import {INK, IVORY, UI} from '../theme';

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const push = prog(f, 0, 90, inOut);
  const lift = prog(f, 84, 108, inOut);
  const rush = prog(f, 132, 150, (t) => t * t * t);
  const camZ = lerp(14, 9, push) - rush * 8.4;
  const tc = `00:00:${String(Math.floor(f / 30)).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`;
  const hud = prog(f, 4, 20);
  return (
    <Bg tone="dark">
      <ThreeCanvas width={1920} height={1080} flat camera={{position: [0, 0, 10], fov: 40}} style={{position: 'absolute'}}>
        <Cam z={camZ} fov={40} />
        <color attach="background" args={[INK]} />
        <Field f={f + 200} color={IVORY} speed={0.08 + rush * 1.5} />
        <group position={[0, lerp(0, 1.25, lift), 0]} rotation={[lerp(0.5, 0, push), lerp(-0.7, 0, push), 0]}>
          <Mark3D f={f} start={6} scale={lerp(1, 0.55, lift)} />
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 170, opacity: 1 - rush}}>
        <Rise at={92} size={210} style={{textAlign: 'center'}}>
          North Frame
        </Rise>
        <div style={{opacity: prog(f, 104, 118), marginTop: 28}}>
          <Label style={{fontSize: 26}}>Digital growth partner for hospitality businesses</Label>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{padding: 56, opacity: hud * (1 - rush), fontFamily: UI}}>
        <Label style={{position: 'absolute', left: 56, top: 52}}>North Frame</Label>
        <Label style={{position: 'absolute', right: 56, top: 52}}>Hospitality — 2026</Label>
        <Label style={{position: 'absolute', left: 56, bottom: 52}}>Digital growth, framed properly</Label>
        <Label style={{position: 'absolute', right: 56, bottom: 52, fontVariantNumeric: 'tabular-nums'}}>{tc}</Label>
        {[
          [40, 40, '0 0'],
          [1880, 40, '90'],
          [1880, 1040, '180'],
          [40, 1040, '270'],
        ].map(([x, y, r], i) => (
          <svg key={i} width={40} height={40} viewBox="0 0 40 40" style={{position: 'absolute', left: (x as number) - 20, top: (y as number) - 20, transform: `rotate(${r === '0 0' ? 0 : r}deg)`}}>
            <path d="M8 30V8h22" stroke={IVORY} strokeWidth={2} fill="none" />
          </svg>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{background: IVORY, opacity: prog(f, 144, 150, (t) => t)}} />
    </Bg>
  );
};
