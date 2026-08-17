# JTECH design system

The rules that make the pages look like one site. Read this before adding a
section or a component — most of what follows is cheap to keep and expensive to
retrofit.

Reference feel: **apple.com** for restraint, spacing, type scale and section
rhythm; **samsung.com/us** for product tiles and category browsing. JTECH's own
identity is the gold graphic language in §3.

---

## 1. Tokens

Every value lives once, in `app/globals.css` as a CSS custom property.
`tailwind.config.ts` only maps utility names onto those variables, so changing a
brand colour is a one-line edit that propagates everywhere.

### Colour

| Token                | Value     | Use                                        |
| -------------------- | --------- | ------------------------------------------ |
| `--color-white`      | `#FFFFFF` | Page ground                                |
| `--color-gray-50`    | `#F5F5F7` | Alternating section background, image beds  |
| `--color-gray-100`   | `#E8E8ED` | Hover fill on light controls               |
| `--color-gray-300`   | `#D2D2D7` | Hairlines, borders                         |
| `--color-gray-500`   | `#86868B` | Footnotes, muted labels                    |
| `--color-gray-700`   | `#6E6E73` | Subheads, secondary body                   |
| `--color-ink`        | `#1D1D1F` | All primary text; dark surfaces            |
| `--color-gold`       | `#F2A52F` | Fills, shapes, badges                      |
| `--color-gold-light` | `#FFC93C` | Hover, gradient stop                       |
| `--color-gold-deep`  | `#DE8F12` | Gradient stop                              |
| `--color-gold-tint`  | `#FEF8EC` | Hover beds                                 |
| `--color-gold-text`  | `#9A6200` | Gold **text** on light backgrounds         |
| `--color-green`      | `#2FBF6B` | In-stock dot only                          |
| `--color-amber`      | `#96590A` | Low-stock label, form errors                |

The Tailwind default palette is **replaced**, not extended — `theme.colors` sits
at the top level of the config. `bg-red-500` and `text-slate-700` do not exist.
If a colour isn't in the table above, it isn't in the system.

### The gray rule — the one that surprised us

The two grays are **not** interchangeable, and which is correct depends on the
surface:

| Text colour           | on white | on `#F5F5F7` | on ink `#1D1D1F` |
| --------------------- | -------- | ------------ | ---------------- |
| `gray-500` `#86868B`  | 3.6:1 ✗  | 3.5:1 ✗      | **4.6:1 ✓**      |
| `gray-700` `#6E6E73`  | **5.0:1 ✓** | **4.8:1 ✓** | 3.3:1 ✗          |

So: **`gray-700` for muted text on light surfaces, `gray-500` for muted text on
ink.** The brief's own note calls gray-500 "footnotes, muted", which is a role,
not a contrast guarantee — used as 12px text on white it fails AA.

One further trap: where a `CornerBlob` tints a gray section (`#F5F5F7` + 8% gold
= `#F5EFE7`), `gray-700` drops to 4.43:1 and misses AA at 12px. Micro-labels that
can sit over a tint — the product card's brand line — use `text-ink/70` (~5.8:1
on white, gray and tinted beds alike).

And `--color-green` is an **in-stock dot colour, not a text colour**: `#2FBF6B`
on white is 2.4:1. `StockDot` is correct because the dot is green while the label
beside it is gray-700.

### The gold contrast rule — the one that gets broken

`#F2A52F` on white is roughly **2:1**. That fails WCAG AA for text by a wide
margin. So:

- **Gold is a fill and shape colour on light backgrounds. Never a text colour.**
- Gold text on white uses `--color-gold-text` (`#9A6200`, ~5:1) → `text-gold-text`.
- On the ink surface (`#1D1D1F`), `#F2A52F` text measures ~8:1 and is correct —
  `text-gold` is right there and nowhere else.

`Button` encodes this in its `surface` prop (`light` | `ink` | `gold`) rather
than leaving it to the call site: the `link` tier resolves to `text-gold-text` on
light and `text-gold` on ink. Use the prop instead of hand-picking a colour.

`--color-amber` exists because low-stock ("آخر قطع") needs a *label* colour, and
gold would fail at 12px. The dot beside it can be gold; the words cannot.

### Radii

Five, and only five. Nothing else in the system is rounded.

| Token          | Value   | Use                              |
| -------------- | ------- | -------------------------------- |
| `rounded-chip` | `12px`  | Icon chips, `NumberedSquare`     |
| `rounded-card` | `18px`  | Cards, product image beds        |
| `rounded-tile` | `24px`  | Large feature tiles, modals      |
| `rounded-full` | `999px` | Buttons, pills                   |
| `rounded-none` | `0`     | —                                |

