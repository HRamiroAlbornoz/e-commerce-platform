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
  cartela-panel:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    padding: "2.5rem 1.5rem"
  quantity-step-button:
    backgroundColor: "transparent"
    textColor: "currentColor"
    typography: "{typography.body}"
    size: "2.75rem"
  text-field-input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0.5rem 0"
  button-primary:
    backgroundColor: "transparent"
    textColor: "currentColor"
    typography: "{typography.label}"
    padding: "0.5rem 1.5rem"
  button-primary-hover-light:
    backgroundColor: "transparent"
    textColor: "{colors.field-magenta}"
    typography: "{typography.label}"
    padding: "0.5rem 1.5rem"
  button-primary-hover-dark:
    backgroundColor: "transparent"
    textColor: "{colors.field-cyan}"
    typography: "{typography.label}"
    padding: "0.5rem 1.5rem"
---

# Design System: CLACK

## Overview

**Creative North Star: "The Numbered Specimen Case"**

CLACK's shipped catalog is a flat grid of specimens: every product sits inside its own full-bleed field of color, badged with a piece number, and described underneath in two weights of type — a didone name/price and a grotesque description. It is the teletext half of the direction contract's museum thesis: the closed four-color field, the numbering, and the didone/grotesque split all shipped exactly as specified. The catalog's search field and category rail — described in the surface brief's FIRST VIEWPORT — have also shipped, as a filter strip on the catalog route rather than fused into the shared header markup (see Navigation / Header). The cartela and its dotted spec table have also shipped — but as a standalone product detail page reached from a card, not as the split-hero composition the brief originally described. Slice 5 added the account-facing surfaces (register, login, forgot-password, Google sign-in, logout, and an admin-access-denied state); it introduced no new color, typeface, or elevation model — it is the same teletext-museum world applied to a fourth kind of screen, plain form pages sitting directly on the page's own theme-swapping ink/bone ground. Slice 4 added pagination to the catalog listing (`PaginationControls`, see Components): a pure application of the existing system — the `Button` primitive, the hairline-divider vocabulary, and the established 70%-opacity support-text pattern — with no new color, typeface, spacing, or elevation token introduced to build it. Slice 6 added the cart surface (`CartPage` at `/cart`, reached through the existing `PublicLayout`): a single receipt-style list of `CartLineItem`s, each carrying its own closed-four-color stripe, the reusable `QuantitySelector`, and a tabular-nums line total, closed by a running total — the same world applied to a fifth kind of screen, sitting on the page's own theme-swapping ground like the auth pages, not a fixed-tone cartela. It introduced no new color, typeface, or elevation token; its one structural extension is applying the dotted-rule divider — previously scoped to the cartela's spec table — to a second context, an itemized receipt-style list (see Shapes). It also added a quick-add affordance to the Product Card itself, restructuring the card from a single full-card `<Link>` into a `<div>` wrapping a `<Link>` plus a sibling action row (see Components). There is still no hero or landing composition anywhere in the build (that remains slice 14's work); do not assume a full-width split hero exists just because the cartela does. This document records what was actually built.

Depth is never simulated. There are no shadows, no gradients, and no border-radius anywhere in the sampled components — flatness is total, not partial. The dark theme (ink ground, bone text) is primary; the light theme is currently a literal swap of the same two neutrals rather than a separately-designed surface (see Do's and Don'ts). The cartela is the one deliberate exception to theme-swapping altogether: it stays bone/ink regardless of the active theme (see the Fixed Paper Rule, under Colors). The auth screens shipped in slice 5, and the cart surface shipped in slice 6, both deliberately did **not** extend that exception — they use the page's own swapping background, not a second fixed-tone panel (see AuthPageLayout and CartPage, under Components).

**Key Characteristics:**
- Closed four-color field system (lime, magenta, cyan, amber) — flat, full-strength, no tints or intermediate variants.
- Didone (Bodoni Moda) carries the single most important line on a view; grotesque (Archivo) carries everything else.
- Zero elevation: no shadows, no gradients, no border-radius anywhere in the system.
- Skeletons mirror the exact shape of loaded content; no spinners.
- Interactive accent color is theme-owned: magenta in light mode, cyan in dark mode, never a fixed hover color — except the one fixed-tone surface (the cartela), which never theme-swaps at all.

## Colors

Four named, flat, equal-weight fields carry product identity; two neutrals (ink and bone) carry everything else. There is no single "brand primary" hue — the four fields function as a closed set, each one interchangeable in role.

### Primary
- **Field Lime** (`#cfef00`): full-bleed background of a product's image tile. One product, one field, no blending with the other three.
- **Field Magenta** (`#ff3fa6`): same role as Field Lime; also the light-theme interactive accent (link hover/focus, active category chip, and now the auth forms' and cart's button/link hover-focus states).
- **Field Cyan** (`#00d9e0`): same role as Field Lime; also the dark-theme interactive accent (link hover/focus, active category chip, and now the auth forms' and cart's button/link hover-focus states).
- **Field Amber** (`#ffb100`): same role as Field Lime.

### Neutral
- **Ink** (`#0d0d0c`): dark-theme background; light-theme text. Also the fixed text color of the cartela panel on the product detail page, in both themes.
- **Bone** (`#f1ecdd`): light-theme background; dark-theme text. Warm off-white, not pure white. Also the fixed background color of the cartela panel, in both themes.

