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
  filters-stack-gap: "1.25rem"
  filters-block-bottom: "2.5rem"
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
  category-chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}/60"
    typography: "{typography.label}"
    padding: "0 0 0.25rem 0"
  category-chip-active-light:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    borderColor: "{colors.field-magenta}"
    typography: "{typography.label}"
  category-chip-active-dark:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    borderColor: "{colors.field-cyan}"
    typography: "{typography.label}"
---

# Design System: CLACK

## Overview

**Creative North Star: "The Numbered Specimen Case"**

CLACK's shipped catalog is a flat grid of specimens: every product sits inside its own full-bleed field of color, badged with a piece number, and described underneath in two weights of type — a didone name/price and a grotesque description. It is the teletext half of the direction contract's museum thesis: the closed four-color field, the numbering, and the didone/grotesque split all shipped exactly as specified. The catalog's search field and category rail — described in the surface brief's FIRST VIEWPORT — have also now shipped, as a filter strip on the catalog route rather than fused into the shared header markup (see Navigation / Header). What has **not** shipped is the other half of the brief: the full-width split hero with cartela and spec table. This document records what was actually built; the hero/cartela/spec-table composition remains a brief, not a shipped pattern, and should not be assumed present when building new screens.

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
- **Field Magenta** (`#ff3fa6`): same role as Field Lime; also the light-theme interactive accent (link hover/focus, active category chip).
- **Field Cyan** (`#00d9e0`): same role as Field Lime; also the dark-theme interactive accent (link hover/focus, active category chip).
- **Field Amber** (`#ffb100`): same role as Field Lime.

### Neutral
- **Ink** (`#0d0d0c`): dark-theme background; light-theme text.
- **Bone** (`#f1ecdd`): light-theme background; dark-theme text. Warm off-white, not pure white.

### Named Rules
**The Closed Four Rule.** Only these four hexes exist as field colors anywhere in the system (enforced at the data layer by `PRODUCT_DISPLAY_COLORS` in `shared/schemas/product.ts`). No tints, no opacity variants, no fifth color. A new field color is a palette decision, not a per-screen choice.

**The Theme-Owned Accent Rule.** The interactive accent is never a fixed hardcoded hue: it is magenta in light mode and cyan in dark mode (see `ErrorState`'s retry link, and the active category chip's underline/text color in `CatalogFilters`). Amber and lime are identity fields only and never carry interaction state.

**The Cycled-Not-Identity Rule.** The four field colors are a rhythm device, not a per-item unique key, anywhere they're reused as a small swatch. `displayColor` cycles across product tiles, and `CatalogFilters`' category-rail dot cycles across the six categories (`PRODUCT_CATEGORIES[index % 4]`) the same way — with only four colors and six categories, two pairs necessarily repeat (Teclados/Sillas both lime, Mouse/Mousepads both magenta). This is intentional: the dot is a scan cue, and the uppercase label is the actual disambiguator. Don't "fix" a repeated swatch color by adding a fifth hue — that would violate the Closed Four Rule to solve a problem the system doesn't have.

## Typography

**Display Font:** Bodoni Moda (with ui-serif, serif fallback)
**Body Font:** Archivo (with ui-sans-serif, sans-serif fallback)

**Character:** A didone/grotesque pairing borrowed from print editorial — Bodoni Moda's high-contrast strokes read as the "headline of the moment," while Archivo's even, data-journalism grotesque carries labels, descriptions, and supporting copy.

### Hierarchy
- **Display** (400, 1.125rem–1.5rem, 1.2 line-height): Product name, product price, and the single headline of an empty/error state. Never used for more than one string per view.
- **Body** (400, 0.875rem, 1.4 line-height): Product descriptions (clamped to one line in the grid), state-message support text, and the catalog search input's typed value/placeholder.
- **Label** (500, 0.75rem, 1.2 line-height, 0.1em tracking, uppercase): Piece-number badges (`No. 01`), the retry link, and the category-rail chips. Always uppercase, always tracked wide.

