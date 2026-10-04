---
name: slushdesign
description: Apply the "Slush" design system — an inflatable-sticker-universe look on pastel paper. Huge crushed display type (Lateral 800, line-height 0.75–0.80), black 1px hand-cut outlines, pill controls, pastel section bands, a six-colour sticker palette and electric-blue 3D ribbons. Use when the user types /slushdesign, or asks for the Slush style, the sticker-book look, or "copy this design".
---

# /slushdesign — Slush design system

When this skill runs, build or restyle the page or component the user asked for in the
Slush style. If they typed `/slushdesign` with no target, ask what to build or restyle.
If they named existing files, restyle those files in place and keep their content and
structure.

## Files in this skill

- `tokens.css`: all design tokens as CSS custom properties, plus base component classes.
  Copy it into the project, or inline it, before writing any styles.
- `reference.md`: the full specification (colours, type scale, components, do's and
  don'ts, layout, component prompts). Read it before designing a new section type.
- `template.html`: a working starter page (marquee, nav, hero, sticker band, QR card,
  footer) built only from the tokens. Start new pages from it.

## Workflow

1. Read `reference.md` and `tokens.css`.
2. Bring the tokens into the project: copy `tokens.css` next to the existing styles, or
   merge its `:root` block in. Never hard-code a hex value that a token already covers.
3. Build sections as full-bleed colour bands. Alternate `--color-sky-wash`, white and
   `--color-concrete-gray` down the page.
4. Every display headline uses `.slush-display`, and gets a ribbon or a sticker cluster
   beside or behind it.
5. Check the rules below before you finish. If you can, render at 375px and 1440px.

## Non-negotiable rules

**Type**
- Display text is Lateral 800 at 70–640px, with line-height 0.75–0.80 (never above 0.85).
  Use `clamp()` so it scales down to phone width without overflowing.
- Everything else is Aeonik Pro: 500 for body, 700 for subheads, nav and buttons.
- Body letter-spacing is -0.01em. Nav, button and uppercase-label letter-spacing is
  0.032em.

**Colour**
- Text and outlines are `#000`.
- The primary CTA is a black fill with white text. The secondary CTA is white with a
  1px black outline.
- Electric Blue `#4da2ff` is decorative only (ribbons, washes). Never use it for a CTA,
  a link or text.
- Use several sticker colours per screen, as a shared set: `#55db9c`, `#e9ccff`,
  `#fb4903`, `#ffd731`, `#5c4ade`. Green is not a success state.

**Shape and depth**
- Buttons, nav and tags are pills (radius 1600px). Cards use a 20–40px radius. Never use
  less than 16px.
- Interactive elements and cards get a 1px solid black border.
- No box-shadows and no gradients. Show depth with colour bands, outlines and the 3D
  ribbons only.

**Layout**
- Page max-width is 1440px, and never under 1280px on desktop.
- Composition is loose and asymmetric: stickers overlap the type and are rotated a few
  degrees, never grid-aligned.

**Motion**
- Only the marquee loops. Buttons get a small hover change.
- Respect `prefers-reduced-motion`: stop the marquee.

## Fonts

Lateral and Aeonik Pro are commercial fonts. Use them if the project has licensed files.
Otherwise use the free substitutes already wired into `tokens.css` from Google Fonts:
**Anton** for display and **Inter** for UI. Load them with:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@500;700&display=swap" rel="stylesheet">
```

## 3D ribbons and stickers

No ribbon image ships with this skill. Use one of these, in order of preference:

1. A 3D render the user supplies.
2. An inline SVG tube: a thick `stroke-linecap="round"` path in `#4da2ff`, with an
   `feTurbulence` grain filter for the rough surface. `template.html` has one.

Stickers are small inline SVGs or rounded `div`s: a sticker-colour fill, a 1px black
outline, and a 16–20px radius or a circle, rotated -12° to 12°.

## Accessibility

- Decorative ribbons and stickers get `aria-hidden="true"`.
- Black on every pastel passes WCAG AA. White text is only allowed on `#000` and
  `#5c4ade`.
- Keep a visible focus ring: a 2px black outline offset by 3px.
