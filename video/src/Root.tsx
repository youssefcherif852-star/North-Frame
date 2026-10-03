import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence, staticFile} from 'remotion';
import './theme';
import {RevealIn, Reveal} from './lib';
import {SCENES, TOTAL, FPS} from './timeline';
import {Intro} from './scenes/Intro';
import {Hero} from './scenes/Hero';
import {Gap} from './scenes/Gap';
import {Services} from './scenes/Services';
import {Ticket} from './scenes/Ticket';
import {Showcase} from './scenes/Showcase';
import {Principles} from './scenes/Principles';
import {Approach} from './scenes/Approach';
import {Founder} from './scenes/Founder';
import {Outro} from './scenes/Outro';

const MAP: Record<string, {C: React.FC; reveal: Reveal}> = {
  intro: {C: Intro, reveal: 'cut'},
  hero: {C: Hero, reveal: 'cut'},
  gap: {C: Gap, reveal: 'cut'},
  services: {C: Services, reveal: 'cut'},
  ticket: {C: Ticket, reveal: 'left'},
  showcase: {C: Showcase, reveal: 'iris'},
  principles: {C: Principles, reveal: 'cut'},
  approach: {C: Approach, reveal: 'cut'},
  founder: {C: Founder, reveal: 'right'},
  outro: {C: Outro, reveal: 'iris'},
};

const OVERLAP = 14;

const NorthFrame: React.FC = () => (
  <AbsoluteFill style={{background: '#0F0F0F'}}>
    {SCENES.map((s) => {
      const m = MAP[s.id];
      if (!m) return null;
      return (
        <Sequence key={s.id} from={s.from} durationInFrames={s.dur + OVERLAP} name={s.id}>
          <RevealIn kind={m.reveal}>
            <m.C />
          </RevealIn>
        </Sequence>
      );
    })}
    <Audio src={staticFile('audio/track.wav')} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition id="NorthFrame" component={NorthFrame} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