### Named Rules
**The One Headline Rule.** Bodoni Moda appears at most once per component as the highest-weight line — the product name, the price, or a state's message title — never for two competing strings on the same card or screen.

## Layout

Mobile-first with exactly two upward breakpoints, `md` (768px) and `lg` (1024px); `sm`, `xl`, and `2xl` are not used anywhere in the codebase. The product grid is `grid-cols-1` at base, `md:grid-cols-2`, `lg:grid-cols-4`, with a `1.5rem` horizontal gap and `2.5rem` vertical gap — the vertical gap is wider than the horizontal one so rows read as distinct specimens rather than a continuous mat. Cards are `aspect-square` image tiles with `2rem` of inset padding around the product photo, followed by a `1rem`-gap text stack. State screens (empty, error) center their content with `6rem` of vertical padding, deliberately more generous than the card rhythm. The catalog's filter block stacks search-then-rail with a `1.25rem` gap and sits `2.5rem` clear of the grid below it (`mb-10`); the category rail itself scrolls horizontally on overflow rather than wrapping, keeping it a single scan line.

## Elevation & Depth

Flat. No shadow, no gradient, and no blur exists anywhere in the sampled components. Depth is conveyed entirely by color-field contrast against the ink/bone ground — a bright flat field sitting on a near-black or bone page reads as "raised" without any actual shadow.

### Named Rules
**The Flat Ground Rule.** Surfaces never lift with a shadow. If a component needs to stand out, it gets a field color, not an elevation.

## Shapes

Zero border-radius anywhere sampled — cards, image tiles, skeletons, the retry link, and the filter controls all have square corners. This is stricter than the direction contract's "no large rounded corners"; the shipped build has no rounded corners at all. Borders are hairline and low-opacity (`border-ink/15` in light, `border-bone/15` in dark) as the default — used on the header's bottom rule and the filter block's own bottom rule. **One documented exception:** the catalog search input's resting-state border is `border-ink/50` (light) / `border-bone/40` (dark), deliberately heavier than the hairline default. This is not a style drift; it's the floor required to clear the binding WCAG 3:1 non-text contrast minimum for an interactive form control's resting boundary, which a hairline border cannot reliably meet. Treat this as a targeted exception for interactive-control boundaries, not a new default border weight — don't carry `ink/50`/`bone/40` into non-interactive hairlines elsewhere.

## Components

### Product Card
The core specimen unit. A flat color-field square holds the product photo (inset, `object-contain`) with a small uppercase piece-number badge (`No. 01`, `No. 02`…) pinned to the top-left corner of the field, at 70%-opacity ink text over the field color. Below the field: the product name in Bodoni Moda, a one-line-clamped Archivo description at 70% opacity, and the price in Bodoni Moda pinned to the bottom of the card via `mt-auto` so prices align across a row regardless of description length.

### Product Card Skeleton
Mirrors the real card's shape exactly: an `aspect-square` block plus three text bars (title, description, price) at the same proportions as the loaded state, so the grid never reflows when data arrives. Uses `motion-safe:animate-pulse`, so `prefers-reduced-motion` users get a static placeholder instead of a pulsing one. No spinners exist in the system.

### Empty / Error States
Centered single-column stack, generous vertical padding (`py-24`), no icons. A Bodoni Moda headline carries the message; an optional Archivo line underneath adds detail at 70% opacity. `ErrorState` additionally renders a retry action styled as an underlined text link (bottom-border, not a filled button) that turns theme-owned accent color on hover/focus (magenta in light, cyan in dark), with a visible 2px focus ring in the same accent.

### Catalog Filters
`CatalogFilters` (rendered by `CatalogPage`, not by `PublicLayout`) is a two-row stack: a borderless search input on top, a horizontally-scrolling category rail below, separated by a `1.25rem` gap and closed off by the block's own hairline bottom rule.

