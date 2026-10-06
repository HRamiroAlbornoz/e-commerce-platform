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

CLACK's catalog is a flat grid of specimens: every product sits inside its own full-bleed field of color, badged with a piece number, and described underneath in two weights of type — a didone name and price, and a grotesque description. The closed four-color field, the numbering, and the didone/grotesque split are the core of the system. Every other surface (product detail, account, cart, checkout, orders, reviews, administration) reuses the same vocabulary: hairline rules, square corners, no elevation, and one headline per component.

Depth is never simulated. There are no shadows, gradients, or border-radius anywhere in the system. The dark theme (ink ground, bone text) is primary; the light theme is a literal swap of the same two neutrals, not a separately designed surface. Two surfaces are fixed-tone exceptions: the product cartela and the featured-product hero keep bone/ink regardless of theme, because they present a product as a physical paper specimen label (see The Fixed Paper Rule).

Administration is the one place the density changes. The admin screens are built in Operate mode: the table is the screen, the per-product color field shrinks to a thumbnail, and grotesque carries everything except the screen title. They use the same palette and type, with no new tokens.

**Key Characteristics:**
- Closed four-color field system (lime, magenta, cyan, amber) — flat, full-strength, no tints or intermediate variants.
- Didone (Bodoni Moda) carries the single most important line on a view; grotesque (Archivo) carries everything else.
- Zero elevation: no shadows, no gradients, no border-radius anywhere in the system.
- Skeletons mirror the exact shape of loaded content; no spinners.
- Interactive accent color is theme-owned: magenta in light mode, cyan in dark mode, never a fixed hover color — except the fixed-tone surfaces (the cartela, and the catalog's featured-product hero), which never theme-swap at all.

## Colors

Four named, flat, equal-weight fields carry product identity; two neutrals (ink and bone) carry everything else. There is no single "brand primary" hue: the four fields function as a closed set, each one interchangeable in role.

### Primary
- **Field Lime** (`#cfef00`): full-bleed background of a product's image tile. One product, one field, no blending with the other three.
- **Field Magenta** (`#ff3fa6`): same role as Field Lime; also the light-theme interactive accent (link hover/focus, active category chip, button and link hover/focus states, the checkout step indicator's active underline).
- **Field Cyan** (`#00d9e0`): same role as Field Lime; also the dark-theme interactive accent, with the same states as Field Magenta.
- **Field Amber** (`#ffb100`): same role as Field Lime.

### Neutral
- **Ink** (`#0d0d0c`): dark-theme background; light-theme text. Also the fixed text color of the cartela panel and of the featured-product hero's text panel, in both themes.
- **Bone** (`#f1ecdd`): light-theme background; dark-theme text. Warm off-white, not pure white. Also the fixed background of the cartela panel and of the featured-product hero's text panel, in both themes.

### Named Rules
**The Closed Four Rule.** Only these four hexes exist as field colors anywhere in the system (enforced at the data layer by `PRODUCT_DISPLAY_COLORS` in `shared/schemas/product.ts`). No tints, no opacity variants, no fifth color. A new field color is a palette decision, not a per-screen choice.

**The Theme-Owned Accent Rule.** The interactive accent is never a fixed hardcoded hue: it is magenta in light mode and cyan in dark mode. It covers every hover, focus, and active state of text links, retry links, the active category chip, `Button` and `TextField` focus and hover, `AuthNav` links, the Product Card's quick-add button, `CartLineItem`'s "Quitar" control, `MergeExclusionsNotice`'s "Entendido" control, the checkout step indicator's completed-step buttons and active underline, and every checkout summary card's "Editar" control. Amber and lime are identity fields only and never carry interaction state.

**The Cycled-Not-Identity Rule.** The four field colors are a rhythm device, not a unique key per item. `displayColor` cycles across product tiles, and it also fills the image panel on the product detail page, the featured-product hero, and the `w-1` stripe on each `CartLineItem`. `CatalogFilters`' category dot cycles the same way across six categories, so two pairs necessarily repeat (Teclados/Sillas both lime, Mouse/Mousepads both magenta). This is intentional: the dot is a scan cue, and the uppercase label is the actual disambiguator. Do not fix a repeated swatch by adding a fifth hue.

**The Fixed Paper Rule.** The product cartela (`bg-bone text-ink`) and the featured-product hero's text panel are bone-on-ink **unconditionally**: they do not theme-swap. Each is a physical paper specimen label sitting in the scene regardless of the room's lighting. Any component placed inside one of these surfaces must not assume the page's theme-swap reaches it (see The Border-Current Rule). The rule covers specimen-shaped content only. Forms, receipts, and lists stay on the page's own theme-swapping ground: the auth pages, the cart, and the checkout all deliberately do so, even where they pin chrome to the viewport edge.

**The Border-Current Rule.** Reusable components that may sit inside a fixed-tone surface use `currentColor` or `border-current` for their color, never a `dark:` variant tied to the page's theme. A hardcoded `dark:border-bone` pair would render bone-on-bone and vanish inside the cartela in dark mode, because the cartela never swaps. `QuantitySelector` and `Button` follow this rule. Any chart, SVG, or third-party component follows it too, using `currentColor` for every color prop it exposes.

## Typography

**Display Font:** Bodoni Moda (with ui-serif, serif fallback)
**Body Font:** Archivo (with ui-sans-serif, sans-serif fallback)

**Character:** A didone/grotesque pairing borrowed from print editorial. Bodoni Moda's high-contrast strokes read as the headline of the moment, while Archivo's even, data-journalism grotesque carries labels, descriptions, and supporting copy.

### Hierarchy
- **Display** (400, 1.125rem–2rem, 1.2 line-height): the single headline-weight line of a component — product name, price, a state's message title, a page title on auth screens (3xl `h1`), a cart or checkout `h2` title, a checkout step's legend or summary title, and a card's own name and price. On the product detail page and the featured-product hero, the name is 3xl and the price is `text-2xl`. On admin screens Display carries only the `h1` screen title; Archivo carries every cell and control of the table.
- **Body** (400, 0.875rem, 1.4 line-height): product descriptions (clamped to one line in the grid, full length on the detail page), the curatorial note (italic), the dotted spec table, state support text, the search input's value and placeholder, and every `TextField` value, hint, and error. A `text-xs` cut of the same 70%-opacity support text carries pagination captions, unit prices, and disclosures. Confirmed values in checkout summaries use the same Body family at 80% opacity, one step darker, because the user already entered them.
- **Label** (500, 0.75rem, 1.2 line-height, 0.1em tracking, uppercase): piece-number badges (`No. 01`), retry links, category chips, `TextField` labels, `Button` text, auth and cart links, the checkout step names, the "Editar" and "Quitar" controls, table column headers and inline field labels (`TABLE_LABEL_CLASSES`), the admin order filter chips, and the admin transition controls (`TEXT_ACTION_BUTTON_CLASSES`). It is also the label of the analytics summary totals and the chart heading. Always uppercase, always tracked wide.

### Named Rules
**The One Headline Rule.** Bodoni Moda appears at most once per component as the highest-weight line: a product name, a price, or a state's message title, never two competing strings on one card or screen. The rule is scoped per component, not per page: a checkout page or the catalog-with-hero page can carry several Display lines, each owned by its own component. Pages keep a single `h1`, which is the `SiteHeader` wordmark on public and private pages. Titles of sub-screens are `h2`.

**Disclosed exception.** The product detail page has two `h1` elements: the header wordmark and the cartela's product name. A single-item detail page earns its own page heading. This is an accepted trade-off, and the wordmark is a candidate for demotion the next time `PublicLayout` changes.

## Layout

Mobile-first, with exactly two upward breakpoints: `md` (768px) and `lg` (1024px). `sm`, `xl`, and `2xl` are not used anywhere. Every responsive rule is written at base, `md:`, or `lg:`.

The product grid is `grid-cols-1` at base, `md:grid-cols-2`, and `lg:grid-cols-4`, with a `1.5rem` horizontal gap and a `2.5rem` vertical gap. The vertical gap is wider so rows read as distinct specimens rather than a continuous mat. Cards are `aspect-square` image tiles with `2rem` of inset padding, followed by a `1rem`-gap text stack. State screens (empty, error) center their content with `6rem` of vertical padding, deliberately more generous than the card rhythm.

The catalog's filter block stacks search above the category rail with a `1.25rem` gap, and sits `2.5rem` clear of the grid (`mb-10`). The rail scrolls horizontally on overflow rather than wrapping, so it stays a single scan line. When results span more than one page, `PaginationControls` closes the grid with a `mt-10 pt-6` hairline top rule and "Anterior" and "Siguiente" buttons flanking the page label. It renders only when there is more than one page. The filters, grid, and pagination sit inside `<div id="catalogo">` below the featured-product hero. That wrapper exists only as the anchor target for the hero's link, and it changes no spacing.

The product detail page is a two-column grid (`grid-cols-1 md:grid-cols-2`). The image panel is `min-h-96` on mobile and `md:min-h-144` on desktop, with the field color filling it edge to edge and the product photo inset with `p-12`. The cartela stacks its content with a `gap-4` flex column and pushes price and cart controls to the bottom with `mt-auto`.

The auth pages (`AuthPageLayout`) are a single centered column, `max-w-md`, `px-4`, with `py-16` on mobile and `md:py-24`. The cart and checkout use `max-w-2xl` with `px-4 md:px-8` and `py-10 md:py-16`. Their wider column fits a receipt list, but they stay in the same single-column family. Titles and content areas share the hairline divider (`border-t border-ink/15 dark:border-bone/15`, `pt-8`).

The checkout adds a two-region layout below the cart block once the cart has at least one line: a step-indicator column and a step-sections column, `flex-col` on mobile and `md:flex-row md:gap-12` on desktop. The two regions are divided from the cart block by a `md:border-t md:border-ink/15 md:pt-8` hairline, which applies only from `md:` up. Each step section carries `pb-10` and, via `not-first:pt-10`, takes top padding only when it is not the first visible section.

The three admin screens share one shell: `mx-auto max-w-6xl px-4 py-10 md:px-8 lg:px-12`, wider than any public or private surface because an operational screen needs more horizontal room. A `flex items-center justify-between` header row holds the `h1` screen title and, on the products screen only, the "Nuevo producto" link. A filter row, when rendered, sits below it with its own `border-b` hairline. The table, or on the analytics screen the summary totals and chart, follows.

### Named Rules
**The Pinned Chrome Rule.** At the base/mobile breakpoint only, two pieces of checkout chrome pin to the viewport instead of scrolling. `CheckoutStepIndicator` becomes `sticky top-0 z-10`, bleeding to the viewport edge (`-mx-4`) with an opaque `bg-bone dark:bg-ink` and a `border-b` hairline. The running total inside `CartLinesSummary` (with `totalVariant="sticky-bottom"`) becomes `fixed inset-x-0 bottom-0 z-10` with the same opaque background and a `border-t` hairline on the opposite edge. Both reset to normal in-flow layout at `md:` and up (`md:static`). The pinning mechanism is always an opaque background plus a hairline border, never a shadow.

## Elevation & Depth

Flat. No shadow, gradient, or blur exists anywhere in the system. Depth is conveyed entirely by color-field contrast against the ink and bone ground: a bright flat field on a near-black or bone page reads as raised without any shadow. Pinned chrome is the one place `position` changes to keep an element in view, and it still separates itself with an opaque background and a hairline border, not a shadow.

### Named Rules
**The Flat Ground Rule.** Surfaces never lift with a shadow. If a component needs to stand out, it gets a field color, not an elevation. This holds even for `position: sticky` and `fixed` chrome: pinning changes an element's position in the viewport, never its elevation.

## Shapes

Zero border-radius anywhere: cards, image tiles, skeletons, the retry link, the filter controls, the cartela panel, the quantity stepper, `TextField`, `Button`, the cart's line items, and the remove and dismiss controls all have square corners. The system is stricter than "no large rounded corners": it has no rounded corners at all.

Borders are hairline and low-opacity by default: `border-ink/15` in light, `border-bone/15` in dark. They appear on the header's bottom rule, the filter block's bottom rule, the cartela panel (two edges only), the title dividers of the auth, cart, and checkout pages, the pagination top rule, the checkout's pinned chrome edges, the `md:` divider between the cart block and the steps, and the analytics totals' top rule and vertical divider.

### Named Rules
**The Hairline-With-One-Exception Rule.** Bare-bottom-border interactive controls (the catalog search input, `TextField`, and the admin inline number editor) use a heavier resting border, `border-ink/50` in light and `border-bone/40` in dark. The heavier value is what clears the WCAG 3:1 non-text contrast floor for an interactive control's boundary, which a hairline cannot reliably meet. This is a targeted exception for that control class. Do not carry `ink/50` or `bone/40` into non-interactive hairlines. `Button` does not use it: it has a full border, `border border-current`, at full opacity, which clears the same floor by itself.

**The Dotted-List Rule.** The dotted divider, `divide-y divide-dotted divide-ink/30 dark:divide-bone/30`, is reserved for discrete, itemized or sequential vertical content. It has five confirmed uses: the cartela's spec table, the cart's line items, the checkout's step sections, the order list and order items, and the review list. Analytics totals and the featured hero are not lists, so they use the hairline treatment instead. It is not a general alternative to the hairline for arbitrary content.

## Components

For each component: a short character line, then shape, color, states, and any distinctive behavior.

### Product Card
The core specimen unit. A flat color-field square holds the product photo (inset, `object-contain`) with a small uppercase piece-number badge (`No. 01`, `No. 02`) pinned to the top-left corner at 70% ink over the field. Below the field: the product name in Bodoni Moda and a one-line-clamped Archivo description at 70% opacity. The card is a `<div>` wrapping a `<Link>` (image, name, description) plus a sibling row with the price (Bodoni Moda, `mt-auto` so prices align across a row) and a quick-add button ("Agregar", or "Sin stock" when out of stock). The button uses the theme-owned accent on hover and focus, with the disabled treatment of `Button`. The structure is a `<div>` and not a single full-card `<Link>` because a `<button>` cannot nest inside an `<a>`. The card's accessible name comes from `aria-labelledby` pointing at three separate ids (name, description, price), not one flattened `aria-label`. That is the reusable pattern for any list of cards-as-links. The grid can show one fewer card than the active catalog on the unfiltered first page, because `CatalogPage` excludes the featured product. The card itself does not know about this.

### Product Card Skeleton
Mirrors the real card's shape exactly: an `aspect-square` block plus three text bars (title, description, price) at the same proportions, so the grid never reflows. Uses `motion-safe:animate-pulse`, so `prefers-reduced-motion` users get a static placeholder.

### Empty / Error States
A centered single-column stack, generous vertical padding (`py-24`), no icons. A Bodoni Moda headline carries the message. An optional Archivo line underneath adds detail at 70% opacity. `ErrorState` adds a retry action styled as an underlined text link (bottom border, not a filled button), with the theme-owned accent on hover and focus and a visible 2px focus ring in the same accent. The cart, checkout, and admin screens reuse `EmptyState` and `ErrorState` directly. Empty and filtered-empty use different copy: "nothing here yet" versus "nothing matches this filter". The analytics page gates its whole content on one `EmptyState`. Its ranking section has its own `ErrorState`, scoped to itself, because the totals and the chart are independent fetches. The featured-product hero shows an `ErrorState` for its own failed fetch, scoped to the hero, and never blocks the grid below it.

### Access Denied State
`AccessDeniedState` (`src/components/states/AccessDeniedState.tsx`) is the state for a customer reaching an admin-only route. It renders full page chrome (`SiteHeader` plus a `min-h-screen bg-bone dark:bg-ink` wrapper), because a route guard reaches it with no layout above it. The content follows the Empty/Error language, with its headline demoted to `h2` so `SiteHeader`'s wordmark stays the only `h1`. It closes with an underlined link back to the catalog, styled like the retry link.

### Catalog Filters
`CatalogFilters` (rendered by `CatalogPage`, not by `PublicLayout`) is a two-row stack: a borderless search input on top, and a horizontally scrolling category rail below, separated by `1.25rem` and closed by the block's own hairline bottom rule.
- **Search input**: `type="search"`, no visible label (an `sr-only` label plus `role="search"` on the wrapper carry the accessible name), Archivo body type, bottom border only. Its resting border is the documented heavier exception. On focus it takes the theme-owned accent.
- **Category rail**: a `role="group"` row of text chips ("Todos" plus one per `PRODUCT_CATEGORIES` entry), Label typography, uppercase, tracked. The active chip is marked with `aria-pressed`, moves to full-opacity ink or bone text, and gets a 2px bottom border in the theme-owned accent. Each non-"Todos" chip has a `size-1.5` color dot that cycles through the four field colors by category index (see The Cycled-Not-Identity Rule).
- **Scrollbar**: themed through a `.catalog-category-rail` rule in `src/index.css`, at ink or bone at 30% opacity, so the native scrollbar stays consistent with the theme.
- **Shared chip class**: the chip class string is exported as `FILTER_CHIP_CLASSES` (`src/features/products/constants/filterStyles.ts`) and reused by `AdminProductFilters` and `AdminOrderFilters`. The admin search input keeps its narrower `max-w-sm`, as a deliberate difference for a denser surface.

### Pagination Controls
`PaginationControls` (`src/features/products/components/PaginationControls.tsx`) is a pure-reuse component with no tokens of its own. A `<nav aria-label="Paginación del catálogo">` closes the grid with the hairline top rule (`border-t border-ink/15 dark:border-bone/15`, `mt-10 pt-6`). "Anterior" and "Siguiente" are stock `Button` primitives in a `flex justify-between` row, flanking a `<p aria-live="polite">` page label ("Página {n}"). The label is Body support text at `text-xs`, not the uppercase Label token. First and last page use `Button`'s own disabled treatment. The control is not rendered on a single page, and it is also omitted when the featured-product exclusion would leave the grid empty.

### Featured Product Hero
`FeaturedProductHero` (`src/features/products/components/FeaturedProductHero.tsx`) is the home page's hero. It lives inside `CatalogPage` above the `id="catalogo"` block, not on a separate landing route, so the home page is hero-plus-catalog on one continuously scrolling page. It is a two-column grid at `md:` and a single column below. A `Link` to the product's detail page wraps the field-colored image on the left. On the right, a `bg-bone text-ink` text panel, unconditionally, with no `dark:` variant (see The Fixed Paper Rule). The panel holds the product name (`h2`, Display, 3xl, `text-balance`), its `curatorialNote` in italic Body (reused from the product record, so the hero never invents copy), the price, `AddToCartControl` (reused unmodified), and a plain anchor, `href="#catalogo"` ("Ver el resto de la sala"). The anchor is styled exactly like the product detail page's reviews link (`underline decoration-1 underline-offset-2`, with the theme-owned focus ring). There is no `scroll-behavior: smooth` in the codebase, so the jump is instant.

The hero's `<img>` is the only image in the codebase with `loading="eager"` and `fetchPriority="high"`. It is the page's likely LCP element. Every other product image is lazy.

The hero's mobile image height is **capped**, `h-64 md:h-auto md:min-h-144`, while the cartela uses a floor, `min-h-96 md:min-h-144`. This divergence is intentional and measured. At 320×800 the uncapped floor pushed "Agregar al carrito" below the fold. With the cap, the CTA sits at 700px top, fully visible. The cartela can grow its image because it owns the whole first viewport. The hero shares its viewport with a CTA that has its own visibility requirement. Keep the cap. Do not reconcile it with the cartela's floor.

The hero shows name, curatorial note, price, and add-to-cart only. It has no spec table, unlike the cartela. The spec table is one click away on the detail page.

The featured product is excluded from the grid only on the default view: no category, no search term, page 1. Under an active filter or search it can reappear, because that is correct search behavior. If the exclusion would empty a non-empty catalog, the grid and the pagination are omitted, not replaced by the "Todavía no hay productos" empty state, which is reserved for a genuinely empty catalog. `useFeaturedProduct` and `useActiveProducts` are two independent fetches, so a slow or failed read in one never blocks the other.

### Featured Product Hero Skeleton
`FeaturedProductHeroSkeleton` mirrors the hero's two-column shape and shares its layout through the exported `FEATURED_PRODUCT_HERO_LAYOUT_CLASSES`. It includes the same `h-64 md:h-auto md:min-h-144` image cap, so loading does not reflow into a taller placeholder. Everything pulses with `motion-safe:animate-pulse`.

### Product Detail Page (the Cartela)
The single-item view reached from a Product Card. Two-column grid: a full-bleed `displayColor` image panel on the left, and the cartela on the right, a `bg-bone text-ink` panel that stays fixed-tone regardless of theme. Because the cartela sits bone-on-bone against the light page background, it carries a hairline on the two edges that abut page bone only: `border-b` at all breakpoints and `md:border-r` on desktop. The edge shared with the image panel has no border, because the field color already gives contrast.

From top to bottom: the product name as `h1` with `text-balance` (see the disclosed two-`h1` exception under Typography); the description; a rating summary linking to `/products/:id/reviews` ("4.5 · 12 reseñas", or "Todavía sin reseñas" when `ratingCount` is 0); one italic paragraph with `curatorialNote`, which holds both the audience line and the criterion in one field; the dotted spec table (`<dl>`); and finally the price (Display, `text-2xl`) with `AddToCartControl`. The button is disabled with "Sin stock" in place of the stepper when stock is 0. Otherwise the stepper caps at available stock. The button calls `addItem`. Deliberately not shown: a piece number or entry date, because no stable identifier exists outside the grid's position-based badge. The image frame's height classes are exported as `PRODUCT_IMAGE_FRAME_HEIGHT_CLASSES` (`src/features/products/constants/productImageFrame.ts`) and shared only with `ProductDetailSkeleton`.

### Product Detail Skeleton
Mirrors the detail page's two-column shape: a solid block for the image panel and stacked bars for the cartela (title, two description lines, three spec lines, price). It is all `motion-safe:animate-pulse`, inside a fixed-tone `bg-bone` wrapper that matches the loaded cartela even before data arrives. The image block reuses `PRODUCT_IMAGE_FRAME_HEIGHT_CLASSES`.

### Quantity Selector
A generic, reusable stepper (`src/components/ui/QuantitySelector.tsx`), not scoped to products. Two square `size-11` (44px) buttons flank a live-announced count (`aria-live="polite"`). Both buttons disable at their bounds, quantity 1 or `maxQuantity`. The step buttons use `border-current` (see The Border-Current Rule). The component accepts an optional `initialQuantity` (default 1). `CartLineItem` uses it to seed the stepper at the stored line quantity. It sits unmodified inside the cartela and inside the featured hero through `AddToCartControl`.

### TextField
`TextField` (`src/components/ui/TextField.tsx`) is the labeled-input primitive behind the auth forms, `ShippingForm`, and `PaymentForm`. It is a `forwardRef` component, so `react-hook-form`'s `register()` can attach its ref. It wraps a Label-typography `<label>` and a bare bottom-border `<input>`: no fill, no box, with the documented heavier resting border and the theme-owned accent on focus.

It takes an optional `hint` and an optional `error`, which share one `aria-describedby` slot. The hint renders only when there is no error. When an error is present, it takes over the slot. The error messages already restate the hint, so showing both would double-announce for screen reader users. The error renders with `role="alert"` at 80% ink or bone.

### Button
`Button` (`src/components/ui/Button.tsx`) is the primitive behind every form submit, the Google sign-in action, the pagination controls, and the checkout's "Continuar a pago", "Revisar compra", and "Confirmar compra". It is built on `border-current` and `text-current`, so it inherits its container's text color. It stays safe inside a fixed-tone surface (see The Border-Current Rule). Its own border is a full `border border-current` at full opacity, not the bare-bottom-border style. It uses Label typography, uppercase, and tracked. Hover and focus swap the border and the text to the theme-owned accent. Disabled drops to 40% opacity with `cursor-not-allowed`, which is how `PaginationControls` shows its first and last page.

`Button` exports its class string as `BUTTON_CLASSES`. Components that navigate, not submit, such as the cart's "Ir a pagar" link and the admin's "Nuevo producto" link, apply the identical look by importing that constant. The checkout's "Confirmar compra" uses the same `Button` with `isLoading` while the order is created, so the user sees the request in progress.

### InlineError
`InlineError` (`src/components/ui/InlineError.tsx`) is a small `role="alert"` message primitive for root-level errors. It renders nothing when `message` is falsy, so callers pass the error straight through without an `if` guard. It is used for the payment step's validation error, for failed admin status transitions (beneath the row's action buttons), and by every form for non-field errors.

### Auth Forms
`LoginForm`, `RegisterForm`, and `ForgotPasswordForm` are built from `TextField`, `Button`, and `InlineError` on `react-hook-form` with `zodResolver`. They all use `mode: 'onTouched'`, the form-validation timing for the whole codebase. `ShippingForm` and `PaymentForm` follow the same convention. Each form disables its whole `<fieldset>` (with `className="contents"`, so the fieldset adds no box) while it submits or redirects, rather than disabling each field.

`RegisterForm` isolates its live-computed "password is too short" state into a `RegisterSubmitButton` child that subscribes with `useWatch({ control, name: 'password' })`. The re-render from every keystroke stays with the button, not the whole form. Reuse this for any future form with a live-computed disabled state.

### GoogleSignInButton
`GoogleSignInButton` (`src/features/auth/components/GoogleSignInButton.tsx`) wraps `signInWithGoogle` in its own `isLoading` and `error` state. It is not a `react-hook-form` form, because there is no field to validate. It renders through the same `Button` and `InlineError` as the email forms, so both sign-in paths look identical in every state.

### AuthPageLayout
`AuthPageLayout` (`src/features/auth/components/AuthPageLayout.tsx`) is the centered-column wrapper for the login and register pages. It has a Display `h1` title, then a hairline-divided content area, capped at `max-w-md`. It sits directly on the page's theme-swapping `bg-bone dark:bg-ink`, not on a fixed-tone panel, because a login form has no editorial reason for the Fixed Paper Rule. It also runs `useRedirectWhenAuthenticated`, which bounces an already-signed-in visitor away from the form. That is behavior, noted here because it lives in the same component.

### Auth Navigation
Three small components carry the auth state through the headers:
- **`AuthNav`** (`src/features/auth/components/AuthNav.tsx`) renders nothing while auth resolves, an "Iniciar sesión" link when anonymous, or "Mi cuenta" plus `LogoutButton` when signed in. Its Label link style, `AUTH_NAV_LINK_CLASSES`, is exported and reused verbatim by `CartIndicator`.
- **`LogoutButton`** (`src/features/auth/components/LogoutButton.tsx`) is shared by `AuthNav`, `PrivateLayout`'s header, and `AdminLayout`'s header. It is a plain Label text control with no border, matching the retry link rather than a boxed `Button`.
- **`SiteHeader`** (`src/components/layout/SiteHeader.tsx`) holds the public header: the wordmark `h1` and the nav controls. `AccessDeniedState` reuses it. `PublicLayout` wraps its outlet in it.

`PrivateLayout` and `AdminLayout` keep their own near-identical headers, with one deliberate difference: their wordmark is a `<Link>`, not an `<h1>`. Inside the walled-off private and admin areas, the wordmark is the way back to the catalog, not the page's heading. This divergence is intentional.

### Cart Lines Summary
`CartLinesSummary` (`src/features/cart/components/CartLinesSummary.tsx`) holds the loading, error, empty, and success states for a resolved cart, and is shared by `CartPage` and `CheckoutPage`. It shows `CartSkeleton` while loading, `ErrorState` on failure, and `EmptyState` with a "Ver catalogo" link when there are no lines. Otherwise it shows the `divide-y divide-dotted` list of `CartLineItem`s, closed by the running total. `totalVariant` is `'static'` (the default, a `border-t` hairline) or `'sticky-bottom'` (checkout, see The Pinned Chrome Rule). `children` renders above the list, and `nonEmptyFooter` renders only when the cart has lines.

### Cart Line Item
`CartLineItem` (`src/features/cart/components/CartLineItem.tsx`) is one row of the cart's receipt-style list. A `w-1` color stripe (`FIELD_COLOR_CLASSES`, from the product's `displayColor`) sits beside the product name (a Display-type `Link` to its detail page), the unit price ("$X c/u", Body), the `QuantitySelector` seeded with the line quantity, a tabular-nums line total (Display), and a text "Quitar" control styled like the retry link.

