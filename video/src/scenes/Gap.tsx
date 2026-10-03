import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Bg, Draw, Label, Rise, Slam, inOut, lerp, prog, useShake, Tone, fgOf, bgOf} from '../lib';
import {DISPLAY, INK, IVORY, UI} from '../theme';

const Flash: React.FC<{tone: Tone; word: string; idx: number}> = ({tone, word, idx}) => {
  const f = useCurrentFrame();
  const z = lerp(1.25, 1, prog(f, 0, 14));
  return (
    <Bg tone={tone}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${z})`}}>
        <div style={{fontFamily: DISPLAY, fontSize: 250, lineHeight: 0.85, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
          Great {word}
        </div>
      </AbsoluteFill>
      <Label style={{position: 'absolute', left: 60, top: 54}}>01 — The gap</Label>
      <Label style={{position: 'absolute', right: 60, top: 54}}>0{idx} / 03</Label>
    </Bg>
  );
};

/** One table line with a cup, a plate and a glass, as on the site. */
const Table: React.FC<{at: number; color: string}> = ({at, color}) => (
  <g stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none">
    <Draw d="M20 300H580" a={at} b={at + 16} />
    {/* plate */}
    <Draw d="M90 300a110 22 0 0 0 220 0" a={at + 6} b={at + 22} />
    <Draw d="M130 300a70 12 0 0 0 140 0" a={at + 9} b={at + 24} />
    {/* cup */}
    <Draw d="M360 220h80v50a28 28 0 0 1 -28 28h-24a28 28 0 0 1 -28 -28z" a={at + 10} b={at + 28} />
    <Draw d="M440 236h14a16 16 0 0 1 0 32h-14" a={at + 16} b={at + 30} />
    <Draw d="M380 196c0 -14 12 -14 12 -28M408 196c0 -14 12 -14 12 -28" a={at + 22} b={at + 36} />
    {/* glass */}
    <Draw d="M490 130h60l-8 70a22 22 0 0 1 -44 0zM520 222v70M496 298h48" a={at + 14} b={at + 34} />
  </g>
);

const Panels: React.FC = () => {
  const f = useCurrentFrame();
  const tilt = lerp(0, -7, prog(f, 40, 60, inOut));
  const load = prog(f, 50, 90, inOut);
  return (
    <Bg tone="light">
      <div style={{position: 'absolute', left: 120, top: 110, width: 1680}}>
        <Rise at={0} size={150}>
          Then a guest
        </Rise>
        <Rise at={8} size={150}>
          looks them up.
        </Rise>
      </div>
      {/* in the room */}
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 470,
          width: 780,
          height: 470,
          border: `3px solid ${INK}`,
          borderRadius: 36,
          transform: `translateY(${(1 - prog(f, 6, 22)) * 600}px)`,
        }}
      >
        <svg viewBox="0 0 600 360" width={720} height={420} style={{position: 'absolute', left: 30, top: 0}}>
          <Table at={14} color={INK} />
        </svg>
        <Label style={{position: 'absolute', left: 32, bottom: 26}}>In the room</Label>
      </div>
      {/* on the screen */}
      <div
        style={{
          position: 'absolute',
          left: 1020,
          top: 470,
          width: 780,
          height: 470,
          border: `3px solid ${INK}`,
          borderRadius: 36,
          background: INK,
          overflow: 'hidden',
          transform: `translateY(${(1 - prog(f, 12, 28)) * 600}px)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 230,
            top: 40,
            width: 300,
            height: 560,
            borderRadius: 44,
            border: `3px solid ${IVORY}`,
            overflow: 'hidden',
            transform: `rotate(${tilt}deg)`,
          }}
        >
          <svg viewBox="160 80 400 300" width={600} height={450} style={{position: 'absolute', left: -60, top: 60, transform: `rotate(${-tilt * 1.6}deg)`}}>
            <defs>
              <clipPath id="load">
                <rect x={160} y={80} width={400} height={lerp(120, 300, load)} />
              </clipPath>
            </defs>
            <g clipPath="url(#load)">
              <Table at={30} color={IVORY} />
            </g>
          </svg>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 32,
                top: 330 + i * 34,
                height: 14,
                width: (200 - i * 50) * prog(f, 40 + i * 5, 70 + i * 5),
                borderRadius: 7,
                border: `2px solid ${IVORY}`,
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute',
              left: 120,
              top: 230,
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: `3px solid ${IVORY}`,
              borderTopColor: INK,
              transform: `rotate(${f * 14}deg)`,
              opacity: 1 - load,
            }}
          />
        </div>
        <Label style={{position: 'absolute', left: 32, bottom: 26, color: IVORY}}>On the screen</Label>
      </div>
    </Bg>
  );
};

const Truth: React.FC = () => {
  const shake = useShake([0, 15, 30], 10);
  return (
    <Bg tone="dark">
      <AbsoluteFill style={{justifyContent: 'center', paddingLeft: 120, transform: shake}}>
        <Slam at={0} size={170} style={{transformOrigin: 'left center'}}>
          The quality is real.
        </Slam>
        <div style={{height: 34}} />
        <Rise at={15} size={120}>
          The digital presence
        </Rise>
        <Rise at={24} size={120}>
          just doesn’t show it.
        </Rise>
      </AbsoluteFill>
    </Bg>
  );
};

const Close: React.FC = () => {
  const f = useCurrentFrame();
  const c = prog(f, 12, 32, inOut);
  const gap = lerp(420, 0, c);
  const shake = useShake([30], 22);
  return (
    <Bg tone="light">
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: shake}}>
        <Label style={{fontSize: 28, opacity: prog(f, 0, 10), marginBottom: 40}}>North Frame exists to</Label>
        <div style={{display: 'flex', fontFamily: DISPLAY, fontSize: 230, lineHeight: 0.85, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
          <span style={{transform: `translateX(${-gap / 2}px)`}}>Close</span>
          <span style={{width: 60}} />
          <span style={{transform: `translateX(${gap / 2}px)`}}>the gap.</span>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 0, marginTop: 50, opacity: prog(f, 2, 10)}}>
          <div style={{width: 18, height: 18, borderRadius: '50%', background: INK}} />
          <div style={{width: lerp(900, 0, c) + 40, height: 3, background: INK}} />
          <div style={{width: 18, height: 18, borderRadius: '50%', background: INK}} />
        </div>
      </AbsoluteFill>
    </Bg>
  );
};

export const Gap: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={15}>
      <Flash tone="dark" word="food." idx={1} />
    </Sequence>
    <Sequence from={15} durationInFrames={15}>
      <Flash tone="light" word="spaces." idx={2} />
    </Sequence>
    <Sequence from={30} durationInFrames={15}>
      <Flash tone="dark" word="service." idx={3} />
    </Sequence>
    <Sequence from={45} durationInFrames={105}>
      <Panels />
    </Sequence>
    <Sequence from={150} durationInFrames={45}>
      <Truth />
    </Sequence>
    <Sequence from={195} durationInFrames={70}>
      <Close />
    </Sequence>
  </AbsoluteFill>
);

void fgOf;
void bgOf;
void UI;