### Spacing

- Section padding: `120px` desktop (`py-section`) / `72px` mobile (`py-section-sm`)
- Content column: `980px` (`max-w-prose`) — `<Container width="prose">`
- Page shell: `1680px` (`max-w-shell`) — `<Container>` default

### Type

One family per script, many sizes. No display face, no mono.

The system stack is listed **first** on purpose: on the client's Mac and iPhone
the page renders in real SF Pro / SF Arabic with zero font requests, which is
most of the Apple feel for free. `Inter` and `IBM Plex Sans Arabic` load via
`next/font/google` (self-hosted at build) as the fallback for everyone else.

`--font-ui` resolves per locale from `html[lang^='ar']`, so no component ever
needs to know which script it's rendering — `font-sans` is always correct.

| Role               | Utility            | Size        | Weight | Tracking  | Leading |
| ------------------ | ------------------ | ----------- | ------ | --------- | ------- |
| Hero               | `text-hero`        | 40–80px     | 600    | `-0.02em` | 1.05    |
| Section headline   | `text-section`     | 32–56px     | 600    | `-0.015em`| 1.07    |
| Big spec numeral   | `text-numeral`     | 44–80px     | 600    | `-0.02em` | 1       |
| Subhead            | `text-subhead`     | 21px        | 400    | 0         | 1.4     |
| Body               | `text-base`        | 17px        | 400    | 0         | 1.6     |
| Caption            | `text-caption`     | 12px        | 500    | `.01em`   | 1.4     |

Headline steps are fluid (`clamp()`), so there are no per-breakpoint font-size
overrides anywhere in the codebase.

Arabic at the same nominal px reads optically smaller than Latin, so
`html[lang^='ar'] body` nudges body copy from 17px to 18px. That is the only
script-conditional type rule.

### Numerals

Prices and figures are **always Latin digits with dot grouping**, identical in
all three locales: `289.000 دج`.

- `lib/format.ts → formatInteger()` does the grouping by hand. `Intl.NumberFormat`
  with `ar-DZ` would emit Arabic-Indic digits and a different separator.
- Wrap in `<bdi>` so a currency word or minus sign can't be reordered by the RTL
  paragraph around it.
- Put `.num` on the **numeral only**, never on a parent that also contains the
  Arabic currency word — `.num` forces the Latin font stack, and `دج` rendered in
  it falls back to a mismatched face.

---

## 2. Layout direction

Arabic is the default locale and it is RTL. The AR and FR/EN layouts mirror from
**the same markup**.

- Use logical properties everywhere: `ps-*` `pe-*` `ms-*` `me-*` `start-*` `end-*`
  `text-start` `text-end` `border-s` `border-e`.
- **Never** `ml-*` `mr-*` `pl-*` `pr-*` `left-*` `right-*` `text-left` `text-right`
  in layout CSS. The verification script asserts none appear in the rendered HTML.
- Directional *glyphs* are a different matter and do flip: chevrons carry
  `rtl:-scale-x-100`, and hover nudges pair `ltr:group-hover:translate-x-[3px]`
  with `rtl:group-hover:-translate-x-[3px]`.

---

## 3. Brand devices

JTECH's graphic language, taken from the client's Instagram. All pure CSS/SVG —
**no image files for decoration**. Each is a real component in `components/brand/`.

| Component          | What it is                                                                |
| ------------------ | ------------------------------------------------------------------------- |
| `<Halftone />`     | Gold dot field, `11px` grid, masked to fade bottom-left, bleeding off a corner. 160–220px. **Never behind text.** |
| `<GoldRibbon />`   | SVG stroke sweeping behind a product and re-emerging. 14–18px, round caps, `#FFC93C → #DE8F12`, draws over 1.2s. No shadow. |
| `<CornerBlob />`   | Flat gold organic shape bleeding off a corner, 30–45vw. No blur, no shadow — the client's shapes are flat. |
| `<GoldPanel />`    | Full-bleed gold gradient with diagonal light rays. Text on it is always ink. |
| `<Swash />`        | 56×4px bar, radius 2px, 20px under every section headline.                 |
| `<NumberedSquare/>`| 40×40px, radius 12px, gold fill, ink numeral 15px/700.                     |
| `<Pill />`         | `ink` (black bed, white text) or `gold` (gold bed, ink text). 12px/600.    |

### The governing rule