### Cart Skeleton
`CartSkeleton` mirrors three `CartLineItem`s (stripe, two text bars, a quantity block), pulsing inside the same `divide-y divide-dotted` wrapper as the loaded list.

### Merge Exclusions Notice
`MergeExclusionsNotice` (`src/features/cart/components/MergeExclusionsNotice.tsx`) is a dismissible `role="alert"` box with a hairline border and no fill. It lists products dropped during the guest-cart merge at login, each with a plain-language reason ("ya no está disponible" or "se quedó sin stock"). Its "Entendido" control uses the same bottom-border text style as "Quitar". It renders nothing when there is nothing to report.

### Cart Indicator
`CartIndicator` (`src/features/cart/components/CartIndicator.tsx`) lives in `SiteHeader` beside `AuthNav`, and reuses `AUTH_NAV_LINK_CLASSES`. It renders "Carrito" or "Carrito (N)" as one interpolated string inside a single `<span>`. Splitting the label and the count into separate nodes collapses the space in the browser's accessible name ("Carrito(5)"). Any label-plus-count control should render as one node.

### Add To Cart Control
`AddToCartControl` (`src/features/products/components/AddToCartControl.tsx`) pairs `QuantitySelector` with the "Agregar al carrito" button, so the button reads the selected quantity. Its state is scoped to this control, so a quantity change does not re-render the detail page. The featured hero uses it unmodified.

