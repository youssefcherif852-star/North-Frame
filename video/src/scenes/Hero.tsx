import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Bg, Icon, Label, Logo, Marquee, Pill, Slam, inOut, lerp, prog, useShake, back} from '../lib';
import {Ribbon} from '../three-bits';
import {Cam} from '../three-bits';
import {DISPLAY, INK, IVORY, UI} from '../theme';

const PTS: [number, number, number][] = [
  [-13, -5, -2],
  [-8, 3.5, 0],
  [-3, -2.5, 1],
  [1.5, 3, 0],
  [6, -3, 1],
  [10, 2.5, -1],
  [15, -1, -3],
];
const PTS2: [number, number, number][] = [
  [15, -8, -4],
  [9, -5.5, -2],
  [3, -7.5, -1],
  [-3, -5, -2],
  [-9, -7.5, -3],
  [-15, -4, -5],
];

const Sticker: React.FC<{at: number; x: number; y: number; r: number; size: number; round?: boolean; dark?: boolean; children: React.ReactNode}> = ({
  at,
  x,
  y,
  r,
  size,
  round,
  dark,
  children,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, at + 14, back);
  if (f < at) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: round ? '50%' : 28,
        border: `3px solid ${INK}`,
        background: dark ? INK : IVORY,
        color: dark ? IVORY : INK,
        display: 'grid',
        placeItems: 'center',
        transform: `scale(${p}) rotate(${r + (1 - p) * 40 + Math.sin(f / 14 + x) * 3}deg)`,
      }}
    >
      {children}
    </div>
  );
};

export const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const shake = useShake([0, 15], 18);
  const rib = prog(f, 0, 70, inOut);
  const rib2 = prog(f, 20, 100, inOut);
  const drift = f / 180;
  const lede = prog(f, 75, 95);
  const exit = prog(f, 168, 180, inOut);
  return (
    <Bg tone="light">
      <AbsoluteFill style={{transform: `${shake} scale(${lerp(1, 1.08, exit)})`}}>
        <ThreeCanvas width={1920} height={1080} flat camera={{position: [0, 0, 10], fov: 45}} style={{position: 'absolute'}}>
        <Cam z={16} fov={45} />
          <color attach="background" args={[IVORY]} />
          <group rotation={[0.15 - drift * 0.2, -0.25 + drift * 0.4, 0]}>
            <Ribbon points={PTS} radius={0.95} p={rib} fill={IVORY} line={INK} outline={0.07} />
            <Ribbon points={PTS2} radius={0.45} p={rib2} fill={IVORY} line={INK} outline={0.05} />
          </group>
        </ThreeCanvas>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', color: INK}}>
          <div style={{opacity: prog(f, 0, 8)}}>
            <Label style={{textAlign: 'center', marginBottom: 34, fontSize: 24}}>North Frame · Hospitality</Label>
          </div>
          <Slam at={0} size={215}>
            Digital growth,
          </Slam>
          <Slam at={15} size={215}>
            framed properly.
          </Slam>
          <div
            style={{
              marginTop: 44,
              maxWidth: 1060,
              textAlign: 'center',
              fontFamily: UI,
              fontWeight: 500,
              fontSize: 32,
              lineHeight: 1.3,
              background: IVORY,
              padding: '8px 18px',
              borderRadius: 16,
              opacity: lede,
              transform: `translateY(${(1 - lede) * 30}px)`,
            }}
          >
            North Frame helps hospitality businesses build a stronger digital presence through premium websites, strategic
            marketing and growth-focused systems.
          </div>
          <div style={{display: 'flex', gap: 18, marginTop: 40}}>
            {[
              ['Start a conversation', true, 105],
              ['Explore what we do', false, 112],
            ].map(([t, filled, at]) => {
              const q = prog(f, at as number, (at as number) + 12, back);
              return (
                <div key={t as string} style={{transform: `translateY(${(1 - q) * 60}px) rotate(${(1 - q) * -6}deg)`, opacity: Math.min(1, q * 2)}}>
                  <Pill tone="light" filled={filled as boolean}>
                    {t as string}
                  </Pill>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
        <Sticker at={30} x={170} y={150} r={-10} size={150} dark>
          <Logo width={88} color={IVORY} />
        </Sticker>
        <Sticker at={45} x={1600} y={120} r={9} size={140} round>
          <Icon name="web" size={66} at={50} color={INK} stroke={2} />
        </Sticker>
        <Sticker at={60} x={1560} y={720} r={-7} size={130} dark>
          <Icon name="growth" size={60} at={64} color={IVORY} stroke={2} />
        </Sticker>
        <Sticker at={75} x={210} y={760} r={12} size={124} round>
          <Icon name="social" size={60} at={78} color={INK} stroke={2} />
        </Sticker>
        <div style={{position: 'absolute', left: -20, right: -20, bottom: 0, transform: `translateY(${(1 - prog(f, 120, 136)) * 140}px)`}}>
          <Marquee tone="dark" speed={7} />
        </div>
      </AbsoluteFill>
    </Bg>
  );
};
