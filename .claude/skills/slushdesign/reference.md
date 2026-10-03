# Slush — Style Reference
> inflatable sticker universe on pastel paper

**Theme:** light

Slush follows a sticker-book logic:

- **Canvas and ribbons.** The canvas is pastel paper, with huge inflated 3D ribbons in electric blue.
- **Display type.** It is enormous and crushed: Lateral 800 at 200–640px, with a line-height of 0.75–0.80. The words become sculptural objects, not sentences.
- **Colour.** The six saturated brand colours work as one shared sticker palette. Each one appears as a filled sticker, a card surface or a decorative wash, never as a restrained accent.
- **Components.** They are rounded to the point of softness (20–40px on cards, pills on nav) and outlined in black, so they look hand-cut.

The result reads less like a fintech landing page and more like a physical collage pinned to a pale wall.

> **Corrections to the source spec, applied here:**
> - The primary action is a **black fill (`#000`) with white text**. The source "Agent Prompt Guide" listed `#ffffff` as the filled action, which contradicts the Filled CTA component.
> - `--element-gap: 4-12px` is not valid CSS. It is split into `--element-gap-sm/--element-gap/--element-gap-lg` (4/8/12px).
> - Tracking values are written in `em`, not `px`.

## Colours

| Name | Value | Token | Role |
|------|-------|-------|------|
| Carbon | `#000000` | `--color-carbon` | Primary text, card borders, filled CTA background, logo mark. Gives the hand-cut sticker outline against pastels |
| Paper White | `#ffffff` | `--color-paper-white` | Page canvas, card surfaces, outlined button fills, text on dark fills |
| Sky Wash | `#dceeff` | `--color-sky-wash` | Hero background, the light-blue pastel ground |
| Concrete Gray | `#cccccc` | `--color-concrete-gray` | Secondary section background, a neutral interlude |
| Soft Mist | `#e9e9e9` | `--color-soft-mist` | Subtle button and surface tints, hover and disabled states |
| Electric Blue | `#4da2ff` | `--color-electric-blue` | Dominant brand colour: 3D ribbons, washes. **Decorative only** |
| Mint Pop | `#55db9c` | `--color-mint-pop` | Green wash and checkmark stickers. **Not a success state** |
| Lavender | `#e9ccff` | `--color-lavender` | Soft accent wash for cards, tags and sticker fills |
| Ember | `#fb4903` | `--color-ember` | Hot accent for sticker icons, badges and the rocket |
| Sunburst | `#ffd731` | `--color-sunburst` | Coin stickers and highlights. Never behind text |
| Voltage Violet | `#5c4ade` | `--color-voltage-violet` | Wallet stickers, QR download card, secondary surfaces |

## Typography

### Lateral 800 (display only)
- **Substitutes:** Druk, Bowlby One, Antonio. Free option: **Anton**.
- **Sizes:** 70, 110, 160, 200, 281, 640px.
- **Line height:** 0.75–0.80. Never above 0.85.
- **Use:** wordmarks and section banners ("SLUSH", "ALL THINGS SUI"). Treat the type as a physical object that ribbons wrap behind.

### Aeonik Pro 500 / 700 (all UI)
- **Substitutes:** Inter, Satoshi, General Sans. Free option: **Inter**.
- **Weights:** 500 for body and metadata (12–16px); 700 for subheads, nav and buttons (24–30px), plus a 64px 700 step for large supporting headlines.
- **Letter-spacing:** -0.01em for body, 0.030–0.032em for nav, buttons and uppercase labels.
- **OpenType features:** `"ss01" on, "tnum"`.

### Type scale

| Role | Size | Line height | Tracking | Token |
|------|------|-------------|----------|-------|
| caption | 12px | 1.56 | -0.01em | `--text-caption` |
| body-lg | 15px | 1.39 | -0.01em | `--text-body-lg` |
| subheading | 24px | 1.2 | -0.01em | `--text-subheading` |
| heading-sm | 30px | 1.1 | -0.01em | `--text-heading-sm` |
| heading | 64px | 1 | -0.01em | `--text-heading` |
| display | 200px | 0.8 | 0 | `--text-display` |
| display-lg | 640px | 0.75 | 0 | `--text-display-lg` |

## Spacing and shape

- **Base unit:** 4px.
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 28, 32, 40, 44, 48, 60, 80, 128, 180, 224.
- **Layout:** max-width 1440px, 48px section gap, 24px card padding, 4–12px element gap.

| Element | Radius |
|---------|--------|
| nav, pills, buttons | 1600px |
| body | 30px |
| cards | 20px |
| wallet icon | 16px |
| elevated cards | 40px |

## Components