### Named Rules
**The Closed Four Rule.** Only these four hexes exist as field colors anywhere in the system (enforced at the data layer by `PRODUCT_DISPLAY_COLORS` in `shared/schemas/product.ts`). No tints, no opacity variants, no fifth color. A new field color is a palette decision, not a per-screen choice.

**The Theme-Owned Accent Rule.** The interactive accent is never a fixed hardcoded hue: it is magenta in light mode and cyan in dark mode (see `ErrorState`'s retry link, the active category chip in `CatalogFilters`, the "Agregar al carrito" button's hover/focus on the product detail page, `Button`'s and `TextField`'s focus/hover states, the "¿Olvidaste tu contraseña?" and "Volver a iniciar sesión" links, `AuthNav`'s links, and — as of slice 6 — the Product Card's quick-add button, `CartLineItem`'s "Quitar" control, and `MergeExclusionsNotice`'s "Entendido" control). Amber and lime are identity fields only and never carry interaction state.

**The Cycled-Not-Identity Rule.** The four field colors are a rhythm device, not a per-item unique key, anywhere they're reused as a small swatch. `displayColor` cycles across product tiles (and also fills the image panel on the product detail page, and — as of slice 6 — the `w-1` color stripe on each `CartLineItem`, sourced from the same product record, not a new per-line assignment), and `CatalogFilters`' category-rail dot cycles across the six categories (`PRODUCT_CATEGORIES[index % 4]`) the same way — with only four colors and six categories, two pairs necessarily repeat (Teclados/Sillas both lime, Mouse/Mousepads both magenta). This is intentional: the dot is a scan cue, and the uppercase label is the actual disambiguator. Don't "fix" a repeated swatch color by adding a fifth hue — that would violate the Closed Four Rule to solve a problem the system doesn't have.

**The Fixed Paper Rule.** The product detail page's cartela panel (`bg-bone text-ink`) is bone-on-ink **unconditionally** — it does not theme-swap with the page's dark mode, unlike every other surface in the system. It is "papel hueso, como único plano claro": a fixed paper object sitting in the scene regardless of the room's lighting. Any component placed inside a fixed-tone surface like this one must not assume the page's theme-swap applies to it — see the QuantitySelector note under Components. This rule is scoped to the cartela; it does not license a second fixed-tone surface elsewhere without a matching editorial reason. **Confirmed by slice 5, and again by slice 6:** the auth screens and the cart page both had the same choice available and did not take it — `AuthPageLayout` and `CartPage` both sit directly on the page's own `bg-bone dark:bg-ink` ground, no bone-fixed panel. That is the rule working as intended, not an inconsistency.

## Typography

**Display Font:** Bodoni Moda (with ui-serif, serif fallback)
**Body Font:** Archivo (with ui-sans-serif, sans-serif fallback)

**Character:** A didone/grotesque pairing borrowed from print editorial — Bodoni Moda's high-contrast strokes read as the "headline of the moment," while Archivo's even, data-journalism grotesque carries labels, descriptions, and supporting copy.