> **One brand device per section. Never two. Gold and gold-tinted pixels stay
> under roughly 12% of any viewport.**

This is enforced structurally, not by convention:

- `<Section device={…} />` takes a **single** node. If you find yourself passing a
  fragment with two devices in it, that's the rule breaking — split the section.
- A device that must sit relative to *content* rather than to a section corner
  (the two `GoldRibbon`s) is composed inline, and the section passes no `device`.
  It still counts as that section's one device.
- Four `NumberedSquare`s in one section is still **one** device. Repetition of a
  single device is the point; mixing two is not.

### Per-page budget

`GoldPanel` is the single exception to the 12% rule — it *is* the brand moment,
so it's allowed to fill its section. Everything else stays well under, which is
what makes that one section land.

| Section              | Device                        |
| -------------------- | ----------------------------- |
| Hero                 | `GoldRibbon` #1 of 2          |
| Categories           | — (gold icon chips)           |
| Featured (ink block) | `GoldRibbon` #2 of 2 — spent  |
| Full range           | `Halftone`                    |
| Best sellers         | `CornerBlob` @ `.08`          |
| Accessories          | `Halftone`                    |
| Why JTECH            | `NumberedSquare` ×4           |
| Services             | `CornerBlob` @ `.08`          |
| Delivery             | `GoldPanel` — the one moment  |
| Instagram            | `Halftone`                    |
| Contact              | — (deliberately none)         |
| Footer               | `Halftone` @ `.2`             |

Hard caps: **two ribbons per page**, **two full-saturation blobs per page**
(both currently spent on the panel and the hero), **one gold panel per page**.

### The ribbon's three-layer stack

The ribbon only reads correctly when it sits **on** the product bed and **under**
the product:

```
bed      (opaque, z-0)        ← absolute inset-0
ribbon   (z-10)               ← negative insets so it bleeds past the bed's radius
product  (z-20)               ← the ribbon disappears behind it, re-emerges past it
```

Putting the ribbon *below* an opaque bed hides it almost entirely — that was the
first attempt and it looked like a stray stroke in the corner.

---

## 4. Motion

Brand easing is `cubic-bezier(.28, .11, .32, 1)` — `ease-brand`.

| Primitive        | What                                            | Cost      |
| ---------------- | ----------------------------------------------- | --------- |
| `<Enter />`      | Fade + 20px rise on load, CSS only              | 0 KB JS   |
| `<StaggerText />`| Headline words rise, 40ms stagger, CSS only     | 0 KB JS   |
| `<Reveal />`     | Same as `Enter`, triggered on scroll            | ~0.5 KB   |
| `<Parallax />`   | Scroll drift, capped at 5% of element height    | ~0.6 KB   |
| `<GoldRibbon />` | `stroke-dashoffset` draw over 1.2s, CSS only    | 0 KB JS   |

### Above the fold uses `Enter`, below the fold uses `Reveal`

The hero headline is the LCP element. Gating it behind an IntersectionObserver
would hold LCP until hydration finished, which the 2.5s-on-4G target can't
absorb. `Enter` and `StaggerText` are therefore **server components** driven by
pure CSS animation, and the hero ships no client JS for its own motion.

### Reveal fails safe

`<Reveal />` renders with **no** `.reveal` class on the server, so the HTML is
visible as delivered. It adds the class (and therefore `opacity: 0`) on mount,
and only if the element is still offscreen — where hiding it is imperceptible.

A reveal that is `opacity: 0` by default blanks every section on a JS error, a
failed hydration, or a scripting-disabled browser. Don't reintroduce that.

### Framer Motion is per-component, never global

It is used in exactly one place: `<QuickView />`, loaded through `next/dynamic`
on first open, so it contributes **nothing** to first-load JS.

`<MobileMenu />` deliberately uses CSS transitions instead. It's the most-tapped
control on mobile, and pulling a JS chunk on tap puts a visible stall in front of
it on a 4G connection.

### Reduced motion is a hard off switch

`@media (prefers-reduced-motion: reduce)` collapses every duration to `0.01ms`
and forces `.reveal` / `.enter` / `.enter-word` to their visible end state. The
light sweep is removed outright. No animation survives it.

### Rendering budget

The homepage is long, and on a throttled mobile CPU its dominant cost is Style &
Layout, not network. Three decisions keep that in check — change them knowingly:

