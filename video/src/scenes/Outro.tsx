import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Bg, Label, Marquee, Pill, Rise, Slam, inOut, lerp, prog, useShake, back} from '../lib';
import {Field, Logo3D, Ribbon} from '../three-bits';
import {Cam} from '../three-bits';
import {DISPLAY, INK, IVORY, UI} from '../theme';

const RIB: [number, number, number][] = [
  [-14, -6, -3],
  [-8, 2, -1],
  [-2, -4, 0],
  [4, 4, -1],
  [9, -2, 0],
  [15, 5, -3],
];

const Direction: React.FC = () => {
  const f = useCurrentFrame();
  const shake = useShake([0, 15, 60, 75], 16);
  const box = prog(f, 60, 80, inOut);
  return (
    <Bg tone="light">
      <ThreeCanvas width={1920} height={1080} flat camera={{position: [0, 0, 10], fov: 45}} style={{position: 'absolute'}}>
        <Cam z={16} fov={45} />
        <color attach="background" args={[IVORY]} />
        <group rotation={[0.1, 0.2 - f / 400, 0]}>
          <Ribbon points={RIB} radius={0.9} p={prog(f, 0, 80, inOut)} fill={IVORY} line={INK} outline={0.07} />
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: shake}}>
        <Label style={{fontSize: 24, marginBottom: 40, background: IVORY, padding: '4px 10px'}}>07 — Start here</Label>
        <Slam at={0} size={180}>
          Your business
        </Slam>
        <Slam at={15} size={180}>
          has a direction.
        </Slam>
        <div style={{position: 'relative', marginTop: 40, padding: '18px 50px 4px'}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: INK,
              borderRadius: 30,
              clipPath: `inset(0 ${(1 - box) * 100}% 0 0 round 30px)`,
            }}
          />
          <div style={{position: 'relative', color: IVORY}}>
            <Rise at={66} size={160}>
              Let’s frame it properly.
            </Rise>
          </div>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};

const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const press = f >= 30 && f < 36 ? 0.94 : 1;
  const p = prog(f, 0, 14, back);
  return (
    <Bg tone="light">
      <div style={{position: 'absolute', left: -200, right: -200, top: 160, transform: 'rotate(-6deg)'}}>
        <Marquee tone="dark" speed={10} size={40} />
      </div>
      <div style={{position: 'absolute', left: -200, right: -200, bottom: 250, transform: 'rotate(5deg)'}}>
        <Marquee tone="light" speed={-8} size={40} items={['Websites', 'Social strategy', 'Paid growth', 'One partner', 'One direction']} />
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{fontFamily: UI, fontWeight: 500, fontSize: 38, marginBottom: 50, background: IVORY, padding: '6px 16px', opacity: prog(f, 4, 14)}}>
          Tell us where your business is today and where you want to take it.
        </div>
        <div style={{transform: `scale(${p * press}) rotate(${(1 - p) * -10 - (f > 30 ? 1.5 : 0)}deg)`}}>
          <Pill tone="light" filled style={{fontSize: 56, padding: '44px 76px', gap: 26}}>
            Start a conversation
            <svg width={56} height={56} viewBox="0 0 24 24">
              <path d="M4 12h15M13 6l6 6-6 6" stroke={IVORY} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Pill>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};

const Lockup: React.FC = () => {
  const f = useCurrentFrame();
  const settle = prog(f, 0, 60, inOut);
  return (
    <Bg tone="dark">
      <ThreeCanvas width={1920} height={1080} flat camera={{position: [0, 0, 10], fov: 40}} style={{position: 'absolute'}}>
        <Cam z={lerp(11, 12.5, settle)} fov={40} />
        <color attach="background" args={[INK]} />
        <Field f={f} color={IVORY} speed={0.03} count={900} />
        <group position={[0, 1.35, 0]} rotation={[0, lerp(-1.2, 0, prog(f, 0, 40, inOut)), 0]}>
          <Logo3D f={f + 30} start={0} scale={0.42} />
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 190}}>
        <Rise at={0} size={220} style={{textAlign: 'center'}} dur={12}>
          North Frame
        </Rise>
        <div style={{marginTop: 30, opacity: prog(f, 10, 22)}}>
          <Label style={{fontSize: 28}}>Digital growth, framed properly.</Label>
        </div>
      </AbsoluteFill>
      <Label style={{position: 'absolute', left: 60, bottom: 52, opacity: prog(f, 18, 30)}}>Digital growth partner for hospitality businesses</Label>
      <Label style={{position: 'absolute', right: 60, bottom: 52, opacity: prog(f, 18, 30)}}>© 2026 North Frame</Label>
    </Bg>
  );
};

export const Outro: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={120}>
      <Direction />
    </Sequence>
    <Sequence from={120} durationInFrames={60}>
      <Cta />
    </Sequence>
    <Sequence from={180} durationInFrames={140}>
      <Lockup />
    </Sequence>
  </AbsoluteFill>
);

void DISPLAY;
void Slam;
