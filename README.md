# North Frame

The official website for **North Frame** — a digital growth partner for hospitality
businesses. Founded by Youssef Cherif.

A single-page, dependency-free static site: semantic HTML, one stylesheet, one small
script. No build step, no framework, no package manager.

```
index.html
assets/
  css/style.css      Slush design system + all layout
  js/main.js         sticky nav state, mobile menu, footer year
  fonts/*.woff2      Anton + Inter, self-hosted
  marks.py           single source for the icon marks
  img/favicon.svg    the North Frame mark
  img/og-image.png   1200×630 social card
```

Fonts are split by `unicode-range`: the `latin-ext` files are only fetched if a
glyph outside Latin-1 actually appears on the page.

## Running it

Open `index.html` directly, or serve the folder:

```bash
npx serve .          # or: python3 -m http.server 8000
```

## Deploying

Any static host works — Vercel, Netlify, Cloudflare Pages, GitHub Pages. There is
nothing to build; publish the repository root as-is.

## Design system

The site uses the **Slush** sticker-book system (the `/slushdesign` skill in
`.claude/skills/slushdesign/`): pastel paper, crushed display type, black
hand-cut outlines, pill controls and a shared sticker palette.

| Token | Value | Role |
| --- | --- | --- |
| `--color-carbon` | `#000000` | Text, 1px outlines, primary buttons, marquee, footer |
| `--color-paper-white` | `#ffffff` | Cards, ghost buttons, tags |
| `--color-sky-wash` | `#dceeff` | Hero, Ticket, About bands; nav |
| `--color-concrete-gray` | `#cccccc` | Services and Approach bands |
| `--color-electric-blue` | `#4da2ff` | The 3D ribbons only — never a link or button |
| `--color-mint-pop` / `--color-lavender` / `--color-sunburst` / `--color-ember` | | Sticker, chip and card fills |
| `--color-voltage-violet` | `#5c4ade` | Ticket to Scale card, founder plate |

Rules the stylesheet keeps:

- Sections are full-bleed colour bands (sky → white → gray); no dividers, no
  shadows, no gradients anywhere.
- Buttons, nav links, tags and chips are pills; cards use a 24–40px radius. Every
  interactive element and card has a 1px black outline.
- The primary action is black with white text; the secondary is white with a black
  outline. White text only appears on black or violet.
- Stickers (brand marks in coloured circles and squares) sit rotated and
  overlapping the display type, never grid-aligned. All are `aria-hidden`.
- The ribbons are inline SVG: three flat strokes along one path (shade, body,
  highlight) roughened by one shared `feTurbulence` filter.

Type: **Anton** for display (a free stand-in for Lateral 800), uppercase, at
`line-height: 0.85` — the ceiling of the system's 0.75–0.85 range, because Anton's
capitals run taller than Lateral's and lines collide below that. **Inter** (a
stand-in for Aeonik Pro) for everything else: 500 for body, 700 for headings and
controls, `0.032em` tracking on uppercase labels. Both are self-hosted woff2, so
there is no third-party request. Every display size is a `clamp()`, so headlines
wrap rather than overflow at phone width.

## Motion

Deliberately little. The black marquee strip loops; buttons lift and tilt a degree
on hover; service cards tilt and turn lavender. Nothing reveals on scroll. Under
`prefers-reduced-motion` the marquee stops and hover transforms are off.

## Drawn, not written

Copy follows the brief's wording, kept to one short paragraph per section at most.
Wherever an argument could be shown instead of explained, it is also drawn:

| Section | What the drawing does |
| --- | --- |
| The gap | Two panels: the same cup, plate and glass composed on one table line, then cropped, tilted and half-loaded on a phone. It sits under the *great food, great spaces, great service* line and makes the same point visually. |
| Services | A monoline mark per discipline — a browser frame with the brand diagonal, a post grid, a rising line. |
| Ticket to Scale | Two diagrams side by side: three providers pulling toward three destinations, against four parts converging on one node and one arrow out. |
| Why North Frame | Each principle is a small diagram — a frame holding one dot, a shape and its reflection, an arrow arriving at a target, three arrows travelling together. |
| Approach | The frame assembles across the four steps: corner marks, then a closed frame, then a filled composition, then an arrow leaving it. |

## The marks

Eight marks, drawn as one system rather than collected as a set. The rules:

- **One vocabulary.** Horizontal and vertical rules, 45° diagonals, exact circles
  and true circular arcs. Nothing freehand. The same geometry the page is built
  from.
- **One optical box.** Every mark is drawn inside an 18-unit box on a 24-unit grid
  and centred on (12,12), so a row of four reads as a system instead of a set
  of drawings at different sizes. This is checked, not eyeballed — the audit
  fails a mark that drifts off centre by more than 0.75 units or falls outside
  17–18.5 units on its dominant axis.
- **One hairline.** Every shape carries `vector-effect="non-scaling-stroke"` as an
  *attribute*, which survives into `<use>` shadow content where a CSS rule cannot
  reach. So a single `stroke-width: 1.5` paints the same line at 24px and at
  56px, matching the page's black outlines. Measured from pixels, not assumed.
- **The brand in the marks.** The three discipline marks are built from the
  wordmark's own frame-and-diagonal: Websites is a framed page cut by the
  diagonal, Paid Growth is that diagonal ascending to an arrowhead, and Social
  Strategy is the frame subdivided.

They live in one inline `<symbol>` sprite, generated — along with the copies
inlined in the two Ticket diagrams — from a single source so the two can never
drift apart.

Every diagram carries a real `aria-label` describing what it shows, so the
argument survives with images or sight unavailable.

## Sections

1. Hero — *Digital growth, framed properly.*
2. The gap — the two panels
3. Services — Websites / Social Strategy / Paid Growth
4. The Ticket to Scale — three providers vs. one system
5. Why North Frame — Clarity, Positioning, Conversion, Direction (nav "Work" points here)
6. Approach — Discover, Frame, Build, Grow
7. About — founder
8. Final CTA + footer

## Before going live

- [ ] **Contact address.** `hello@northframe.co` is a placeholder. Replace both
      `mailto:` links (final CTA + footer) with the real address, or swap them for a
      form endpoint.
- [ ] **Canonical URL.** Add `<link rel="canonical">` and switch the two `og:image`
      / `twitter:image` paths to absolute URLs once the domain is live — most
      scrapers will not resolve a relative path.
- [ ] **Founder photograph.** The About section uses a typographic plate instead of
      a portrait. A comment above the section shows the `<img>` to drop in when a
      real photograph exists.
- [ ] **Client work.** There is no case-study section, by design — nothing was
      invented. Add one when there is real work to show, and repoint nav "Work".

## Accessibility

Single `h1`, ordered heading levels, a skip link, visible `:focus-visible` rings
(white inside the dark areas), `aria-expanded` on the menu toggle, Escape to close,
and no interactive target under 44px. Black on every pastel passes WCAG AA; white
text sits only on black (21:1) and violet (6:1).

## Verified

Rendered in real Chromium at 375 / 768 / 1000 / 1440 / 1920px: no horizontal
overflow, no console errors or failed requests, both self-hosted fonts load, the
mobile menu opens below the nav, closes on link tap and on Escape, and the desktop
nav fits from 992px up.
