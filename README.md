# North Frame

The official website for **North Frame** — a digital growth partner for hospitality
businesses. Founded by Youssef Cherif.

A single-page, dependency-free static site: semantic HTML, one stylesheet, one small
script. No build step, no framework, no package manager.

```
index.html
assets/
  css/style.css      design system + all layout
  js/main.js         nav, mobile menu, scroll reveals, progress rule
  fonts/*.woff2      Inter + Inter Tight, self-hosted
  img/favicon.svg    the North Frame mark
  img/og-image.png   1200×630 social card
```

First load is about 150 KB: 23 KB HTML, 30 KB CSS, 4 KB JS, 93 KB fonts. The
`latin-ext` font files (another 175 KB on disk) are only fetched if a glyph
outside Latin-1 actually appears, which `unicode-range` decides per page.

## Running it

Open `index.html` directly, or serve the folder:

```bash
npx serve .          # or: python3 -m http.server 8000
```

## Deploying

Any static host works — Vercel, Netlify, Cloudflare Pages, GitHub Pages. There is
nothing to build; publish the repository root as-is.

## Design system

Two colours, and opacity for everything else.

| Token | Value | Role |
| --- | --- | --- |
| `--ink` | `#0F0F0F` | Text, dark sections, primary buttons |
| `--ivory` | `#FAF8F5` | Page ground, inverted text |

Hierarchy comes from opacity steps, hairline rules, and type scale — not from
accent colours. Dark sections and the footer re-declare `--bg` / `--fg` /
`--fg-soft` / `--fg-faint` / `--fg-decor` / `--rule`, so every component inside
them inverts without a duplicated rule.

Above 62rem two hairlines run the full height of the page, half a gutter outside
the content column — the frame the brand is named for, and the grid every section
is measured against. They live inside each section rather than in one fixed
overlay, so they pick up that section's own rule colour; the ten blocks
(hero, eight sections, footer) are contiguous to the pixel, so the lines are
unbroken.

Type: **Inter Tight** for display (tight tracking, editorial), **Inter** for body
and labels — both self-hosted as variable woff2, so there is no third-party
request in the critical path and no layout shift from a late webfont. Every size
is a `clamp()` in `:root`, so the scale is fluid rather than stepped at
breakpoints. Arrows are drawn, not typed: Inter's Latin subsets have no U+2192, so
a `→` in text would silently render in a fallback face.

## Motion

Two reveal primitives, one observer, one rAF-throttled scroll handler.

- `.mask` slides display type out of a clipped box. Every heading on the page uses
  it. Below 48rem headings wrap to several visual lines, where sliding a two-line
  slab reads worse than a fade — so the mask becomes a fade at that width instead.
- `.reveal` is a 14px fade-up for everything else, staggered by `--i` across
  siblings.
- The hero is choreographed by hand (`--i` 0→5: label, both headline lines,
  buttons, lede, rail) and held until `document.fonts.ready`, with a 600ms
  timeout, so the opening reveal never animates in the fallback face and reflow
  mid-motion.
- The four hero brackets scale outward from their own corners as the page opens —
  the brand mark, performed once.
- Micro-interactions are fast (.22–.42s) and reveals are slow (.8s) on
  `cubic-bezier(.16, 1, .3, 1)`. That contrast is the point.
- Hover: nav labels swap on a masked vertical slide, button arrows leave to the
  right as their twin arrives from the left, filled buttons wipe to their inverse,
  service rows answer by darkening their own hairline rather than filling with grey.

All of it is disabled under `prefers-reduced-motion`, and the page is fully legible
with JavaScript off (reveal states only apply under `html.js`).

## Drawn, not written

The page carries 357 words of visible copy. Wherever an argument could be shown
instead of explained, it is drawn:

| Section | What the drawing does |
| --- | --- |
| The gap | Two panels: the same cup, plate and glass composed on one table line, then cropped, tilted and half-loaded on a phone. The argument, without the paragraph. |
| Services | A monoline mark per discipline — a browser frame with the brand diagonal, a post grid, a rising line. |
| Ticket to Scale | Two diagrams side by side: three providers pulling toward three destinations, against four parts converging on one node and one arrow out. |
| Why North Frame | Each principle is a small diagram — a frame holding one dot, a shape and its reflection, an arrow arriving at a target, three arrows travelling together. |
| Industries | Twelve hospitality pictograms on a hairline grid. Each tile inverts on hover. |
| Approach | The frame assembles across the four steps: corner marks, then a closed frame, then a filled composition, then an arrow leaving it. |

## The marks

Twenty marks, drawn as one system rather than collected as a set. The rules:

- **One vocabulary.** Horizontal and vertical rules, 45° diagonals, exact circles
  and true circular arcs. Nothing freehand. The same geometry the page is built
  from.
- **One optical box.** Every mark is drawn inside an 18-unit box on a 24-unit grid
  and centred on (12,12), so a grid of twelve reads as a system instead of a set
  of drawings at different sizes. This is checked, not eyeballed — the audit
  fails a mark that drifts off centre by more than 0.75 units or falls outside
  17–18.5 units on its dominant axis.
- **One hairline.** Every shape carries `vector-effect="non-scaling-stroke"` as an
  *attribute*, which survives into `<use>` shadow content where a CSS rule cannot
  reach. So a single `stroke-width: 1.25` paints the same hairline at 24px and at
  44px, matching the page's own 1px rules. Measured from pixels, not assumed.
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
5. Why North Frame — Clarity, Positioning, Conversion, Direction
6. Industries — twelve hospitality tiles (nav "Work" points here)
7. Approach — Discover, Frame, Build, Grow
8. About — founder
9. Final CTA + footer

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

Single `h1`, ordered heading levels, a skip link, visible `:focus-visible` rings,
`aria-expanded` on the menu toggle, Escape to close, and no interactive target
under 32px.

The opacity ladder is split by role, because the obvious shortcut fails WCAG:
`--fg-faint` is the lightest tone allowed for small text (4.5:1 or better) and
`--fg-decor` is for display sizes only (3:1 or better). Every text node was
checked against its real rendered background at 375 / 390 / 430 / 768 / 1024 /
1440 / 1920 px — no contrast failures, no horizontal overflow, no console errors.

## Verified

Driven in real Chromium, not eyeballed. At 320 / 360 / 375 / 390 / 414 / 430 / 600
/ 768 / 834 / 1024 / 1280 / 1440 / 1680 / 1920 / 2560px:

- no element crosses the viewport edge
- no text node fails WCAG AA against its **real rendered** background
- no mask still clips its line after revealing
- nothing is left unrevealed after a full scroll
- no console error, page error, or failed request
- every in-page anchor lands clear of the fixed nav
- no undefined CSS custom property, no rule for markup that no longer exists,
  no duplicate `id`

Plus: the mobile menu opens, locks scroll without shifting the page, closes on
Escape and on link tap and returns focus; `prefers-reduced-motion` leaves every
element visible and un-animated; with JavaScript disabled the whole page renders.

Bugs this caught and fixed, rather than shipped:

| Symptom | Cause |
| --- | --- |
| Icon set read as a generic icon pack, not part of this site | marks drawn at wildly different optical sizes — 18×8 next to 9×17.5 — with freehand curves the rest of the page never uses |
| Service row arrows rendered as solid black triangles | an `<svg>` with no `fill`/`stroke` set |
| An ivory stripe down the right edge of every dark section | `scrollbar-gutter: stable` reserved 15px the full-bleed sections never painted into |
| The primary button dissolved into the page on hover | inverting a filled button that had no border |
| The nav's bottom border looked half-broken | a scroll-progress hairline overwriting part of it (removed — it read as a utility bar) |
| Three icon `color` declarations silently inherited | `var(--fg)` had been dropped as "unused", making them invalid at computed-value time |