- **Pill nav button.** 1600px radius, 1px black border and a white fill. Aeonik Pro 700 at 12–14px, 0.032em tracking. 15px × 12px padding, 4px gaps.
- **Filled CTA ("Launch App").** Black fill with white text. Aeonik Pro 700 at 13–14px, 10px × 12px padding, pill shape. Use one per screen.
- **Outlined ghost button.** White fill, 1px black border and black text, same type and padding as the CTA. Sits beside or below the CTA.
- **Logo mark.** A circular badge with a black outline and an "S", fixed at top-left.
- **Plus menu button.** A circular icon button with a black outline and a "+" glyph.
- **QR download card.** 20px radius and a `#5c4ade` background. It splits into a white QR panel (black hairline border) and a "DOWNLOAD" label in Aeonik Pro 700, white.
- **Sticker decoration.** A flat rocket, coin, wallet or checkmark, with a 1px black outline and a 16–20px radius. Fill it with a brand colour. Place stickers overlapping and rotated, never grid-aligned.
- **Marquee banner.** A full-bleed black strip with white Aeonik Pro 700 uppercase at 12–13px and 0.032em tracking. It loops continuously.
- **Display headline block.** Lateral 800 at 200–640px, line-height 0.75–0.80, black. Always pair it with an Aeonik Pro tagline.
- **Tagline subhead.** Aeonik Pro 500 at 24–64px, black, directly below the display block.
- **3D ribbon.** A grainy, inflatable tube in Electric Blue that wraps behind the display text. It is the signature motif and appears in every section.
- **Section background panel.** Full-bleed bands alternating `#dceeff`, `#ffffff` and `#cccccc`, with no borders or shadows.

## Do

- Use Lateral 800 at 200–640px with a line-height of 0.75–0.80 for every display headline.
- Use the six-colour sticker palette as a shared set, several colours per screen.
- Give nav, buttons and cards a 1px solid `#000` border.
- Make nav, buttons and tags pills. Give cards a 20–40px radius.
- Pair every display headline with a ribbon or a sticker cluster.
- Set nav, buttons and uppercase labels in Aeonik Pro 700 with 0.030–0.032em tracking.
- Alternate section backgrounds to create the scroll rhythm.

## Don't

- Don't use a radius under 16px on cards, or anything but pills for buttons and tags.
- Don't let the display line-height go above 0.85.
- Don't use blue `#4da2ff` as a CTA fill or link colour.
- Don't use box-shadows anywhere.
- Don't use green `#55db9c` as a success state.
- Don't constrain the desktop page under 1280px.
- Don't use gradients anywhere.

## Surfaces

| Level | Name | Value |
|-------|------|-------|
| 1 | Sky Wash | `#dceeff` |
| 2 | Paper White | `#ffffff` |
| 3 | Concrete Gray | `#cccccc` |
| 4 | Sticker surface | `#e9ccff` |

## Imagery

- **3D ribbons dominate.** They are grainy, inflatable tubes in Electric Blue, wrapping around or behind the type.
- **2D stickers float around headlines.** A rocket, a gold coin, a green check and a purple wallet, each with a 1px black outline, like cut-outs pinned to a board.
- **No photography and no illustration grids.** The composition stays collage-like and asymmetric.

## Layout

The page is a full-bleed vertical scroll with no sidebar.

- **Top of page:** the marquee, then a minimal nav (logo left, pill links in the centre, filled CTA right).
- **Sections:** each is a full-viewport colour band with oversized display type, centred or left-aligned, wrapped by ribbons.
- **Composition:** stickers overlap the type, and the QR card sits off-centre.
- **Rhythm:** vertical spacing is generous (48px section gaps), horizontal composition is asymmetric, and every band reads like a self-contained poster.

## Component prompts

1. **Hero.**
   - `#dceeff` full-bleed background, with a centred Lateral 800 headline at 200px, line-height 0.80, black.
   - A 3D Electric Blue grainy ribbon wraps behind the headline.
   - Tagline: Aeonik Pro 500 at 24px, -0.01em.
   - Two buttons: a black filled "Launch Web App" and a ghost "Download for Chrome", both pills with Aeonik Pro 700 at 13px and 0.032em.
   - Stickers float around the headline: an Ember rocket, a Sunburst coin and a Violet wallet. Each has a 1px black outline, a 20px radius and a slight rotation.
2. **QR download card.** 20px radius, `#5c4ade` background, 1px black border. A white QR square with 8px padding on the left; "DOWNLOAD" in Aeonik Pro 700 14px, white, on the right.
3. **Marquee strip.** A black full-bleed band with scrolling Aeonik Pro 700 12px, 0.032em, white, uppercase.
4. **Secondary section.**
   - `#cccccc` background, with Lateral 800 at 281px and line-height 0.76 on the left.
   - A blue ribbon arcs across the top.
   - A mint check sticker sits far left and a violet wallet sticker far right, both overlapping the type.

## Gradients
None. This is a hard rule.

## Animation
- Only the marquee scrolls, plus minimal hover transitions on buttons.
- Ribbons and stickers are static.
- Under `prefers-reduced-motion`, stop the marquee.

## Similar brands
Rainbow.me, Phantom Wallet, Backpack Wallet, Magic Eden.