### Cart Page
`CartPage` (`src/features/cart/pages/CartPage.tsx`, route `/cart`, inside `PublicLayout`) is a single centered column with a `<h2>` "Carrito" title over a hairline-divided content area. It renders `CartLinesSummary` with `totalVariant="static"`, the `MergeExclusionsNotice` in `children`, and the "Ir a pagar" link (`BUTTON_CLASSES`, to `/checkout`) in `nonEmptyFooter`. It sits on the theme-swapping ground, like the auth and checkout pages.

### Checkout Page
`CheckoutPage` (`src/features/checkout/pages/CheckoutPage.tsx`, route `/checkout`, inside `PrivateLayout` and `ProtectedRoute`, so it needs a signed-in session) opens with an `<h2>` "Checkout" title and renders `CartLinesSummary` with `totalVariant="sticky-bottom"`. Once the cart has at least one line, it adds the two-region step layout (see Layout). `CheckoutStepIndicator` sits beside a `divide-dotted` column of step sections: `ShippingForm` or `ShippingSummary`, `PaymentForm` or `PaymentSummary`, and `ReviewSection`. Each section switches between its form and its summary according to `getStepVisibility(draft, step)`, which returns `'form'`, `'summary'`, or `'hidden'`. The state comes from `useCheckoutDraft`. There is no per-step route, no modal, and no screen swap. The cart and all three steps are one continuous document, separated only by the dotted rule. The draft (shipping, payment, and the active step) persists per uid.

