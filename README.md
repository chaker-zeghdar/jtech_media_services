# JTECH Media Services

Storefront for a phone, accessory and computer shop in Batna, Algeria.
Trilingual (Arabic default, French, English), Arabic RTL.

**Phase 1 — this repo:** design system + homepage. No backend, no cart, no
checkout.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script              | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Dev server                                           |
| `npm run build`     | Production build (prerenders all three locales)      |
| `npm start`         | Serve the production build                           |
| `npm run typecheck` | `tsc --noEmit`                                       |
| `npm run lint`      | ESLint                                               |

Deploy target is Vercel; no configuration beyond the repo is needed. Set
`NEXT_PUBLIC_SITE_URL` (see `.env.example`) once the domain is confirmed so
canonical and `hreflang` tags resolve to the real origin — on Vercel the
platform-provided host is used automatically if you don't.

---

## Stack

- **Next.js 15** (App Router) + **React 19**, TypeScript strict
- **Tailwind CSS 3** with a custom token layer — the default palette is replaced,
  not extended
- **next-intl 4** for i18n, `localePrefix: 'as-needed'`
- **Framer Motion** for the quick-view dialog only, lazily loaded
- **zod** for content schemas
- **next/font** — Inter + IBM Plex Sans Arabic, self-hosted at build

No component library. Every component is written for this project.

---

## Structure

```
app/
  globals.css              Design tokens, base styles, keyframes, motion utilities
  [locale]/layout.tsx      Root layout: <html lang/dir>, fonts, chrome, metadata
  [locale]/page.tsx        The homepage — composes the 11 sections in order
components/
  brand/                   Halftone, GoldRibbon, CornerBlob, GoldPanel, Swash,
                           NumberedSquare, Pill, LogoMark
  ui/                      Button, Card, ProductCard, ProductImage, CategoryTile,
                           SpecStat, Price, StockDot, Carousel, CompareTable,
                           QuickView, Accordion, Field, Badge, Icon
  layout/                  AnnouncementBar, Header, LocalNav, MobileMenu,
                           MobileOrderBar, Footer, Section, SectionHeader,
                           Container, LocaleSwitcher, HashAnchorFix,
                           navigation.ts
  motion/                  Enter, Reveal, StaggerText, Parallax
  sections/                One file per homepage section (incl. FeatureMosaic,
                           BrandMarquee)
content/                   Typed content modules — see below
i18n/                      routing.ts, request.ts, navigation.ts
lib/                       cn, format, product selectors, useInView, clientMessages
messages/                  ar.json, fr.json, en.json
```

`DESIGN.md` documents the tokens, the one-brand-device-per-section rule, the
motion contract and the accessibility contract. **Read it before adding a
section.**

---

## Locales

| Locale | Direction | Path            |
| ------ | --------- | --------------- |
| `ar`   | rtl       | `/` (default)   |
| `fr`   | ltr       | `/fr`           |
| `en`   | ltr       | `/en`           |

All three prerender as static HTML. Automatic locale detection is **off** on
purpose — the audience is Algerian, and a French-language browser shouldn't be
redirected away from the Arabic default.

Every UI string lives in `messages/{ar,fr,en}.json`, including alt text and
aria-labels. The three files are type-checked against `ar.json` via the
`next-intl` augmentation in `global.d.ts`, so a mistyped key is a build error
rather than a broken string shown to a customer.

**Product copy is not in the message files.** It lives per-locale inside the
content modules (`name`, `description`, spec labels), because in Phase 2 those
become `jsonb` columns on the Supabase rows.

---

## Content layer

No database this phase. `content/` holds typed modules whose shapes mirror the
future Supabase tables exactly, so Phase 2 is a data-source swap rather than a
refactor.

| File            | Mirrors                                       |
| --------------- | --------------------------------------------- |
| `schemas.ts`    | The zod schemas every other module parses through |
| `products.ts`   | `products` + `product_variants`               |
| `categories.ts` | `categories`                                  |
| `services.ts`   | `services`                                    |
| `wilayas.ts`    | `wilayas` (all 58)                            |
| `settings.ts`   | `settings` (single row)                       |
| `contact.ts`    | Client-safe contact constants — see below     |

