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

Hierarchy comes from opacity steps (`--ink-80` → `--ink-06`, `--ivory-72` →
`--ivory-10`), hairline rules, and type scale — not from accent colours. Dark
sections set `--bg` / `--fg` / `--rule` on `.section--dark`, so components inside
them invert without duplicated rules.

Type: **Inter Tight** for display (tight tracking, editorial), **Inter** for body
and labels — both self-hosted as variable woff2, so there is no third-party
request in the critical path and no layout shift from a late webfont. Every size
is a `clamp()` in `:root`, so the scale is fluid rather than stepped at
breakpoints. Arrows are drawn as inline SVG: Inter's Latin subsets have no U+2192,
so a typed `→` would silently render in a fallback face.

Motion is deliberately small: a masked line reveal in the hero, a 14px fade-up on
section entry, a scroll-linked rule in the Approach section, and hover
micro-interactions. All of it is disabled under `prefers-reduced-motion`, and the
page is fully legible with JavaScript off (reveal states only apply under `html.js`).

## Sections

1. Hero — *Digital growth, framed properly.*
2. The gap — why good businesses end up mispresented online
3. Services — Websites / Social Strategy / Paid Growth
4. The Ticket to Scale — the combined offer
5. Why North Frame — Clarity, Positioning, Conversion, Direction
6. Industries — the twelve hospitality categories (nav "Work" points here)
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

- 7 breakpoints: no horizontal overflow, no contrast failures, no console errors
- Mobile menu: opens, locks scroll, closes on Escape and on link tap, returns focus
- `prefers-reduced-motion`: all content visible, no transitions
- JavaScript disabled: all content visible (reveal states are scoped to `html.js`)
