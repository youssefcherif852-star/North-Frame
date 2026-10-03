import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Bg, Icon, Label, Rise, inOut, lerp, prog, back} from '../lib';
import {DISPLAY, INK, IVORY, UI} from '../theme';

const CARDS = [
  {n: '01', icon: 'web', name: 'Websites', body: 'Premium, responsive websites designed around the business, its identity and its customers.'},
  {n: '02', icon: 'social', name: 'Social Strategy', body: 'A clearer social presence, with content direction and a strategy designed around the brand.'},
  {n: '03', icon: 'growth', name: 'Paid Growth', body: 'Meta advertising strategy designed to turn attention into measurable business opportunities.'},
];

export const Services: React.FC = () => {
  const f = useCurrentFrame();
  const dock = prog(f, 36, 54, inOut);
  return (
    <Bg tone="light">
      <Label style={{position: 'absolute', left: 100, top: 60, opacity: prog(f, 0, 10)}}>02 — Services</Label>
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: lerp(330, 110, dock),
          transformOrigin: 'left top',
          transform: `scale(${lerp(1, 0.56, dock)})`,
        }}
      >
        <Rise at={0} size={170}>
          Everything your
        </Rise>
        <Rise at={8} size={170}>
          digital presence needs.
        </Rise>
      </div>
      <AbsoluteFill style={{perspective: 2200}}>
        {CARDS.map((c, i) => {
          const at = 45 + i * 15;
          const p = prog(f, at, at + 22, back);
          const inv = f >= 150 + i * 15 && f < 150 + i * 15 + 30;
          const dark = inv;
          const float = Math.sin((f + i * 20) / 22) * 8;
          const tilt = [-2.5, 1.5, -1.2][i];
          if (f < at) return null;
          return (
            <div
              key={c.n}
              style={{
                position: 'absolute',
                left: 100 + i * 590,
                top: 360 + float,
                width: 540,
                height: 600,
                borderRadius: 40,
                border: `3px solid ${INK}`,
                background: dark ? INK : IVORY,
                color: dark ? IVORY : INK,
                padding: 44,
                boxSizing: 'border-box',
                transformOrigin: 'center bottom',
                transform: `rotateX(${(1 - p) * 70}deg) rotateY(${(1 - p) * -30}deg) translateY(${(1 - Math.min(p, 1)) * 300}px) rotate(${tilt * (dark ? 2 : 1)}deg) ${dark ? 'translateY(-16px)' : ''}`,
                opacity: Math.min(1, p * 2.5),
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div style={{fontFamily: DISPLAY, fontSize: 120, lineHeight: 0.8}}>{c.n}</div>
                <div
                  style={{
                    width: 130,
                    height: 130,
                    borderRadius: '50%',
                    border: `3px solid ${dark ? IVORY : INK}`,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon name={c.icon} size={64} at={at + 8} color={dark ? IVORY : INK} stroke={2} />
                </div>
              </div>
              <div style={{flex: 1}} />
              <div style={{fontFamily: DISPLAY, fontSize: 92, lineHeight: 0.85, textTransform: 'uppercase'}}>{c.name}</div>
              <div style={{fontFamily: UI, fontWeight: 500, fontSize: 27, lineHeight: 1.35, marginTop: 22}}>{c.body}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </Bg>
  );
};