### Hierarchy
- **Display** (400, 1.125rem–2rem, 1.2 line-height): Product name, product price, and the single headline of an empty/error state. On the product detail page the name grows to a 3xl `h1` and the price to `text-2xl` — both still Display, just sized up for the single-item context. On the auth pages, the same role sizes to a 3xl `h1` for the page title ("Iniciar sesión", "Crear cuenta"). On the cart page (slice 6), it carries the "Carrito" `h2` title, each `CartLineItem`'s product name and line total, and the running total's amount — the same name+price pairing per row the Product Card already established, not a new doubling. Never used for more than one headline-weight string per view.
- **Body** (400, 0.875rem, 1.4 line-height): Product descriptions (clamped to one line in the grid, full-length on the detail page), the curatorial note (italicized, see Components), the dotted spec table, state-message support text, the catalog search input's typed value/placeholder, and every `TextField` input's typed value, its hint/error text, and form body copy ("Ingresá tu email y te enviamos un enlace..."). A smaller `text-xs` cut of this same 70%-opacity support-text pattern — not the Label token — also carries `PaginationControls`' "Pagina {n}" caption (slice 4) and, as of slice 6, `CartLineItem`'s "c/u" unit-price line and `MergeExclusionsNotice`'s body text, matching `TextField`'s hint sizing/color exactly.
- **Label** (500, 0.75rem, 1.2 line-height, 0.1em tracking, uppercase): Piece-number badges (`No. 01`), the retry link, the category-rail chips, the detail page's "Agregar al carrito" button label, every `TextField` label, the `Button` primitive's text (including `PaginationControls`' "Anterior"/"Siguiente" buttons, slice 4, unchanged from the primitive), `AuthNav`'s "Iniciar sesión"/"Mi cuenta"/"Cerrar sesión" links, and — as of slice 6 — `CartIndicator` ("Carrito" / "Carrito (N)", reusing `AUTH_NAV_LINK_CLASSES` verbatim), `CartLineItem`'s "Quitar" control, and `MergeExclusionsNotice`'s "Entendido" control. Always uppercase, always tracked wide.

### Named Rules
**The One Headline Rule.** Bodoni Moda appears at most once per component as the highest-weight line — the product name, the price, or a state's message title — never for two competing strings on the same card or screen. **Disclosed exception:** the product detail page has two `<h1>` elements on the DOM — `PublicLayout`'s header wordmark and the cartela's product-name heading — because a single-item detail page earns its own real page heading rather than borrowing the site wordmark's. This is an accepted trade-off, not an error; the header wordmark is a candidate for demotion to a non-heading element the next time `PublicLayout` is touched, but that is out of scope until then. The auth pages hold to the strict rule (one `h1`, `AuthPageLayout`'s own title) since `AccessDeniedState` — the other slice-5 screen that also renders `SiteHeader` — demotes its own heading to `h2`, keeping the wordmark as the page's only `<h1>`. `CartPage` (slice 6) follows the same precedent: its "Carrito" title renders as an `h2`, not an `h1`, keeping `SiteHeader`'s wordmark as the page's only heading — a finish-review finding on this build (it originally shipped with a duplicate `h1`) fixed and verified before ship, confirming the rule a third time rather than becoming a fourth instance to fix later.

## Layout

Mobile-first with exactly two upward breakpoints, `md` (768px) and `lg` (1024px); `sm`, `xl`, and `2xl` are not used anywhere in the codebase. The product grid is `grid-cols-1` at base, `md:grid-cols-2`, `lg:grid-cols-4`, with a `1.5rem` horizontal gap and `2.5rem` vertical gap — the vertical gap is wider than the horizontal one so rows read as distinct specimens rather than a continuous mat. Cards are `aspect-square` image tiles with `2rem` of inset padding around the product photo, followed by a `1rem`-gap text stack. State screens (empty, error) center their content with `6rem` of vertical padding, deliberately more generous than the card rhythm. The catalog's filter block stacks search-then-rail with a `1.25rem` gap and sits `2.5rem` clear of the grid below it (`mb-10`); the category rail itself scrolls horizontally on overflow rather than wrapping, keeping it a single scan line. When results span more than one page, `PaginationControls` closes the grid off the same way the filter block opens it: a `mt-10 pt-6` hairline top rule (`border-t border-ink/15 dark:border-bone/15`), with "Anterior"/"Siguiente" `Button`s flanking the page label in a `flex justify-between` row — no new spacing token, the same `2.5rem`/`1.5rem` rhythm reused as a closing bracket instead of an opening one. It's rendered only when there's more than one page of results; on a single page it doesn't render at all.

The product detail page is a two-column grid (`grid-cols-1 md:grid-cols-2`, collapsing to one column below `md`): an image panel on the left and the cartela panel on the right. The image panel is `min-h-96` (mobile) / `md:min-h-144` (desktop), with the field color filling it edge-to-edge (a sangre) and the product photo inset via flex-centering (`p-12`) rather than the grid card's fixed padding. The cartela stacks its content with a `gap-4` flex column and pushes price/quantity/cart-button to the bottom of the panel with `mt-auto`, the same bottom-alignment device the grid card uses for price.

The auth pages (`AuthPageLayout`) are a single centered column, `max-w-md`, `px-4`, with generous vertical padding (`py-16` mobile / `md:py-24`) — no grid, no two-column split; a narrower, denser rhythm than the catalog/detail pages because the content is a single form, not a specimen or a gallery. Its title and content area are separated by a hairline top rule (`border-t border-ink/15 dark:border-bone/15`) with `pt-8`, the same hairline-divider language used for the header and the filter block, just applied vertically inside a form page rather than between page sections.

The cart page (`CartPage`, slice 6) is also a single centered column, `max-w-2xl`, `px-4 md:px-8`, `py-10 md:py-16` — wider than `AuthPageLayout`'s `max-w-md` because a receipt list needs more horizontal room than a form field, but the same single-column, no-grid family. Its title and content area share the identical hairline-divider pattern as `AuthPageLayout` (`border-t border-ink/15 dark:border-bone/15`, `pt-8`). Line items stack inside a `divide-y divide-dotted divide-ink/30` list (see Shapes) rather than the grid's card rhythm, and the running total closes the list with its own `mt-6 pt-6` hairline rule — the same "closing bracket" device `PaginationControls` uses to close the catalog grid.

## Elevation & Depth

Flat. No shadow, no gradient, and no blur exists anywhere in the sampled components. Depth is conveyed entirely by color-field contrast against the ink/bone ground — a bright flat field sitting on a near-black or bone page reads as "raised" without any actual shadow.

### Named Rules
**The Flat Ground Rule.** Surfaces never lift with a shadow. If a component needs to stand out, it gets a field color, not an elevation.

## Shapes

Zero border-radius anywhere sampled — cards, image tiles, skeletons, the retry link, the filter controls, the cartela panel, the quantity stepper, `TextField`, `Button`, and — as of slice 6 — the cart's line items and its remove/dismiss controls all have square corners. This is stricter than the direction contract's "no large rounded corners"; the shipped build has no rounded corners at all. Borders are hairline and low-opacity (`border-ink/15` in light, `border-bone/15` in dark) as the default — used on the header's bottom rule, the filter block's own bottom rule, the cartela panel (scoped to two edges only), `AuthPageLayout`'s and `CartPage`'s title/content dividers, and `PaginationControls`' own top rule, closing the grid with the identical hairline the filter block opens it with. **One documented exception, now confirmed twice:** the catalog search input's resting-state border is `border-ink/50` (light) / `border-bone/40` (dark), deliberately heavier than the hairline default, to clear the binding WCAG 3:1 non-text contrast minimum for an interactive form control's resting boundary, which a hairline border cannot reliably meet. `TextField` (slice 5) reuses the identical values for the same reason — it is the same class of control (a bare bottom-border input with no fill), not a new exception invented for this build. Treat this as a targeted exception for bare-bottom-border interactive-control boundaries, not a new default border weight — don't carry `ink/50`/`bone/40` into non-interactive hairlines elsewhere. `Button`, notably, does **not** use this heavier value: it has its own full border (`border border-current`) at full opacity, which already clears the same contrast floor without needing the `/50`/`/40` treatment — a bare-bottom-border control and a fully-bordered control solve the same accessibility requirement differently, and each should keep its own solution.

The dotted-rule spec table on the product detail page (`divide-y divide-dotted divide-ink/30`) is a second, distinct border vocabulary from the hairline solid rule used everywhere else — a punctuated, tabular divider rather than a structural edge. **As of slice 6, this vocabulary has a second confirmed use:** `CartPage`'s line-item list (`<ul>` of `CartLineItem`s) uses the identical `divide-y divide-dotted divide-ink/30 dark:divide-bone/30` class, and the cart skeleton mirrors it. Both uses share the same shape — a vertical list of discrete, itemized rows (spec/attribute pairs; receipt line items) — so this is a genuine, reused pattern, not a one-off. Treat it as scoped to `<dl>`-style spec/attribute tables and itemized receipt-style lists specifically, not a general alternative to the hairline convention for arbitrary content lists.

## Components

For each component, lead with a short character line, then specify shape, color assignment, states, and any distinctive behavior.

### Product Card
The core specimen unit. A flat color-field square holds the product photo (inset, `object-contain`) with a small uppercase piece-number badge (`No. 01`, `No. 02`…) pinned to the top-left corner of the field, at 70%-opacity ink text over the field color. Below the field: the product name in Bodoni Moda, a one-line-clamped Archivo description at 70% opacity. **As of slice 6, the card is a `<div>` wrapping a `<Link>` (image, name, description) plus a sibling row holding the price (Bodoni Moda, `mt-auto`-pinned so prices align across a row regardless of description length) and a quick-add button ("Agregar" / "Sin stock" when out of stock, theme-owned accent on hover/focus, disabled treatment matching `Button`'s 40%-opacity convention) — restructured from a single full-card `<Link>` because a `<button>` cannot legally nest inside an `<a>`.** The card's accessible name still comes from `aria-labelledby` pointing at three separate ids (name, description, price) rather than a single flattened `aria-label` string, unchanged by the restructuring — this remains the reusable pattern for any future list-of-cards-as-links component in this codebase.

### Product Card Skeleton
Mirrors the real card's shape exactly: an `aspect-square` block plus three text bars (title, description, price) at the same proportions as the loaded state, so the grid never reflows when data arrives. Uses `motion-safe:animate-pulse`, so `prefers-reduced-motion` users get a static placeholder instead of a pulsing one. No spinners exist in the system.

### Empty / Error States
Centered single-column stack, generous vertical padding (`py-24`), no icons. A Bodoni Moda headline carries the message; an optional Archivo line underneath adds detail at 70% opacity. `ErrorState` additionally renders a retry action styled as an underlined text link (bottom-border, not a filled button) that turns theme-owned accent color on hover/focus (magenta in light, cyan in dark), with a visible 2px focus ring in the same accent. As of slice 6, `CartPage` reuses `ErrorState` and `EmptyState` directly for its own error/empty conditions — no cart-specific variant was built.

### Access Denied State
`AccessDeniedState` (`src/components/states/AccessDeniedState.tsx`) is a fifth reusable state, alongside Empty/Error/Loading-via-skeletons, for the case of a customer hitting an admin-only route. Unlike the other states, it renders full page chrome — `SiteHeader` plus a `min-h-screen bg-bone dark:bg-ink` wrapper — because a route guard reaches it directly with no ancestor layout to supply that chrome. Content below the header follows the same centered-stack, no-icon language as Empty/Error (`h2` Bodoni Moda headline, Archivo support line at 70% opacity, generous `py-24`), demoted to `h2` specifically so `SiteHeader`'s wordmark remains the page's only `<h1>` (see the One Headline Rule). It closes with an underlined text link back to the catalog, styled identically to the retry link and the auth pages' secondary links (accent on hover/focus, 2px accent focus ring).

### Catalog Filters
`CatalogFilters` (rendered by `CatalogPage`, not by `PublicLayout`) is a two-row stack: a borderless search input on top, a horizontally-scrolling category rail below, separated by a `1.25rem` gap and closed off by the block's own hairline bottom rule.

- **Search input**: `type="search"`, no visible label (an `sr-only` label plus `role="search"` on the wrapper carry the accessible name), Archivo body type, bottom-border-only styling (no full box, no fill) — consistent with the system's "no boxes, just rules" language elsewhere. Its resting border is the one documented hairline exception above (`ink/50`/`bone/40`); on focus it swaps to the theme-owned accent (`field-magenta`/`field-cyan`), matching the Theme-Owned Accent Rule.
- **Category rail**: a `role="group"` row of pill-less text chips ("Todos" plus one per `PRODUCT_CATEGORIES` entry), Label typography, uppercase, tracked. The active chip is marked with `aria-pressed` and switches from `ink/60`/`bone/60` to full-opacity `ink`/`bone` text with a 2px bottom border in the theme-owned accent color — the same accent used for hover/focus elsewhere, now also carrying an active/selected state. Each non-"Todos" chip is preceded by a `size-1.5` color dot that cycles through the four closed field colors by category index (see the Cycled-Not-Identity Rule) — it is a scan-rhythm cue, not a per-category identity color, and two categories legitimately share a dot color.
- **Scrollbar theming**: the rail's overflow-x scrollbar is themed via a dedicated `.catalog-category-rail` rule in `src/index.css` (`scrollbar-width`/`scrollbar-color` plus `::-webkit-scrollbar*`) at `rgb(13 13 12 / 30%)` in light and `rgb(241 236 221 / 30%)` in dark — i.e., ink/bone at 30% opacity, no new hex introduced. This keeps the native scroll affordance visually theme-consistent instead of leaving it as unstyled browser chrome.

### Pagination Controls
`PaginationControls` (`src/features/products/components/PaginationControls.tsx`, slice 4, rendered by `CatalogPage` directly below `ProductGrid`) is a pure-reuse component: it introduces no new color, typography, spacing, or shape token. A `<nav aria-label="Paginacion del catalogo">`, closed off from the grid above it by the same hairline top rule used throughout the system (`border-t border-ink/15 dark:border-bone/15`, `mt-10 pt-6`), lays out "Anterior" and "Siguiente" — two stock `Button` primitives, unmodified — in a `flex justify-between` row flanking a `<p aria-live="polite">` page label ("Pagina {n}"). No bespoke pagination control, page-number list, or ellipsis affordance was built; first/last-page state rides entirely on `Button`'s own existing `disabled` treatment (40% opacity, `cursor-not-allowed`) — "Anterior" disables at page 1, "Siguiente" disables when the query reports no next page. The page label itself reuses the same `text-xs`/70%-opacity support-text pattern already established by `TextField`'s hint and the product card's description (`text-ink/70 dark:text-bone/70`) — it is Body-family support text at a smaller cut, not the uppercase/tracked Label token, matching what the build actually shipped rather than what a "kicker" reading of a small caption might assume. `CatalogPage` mounts it conditionally (`effectivePage > 1 || catalog.hasNextPage`) — hidden entirely when every result fits on page 1, rather than rendering a disabled no-op control.

### Product Detail Page (the Cartela)
The single-item view reached from a Product Card's link. Two-column grid: a full-bleed `displayColor` image panel on the left (see Layout), and the cartela on the right — a `bg-bone text-ink` panel that is fixed-tone regardless of theme (the Fixed Paper Rule). Because the cartela sits bone-on-bone against the light-theme page background (also bone), it carries a scoped hairline border on the two edges that abut page-bone only — `border-b` at all breakpoints and `md:border-r` on desktop — and no border on the edge shared with the image panel, where the field color already provides contrast without one.

Content top to bottom: the product name as an `h1` with `text-balance` (a craft-floor fix that prevents an orphaned last word — see the disclosed two-`h1` exception under Typography); the plain description; a rating summary as a `Link` to `/products/:id/reviews` ("4.5 · 12 reseñas") or "Todavia sin reseñas" when `ratingCount` is 0; one italic Archivo paragraph, `curatorialNote`, which deliberately merges what the surface brief described as two separate elements (a short who-it's-for line and a separate criterio paragraph) into a single field — a content-model simplification, not an oversight; the dotted-rule spec table (`<dl>`, see Shapes); and finally price (Display, `text-2xl`) alongside `AddToCartControl` (see below), which pairs the quantity stepper with the "Agregar al carrito" button. The button is stock-gated: disabled with "Sin stock" text in place of the stepper when `stock` is 0, and the stepper's max is capped at available stock otherwise. As of slice 6, the button is wired to the cart (`addItem`) — previously a disclosed future-slice gap, now closed. **Deliberately not built:** a stable piece-number/entry-date pair on the cartela (no such stable identifier exists outside the catalog grid's arbitrary position-based badge) and the reviews list itself (only a placeholder route exists at `/products/:id/reviews`, the list is a future slice).

### Product Detail Skeleton
Mirrors the detail page's two-column shape exactly: a solid block for the image panel and stacked bars (title, two description lines, three spec-table lines, price) for the cartela, all `motion-safe:animate-pulse`, all inside a fixed-tone `bg-bone` wrapper matching the loaded cartela's Fixed Paper treatment even before data arrives.

### Quantity Selector
A generic, reusable stepper (`src/components/ui/QuantitySelector.tsx`), not scoped to products. Two square `size-11` (44px) buttons flank a live-announced (`aria-live="polite"`) count; both buttons disable at their bound (quantity 1, or `maxQuantity`). **The border-current rule:** its step buttons use `border-current` rather than a hardcoded `border-ink dark:border-bone` pair. This was a real bug caught and fixed during the slice-3 build — a hardcoded `dark:border-bone` pair would render bone-on-bone and vanish inside the cartela in dark mode, because the cartela never theme-swaps (Fixed Paper Rule). Any component that may be placed inside a fixed-tone surface must use `currentColor` (or an explicit, non-conditional color) instead of a `dark:` variant tied to the page's own theme — the page's theme-swap cannot be assumed to reach every ancestor. **Confirmed reused in slice 5:** `Button` (below) independently follows the same `border-current`/`text-current` convention, for a related but distinct reason — not because it lives inside the cartela today, but so it stays safe to drop inside one later (checkout, admin forms) without a repeat of the QuantitySelector bug. **Confirmed reused in slice 6:** the component gained an optional `initialQuantity` prop (defaults to `1`, no visual change), its first consumer — `CartLineItem` seeds the stepper at the cart's stored quantity for that line instead of always starting at 1. `ProductDetailPage`'s existing usage via `AddToCartControl` is unaffected by the default.

### TextField
`TextField` (`src/components/ui/TextField.tsx`) is the labeled-input primitive behind every auth form. It's a `forwardRef` component (for `react-hook-form`'s `register()` to attach its ref directly) wrapping a Label-typography `<label>` and a bare bottom-border `<input>` — no fill, no box, the same "no boxes, just rules" language as the catalog search input, and it reuses that input's documented heavier resting border (`border-ink/50` / `dark:border-bone/40`) for the same WCAG 3:1 reason (see Shapes). On focus it swaps to the theme-owned accent, also matching the search input.

It takes an optional `hint` and an optional `error`, and the two share one `aria-describedby` slot rather than stacking: `hint` renders only when there's no `error`; when an `error` is present it takes over the slot and the hint disappears. This isn't an oversight — Zod's validation messages already restate the hint's content (e.g. the password-length rule), so showing both would double-announce the same information to screen reader users. `error` renders with `role="alert"` at 80%-opacity ink/bone text.

### Button
`Button` (`src/components/ui/Button.tsx`) is the primitive behind every form submit, the Google sign-in action, and — as of slice 4 — `PaginationControls`' "Anterior"/"Siguiente" controls. Unlike most of the system's ink/bone-hardcoded text, it's built on `border-current`/`text-current` so it inherits whatever text color its container establishes — the same reasoning as the Quantity Selector's border-current rule, applied proactively so `Button` stays safe to drop inside a future fixed-tone surface without repeating that bug. Its own border is a full `border border-current` (not the bare-bottom-border style of `TextField`/the search input), Label typography, uppercase, tracked. Hover/focus swap to the theme-owned accent (magenta light / cyan dark) on both border and text; disabled state drops to 40% opacity with `cursor-not-allowed` — this is the exact mechanism `PaginationControls` leans on for its first/last-page state, with no override or variant added.

### InlineError
`InlineError` (`src/components/ui/InlineError.tsx`) is a tiny `role="alert"` message primitive, extracted after four forms independently duplicated the same markup for root-level (non-field) errors. It renders nothing when its `message` prop is falsy — callers pass the error straight through without an `if` guard at the call site.

### Auth Forms
`LoginForm`, `RegisterForm`, and `ForgotPasswordForm` are all built from `TextField` + `Button` + `InlineError` on `react-hook-form` with `zodResolver`, and all three share `mode: 'onTouched'` (validate on first blur, revalidate on every change after) — this is the established form-validation-timing convention for the codebase going forward, not a per-form choice. Each form disables its whole `<fieldset>` (via `className="contents"`, so the fieldset doesn't introduce its own box) while submitting or redirecting, rather than disabling each field individually.

`RegisterForm` isolates its one live-computed value — whether the password is still too short to submit — into a small `RegisterSubmitButton` child component that subscribes with `useWatch({ control, name: 'password' })` rather than calling the form's whole-form-subscribing `watch()`. This keeps the re-render caused by every keystroke scoped to the submit button alone instead of the entire form; it's the pattern to reuse for any future form that needs a live-computed disabled/enabled state, given this project's stated performance-sensitivity brief.

### GoogleSignInButton
`GoogleSignInButton` (`src/features/auth/components/GoogleSignInButton.tsx`) wraps `signInWithGoogle` in its own local `isLoading`/`error` state (it isn't a `react-hook-form` form — there's no field to validate) and renders through the same `Button` + `InlineError` primitives as the email/password forms, so the two sign-in paths look identical at rest and in their error/loading states.

### AuthPageLayout
`AuthPageLayout` (`src/features/auth/components/AuthPageLayout.tsx`) is the shared centered-column wrapper for the login and register pages: a Display `h1` title, then a hairline-divided (`border-t border-ink/15 dark:border-bone/15`) content area, capped at `max-w-md`. It deliberately does **not** introduce a cartela-style fixed-tone panel — these screens sit directly on the page's own theme-swapping `bg-bone dark:bg-ink` ground. The Fixed Paper Rule is explicitly scoped to the product-detail cartela (a physical-paper editorial device); a login form has no equivalent editorial reason to stop theme-swapping, so it doesn't. It also runs `useRedirectWhenAuthenticated`, bouncing an already-authenticated visitor away from the form — a behavioral rule, not a visual one, noted here because it lives in the same component.

### Auth Navigation
Three small components carry the authenticated/anonymous state through the site's headers:
- **`AuthNav`** (`src/features/auth/components/AuthNav.tsx`) renders nothing while auth is still resolving, an "Iniciar sesión" link when anonymous, or "Mi cuenta" + `LogoutButton` when authenticated. It lives inside `SiteHeader`, now beside `CartIndicator` (slice 6). Its Label-typography link style (`AUTH_NAV_LINK_CLASSES`) is exported and reused verbatim by `CartIndicator` rather than restated.
- **`LogoutButton`** (`src/features/auth/components/LogoutButton.tsx`) is shared between `AuthNav` (public header) and `PrivateLayout`'s own header — both render it as a plain Label-typography text control (no border, no button chrome), matching the retry-link/category-chip visual language rather than looking like a boxed `Button`.
- **`SiteHeader`** (`src/components/layout/SiteHeader.tsx`) is the header markup extracted out of `PublicLayout` (wordmark `h1` + nav controls) so `AccessDeniedState` could reuse the identical chrome without duplicating it. `PublicLayout` now only renders `<SiteHeader /><Outlet /></SiteHeader>` (sic — wraps the outlet, doesn't nest inside the header).

**Note on the two headers:** `PrivateLayout` keeps its own near-identical header inline rather than using `SiteHeader`, and with one real, deliberate difference — its wordmark is a `<Link>`, not an `<h1>`, because inside the walled-off private area it's the only way back to the catalog and doesn't need to double as the page's heading. This is a confirmed, intentional divergence between the two headers, not drift to reconcile.

### Cart Line Item
`CartLineItem` (`src/features/cart/components/CartLineItem.tsx`) is one row of the cart's receipt-style list: a `w-1` flat color-field stripe (`FIELD_COLOR_CLASSES`, cycled from the closed four-field set via the product's own `displayColor` — the same source as the Product Card's field, not a new per-line assignment) sits beside the product name (a `Link` back to its detail page, Display type), its unit price (Body, "$X c/u"), the reusable `QuantitySelector` (seeded via its new `initialQuantity` prop — see Quantity Selector, above), a tabular-nums line total (Display, matching the Product Card's price/name pairing), and a text "Quitar" remove control styled identically to the retry link and `MergeExclusionsNotice`'s "Entendido" control (bottom-border text, no icon, no button chrome).

### Cart Skeleton
`CartSkeleton` mirrors three `CartLineItem`s' shape (stripe, two text bars, a quantity-sized block), all `motion-safe:animate-pulse`, inside the same `divide-y divide-dotted` list wrapper the loaded state uses — the same skeleton convention as `ProductCardSkeleton` and the Product Detail Skeleton. No spinners anywhere in the system.

### Merge Exclusions Notice
`MergeExclusionsNotice` (`src/features/cart/components/MergeExclusionsNotice.tsx`) is a dismissible `role="alert"` box (hairline border, no fill) listing products dropped during the guest-cart/Firestore-cart login merge (F5.7), each with a plain-language reason ("ya no esta disponible" / "se quedo sin stock"). Its "Entendido" dismiss control reuses the same bottom-border text-link style as the retry link and `CartLineItem`'s "Quitar" — no icon, matching the system's no-icon convention. Renders nothing when there's nothing to report.

### Cart Indicator
`CartIndicator` (`src/features/cart/components/CartIndicator.tsx`) lives in `SiteHeader` beside `AuthNav`, reusing `AUTH_NAV_LINK_CLASSES` verbatim (the same Label-typography link style `AuthNav` already uses) so the two header controls read as one family. It renders "Carrito" or "Carrito (N)" as a single interpolated string inside one `<span>` — **not** a label text node followed by a separately-rendered count span. That split shape was tried first and produced a real accessible-name bug: the browser's accessible-name computation collapsed "Carrito" and " (5)" into "Carrito(5)" with no space when the label and the count lived in separate text nodes. Any future label-plus-count control in this codebase should render the whole string as one interpolated node, as `CartIndicator` now does.

### Add To Cart Control
`AddToCartControl` (`src/features/products/components/AddToCartControl.tsx`) pairs the `QuantitySelector` with the product-detail page's "Agregar al carrito" button so the button reads the actually-selected quantity — the same small-component, state-plus-action-scoping pattern already used by `RegisterSubmitButton` in the auth slice, applied here to keep the quantity re-render local to this control instead of the whole detail page.

### Cart Page
`CartPage` (`src/features/cart/pages/CartPage.tsx`, slice 6, route `/cart`, reached through the existing `PublicLayout`, unmodified) is a single centered column (see Layout) holding a `<h2>` "Carrito" title — demoted from an originally-shipped `<h1>` during finish review, per the One Headline Rule — over a hairline-divided content area. Content follows the cart's resolved status: `CartSkeleton` while loading, `ErrorState` on failure, `EmptyState` plus a "Ver catalogo" link when the cart has no lines, or the `divide-y divide-dotted` list of `CartLineItem`s (see Shapes) closed by a running total in a `flex justify-between` row with its own hairline top rule — the same closing-bracket device `PaginationControls` uses to close the catalog grid. `MergeExclusionsNotice` renders above the list when the guest-cart merge dropped anything. No cartela-style fixed-tone panel was introduced (see the Fixed Paper Rule); the page sits on the page's own theme-swapping ground, like the auth pages.

## Do's and Don'ts

### Do:
- **Do** assign exactly one of the four closed field colors, full-strength and full-bleed, per product tile — and, on the product detail page, to the image panel itself, and, on the cart page, to each `CartLineItem`'s color stripe.
- **Do** keep Bodoni Moda to one headline-weight string per component (name, price, or state message) — never stack two didone lines competing for attention.
- **Do** build any new skeleton to the exact shape of its loaded content, and gate its animation behind `motion-safe:`.
- **Do** source interactive accent color from the active theme (magenta light / cyan dark), not a hardcoded hex — except inside the cartela's own fixed-tone surface, where hardcoded `ink`/accent colors are correct because that surface never swaps.
- **Do** keep corners square and surfaces shadow-free; depth comes from the field color, never from elevation.
- **Do** cycle small color swatches (category-rail dots, product `displayColor`, the cart line-item stripe) through the closed four-field set by index, and let the adjacent text label do the disambiguation — repeated colors across items are expected, not a bug to fix with a fifth color.
- **Do** keep a filter/text control that needs to clear the WCAG 3:1 non-text UI-boundary floor on a heavier border than the system's default hairline, scoped to that control's bare-bottom-border style (`ink/50`/`bone/40`) — a fully-bordered control like `Button` can clear the same floor with its own full-opacity `border-current` instead.
- **Do** use `border-current`/`currentColor` (not a `dark:` variant) in any reusable component that might be dropped inside a fixed-tone surface like the cartela — see the Quantity Selector's and `Button`'s border-current rule.
- **Do** use `aria-labelledby` referencing separate name/description/price node ids for card-as-link components, following the Product Card's pattern, rather than a single flattened `aria-label`.
- **Do** validate forms with `react-hook-form`'s `mode: 'onTouched'` and isolate any live-computed, per-keystroke UI state (e.g. a disabled submit button) into a small child component subscribed with `useWatch`, not the form's whole-subscribing `watch()`.
- **Do** share one `aria-describedby` slot between a field's hint and its error (hint hidden once an error is present) rather than stacking both, when the error message already restates the hint's content.
- **Do** reuse the stock `Button` primitive and its existing `disabled` treatment for prior/next-style controls (see `PaginationControls`) instead of building a bespoke state for "can't go further" — 40% opacity plus `cursor-not-allowed` already says it.
- **Do** reuse the dotted-rule divider (`divide-dotted`) for itemized receipt-style lists (see `CartPage`'s line-item list), alongside its original `<dl>` spec-table use — it is now a confirmed two-context pattern, not a one-off.
- **Do** render a label-plus-count control (see `CartIndicator`) as a single interpolated string inside one text node, not a label text node followed by a separately-rendered count span — splitting them collapses the space in the browser's accessible-name computation.

### Don't:
- **Don't** add border-radius, drop shadows, gradients, or glassmorphism — none exist in the shipped system and none are implied by the direction contract.
- **Don't** introduce a tint, opacity variant, or fifth color into the closed four-field set — including as a "fix" for a category or product that happens to share a cycled swatch color with another.
- **Don't** assume a full-width split-hero/landing composition exists just because the cartela shipped — the cartela is a standalone product detail page; the hero/landing composition itself remains unbuilt (slice 14).
- **Don't** treat the current light theme (a literal ink/bone swap) as the finished "separately designed" light mode the direction contract calls for — it is recorded here as shipped behavior, not as an approved target for future light-theme work.
- **Don't** generalize the search input's/`TextField`'s heavier border (`ink/50`/`bone/40`) into the system's default border weight — it's a one-off floor for bare-bottom-border interactive controls' resting-state contrast, not a replacement for the hairline (`ink/15`/`bone/15`) convention used everywhere else.
- **Don't** fold catalog-specific filtering controls into `PublicLayout`'s shared header — it also wraps routes (product detail, auth pages, cart, the future landing page) that don't need them; keep filter UI on the routes that use it.
- **Don't** generalize the Fixed Paper Rule into a second fixed-tone surface elsewhere without the same editorial reason (a physical paper object in the scene) — it is a named exception for the cartela; the slice-5 auth pages and the slice-6 cart page confirm this by deliberately staying on the page's own theme-swapping ground instead.
- **Don't** wire a hardcoded `dark:` color pair onto a component that could end up inside a fixed-tone surface; use `currentColor`/`border-current` or an explicit non-conditional value instead.
- **Don't** treat the product detail page's two `<h1>` elements (header wordmark + cartela name) as a pattern to reproduce deliberately elsewhere — it's a disclosed, single-item-page trade-off, not a system-wide heading convention. `AccessDeniedState` and `CartPage` both demote their own headings to `h2` for exactly this reason.
- **Don't** read `PaginationControls`' small `text-xs` page-label caption as a precedent for a new uppercase/tracked "kicker" or eyebrow treatment — it is plain Body-family support text at a smaller size (matching `TextField`'s hint), not the Label token, and no kicker/eyebrow component exists anywhere in this system.
- **Don't** nest a `<button>` inside an `<a>` (or vice versa) — invalid HTML. When a card or list item needs both a navigation link and an independent action (see the Product Card's slice-6 quick-add button), wrap both in a container element and keep the interactive controls as siblings, not nested.