- **`<ProductCard />` is a server component.** All of its hover choreography is
  CSS on the card's `group`, so a card needs no JavaScript. Only
  `<QuickViewTrigger />` is a client island, and only the best-sellers grid
  enables it (the brief scopes quick view to that section). Making the whole card
  a client component cost ~80ms of Total Blocking Time for one boolean per card.
- **Sections carry `content-visibility: auto`** via `.defer-offscreen`, so the
  browser skips style, layout and paint for sections still below the fold. This
  moved First Contentful Paint 2.3s → 1.7s and Speed Index 3.1s → 1.7s under
  simulated mobile throttling. `contain-intrinsic-size: auto 900px` keeps the
  scrollbar stable, and CLS stayed at 0.003.
- **The rails are capped** (`RAIL_LIMIT`, and `.slice()` in the best-sellers and
  accessories sections). The content layer holds the full catalogue; the homepage
  shows a subset, because every extra card is ~35 DOM nodes of layout work.

### Keyframes live in `globals.css`, not in the Tailwind config

Tailwind only emits a `@keyframes` block when a matching `animate-*` class is
found by the content scanner. Several animations here are driven from raw CSS
rules (`.light-sweep`, `.enter`, `.enter-word`) where the scanner can't see the
reference — declaring those keyframes in the config got `sweep-light` purged and
silently broke the ProductCard hover sweep. Raw CSS keyframes are never purged.

---

## 5. Accessibility contract

Non-negotiable, and mostly free if you don't fight it.

- **Every string comes from `messages/{ar,fr,en}.json`** — including `alt` text,
  `aria-label`s and visually-hidden text. No literal copy in any component.
- **Colour is never the only signal.** `StockDot` pairs the dot with a text label.
- **Hover-only controls are broken controls.** Every `group-hover:` reveal in
  `ProductCard` is paired with `group-focus-within:`, so a keyboard user gets the
  same affordances.
- **Visible focus rings, always.** A 2px ink ring globally; `.on-ink` and
  `.on-gold` swap it to white / ink so it can't disappear into a dark or gold
  surface. Never `outline: none`.
- **Landmarks are named.** Each `<Section>` is `aria-labelledby="{id}-title"`, and
  `<SectionHeader>` renders the matching heading id. There is a skip link to
  `#main`.
- **Dialogs implement the full contract by hand** (no headless library):
  `QuickView` and `MobileMenu` both label themselves, move focus in on open,
  restore it on close, cycle Tab inside, close on Escape and on backdrop, and
  scroll-lock the page. `MobileMenu` uses `visibility: hidden` when closed so its
  links leave the accessibility tree and the tab order.
- **Native elements where they exist.** `Accordion` is `<details>`/`<summary>`:
  correct announcements, keyboard operation and find-in-page expansion, zero JS.
- **Wide content scrolls inside its own container.** `CompareTable` and the
  carousels have their own `overflow-x`; the page body never scrolls sideways.
  Verified at 390–1920px in all three locales.

---

## 6. Adding a section

1. Wrap it in `<Section id="…">`. The id must also exist in
   `SECTION_IDS` (`components/layout/navigation.ts`) and as a key under `nav.*`
   in all three message files.
2. Use `<SectionHeader id="…">` for the headline. It renders the `Swash`
   automatically and there is no prop to turn it off — that's what keeps a dozen
   plain sections reading as one family.
3. Pick **one** device from the table in §3, and check the per-page budget above
   before reaching for a ribbon or a full-saturation blob.
4. Alternate the background (`white` / `gray`) against the neighbouring sections.
5. Use `<Reveal>` for entrance motion, not `<Enter>` — `Enter` is for above the
   fold only.
6. If it appears in the sticky nav, add its id to `LOCAL_NAV_IDS` **in document
   order**. (`LocalNav` resolves the active entry from real DOM position, so a
   wrong order won't break the highlight, but the nav should still read top to
   bottom.)

## 7. Don't

- No component library, no template.
- No glow or halo behind products — the ribbon replaces it.
- No gradient text, no gradient buttons, no animated gradients.
- No shadows on gold shapes.
- No gold text on white below 24px — use `text-gold-text`.
- No two brand devices in one viewport.
- No glassmorphism, no neon, no dark-mode toggle.
- No `left`/`right` in layout CSS.
- No `any` in TypeScript (ESLint errors on it), no unused dependencies.
- No overriding a component's colour via `className` when it sets its own — pass a
  prop instead. `<Swash className="bg-ink">` leaves both `bg-gold` and `bg-ink` in
  the class list, and which wins depends on stylesheet order, not on the order you
  wrote them. That's a coin flip; `<Swash tone="ink">` is a decision.
