# North Frame — motion graphic

A 64-second, 1920×1080, 30fps showcase of the agency and its website, built with
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
committed: a 120 BPM procedural track whose impacts land on the cuts.

## Timeline

Every cut lands on a beat (one beat = 15 frames, one bar = 60). The scenes are listed in
`src/timeline.ts`.

| Time | Scene | What happens |
| --- | --- | --- |
| 0:00 | Intro | 3D: the frame mark's parts fly in from depth through a particle field and lock together. The diagonal draws, then the wordmark rises. |
| 0:05 | Hero | *Digital growth, framed properly.* slams in over growing 3D hollow ribbons, then stickers, the lede, CTAs and the marquee. |
| 0:11 | The gap | *Great food. Great spaces. Great service.* flash on the beat. Then *In the room* is set against *On the screen*. *Close the gap.* closes. |
| 0:19 | Services | The three service cards flip in with their marks drawing, then invert one per beat. |
| 0:26 | Ticket to Scale | The ticket, then three providers in three directions converge into one system. *One direction. One system. One partner.* |
| 0:33 | The website | 3D: a fly-through of the site's nine sections, the page scrolling in a browser and a phone, then the whole page as a wall. |
| 0:42 | Why North Frame | Clarity, Positioning, Conversion, Direction, two beats each. |
| 0:46 | Approach | The frame assembles: corners, closed frame, composition, arrow out. |
| 0:52 | About | *Built with intention.* and the founder card. |
| 0:56 | Close | *Your business has a direction. Let's frame it properly.* Then the CTA and the 3D lockup. |

Copy comes from the site. Nothing is invented: no clients, numbers or testimonials.

## Files

```
src/theme.ts         colours + font loading
src/lib.tsx          type motion (Rise, Slam), Draw, pills, marquee, reveals, icons
src/three-bits.tsx   3D: particle field, the mark, outlined ribbons, textures, camera rig
src/scenes/*.tsx     one file per scene
public/site/         screenshots of the live site used as 3D textures
```

The screenshots in `public/site/` come from the site's own `index.html`. Re-shoot
them after a design change.
