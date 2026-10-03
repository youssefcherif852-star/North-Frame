import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Bg, Label, Rise, Slam, inOut, lerp, prog, useShake} from '../lib';
import {DISPLAY, INK, IVORY, UI} from '../theme';

const PROVIDERS = ['Web designer', 'Social media manager', 'Ads freelancer'];

const Diagram: React.FC<{f: number}> = ({f}) => {
  const draw = prog(f, 66, 92, inOut);
  const merge = prog(f, 104, 130, inOut);
  const out = prog(f, 126, 146, inOut);
  const ys = [180, 420, 660];
  const endYs = [40, 420, 800];
  const node = {x: 1100, y: 420};
  return (
    <svg width={1720} height={840} viewBox="0 0 1720 840" style={{position: 'absolute', left: 100, top: 160, overflow: 'visible'}}>
      {ys.map((y, i) => {
        const ex = lerp(1480, node.x, merge);
        const ey = lerp(endYs[i], node.y, merge);
        const d = `M440 ${y} C 800 ${y}, ${lerp(1100, 860, merge)} ${ey}, ${ex} ${ey}`;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={IVORY}
            strokeWidth={4}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - draw}
            strokeLinecap="round"
          />
        );
      })}
      {ys.map((y, i) => (
        <g key={`a${i}`} opacity={(1 - merge) * draw}>
          <path
            d={`M${1480 - 22} ${endYs[i] - 18} L1480 ${endYs[i]} L${1480 - 22} ${endYs[i] + 18}`}
            stroke={IVORY}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
      {merge > 0 && (
        <g>
          <circle cx={node.x} cy={node.y} r={lerp(0, 46, merge)} fill={IVORY} />
          <path
            d={`M${node.x + 46} ${node.y} H${lerp(node.x + 46, 1640, out)}`}
            stroke={IVORY}
            strokeWidth={8}
            strokeLinecap="round"
          />
          {out > 0.9 && (
            <path d="M1610 390 L1644 420 L1610 450" stroke={IVORY} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </g>
      )}
      {PROVIDERS.map((p, i) => {
        const q = prog(f, 60 + i * 5, 76 + i * 5);
        return (
          <foreignObject key={p} x={0} y={ys[i] - 50} width={440} height={100}>
            <div
              style={{
                height: 100,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                padding: '0 34px',
                borderRadius: 1600,
                border: `3px solid ${IVORY}`,
                background: merge > 0.5 ? IVORY : INK,
                color: merge > 0.5 ? INK : IVORY,
                fontFamily: UI,
                fontWeight: 700,
                fontSize: 28,
                letterSpacing: '0.032em',
                textTransform: 'uppercase',
                opacity: q,
                transform: `translateX(${(1 - q) * -80}px)`,
              }}
            >
              {p}
            </div>
          </foreignObject>
        );
      })}
    </svg>
  );
};

export const Ticket: React.FC = () => {
  const f = useCurrentFrame();
  const shake = useShake([0, 150, 165, 180], 14);
  const titleOut = prog(f, 52, 64, inOut);
  const diagOut = prog(f, 146, 152, inOut);
  return (
    <Bg tone="dark">
      <AbsoluteFill style={{transform: shake}}>
        <Label style={{position: 'absolute', left: 100, top: 60}}>03 — The offer</Label>
        {f < 66 && (
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `translateY(${-titleOut * 1100}px)`}}>
            <div
              style={{
                border: `4px solid ${IVORY}`,
                borderRadius: 48,
                padding: '50px 90px 60px',
                position: 'relative',
                transform: `rotate(${lerp(-12, -2, prog(f, 0, 20))}deg) scale(${lerp(0.6, 1, prog(f, 0, 16))})`,
              }}
            >
              {[-1, 1].map((s) => (
                <div
                  key={s}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    [s < 0 ? 'left' : 'right']: -38,
                    width: 70,
                    height: 70,
                    marginTop: -35,
                    borderRadius: '50%',
                    background: INK,
                    border: `4px solid ${IVORY}`,
                    clipPath: s < 0 ? 'inset(0 0 0 50%)' : 'inset(0 50% 0 0)',
                  }}
                />
              ))}
              <Rise at={4} size={240} style={{textAlign: 'center'}}>
                The Ticket
              </Rise>
              <Rise at={12} size={240} style={{textAlign: 'center'}}>
                to Scale
              </Rise>
              <div
                style={{
                  position: 'absolute',
                  right: -60,
                  top: -60,
                  width: 130,
                  height: 130,
                  borderRadius: '50%',
                  background: IVORY,
                  color: INK,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 64,
                  fontFamily: DISPLAY,
                  transform: `scale(${prog(f, 24, 36)}) rotate(${f * 2}deg)`,
                }}
              >
                ★
              </div>
            </div>
          </AbsoluteFill>
        )}
        {f >= 60 && f < 152 && (
          <AbsoluteFill style={{opacity: 1 - diagOut}}>
            <Label style={{position: 'absolute', left: 100, top: 120, fontSize: 26, opacity: 1 - prog(f, 100, 108)}}>Three providers, three directions</Label>
            <Label style={{position: 'absolute', left: 100, top: 120, fontSize: 26, opacity: prog(f, 112, 120)}}>One system, one direction</Label>
            <Diagram f={f} />
          </AbsoluteFill>
        )}
        {f >= 150 && (
          <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 100}}>
            <Slam at={150} size={230} style={{transformOrigin: 'left center', marginBottom: 24}}>
              One direction.
            </Slam>
            <Slam at={165} size={230} style={{transformOrigin: 'left center', marginBottom: 24}}>
              One system.
            </Slam>
            <Slam at={180} size={230} style={{transformOrigin: 'left center', color: INK, background: IVORY, alignSelf: 'flex-start', padding: '10px 28px 0', borderRadius: 24}}>
              One partner.
            </Slam>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </Bg>
  );
};
