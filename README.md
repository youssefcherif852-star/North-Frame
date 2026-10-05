# North Frame

The official website for **North Frame** — a digital growth partner for hospitality
businesses. Founded by Youssef Cherif.

A single-page, dependency-free static site. **`index.html` is self-contained**: the
stylesheet, the script and the two Latin font faces (Anton, Inter) are embedded in
it, so the page renders fully designed wherever the file is opened — served from a
host, opened from disk, previewed in an app, or sent on its own as one file. No
build step, no framework, no package manager.

```
index.html               the whole page: markup, <style>, <script>, embedded fonts
assets/
  fonts/*-latin-ext.woff2  extended-Latin faces, only fetched for glyphs outside Latin-1
  img/logo.svg             the North Frame logo: serif NF, ivory on an ink square
  img/favicon.svg          the logo, cropped tighter for small sizes
  img/og-image.png         1200×630 social card
  marks.py                 single source for the icon marks
```

Why embedded: the page used to load `assets/css/style.css` by relative path, so
any copy of `index.html` opened without its `assets/` folder beside it (a
download, an attachment, a file preview) lost every style and showed raw HTML.
Embedding removes that dependency. The optional files above degrade quietly: no
favicon, no share image, or a system fallback for a rare accented glyph.

Edit styles in the `<style>` block and behaviour in the `<script>` block at the
end of `<body>`.

## Running it

Open `index.html` directly, or serve the folder:

```bash
npx serve .          # or: python3 -m http.server 8000
```

## Deploying

Any static host works — Vercel, Netlify, Cloudflare Pages, GitHub Pages. There is
nothing to build; publish the repository root as-is.

## Design system

The layout follows the **Slush** sticker-book system (the `/slushdesign` skill in
`.claude/skills/slushdesign/`): crushed display type, pill controls, outlined
cards, stickers, ribbons and a marquee. The colour is the brand's own pair, and
nothing else:

| Token | Value |
| --- | --- |
| `--ink` | `#0F0F0F` |
| `--ivory` | `#FAF8F5` |

No tints, no opacity steps, no third colour — checked by reading every computed
colour on the rendered page, which returns exactly these two.

Every component paints with `--bg` / `--fg`, and two classes swap them:
`.is-dark` (ink ground, ivory ink) and `.is-light`. A dark band, a filled card, a
filled sticker or chip are the same component in the other context, so nothing is
styled twice.

- Bands alternate ivory and ink down the page; the Ticket to Scale is an ink card
  on an ivory band, and the footer closes in ink.
- Buttons, nav links, tags and chips are pills; cards use a 24–40px radius; every
  card and control has a 1px outline in the opposite colour.
- Stickers are the brand marks in ink or ivory circles and squares, rotated and
  overlapping the display type. All are `aria-hidden`.
- Ribbons are hollow outlined tubes (an outer stroke, an inner stroke in the band
  colour, one highlight line), so display type can cross them. Body text that
  crosses a ribbon sits on a small plate of the band colour.

Type: **Anton** for display (a free stand-in for Lateral 800), uppercase, at
`line-height: 0.85` — the ceiling of the system's 0.75–0.85 range, because Anton's
capitals run taller than Lateral's and lines collide below that. **Inter** for
everything else: 500 for body, 700 for headings and controls, `0.032em` tracking
on uppercase labels. Both are self-hosted woff2. Every display size is a
`clamp()`, so headlines wrap rather than overflow at phone width.

## Motion

Deliberately little. The ink marquee strip loops; buttons lift and tilt a degree
on hover; ghost buttons and nav links invert; service cards tilt and turn ink.
Nothing reveals on scroll. Under `prefers-reduced-motion` the marquee stops and
hover transforms are off.

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

## The logo

Serif capitals N and F set tight, ivory on an ink square (`assets/img/logo.svg`),
traced to vector from the master artwork.
The letters live once in the page as the `#logo-nf` symbol and are reused for the
nav tile, the two NF stickers, the founder plate and the footer tile, so they
always match. On ink grounds the tile is drawn with a 1px ivory outline.

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

- [x] **Contact address.** Both `mailto:` links (final CTA + footer) go to
      `northframe75@gmail.com`.
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
(ivory inside the dark areas), `aria-expanded` on the menu toggle, Escape to close,
and no interactive target under 44px. Ink on ivory and ivory on ink are 18:1, well past
WCAG AAA.

## Verified

Rendered in real Chromium at 375 / 768 / 1000 / 1440 / 1920px: no horizontal
overflow, no console errors or failed requests, both self-hosted fonts load, the
mobile menu opens below the nav, closes on link tap and on Escape, and the desktop
nav fits from 992px up.