### Checkout Step Indicator
`CheckoutStepIndicator` (`src/features/checkout/components/CheckoutStepIndicator.tsx`) is the three-item step nav (Envío, Pago, Revisión), rendered as an `<ol>`. Each step is in one of three states, and these are the whole vocabulary:
- **Completed** (its form has been submitted): a clickable `<button>`, Label typography, underlined (`underline decoration-1 underline-offset-2`), full opacity, theme-owned accent on hover and focus. Clicking it returns to that step's form.
- **Active** (the step showing its form): a plain `<span>`, Label typography, full opacity, with a heavier accent underline (`decoration-field-magenta decoration-2`, or `dark:decoration-field-cyan`) that does not change on hover, because it is not interactive.
- **Unreached** (a later step not yet visible): a plain `<span>`, Label typography, at 40% opacity. It is not interactive.

Navigation is backward-only by construction. "Revisión" never renders as a `<button>`, because it is a read-only summary of the other two steps. An unreached step is a dimmed label, not a `disabled` button, because it is not a control yet. At base width, the `<ol>` is the pinned chrome (`sticky top-0`, horizontal `flex gap-6`). From `md:` it is a static vertical list (`md:flex-col md:gap-4`) in the left column.

### Checkout Forms
`ShippingForm` and `PaymentForm` (`src/features/checkout/components/`) are `react-hook-form` and `zodResolver` forms built from `TextField` and `Button`, using the auth forms' `mode: 'onTouched'` and whole-fieldset disable. `ShippingForm` collects name, address, city, postal code, and phone, and submits to "Continuar a pago". `PaymentForm` collects only a cardholder name and a native radio choice between "Aprobado" and "Rechazado", under a "Resultado simulado" `<fieldset>` and `<legend>`. It has **no card number, expiry, or CVV field**. A `text-xs` disclosure line states that no real charge is processed. The spec requires only a forced success or failure for testing. Realistic card fields would add fields the spec never asked for. The radio group's validation error renders through `InlineError`.

