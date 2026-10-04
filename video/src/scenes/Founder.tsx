import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Bg, Label, Logo, Rise, inOut, lerp, prog, back} from '../lib';
import {DISPLAY, INK, IVORY, UI} from '../theme';

export const Founder: React.FC = () => {
  const f = useCurrentFrame();
  const card = prog(f, 6, 40, back);
  const spin = lerp(-110, -8, card) + Math.sin(f / 20) * 3;
  return (
    <Bg tone="dark">
      <Label style={{position: 'absolute', left: 100, top: 60}}>06 — About</Label>
      <div style={{position: 'absolute', left: 100, top: 230}}>
        <Rise at={0} size={190}>
          Built with
        </Rise>
        <Rise at={8} size={190}>
          intention.
        </Rise>
        <div style={{marginTop: 50, opacity: prog(f, 30, 44), transform: `translateY(${(1 - prog(f, 30, 44)) * 30}px)`, maxWidth: 820}}>
          <div style={{fontFamily: UI, fontWeight: 500, fontSize: 34, lineHeight: 1.35}}>
            “I started North Frame to help hospitality businesses present themselves online with the same care they put into
            everything else.”
          </div>
          <Label style={{marginTop: 30, fontSize: 24}}>Youssef Cherif — Founder, North Frame</Label>
        </div>
      </div>
      <AbsoluteFill style={{perspective: 1800}}>
        <div
          style={{
            position: 'absolute',
            right: 170,
            top: 170,
            width: 560,
            height: 720,
            borderRadius: 40,
            background: IVORY,
            color: INK,
            border: `3px solid ${IVORY}`,
            transform: `rotateY(${spin}deg) rotateZ(${lerp(-20, 4, card)}deg)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 50,
            boxSizing: 'border-box',
          }}
        >
          <Logo width={420} color={INK} style={{marginTop: 30}} />
          <div>
            <div style={{fontFamily: DISPLAY, fontSize: 84, lineHeight: 0.85, textTransform: 'uppercase'}}>Youssef Cherif</div>
            <Label style={{marginTop: 18, fontSize: 24}}>Founder</Label>
          </div>
          <div
            style={{
              position: 'absolute',
              right: -50,
              bottom: 160,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: INK,
              color: IVORY,
              border: `3px solid ${IVORY}`,
              display: 'grid',
              placeItems: 'center',
              fontSize: 56,
              transform: `scale(${prog(f, 40, 52, back)}) rotate(${f * 2}deg)`,
            }}
          >
            ★
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: IVORY, opacity: prog(f, 112, 120, inOut) * 0}} />
    </Bg>
  );
};
