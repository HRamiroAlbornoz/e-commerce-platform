---
name: CLACK
description: A teletext-flat specimen grid for gaming peripherals, where each product sits on its own named color field.
colors:
  ink: "#0d0d0c"
  bone: "#f1ecdd"
  field-lime: "#cfef00"
  field-magenta: "#ff3fa6"
  field-cyan: "#00d9e0"
  field-amber: "#ffb100"
typography:
  display:
    fontFamily: "Bodoni Moda, ui-serif, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "Archivo, ui-sans-serif, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, ui-sans-serif, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.1em"
spacing:
  card-gap-x: "1.5rem"
  card-gap-y: "2.5rem"
  card-image-inset: "2rem"
  card-content-gap: "1rem"
  state-padding-y: "6rem"
components:
  retry-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "0"
  retry-link-hover-light:
    backgroundColor: "transparent"
    textColor: "{colors.field-magenta}"
    typography: "{typography.label}"
    padding: "0"
  retry-link-hover-dark:
    backgroundColor: "transparent"
    textColor: "{colors.field-cyan}"
    typography: "{typography.label}"
    padding: "0"
---

# Design System: CLACK

## Overview

**Creative North Star: "The Numbered Specimen Case"**

CLACK's shipped catalog is a flat grid of specimens: every product sits inside its own full-bleed field of color, badged with a piece number, and described underneath in two weights of type — a didone name/price and a grotesque description. It is the teletext half of the direction contract's museum thesis: the closed four-color field, the numbering, and the didone/grotesque split all shipped exactly as specified. The other half — the full-width split hero with cartela, spec table, category rail, and search header — did **not** ship in this pass. What exists today is a uniform four-up grid, not the vitrine composition described in the surface brief's FIRST VIEWPORT. This document records the grid that was actually built; the hero/cartela composition remains a brief, not a shipped pattern, and should not be assumed present when building new screens.

Depth is never simulated. There are no shadows, no gradients, and no border-radius anywhere in the sampled components — flatness is total, not partial. The dark theme (ink ground, bone text) is primary; the light theme is currently a literal swap of the same two neutrals rather than a separately-designed surface (see Do's and Don'ts).

**Key Characteristics:**
- Closed four-color field system (lime, magenta, cyan, amber) — flat, full-strength, no tints or intermediate variants.
- Didone (Bodoni Moda) carries the single most important line on a view; grotesque (Archivo) carries everything else.
- Zero elevation: no shadows, no gradients, no border-radius anywhere in the system.
- Skeletons mirror the exact shape of loaded content; no spinners.
- Interactive accent color is theme-owned: magenta in light mode, cyan in dark mode, never a fixed hover color.

## Colors

Four named, flat, equal-weight fields carry product identity; two neutrals (ink and bone) carry everything else. There is no single "brand primary" hue — the four fields function as a closed set, each one interchangeable in role.

### Primary
- **Field Lime** (`#cfef00`): full-bleed background of a product's image tile. One product, one field, no blending with the other three.
- **Field Magenta** (`#ff3fa6`): same role as Field Lime; also the light-theme interactive accent (link hover/focus).
- **Field Cyan** (`#00d9e0`): same role as Field Lime; also the dark-theme interactive accent (link hover/focus).
- **Field Amber** (`#ffb100`): same role as Field Lime.

### Neutral
- **Ink** (`#0d0d0c`): dark-theme background; light-theme text.
- **Bone** (`#f1ecdd`): light-theme background; dark-theme text. Warm off-white, not pure white.

### Named Rules
**The Closed Four Rule.** Only these four hexes exist as field colors anywhere in the system (enforced at the data layer by `PRODUCT_DISPLAY_COLORS` in `shared/schemas/product.ts`). No tints, no opacity variants, no fifth color. A new field color is a palette decision, not a per-screen choice.

