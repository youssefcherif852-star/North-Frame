// One source of truth for scene timing. 30 fps, 120 BPM: one beat = 15 frames,
// one bar = 60 frames. Every cut lands on a beat; the soundtrack generator
// (scripts/gen-audio.mjs) reads the same numbers.
export const FPS = 48;
export const BEAT = 15;

export const SCENES = [
  {id: 'intro', from: 0, dur: 150},
  {id: 'hero', from: 150, dur: 180},
  {id: 'gap', from: 330, dur: 240},
  {id: 'services', from: 570, dur: 210},
  {id: 'ticket', from: 780, dur: 210},
  {id: 'showcase', from: 990, dur: 270},
  {id: 'principles', from: 1260, dur: 120},
  {id: 'approach', from: 1380, dur: 180},
  {id: 'founder', from: 1560, dur: 120},
  {id: 'outro', from: 1680, dur: 300},
] as const;

export const TOTAL = 1980;
