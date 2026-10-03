# North Frame — motion graphic

A 41-second, 1920×1080, 48fps showcase of the agency and its website, built with
**Remotion** and **Three.js** (via `@remotion/three`). The brand's two colours only:
ink `#0F0F0F` and ivory `#FAF8F5`. Anton for display, Inter for everything else —
the same faces as the site.

```bash
npm install
npm run studio     # preview and scrub in the browser
npm run render     # → out/north-frame.mp4
npm run stills -- 60 250 1100   # review stills → out/st/
```

`npm run audio` (run automatically by `studio` and `render`) writes the soundtrack,
`public/audio/track.wav`, from `scripts/gen-audio.mjs`. It is generated, not
committed: bright nu-disco in D major at 96 BPM — four-on-the-floor kick, claps,
16th hats, an octave-bouncing bass, sidechained supersaw chords, a plucked arpeggio
and a lead hook with echo and reverb. It drops at the hero, the website fly-through
and the final chorus, and ends on a held chord with the logo. One beat is 30
frames, so every cut lands on a beat.

## Timeline

Every cut lands on a beat of the music (one beat = 30 frames at 96 BPM). The animation is
timed in frames and plays at 48fps, so the whole piece runs 1.6× the speed it was
designed at without dropping a frame; change `FPS` in `src/timeline.ts` (and in
`scripts/gen-audio.mjs`) to retime it. The scenes are listed in
`src/timeline.ts`.

| Time | Scene | What happens |
| --- | --- | --- |
| 0:00 | Intro | 3D: the logo tile's four sides fly in through a particle field and lock into a square, then the extruded N and F arrive from depth and set together. The wordmark rises. |
| 0:03 | Hero | *Digital growth, framed properly.* slams in over growing 3D hollow ribbons, then stickers, the lede, CTAs and the marquee. |
| 0:07 | The gap | *Great food. Great spaces. Great service.* flash on the beat. Then *In the room* is set against *On the screen*. *Close the gap.* closes. |
| 0:12 | Services | The three service cards flip in with their marks drawing, then invert one per beat. |
| 0:16 | Ticket to Scale | The ticket, then three providers in three directions converge into one system. *One direction. One system. One partner.* |
| 0:21 | The website | 3D: a fly-through of the site's nine sections, the page scrolling in a browser and a phone, then the whole page as a wall. |
| 0:26 | Why North Frame | Clarity, Positioning, Conversion, Direction, two beats each. |
| 0:29 | Approach | The frame assembles: corners, closed frame, composition, arrow out. |
| 0:33 | About | *Built with intention.* and the founder card. |
| 0:35 | Close | *Your business has a direction. Let's frame it properly.* Then the CTA and the 3D logo lockup. |

Copy comes from the site. Nothing is invented: no clients, numbers or testimonials.

## Files

```
src/theme.ts         colours + font loading
src/logo.ts          the NF logo letters (same path as the site's assets/img/logo.svg)
src/lib.tsx          type motion (Rise, Slam), Draw, pills, marquee, reveals, icons
src/three-bits.tsx   3D: particle field, the extruded logo, outlined ribbons, textures, camera rig
src/scenes/*.tsx     one file per scene
public/site/         screenshots of the live site used as 3D textures
```

The screenshots in `public/site/` come from the site's own `index.html`. Re-shoot
them after a design change.