Each module parses its literal through its schema **at import time**, so invalid
content fails the build instead of the page. In Phase 2 the same `.parse()` calls
sit on the Supabase response instead.

Prices are DZD integers. Never floats, never preformatted strings.

### Client/server boundary — important

**Client components must not import from `content/products`, `content/settings`,
`content/wilayas` or `content/categories`.** Those modules run zod at import time
and hold the whole catalogue; importing one from the browser drags all of it
across the boundary. Measured cost when this was wrong: **24 KB** of first-load
JS (156 KB → 132 KB after the fix).

Client components use instead:

- `content/contact.ts` — plain literals plus `whatsappLink()` / `telLink`.
  Zero imports, no zod. `content/settings.ts` spreads these same literals, so
  there is still one source of truth.
- `lib/product.ts` — `primaryVariant()`, `priceFrom()`, `productColours()`.
  Type-only imports, which the compiler erases.

---

## How to add a product

Edit `content/products.ts` and append an entry to `PRODUCTS_INPUT`. The zod
schema will tell you at build time if anything is missing.

```ts
{
  slug: 'galaxy-s25',                    // lowercase kebab-case, unique
  brand: 'Samsung',
  category: 'samsung',                   // iphone | samsung | android | pc | accessories
  badges: ['new'],                       // new | bestseller | promo | last-units | warranty
  featured: false,                       // exactly one product should be true — the dark block
  bestseller: true,                      // surfaces it in the "الأكثر مبيعاً" grid
  name:        { ar: '…', fr: '…', en: '…' },
  description: { ar: '…', fr: '…', en: '…' },
  highlights: [],                        // big spec numerals; only the featured product needs these
  specs: [
    { key: 'screen', label: { ar: 'الشاشة', fr: 'Écran', en: 'Display' }, value: '6.7" AMOLED' },
  ],
  variants: [                            // at least one
    {
      id: 'galaxy-s25-black-256',        // unique across all products
      colour: { slug: 'black', hex: '#2B2C30', label: { ar: 'أسود', fr: 'Noir', en: 'Black' } },
      storage: '8 GB / 256 GB',          // or null for accessories
      price: 195000,                     // DZD integer
      compareAt: 210000,                 // or null; must be greater than price
      stock: 'in-stock',                 // in-stock | low-stock | out-of-stock
      images: [],                        // see below
    },
  ],
}
```

All three locales are required on every localized field — a missing one fails the
build.

### Adding product photos

Six products carry photos (`public/products/`). Everything else has `images: []`,
which is a valid, intentional state: `<ProductImage />` renders a *branded* empty
state — the `#F5F5F7` bed, the JTECH mark at 12% opacity and the product name —
rather than a broken image or a bare gray rectangle. **Do not replace that with a
gray box, a spinner or an upload placeholder.**

⚠️ **The current cutouts are low resolution.** They were extracted from the
client's Instagram posts:

| File | Size |
| --- | --- |
| `iphone-16-pro.png` | 520×677 |
| `galaxy-z-fold-8-ultra.png` | 173×261 |
| `galaxy-z-fold-8.png` | 150×256 |
| `galaxy-z-flip-8.png` | 186×201 |
| `galaxy-watch-ultra-2.png` | 157×185 |
| `galaxy-watch-9.png` | 111×179 |

They prove the layout and are fine to show the client; they are **not launch
assets**. They are deliberately never upscaled — upscaling adds artefacts, not
detail. Consequences baked into the code:

- **The hero stays on the empty state.** The iPhone shot is 520px wide, the hero
  stage is 620px. A visibly soft hero is worse than a considered placeholder.
  `components/sections/Hero.tsx` carries the note; swap `src` to
  `primaryVariant(product).images[0]` when a real hero shot arrives.
- **The mosaic renders them at 140–260px**, all below intrinsic size.
- **Only one shot exists per product**, so every colour variant of the iPhone 16
  Pro points at the same white-titanium photo.

To add a photo, drop the file in `public/products/` and list its path on the
matching variant:

```ts
images: ['/products/iphone-16-pro.png'],
```

That is the whole change — no component edits, no config.

## How to change contact details

These are the client's real details. Two files:

1. **`content/contact.ts`** — the primary (orders/WhatsApp) phone. Lives
   separately so client components can build `tel:` and `wa.me` links without
   pulling zod into the browser bundle.
