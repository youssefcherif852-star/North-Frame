import React from 'react';
import * as THREE from 'three';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Bg, Label, Rise, inOut, lerp, prog} from '../lib';
import {Field, useTextures} from '../three-bits';
import {Cam} from '../three-bits';
import {INK, IVORY} from '../theme';

const D = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `site/panels/d${i}.png`);
const M = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `site/panels/m${i}.png`);
const SCROLL = ['site/desktop-scroll.png', 'site/mobile-scroll.png'];
const NAMES = ['Hero', 'Positioning', 'Services', 'The Ticket', 'Why North Frame', 'Approach', 'Founder', 'Start here', 'Footer'];

const Framed: React.FC<{
  tex: THREE.Texture | null;
  w: number;
  h: number;
  border?: number;
  radius?: number;
} & React.JSX.IntrinsicElements['group']> = ({tex, w, h, border = 0.05, ...rest}) => (
  <group {...rest}>
    <mesh position={[0, 0, -0.01]}>
      <planeGeometry args={[w + border * 2, h + border * 2]} />
      <meshBasicMaterial color={IVORY} />
    </mesh>
    <mesh>
      <planeGeometry args={[w, h]} />
      {/* keyed so the shader is rebuilt once the texture arrives */}
      {tex ? <meshBasicMaterial key={tex.uuid} map={tex} toneMapped={false} /> : <meshBasicMaterial key="empty" color={INK} />}
    </mesh>
  </group>
);

/** Fly-through: the nine desktop sections hang either side of the camera's path. */
const Corridor: React.FC = () => {
  const f = useCurrentFrame();
  const tex = useTextures(D);
  const mtex = useTextures(M);
  const t = prog(f, 0, 112, (x) => x);
  const camZ = lerp(8, -27, inOut(t));
  const cur = Math.max(0, Math.min(8, Math.round((8 - camZ) / 5 - 1)));
  return (
    <Bg tone="dark">
      <ThreeCanvas width={1920} height={1080} flat camera={{position: [0, 0, 10], fov: 55}} style={{position: 'absolute'}}>
        <Cam z={camZ} fov={55} />
        <color attach="background" args={[INK]} />
        <Field f={f} color={IVORY} speed={0.4} count={900} size={0.04} />
        {tex.map((tx, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          return (
            <Framed key={i} tex={tx} w={4.8} h={3} position={[side * 3.1, (i % 3) * 0.35 - 0.3, -i * 5]} rotation={[0, -side * 0.62, 0]} />
          );
        })}
        {mtex.map((tx, i) => {
          const side = i % 2 === 0 ? 1 : -1;
          return (
            <Framed key={`m${i}`} tex={tx} w={1.3} h={2.82} border={0.04} position={[side * 6.6, 0.4, -i * 5 - 3]} rotation={[0, -side * 0.9, 0]} />
          );
        })}
      </ThreeCanvas>
      <AbsoluteFill style={{padding: 70}}>
        <Label style={{position: 'absolute', left: 70, top: 60}}>The website</Label>
        <Label style={{position: 'absolute', right: 70, top: 60}}>
          {String(cur + 1).padStart(2, '0')} / 09 — {NAMES[cur]}
        </Label>
      </AbsoluteFill>
    </Bg>
  );
};

/** The page itself scrolling in a browser frame and a phone. */
const Devices: React.FC = () => {
  const f = useCurrentFrame();
  const [desk, mob] = useTextures(SCROLL);
  const s = prog(f, 6, 88, inOut);
  if (desk) {
    const rep = 900 / 8192;
    desk.repeat.set(1, rep);
    desk.offset.set(0, 1 - rep - s * (1 - rep) * 0.92);
  }
  if (mob) {
    const rep = 1688 / 8192;
    mob.repeat.set(1, rep);
    mob.offset.set(0, 1 - rep - s * (1 - rep) * 0.92);
  }
  const enter = prog(f, 0, 20);
  const rotY = lerp(-0.5, -0.18, prog(f, 0, 90, inOut));
  return (
    <Bg tone="dark">
      <ThreeCanvas width={1920} height={1080} flat camera={{position: [0, 0, 10], fov: 40}} style={{position: 'absolute'}}>
        <Cam z={10} fov={40} />
        <color attach="background" args={[INK]} />
        <group rotation={[0.08, rotY, 0]} position={[0.3, lerp(-6, -0.1, enter), 0]}>
          {/* browser */}
          <group position={[-1.2, 0, 0]}>
            <mesh position={[0, 2.5, -0.02]}>
              <planeGeometry args={[7.36, 0.56]} />
              <meshBasicMaterial color={IVORY} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[-3.36 + i * 0.28, 2.5, 0]}>
                <circleGeometry args={[0.08, 24]} />
                <meshBasicMaterial color={INK} />
              </mesh>
            ))}
            <Framed tex={desk} w={7.2} h={4.5} border={0.08} position={[0, 0, 0]} />
          </group>
          {/* phone */}
          <group position={[3.7, -0.5, 1.4]} rotation={[0, -0.2, 0.04]}>
            <mesh position={[0, 0, -0.03]}>
              <planeGeometry args={[1.86, 3.86]} />
              <meshBasicMaterial color={IVORY} />
            </mesh>
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[1.76, 3.76]} />
              <meshBasicMaterial color={INK} />
            </mesh>
            <Framed tex={mob} w={1.6} h={3.46} border={0.0} />
          </group>
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{padding: '70px 70px 210px', justifyContent: 'flex-end'}}>
        <Rise at={10} size={130}>
          One page.
        </Rise>
        <Rise at={18} size={130}>
          Every screen.
        </Rise>
      </AbsoluteFill>
    </Bg>
  );
};

/** All nine sections as one wall, camera pulling back. */
const Wall: React.FC = () => {
  const f = useCurrentFrame();
  const tex = useTextures(D);
  const pull = prog(f, 0, 70, inOut);
  return (
    <Bg tone="dark">
      <ThreeCanvas width={1920} height={1080} flat camera={{position: [0, 0, 10], fov: 45}} style={{position: 'absolute'}}>
        <Cam z={lerp(5, 17, pull)} fov={45} />
        <color attach="background" args={[INK]} />
        <group rotation={[lerp(-0.1, -0.35, pull), lerp(0.2, 0.42, pull), lerp(0.05, 0.12, pull)]}>
          {tex.map((tx, i) => {
            const x = (i % 3) - 1;
            const y = 1 - Math.floor(i / 3);
            const q = prog(f, i * 2, i * 2 + 16);
            return <Framed key={i} tex={tx} w={4.8} h={3} position={[x * 5.2, y * 3.4, (1 - q) * -10]} />;
          })}
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{background: IVORY, color: INK, padding: '20px 44px 6px', borderRadius: 30, transform: `rotate(-3deg) scale(${prog(f, 26, 38)})`}}>
          <Rise at={26} size={170}>
            Framed properly.
          </Rise>
        </div>
      </AbsoluteFill>
    </Bg>
  );
};

export const Showcase: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={120}>
      <Corridor />
    </Sequence>
    <Sequence from={120} durationInFrames={90}>
      <Devices />
    </Sequence>
    <Sequence from={210} durationInFrames={80}>
      <Wall />
    </Sequence>
  </AbsoluteFill>
);