- **Search input**: `type="search"`, no visible label (an `sr-only` label plus `role="search"` on the wrapper carry the accessible name), Archivo body type, bottom-border-only styling (no full box, no fill) — consistent with the system's "no boxes, just rules" language elsewhere. Its resting border is the one documented hairline exception above (`ink/50`/`bone/40`); on focus it swaps to the theme-owned accent (`field-magenta`/`field-cyan`), matching the Theme-Owned Accent Rule.
- **Category rail**: a `role="group"` row of pill-less text chips ("Todos" plus one per `PRODUCT_CATEGORIES` entry), Label typography, uppercase, tracked. The active chip is marked with `aria-pressed` and switches from `ink/60`/`bone/60` to full-opacity `ink`/`bone` text with a 2px bottom border in the theme-owned accent color — the same accent used for hover/focus elsewhere, now also carrying an active/selected state. Each non-"Todos" chip is preceded by a `size-1.5` color dot that cycles through the four closed field colors by category index (see the Cycled-Not-Identity Rule) — it is a scan-rhythm cue, not a per-category identity color, and two categories legitimately share a dot color.
- **Scrollbar theming**: the rail's overflow-x scrollbar is themed via a dedicated `.catalog-category-rail` rule in `src/index.css` (`scrollbar-width`/`scrollbar-color` plus `::-webkit-scrollbar*`) at `rgb(13 13 12 / 30%)` in light and `rgb(241 236 221 / 30%)` in dark — i.e., ink/bone at 30% opacity, no new hex introduced. This keeps the native scroll affordance visually theme-consistent instead of leaving it as unstyled browser chrome.

### Navigation / Header
A single hairline-bordered header (`border-ink/15` light / `border-bone/15` dark) holding only the CLACK wordmark, set in Bodoni Moda, uppercase, wide-tracked. This header is shared chrome from `PublicLayout` and also wraps product detail and the future landing page. The catalog's search field and category rail (Catalog Filters, above) are **not** part of this shared header — they're rendered by `CatalogPage` itself, immediately below the header, flush against its bottom rule so the two read as one continuous strip on the catalog screen without adding search/filtering to routes that don't need it (product detail, the future landing page). The direction contract's FIRST VIEWPORT description of a search bar and category rail with colored dots has shipped, positioned this way rather than fused into the header markup.

## Do's and Don'ts

### Do:
- **Do** assign exactly one of the four closed field colors, full-strength and full-bleed, per product tile.
- **Do** keep Bodoni Moda to one headline-weight string per component (name, price, or state message) — never stack two didone lines competing for attention.
- **Do** build any new skeleton to the exact shape of its loaded content, and gate its animation behind `motion-safe:`.
- **Do** source interactive accent color from the active theme (magenta light / cyan dark), not a hardcoded hex.
- **Do** keep corners square and surfaces shadow-free; depth comes from the field color, never from elevation.
- **Do** cycle small color swatches (category-rail dots, product `displayColor`) through the closed four-field set by index, and let the adjacent text label do the disambiguation — repeated colors across items are expected, not a bug to fix with a fifth color.
- **Do** keep a filter/search control that needs to clear the WCAG 3:1 non-text UI-boundary floor on a heavier border than the system's default hairline, scoped to that control only.

### Don't:
- **Don't** add border-radius, drop shadows, gradients, or glassmorphism — none exist in the shipped system and none are implied by the direction contract.
- **Don't** introduce a tint, opacity variant, or fifth color into the closed four-field set — including as a "fix" for a category or product that happens to share a cycled swatch color with another.
- **Don't** assume the full split-hero/cartela/spec-table composition from the surface brief is already built when designing a new screen — only the specimen grid plus the catalog's search input and category rail have shipped so far.
- **Don't** treat the current light theme (a literal ink/bone swap) as the finished "separately designed" light mode the direction contract calls for — it is recorded here as shipped behavior, not as an approved target for future light-theme work.
- **Don't** generalize the search input's heavier border (`ink/50`/`bone/40`) into the system's default border weight — it's a one-off floor for an interactive control's resting-state contrast, not a replacement for the hairline (`ink/15`/`bone/15`) convention used everywhere else.
- **Don't** fold catalog-specific filtering controls into `PublicLayout`'s shared header — it also wraps routes (product detail, the future landing page) that don't need them; keep filter UI on the routes that use it.