### Checkout Summary Card
`CheckoutSummaryCard` (`src/features/checkout/components/CheckoutSummaryCard.tsx`) is the shell behind `ShippingSummary` and `PaymentSummary`. It has a Display title on the left, an "Editar" control on the right (Label, underlined, theme-owned accent, identical to the completed-step buttons), and a `children` slot below the title for the confirmed values (Body, 80% opacity). "Editar" and the step indicator's completed-step button call the same `editShipping` or `editPayment` callback, so both entry points stay in sync by construction.

### Review Section
`ReviewSection` (`src/features/checkout/components/ReviewSection.tsx`) is the final, always read-only step. It has a Display "Revisión final" title, a Body line that restates the total using the shared `formatPrice`, and the "Confirmar compra" `Button`. That button calls `createOrder` with the draft's `orderRequestId`, so a double click or a retry never creates two orders. It shows `isLoading` while the request runs. On success it calls `onOrderCreated`, which navigates to the order's detail page. A simulated payment that was rejected is caught before the request and explained in place. `ReviewSection` never renders a form and has no "Editar" of its own. It only reads the drafts confirmed by the two steps above.

### Modal
`Modal` (`src/components/ui/Modal.tsx`) is the system's overlay primitive: an opaque `bg-ink/60` backdrop behind a `bg-bone` (`dark:bg-ink`) panel with a hairline border, never a shadow. It has `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing at a Display `<h2>` title. Focus is trapped in the panel. Escape and a backdrop click close it, unless `closeDisabled` is set during a destructive action. Focus returns to the opener on close. Initial focus goes to the `initialFocusRef` the caller passes. Every current consumer points it at the safe "Volver" control, so a reflexive Enter can never confirm a destructive action.

### Confirm Action Modal
`ConfirmActionModal` (`src/components/ui/ConfirmActionModal.tsx`) is the shared shell for every destructive confirmation: a `Modal` whose body names exactly what will be destroyed (never a bare "¿estás seguro?"). It has a safe "Volver" text control and a destructive `Button` labeled with the caller's verb ("Confirmar cancelación", "Borrar reseña", "Eliminar definitivamente"). It owns its async submit state. A failed `onConfirm` shows its message inline through `InlineError` without closing the modal, so the user keeps their place. A successful one calls `onConfirmed`.

Its trigger, `DestructiveTriggerButton` (`src/components/ui/DestructiveTriggerButton.tsx`), is a Label underlined text control with no button chrome. It is used by "Cancelar orden", "Borrar mi reseña", and the admin row's "Cancelar". It takes a `disabled` prop, and exports its class string as `TEXT_ACTION_BUTTON_CLASSES`. That constant is reused unmodified by the admin row's non-destructive transitions ("Marcar en proceso", "Marcar completada"). The component's name still describes its original purpose, and the exported class is the reusable piece.