2. **`content/settings.ts`** — the three departments, address, hours, socials,
   delivery fees and map. It spreads in the values from `contact.ts`, so
   nothing is duplicated.

**The three numbers are not interchangeable** and are modelled as `departments`
rather than as extra string fields, so a component can't accidentally show the
repair line as the shop number:

| Department    | Number           |
| ------------- | ---------------- |
| Orders + WhatsApp | `0659 39 13 13` |
| Repair service | `0773 34 51 20` |
| Sponsoring + e-recharge | `0792 00 86 88` |

`mapPinConfirmed: true` — the map marker is the client's own confirmed Google
Maps pin (decoded from its Plus Code), not an approximation. See the comment
above `mapEmbedUrl` in `content/settings.ts` for how it was derived.

There is no email or website field — both were removed outright (not hidden)
once the client's real numbers made the inferred, unconfirmed email moot.

No component hardcodes a phone number, an address or a social handle.

### Brand assets

- **The logo** is drawn as vector paths in
  [`components/brand/LogoMark.tsx`](components/brand/LogoMark.tsx) — the "JT"
  monogram, four italic strokes. Not a raster, so it stays crisp from the 16px
  favicon to the hero watermark and recolours from a single `fill`. It appears in
  the header, the footer, the mobile menu, the `<ProductImage />` empty-state
  watermark (at 12% ink) and the favicon (`app/icon.svg`, which carries its own
  copy of the paths because Next reads that file directly).
- **The brand colour** is `--color-gold` in
  [`app/globals.css`](app/globals.css). Change that one line and it propagates
  everywhere. The rest of the gold family (`light`, `deep`, `tint`, `text`) is
  derived from it — if you change the base, re-derive them, and re-check
  `--color-gold-text` against white: it is the only gold allowed as text on a
  light surface and it must stay above 4.5:1. The `gold-panel` gradient in
  `tailwind.config.ts` also carries literal stops. DESIGN.md § "Colour" has the
  measured numbers.

### Delivery fees

`content/wilayas.ts` holds all 58 wilayas grouped into four fee bands (`local`,
`standard`, `extended`, `sahara`) so the reason a fee differs stays visible. The
homepage's delivery section renders those bands as an accordion, which makes the
"58 wilayas" claim checkable in two taps. Editing `FEE_TIERS` updates the
headline figures, the accordion and the footer at once.

---

## Phase 1 behaviour worth knowing

These are deliberate interim choices, each marked `PHASE 2:` in the code:

- **"Order" buttons deep-link to WhatsApp** with the product name prefilled,
  because there is no cart yet. `ProductCard`'s slide-up action, the featured
  block's CTA and the quick-view button all do this. Phase 2 swaps the `<a>` for
  an `addToCart` handler; nothing else about those components changes.
- **Category links resolve to `#range`.** `components/layout/navigation.ts →
  categoryHref()` is a single function returning that anchor. Change it to
  `/categories/${slug}` and the header nav, the category tiles and the footer
  columns all switch over at once.
- **The three legal labels in the footer render as plain text**, not links,
  because `/legal/*` doesn't exist. A link to a 404 is worse than no link.
- **`CompareTable` is built but unused.** The brief puts it on category pages in
  Phase 2, where someone is actually choosing between options — not on the
  homepage. It ships now so that page is a composition job.
- **`Field` is built but unused** for the same reason: Phase 2's order form and
  wilaya picker build on it.
- **The brand marquee shows the client's four real marketing posts**, contained in
  cards on a neutral band rather than full-bleed — they use a pale cyan palette
  that would fight every other section if bled edge to edge. Alt text lives in
  `messages.social.slides.*`.
- **⚠️ Three of those four slides advertise branding, web development,
  photography and paid Facebook/Google ads** — an agency service line that appears
  nowhere else on this site, which is otherwise a phone shop. The business clearly
  offers it (two of the three phone numbers are for it), but the website doesn't
  say so. Either add a "خدمات الوكالة" section or swap those slides for retail
  posts. Flagged as a `TODO` in `components/sections/BrandMarquee.tsx`.

---

## What Phase 2 plugs into