**The Theme-Owned Accent Rule.** The interactive accent is never a fixed hardcoded hue: it is magenta in light mode and cyan in dark mode (see `ErrorState`'s retry link). Amber and lime are identity fields only and never carry interaction state.

## Typography

**Display Font:** Bodoni Moda (with ui-serif, serif fallback)
**Body Font:** Archivo (with ui-sans-serif, sans-serif fallback)

**Character:** A didone/grotesque pairing borrowed from print editorial — Bodoni Moda's high-contrast strokes read as the "headline of the moment," while Archivo's even, data-journalism grotesque carries labels, descriptions, and supporting copy.

### Hierarchy
- **Display** (400, 1.125rem–1.5rem, 1.2 line-height): Product name, product price, and the single headline of an empty/error state. Never used for more than one string per view.
- **Body** (400, 0.875rem, 1.4 line-height): Product descriptions (clamped to one line in the grid), state-message support text.
- **Label** (500, 0.75rem, 1.2 line-height, 0.1em tracking, uppercase): Piece-number badges (`No. 01`) and the retry link. Always uppercase, always tracked wide.

### Named Rules
**The One Headline Rule.** Bodoni Moda appears at most once per component as the highest-weight line — the product name, the price, or a state's message title — never for two competing strings on the same card or screen.

## Layout

Mobile-first with exactly two upward breakpoints, `md` (768px) and `lg` (1024px); `sm`, `xl`, and `2xl` are not used anywhere in the codebase. The product grid is `grid-cols-1` at base, `md:grid-cols-2`, `lg:grid-cols-4`, with a `1.5rem` horizontal gap and `2.5rem` vertical gap — the vertical gap is wider than the horizontal one so rows read as distinct specimens rather than a continuous mat. Cards are `aspect-square` image tiles with `2rem` of inset padding around the product photo, followed by a `1rem`-gap text stack. State screens (empty, error) center their content with `6rem` of vertical padding, deliberately more generous than the card rhythm.

## Elevation & Depth

Flat. No shadow, no gradient, and no blur exists anywhere in the sampled components. Depth is conveyed entirely by color-field contrast against the ink/bone ground — a bright flat field sitting on a near-black or bone page reads as "raised" without any actual shadow.

### Named Rules
**The Flat Ground Rule.** Surfaces never lift with a shadow. If a component needs to stand out, it gets a field color, not an elevation.

## Shapes

Zero border-radius anywhere sampled — cards, image tiles, skeletons, and the retry link all have square corners. This is stricter than the direction contract's "no large rounded corners"; the shipped build has no rounded corners at all. Borders, where present, are hairline and low-opacity (`border-ink/15` in light, `border-bone/15` in dark) — used once, on the header's bottom rule.

## Components

### Product Card
The core specimen unit. A flat color-field square holds the product photo (inset, `object-contain`) with a small uppercase piece-number badge (`No. 01`, `No. 02`…) pinned to the top-left corner of the field, at 70%-opacity ink text over the field color. Below the field: the product name in Bodoni Moda, a one-line-clamped Archivo description at 70% opacity, and the price in Bodoni Moda pinned to the bottom of the card via `mt-auto` so prices align across a row regardless of description length.

### Product Card Skeleton
Mirrors the real card's shape exactly: an `aspect-square` block plus three text bars (title, description, price) at the same proportions as the loaded state, so the grid never reflows when data arrives. Uses `motion-safe:animate-pulse`, so `prefers-reduced-motion` users get a static placeholder instead of a pulsing one. No spinners exist in the system.

### Empty / Error States
Centered single-column stack, generous vertical padding (`py-24`), no icons. A Bodoni Moda headline carries the message; an optional Archivo line underneath adds detail at 70% opacity. `ErrorState` additionally renders a retry action styled as an underlined text link (bottom-border, not a filled button) that turns theme-owned accent color on hover/focus (magenta in light, cyan in dark), with a visible 2px focus ring in the same accent.

### Navigation / Header
A single hairline-bordered header holding only the CLACK wordmark, set in Bodoni Moda, uppercase, wide-tracked. No search field, no category rail, and no secondary navigation currently exist in the shipped header — the direction contract's FIRST VIEWPORT description of a search bar and category rail with colored dots is not yet built.

## Do's and Don'ts

### Do:
- **Do** assign exactly one of the four closed field colors, full-strength and full-bleed, per product tile.
- **Do** keep Bodoni Moda to one headline-weight string per component (name, price, or state message) — never stack two didone lines competing for attention.
- **Do** build any new skeleton to the exact shape of its loaded content, and gate its animation behind `motion-safe:`.
- **Do** source interactive accent color from the active theme (magenta light / cyan dark), not a hardcoded hex.
- **Do** keep corners square and surfaces shadow-free; depth comes from the field color, never from elevation.

### Don't:
- **Don't** add border-radius, drop shadows, gradients, or glassmorphism — none exist in the shipped system and none are implied by the direction contract.
- **Don't** introduce a tint, opacity variant, or fifth color into the closed four-field set.
- **Don't** assume the hero/cartela/spec-table/category-rail composition from the surface brief is already built when designing a new screen — only the plain specimen grid has shipped so far.
- **Don't** treat the current light theme (a literal ink/bone swap) as the finished "separately designed" light mode the direction contract calls for — it is recorded here as shipped behavior, not as an approved target for future light-theme work.