The cancel modal takes an injected `onCancel: () => Promise<Result>` action. The customer's order page supplies a call scoped to the signed-in customer, and the admin row supplies a call to the admin status endpoint. Neither action is hardcoded in the modal.

### Order Status Badge
`OrderStatusBadge` (`src/features/orders/components/OrderStatusBadge.tsx`) marks the four order states without relying on color alone. Pendiente is outlined, En proceso is outlined and underlined, Completada is filled (inverted ink and bone), and Cancelada is outlined and struck through. The shared base class is `STATUS_BADGE_BASE_CLASSES` (`src/components/ui/statusBadgeClasses.ts`), also used by `ProductStatusBadge`. The admin order row renders this same component, unmodified.

### Orders Page
`OrdersPage` (`/orders`, inside `PrivateLayout`) and its row `OrderListItem` use the single-column `max-w-2xl` hairline family, with `divide-y divide-dotted` for the list. Each row is one full-row `Link`: the abbreviated order number in Display, the date at 70% Body, `OrderStatusBadge`, and a tabular-nums total. There is no separate "view" control, and the whole row carries the focus ring. `EmptyState` covers a customer with no orders. `OrdersSkeleton` mirrors the loaded row.

### Order Detail Page
`OrderDetailPage` (`/orders/:orderId`) shows `OrderStatusBadge` beside a Display `h2` order number. Its items are a `divide-dotted` list of read-only `OrderItemRow`s (name, quantity × unit price, line total, mirroring `CartLineItem` without the stepper or remove control, because a past order is a record). A `<dl>` closes it with subtotal, shipping, and total. The total uses the same Display `text-2xl` treatment as the cart's running total. A plain shipping block follows. "Cancelar orden" (`DestructiveTriggerButton` to `CancelOrderModal`) renders **only** when `order.status === 'pending'`: not disabled, not present at all. The page is also the post-purchase confirmation screen, because `CheckoutPage` navigates straight here after an order. It reads equally well right after a purchase and months later, so it has no separate success variant.

### Rating Display
`RatingDisplay` (`src/features/reviews/components/RatingDisplay.tsx`) reads a 1–5 rating as five `size-3` square segments, filled ink or bone below the rating and hairline-outlined above it, with the number spelled out beside them. The segment row has `role="img"` and the accessible name "Calificación: 4 de 5". There are no star glyphs and no icons anywhere in the system. The convention is the same text-plus-mark approach as `OrderStatusBadge`.

### Rating Input
`RatingInput` (`src/features/reviews/components/RatingInput.tsx`) is `ReviewForm`'s five-option control. It is a row of `size-10` bordered squares, built from five visually hidden native radio inputs, with `peer-checked` styling on their visible labels. It is driven by `Controller`, not `register()`. The reason: `register()`'s uncontrolled radio sync compares `defaultValues` to the DOM's string `value` with no coercion, so a numeric rating does not pre-check when editing an existing review. `Controller` with explicit `checked` and `onChange` avoids that comparison. Use the same pattern for any radio or checkbox group bound to a non-string field.

### Textarea
`Textarea` (`src/components/ui/Textarea.tsx`) is the multi-line counterpart of `TextField`: the same bare bottom border, the same theme-owned accent on focus, and the same one-slot hint and error behavior. Its `aria-describedby` wiring is shared through the `useFieldDescribedBy` hook (`src/lib/useFieldDescribedBy.ts`).

### Review Form and Reviews List
`ReviewForm` (`src/features/reviews/components/ReviewForm.tsx`) pairs `RatingInput` with a `Textarea`, using `react-hook-form`, `zodResolver`, and `mode: 'onTouched'`. One component serves both "leave a review" and "edit your review". It is keyed by the review's id, so the form remounts with fresh `defaultValues` when switching between them, instead of resetting a mounted form by hand. `ReviewListItem` pairs `RatingDisplay` with the reviewer's name, date, and comment, inside the same `divide-y divide-dotted` list. `ReviewsSkeleton` mirrors it.