| Phase 2 work           | Where it attaches                                                   |
| ---------------------- | ------------------------------------------------------------------- |
| Supabase products      | Replace the literals in `content/products.ts`; keep `productSchema` and `.parse()` on the response. Consumers import from `@/content` and don't change. |
| Product detail pages   | `app/[locale]/products/[slug]/page.tsx`. `QuickView`'s layout is the content model already. |
| Category pages         | `app/[locale]/categories/[slug]/page.tsx`. Point `categoryHref()` at it; drop `CompareTable` on the page. |
| Cart + checkout        | Replace the WhatsApp `<a>` in `ProductCard` / `FeaturedProduct` / `QuickView` with a cart action. |
| Order form             | Build on `Field` and the `wilayas` module — the fee bands are already keyed by wilaya code. |
| Legal pages            | `app/[locale]/legal/*`; turn the footer's plain-text legal labels into links. |
| Real product photos    | Drop files in `public/products/`, list paths in `content/products.ts`. |

The schemas are the contract. Anything that validates against
`content/schemas.ts` will render.

---

## Verified

Measured against the production build (`next start`), not asserted.

### Build and structure

- `npm run build` clean, `tsc --noEmit` clean, ESLint clean, zero `any`
- All three locales prerender as static HTML; `/ar` correctly redirects (the
  Arabic canonical is `/`)
- **First Load JS: 129 KB** (budget: 150 KB)
- No horizontal overflow at 390 / 768 / 1440 / 1920px, in both directions
- Latin digits only — no Arabic-Indic digits leak into any locale
- Every section carries `aria-labelledby` pointing at its own heading
- No physical `left`/`right` layout classes in the rendered HTML
- Message files: 172 keys, identical across `ar`/`fr`/`en`, placeholders matched
- Content renders with JavaScript disabled — no section is `opacity: 0` by default
- Every anchor (`#promise` `#range` `#bestsellers` `#accessories` `#services`
  `#delivery` `#contact`) lands 15px below the sticky nav, consistently
- Fast scroll top→bottom and back leaves **zero** elements at `opacity: 0`; a deep
  link to `#services` leaves nothing hidden above the viewport
- Brand marquee: 45s linear infinite, pauses on hover and focus-within, and under
  `prefers-reduced-motion` drops to `animation: none` with the duplicate hidden
- **No console errors or warnings** on `/`, `/fr` or `/#accessories`

### Lighthouse

|                | Perf    | A11y    | Best Practices | SEO |
| -------------- | ------- | ------- | -------------- | --- |
| Desktop (ar)   | **100** | **100** | **100**        | 91  |
| Mobile (ar)    | 82–88   | **100** | **100**        | 91  |
| Mobile (fr)    | 93      | **100** | **100**        | 91  |
| Mobile (en)    | 89      | **100** | **100**        | 91  |

- **Accessibility and Best Practices are 100** on every locale and both form
  factors, with zero failing audits.
- **SEO 91** is a local-testing artifact: the only failing audit is `canonical`,
  because the canonical URL points at the production origin while the page is
  served from `127.0.0.1`. Set `NEXT_PUBLIC_SITE_URL` and it scores 100.
- **CLS 0.003** — effectively zero. Every image and the map iframe have explicit
  dimensions.
- **Mobile performance misses the ≥95 bar** (median ~85). See below.

### On mobile performance

Real, unthrottled: **FCP ~200ms, LCP ~380ms**. Lighthouse's mobile score comes
from a *simulated* mid-tier Android on 4G with a 4× CPU multiplier, and under
that model the remaining cost is almost entirely Style & Layout across ~1,850 DOM
elements — not network, not JavaScript.

What was already done to close the gap: CSS inlined (removed the only
render-blocking request), product cards converted to server components (TBT
250ms → 160ms), quick view scoped to the best-sellers grid, `content-visibility`
on sections (FCP 2.3s → 1.7s), rails capped, `text-wrap: balance` scoped to
headlines, per-locale font loading, and the Arabic font reduced to its Arabic
subset.

What would close the rest is content volume, which is a client decision rather
than an engineering one: fewer product cards per rail (`RAIL_LIMIT` in
`components/sections/FullRange.tsx`), or moving a section such as the Instagram
strip or the 58-wilaya accordion off the homepage. Each rail item is ~35 DOM
nodes; dropping the three rails to four cards each is worth roughly 8 points.