### Product Reviews Page
`ProductReviewsPage` (`/products/:id/reviews`, linked from the cartela's rating summary) uses the same `max-w-2xl` hairline family. The "X.X · N reseñas" summary is computed from the loaded review list, not from the product's denormalized `ratingAverage` and `ratingCount`. The list is already in memory, so the summary is accurate and updates the instant a review is saved or deleted, without waiting for the server recalculation. An anonymous visitor sees the list but not the form, plus a sign-in link that returns here. A signed-in visitor sees their own review pre-loaded in the form, a "Borrar mi reseña" trigger when one exists, and everyone's reviews below.

### Admin Layout
`AdminLayout` (`src/layouts/AdminLayout.tsx`) is the chrome for every `/admin/*` route. It is a `SiteHeader`-shaped header: a wordmark `Link` (not an `h1`, for the reason given under Auth Navigation), `LogoutButton`, and a `<nav aria-label="Secciones de administración">` with three entries from `ADMIN_NAV_LINKS`: "Productos", "Órdenes", and "Analytics". It uses `NavLink` with Label typography and an underline. The active link is full opacity with an ink or bone underline. An inactive link is 70% opacity with a transparent underline. Hover and focus swap to the theme-owned accent. The header sits on the theme-swapping `bg-bone dark:bg-ink` ground, like `PrivateLayout`.

### Admin Products Table
`AdminProductsPage` (`src/features/admin/products/pages/AdminProductsPage.tsx`, route `/admin/products`) is the brief's thesis, made literal: the table is the screen. It fetches the full catalog once, with no `isActive` filter, because a retired product must stay visible to be reactivated. It filters by category and name on the client, instantly, with no debounce. There is no network cost left to debounce, and an operator correcting prices all day needs the filter to respond at once.

Below `md:` each row becomes a stacked card, and each cell gets an inline label that is hidden at `md:`. There is never horizontal scroll. The column labels, both the desktop header and the inline labels, share `TABLE_LABEL_CLASSES` (`src/features/admin/constants/tableLabelClasses.ts`). That constant is Label typography at 60% opacity. Its contrast was measured: 60% gives about 4.8:1 against bone, which clears the AA floor for text at this size, while 50% gives about 3.5:1 and fails. The empty state and the "filter matched nothing" state use different `EmptyState` copy. Loading shows the shared `TableSkeleton`.

### Admin Orders Table
`AdminOrdersPage` (`src/features/admin/orders/pages/AdminOrdersPage.tsx`, route `/admin/orders`) uses the same shape as the products table: the page shell, the `<table>` at `md:` with stacked cards below, `TABLE_LABEL_CLASSES`, and `TableSkeleton`. `AdminOrderFilters` reuses `FILTER_CHIP_CLASSES` for its status chips. Its status filter lives in the URL (`?status=`), parsed through `parseOrderStatusParam`, and an invalid or stale value falls back to no filter. That makes it shareable and back-button safe. The products table keeps its filter in local state, by design.

Each `AdminOrderRow` shows the order number, date, customer name, tabular-nums total, `OrderStatusBadge`, and an actions cell. The actions cell renders only the transitions that `ORDER_STATUS_TRANSITIONS` allows from the row's current status. A pending order shows "Marcar en proceso" and "Cancelar". A processing order shows "Marcar completada" and "Cancelar". A completed or cancelled order shows neither, not disabled versions of them. The forward transitions are one-click actions with no modal. Only "Cancelar" opens `CancelOrderModal`, because it reverses stock and product counters. A failed transition shows its message through `InlineError` beneath the row's buttons, and never removes or disables the row.

### Table Skeleton
`TableSkeleton` (`src/components/ui/TableSkeleton.tsx`) is one shared `motion-safe:animate-pulse` stack of flat bars, six rows by default. Both admin tables use it. It does not mirror a specific column shape, because a generic dense table's loading state is a block of rows. One shape serves both tables without over-fitting to either schema.

### Editable Number Cell
`EditableNumberCell` (`src/features/admin/products/components/EditableNumberCell.tsx`) is the price and stock inline editor: a bare bottom-border `<input type="number">` with the heavier resting border exception, `tabular-nums`, committing on blur or Enter. On a failed save it reverts to the last confirmed value and explains the error in place. Saving state is per row (`savingId`), never a shared flag, so editing one price never disables the whole table. It is keyed by its `value` prop (`key={product.price}`), so a value that changes from outside the control, such as a refetch, remounts it cleanly. The row that made the edit never remounts, because its local value already matches what the server returned. The save does not cost the user focus.

### Product Status Badge
`ProductStatusBadge` (`src/features/admin/products/components/ProductStatusBadge.tsx`) marks Activo and Retirado with text and a non-color mark, never the field color and never a grayed-out state. Activo is a full-opacity bordered box, and Retirado is the same box with `line-through`. It shares `STATUS_BADGE_BASE_CLASSES` with `OrderStatusBadge`.

### Admin Product Form
`AdminProductFormPage` and `AdminProductForm` (`src/features/admin/products/`) serve both `/admin/products/new` and `/admin/products/:id/edit` from one component. They use `react-hook-form`, `zodResolver`, and `mode: 'onTouched'`, built from `TextField`, `Textarea`, and `Button`. `ProductSpecsFieldArray` manages the spec rows with `useFieldArray`, adding and removing `{label, value}` pairs. Its min-1 and max-12 bounds appear as disabled states on "Quitar" and "Agregar especificación", not only as a submit error. Category and display color are native `<select>` elements, styled with the same bare bottom border as `TextField`.

### Image Upload Field
`ImageUploadField` (`src/features/admin/products/components/ImageUploadField.tsx`) is the native `<input type="file">` and the progress indicator of the admin form. It is purely presentational. The upload state machine, `useImageUpload`, lives in `AdminProductForm`, so the form's single fieldset disable covers "an image is still uploading" as well as "the form is submitting". The file control borrows `Button`'s look for its `::file-selector-button`. The progress bar is a flat two-layer bar: an `ink/10` or `bone/10` track and a field-color fill, with no gradient and no rounded ends. The preview has a real `alt` ("Vista previa de la imagen del producto"), because it is the only way the admin confirms which file uploaded. Upload errors (wrong format, too large, a failed request, an expired presigned URL) render through `InlineError`, separate from the field's own validation error.

### Admin Analytics Page
`AdminAnalyticsPage` (`src/features/admin/analytics/pages/AdminAnalyticsPage.tsx`, route `/admin/analytics`) is the third admin screen. It has neither a filter row nor a table. It is gated on one hook, `useOrdersSummary`, which runs a single Firestore aggregation (`sum('total')` and `count()` over non-cancelled orders). While it loads, `AnalyticsSummaryTilesSkeleton` shows. On failure, `ErrorState` shows. When `totalOrders` is 0, one `EmptyState` ("Todavía no hay ventas") replaces everything below the `h1`. A page with an empty-state message above an empty chart would say the same thing twice. Only when there are orders does the page render `AnalyticsSummaryTiles` and `TopSellingProductsSection` in a `flex flex-col gap-8` stack.

`TopSellingProductsSection` is a second, independent unit, with its own hook (`useTopSellingProducts`), skeleton, and `ErrorState` with retry. It is deliberately not merged with the summary fetch, so a slow or failed ranking never blocks the totals, and the reverse. If orders exist but no product has any units sold yet, it shows a plain sentence ("Todavía no hay unidades vendidas para armar el ranking") instead of a second `EmptyState`. The ranking query excludes zero-unit products with `where('unitsSold','>',0)`, so a product that never sold can never appear as a top seller.

### Analytics Summary Tiles
`AnalyticsSummaryTiles` (`src/features/admin/analytics/components/AnalyticsSummaryTiles.tsx`) shows "Ingresos totales" and "Cantidad de órdenes" as two label and value pairs inside one flowing `<dl>`. **These are not boxed metric cards.** The block opens with `border-t border-ink/15 pt-6` and stacks on mobile (`flex-col gap-6`). From `md:` it sits side by side (`md:flex-row`), with a vertical hairline between the totals (`md:divide-x md:divide-ink/15`). `<dt>` uses `TABLE_LABEL_CLASSES`. `<dd>` is Display, `text-3xl`, `tabular-nums`. The container classes are exported as `ANALYTICS_SUMMARY_CLASSES`, shared with the skeleton.
A bordered grid of metric cards, one box per number, was tried and rejected. It reads as the generic product-analytics dashboard that the admin brief's thesis rejects by name. Any admin screen that shows a small set of totals should use this flowing list instead.

### Top Selling Products Chart
`TopSellingProductsChart` (`src/features/admin/analytics/components/TopSellingProductsChart.tsx`) is the system's only chart, built on Recharts (`recharts@^3.10.1`). It is a horizontal `BarChart` (`layout="vertical"`) with one series, units sold, for the top five products. Every color prop Recharts exposes (`Bar fill`, `LabelList fill`, both axes' `tick.fill`, both axes' and the grid's `stroke`) is `currentColor`. The wrapper sets `text-ink dark:text-bone`, so the chart inherits the theme-swap with no chart color tokens. The grid and axis strokes use the same hairline weight (`strokeOpacity` 0.15 and 0.3), not a heavier library default. Each bar's value is drawn on the bar with `LabelList` (`position="right"`), so no series depends on color or hover alone. `isAnimationActive={false}` is deliberate: no motion exists elsewhere in the system, and the chart matches that. The chart's `accessibilityLayer` stays on, so keyboard and screen reader support remain. `TopSellingProductsChartSkeleton` is a single flat pulsing block at the chart's `h-64` height.

## Do's and Don'ts

### Do:
- **Do** assign exactly one of the four closed field colors, full-strength and full-bleed, per product tile. On the product detail page and the featured hero, it fills the image panel. On the cart page, it is each `CartLineItem`'s color stripe.
- **Do** keep Bodoni Moda to one headline-weight string per component (name, price, or state message). Several components on one page may each carry their own headline, as on checkout or on the catalog-with-hero home page.
- **Do** build any new skeleton to the exact shape of its loaded content, and gate its animation behind `motion-safe:`. The exception is a generic dense table or a chart with no fixed column or series shape. There, a shared flat block is the right choice.
- **Do** source interactive accent color from the active theme (magenta light, cyan dark), not a hardcoded hex. The exception is a fixed-tone surface (the cartela and the featured hero), where hardcoded ink and accent colors are correct because that surface never swaps.
- **Do** keep corners square and surfaces shadow-free. Depth comes from the field color, never from elevation.
- **Do** cycle small color swatches (category dots, `displayColor`, the cart stripe) through the closed four-field set by index. Let the adjacent text label do the disambiguation. Repeated colors are expected, not a bug.
- **Do** put a control that needs to clear the WCAG 3:1 boundary floor on the heavier bare-border value (`ink/50`, `bone/40`). A fully bordered control like `Button` uses its own full-opacity `border-current` instead.
- **Do** use `border-current` or `currentColor`, not a `dark:` variant, in any reusable component that might sit inside a fixed-tone surface. Any chart, SVG, or third-party component uses `currentColor` for every color prop, as `TopSellingProductsChart` does.
- **Do** use `aria-labelledby` pointing at separate name, description, and price ids for card-as-link components, following the Product Card. Do not use a single flattened `aria-label`.
- **Do** validate forms with `react-hook-form`'s `mode: 'onTouched'`. Isolate any live-computed, per-keystroke UI state (such as a disabled submit button) into a small child that uses `useWatch`, not the form's whole-subscribing `watch()`.
- **Do** share one `aria-describedby` slot between a field's hint and its error. Hide the hint once an error is present, when the error restates the hint.
- **Do** reuse the stock `Button` and its `disabled` treatment for prior and next controls (see `PaginationControls`). Do not build a bespoke "can't go further" state.
- **Do** use `divide-dotted` for itemized receipt-style lists and sequential document sections (see The Dotted-List Rule). Do not use it as a general divider.
- **Do** render a label-plus-count control (see `CartIndicator`) as one interpolated text node. Splitting it collapses the space in the accessible name.
- **Do** export a primitive's class string as a named constant (`BUTTON_CLASSES`, `AUTH_NAV_LINK_CLASSES`, `TEXT_ACTION_BUTTON_CLASSES`, `ANALYTICS_SUMMARY_CLASSES`, `FEATURED_PRODUCT_HERO_LAYOUT_CLASSES`) when a non-primitive element, a same-visual sibling control, or the component's own skeleton needs the identical look.
- **Do** use `position: sticky` or `fixed` with an opaque `bg-bone` or `dark:bg-ink` background and a hairline border, never a shadow, to pin navigational chrome or a running total at base width. Reset to in-flow layout from `md:` up (see The Pinned Chrome Rule).
- **Do** render an unreached step as a plain dimmed label, and a completed step as a clickable `<button>`. Do not use a `disabled` button for either. The same applies to row actions bound to a state machine: a transition the graph does not allow from the current state is not rendered at all (see `AdminOrderRow`).
- **Do** use one of the system's verified text-opacity steps (`/60`, `/70`, `/80`) for de-emphasized text. Never pick a value by eye. `/50` is verified only as a border exception, and it fails AA at text weight.
- **Do** use `Controller`, not `register()`, for any radio or checkbox group bound to a non-string field (see `RatingInput`).
- **Do** compute a live summary (an average, a count) from a list already loaded in memory when the screen holds that list. See `ProductReviewsPage`. This keeps the summary accurate and updates it without waiting on a server recalculation.
- **Do** key a self-contained editable control by the external value it displays (see `EditableNumberCell`'s `key={product.price}`) when that value can change from outside its own edits. No manual resync code is needed. The control's own edit does not remount itself.
- **Do** lift an async sub-flow's busy state (a file upload, a secondary fetch) into the parent form when the parent's submit gate must account for it. See `ImageUploadField` and `useImageUpload`, called from `AdminProductForm`. A presentational child is a pure function of its props, so the parent stays the single source of truth for "busy".
- **Do** inject a caller-supplied async action into a shared confirmation modal (see `CancelOrderModal`'s `onCancel`), once a second caller needs a differently scoped action through the same shell.
- **Do** put an admin table's filter state in the URL only when the surface brief asks for a shareable filter (see `AdminOrderFilters`). Otherwise keep it local (see `AdminProductFilters`). The two tables are allowed to differ on this.
- **Do** show a small set of admin totals (two to a handful of numbers) as a flowing `<dl>`, with label and value pairs separated by a hairline. Use a Label `<dt>` and a Display `<dd>`. Never use a grid of bordered metric cards (see Analytics Summary Tiles).
- **Do** keep independent sections of a dashboard-style page on separate hooks and queries, each with its own loading, error, and empty handling. A failure in one section must never block a sibling that does not depend on it.
- **Do** let a component that shares another's visual family diverge in sizing when one consumer has a competing element the other lacks. The featured hero's capped mobile image is the example. Verify any divergence by measuring the real viewport before recording it as intentional.
- **Do** exclude a page's featured item from the list below it only on the default, unfiltered view, where duplication is guaranteed. Under a filter or search, let the item reappear. When the exclusion would leave a non-empty source looking empty, omit the downstream section rather than showing an empty state.

### Don't:
- **Don't** add border-radius, drop shadows, gradients, or glassmorphism. None exist in the system.
- **Don't** introduce a tint, opacity variant, or fifth color into the closed four-field set, not even to "fix" a repeated swatch.
- **Don't** assume the home page hero lives on a separate landing route, or that it shows a full spec table the way the cartela does. `FeaturedProductHero` is a section of `CatalogPage` (`/`) and shows only name, curatorial note, price, and add-to-cart.
- **Don't** treat the current light theme, a literal ink and bone swap, as a finished light mode. It is the shipped behavior, not an approved target.
- **Don't** generalize the heavier border (`ink/50`, `bone/40`) into the default border weight. It is a floor for bare-border interactive controls, not a replacement for the hairline.
- **Don't** fold catalog filtering controls into `PublicLayout`'s shared header. `PublicLayout` also wraps routes that do not need them. Keep filter UI on the routes that use it.
- **Don't** extend the Fixed Paper Rule to a third fixed-tone surface without the same editorial reason, a physical paper specimen object in the scene. Forms, receipts, and lists stay on the theme-swapping ground.
- **Don't** hardcode a `dark:` color pair onto a component that could sit inside a fixed-tone surface. Use `currentColor`, `border-current`, or an explicit non-conditional value.
- **Don't** reproduce the product detail page's two `h1` elements elsewhere. It is a disclosed trade-off for a single-item page. All other pages keep one `h1`.
- **Don't** read `PaginationControls`' `text-xs` page label as precedent for an uppercase, tracked kicker or eyebrow. It is plain Body support text, and no kicker component exists.
- **Don't** nest a `<button>` inside an `<a>`, or the reverse. When a card needs both a link and an action, wrap both in a container and keep the controls as siblings.
- **Don't** use a `disabled` `<button>` for an unreached step or a transition the state machine does not allow. Render a plain non-interactive element, or do not render it. A disabled control implies the action exists and is temporarily blocked.
- **Don't** treat the payment step's lack of card fields as a gap to complete. It is a deliberate, scoped simplification.
- **Don't** use URL-based status filtering as the default for every admin filter. It is a deliberate divergence, justified by the shareable-filter requirement. Do not retrofit it onto the product table without the same requirement.
- **Don't** show admin totals as a grid of bordered metric-card tiles. Use the flowing `<dl>` pattern (see Analytics Summary Tiles).
- **Don't** "fix" the featured hero's capped mobile image (`h-64`) back to the cartela's floor-only `min-h-96`. The two diverge on purpose, and matching them would reopen the below-the-fold CTA defect.
