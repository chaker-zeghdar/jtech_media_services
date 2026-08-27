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
| `--color-gold`       | `#E1AA4D` | Fills, shapes, badges                      |
| `--color-gold-light` | `#F0C46F` | Hover, gradient stop                       |
| `--color-gold-deep`  | `#C48F35` | Gradient stop                              |
| `--color-gold-tint`  | `#FCF7EB` | Hover beds                                 |
| `--color-gold-text`  | `#8A6524` | Gold **text** on light backgrounds         |
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
= `#F3EFE9`), `gray-700` drops to 4.43:1 and misses AA at 12px. Micro-labels that
can sit over a tint — the product card's brand line — use `text-ink/70` (~5.8:1
on white, gray and tinted beds alike).

The same trap applies to *surfaces*, not just text: `<ProductCard>`'s image bed is
`gray-50` by design, which disappears entirely on a `gray-50` section and leaves
the cards looking like images floating with no container. Sections with a gray
background pass `bed="white"`. Check this whenever a section's surface changes.

And `--color-green` is an **in-stock dot colour, not a text colour**: `#2FBF6B`
on white is 2.4:1. `StockDot` is correct because the dot is green while the label
beside it is gray-700.

### The gold contrast rule — the one that gets broken

`#E1AA4D` on white is **2.09:1**. That fails WCAG AA for text by a wide margin.
So:

- **Gold is a fill and shape colour on light backgrounds. Never a text colour.**
- Gold text on white uses `--color-gold-text` (`#8A6524`, 5.3:1) → `text-gold-text`.
  It also clears AA on `gray-50` (4.9:1) and on `gold-tint` (5.0:1).
- On the ink surface (`#1D1D1F`), `#E1AA4D` text measures 8.1:1 and is correct —
  `text-gold` is right there and nowhere else.

`Button` encodes this in its `surface` prop (`light` | `ink` | `gold`) rather
than leaving it to the call site: the `link` tier resolves to `text-gold-text` on
light and `text-gold` on ink. Use the prop instead of hand-picking a colour.

### Text on the gold panel is solid ink — no alpha

The panel is a gradient, and its deepest stop is `#C1862C`. Solid `#1D1D1F` on
that measures 5.4:1, but `text-ink/70` measures **3.3:1** — so any alpha at all
fails somewhere along the gradient. Hierarchy on the panel comes from size and
weight, never from opacity. (This is also what the brief asked for: "Text on it
is always `#1D1D1F`".)

Worth knowing: axe and Lighthouse **cannot** evaluate contrast over a CSS
gradient — they report it as incomplete and skip it. A 100 accessibility score
does not mean the gold panel was checked. It was checked by hand.

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

One family per script, many sizes. No mono, and no display face — with exactly
one recorded exception, the hero headline (below).

The system stack is listed **first** on purpose: on the client's Mac and iPhone
the page renders in real SF Pro / SF Arabic with zero font requests, which is
most of the Apple feel for free. `Inter` and `IBM Plex Sans Arabic` load via
`next/font/google` (self-hosted at build) as the fallback for everyone else.

`--font-ui` resolves per locale from `html[lang^='ar']`, so no component ever
needs to know which script it's rendering — `font-sans` is always correct.

| Role               | Utility            | Size        | Weight | Tracking  | Leading |
| ------------------ | ------------------ | ----------- | ------ | --------- | ------- |
| Hero display       | `text-hero-display`| 24–136px    | 900†   | `-0.035em`| 0.94    |
| Hero               | `text-hero`        | 40–80px     | 600    | `-0.02em` | 1.05    |
| Section headline   | `text-section`     | 32–56px     | 600    | `-0.015em`| 1.07    |
| Big spec numeral   | `text-numeral`     | 44–80px     | 600    | `-0.02em` | 1       |
| Subhead            | `text-subhead`     | 21px        | 400    | 0         | 1.4     |
| Body               | `text-base`        | 17px        | 400    | 0         | 1.6     |
| Caption            | `text-caption`     | 12px        | 500    | `.01em`   | 1.4     |

Headline steps are fluid (`clamp()`), so there are no per-breakpoint font-size
overrides anywhere in the codebase.

**† The one display-face exception.** `text-hero-display` is used by a single
element — the hero headline — and nothing else may adopt it. It is still Inter,
not a fourth family; what makes it a display step is the combination the text
steps deliberately never reach for: weight 900 (the top of Inter's variable
range), leading below 1, and tracking nearly double the next-heaviest step's.
That is a deliberate bend of the rule above, taken so the hero can carry the
reference design's oversized opening, and it is confined to one element so the
rest of the page still holds the line.

Arabic opts out of all three parts of it at the call site, and this is not a
detail to "tidy up" later:

- **Weight** — IBM Plex Sans Arabic ships up to 700. Asking for 900 gets a
  synthesised faux-bold that smears the joins, so RTL takes 700.
- **Tracking** — Arabic is a joined script. Negative tracking pulls the
  letterforms *apart* at the connections rather than tightening the line, so RTL
  takes normal tracking.
- **Leading** — 0.94 clips the taller Arabic ascenders, so RTL takes 1.12.

The size is bounded by a hard requirement, not by taste: **the headline sets on
one line at every width**, in all three locales. The binding case is the longest
locale against the card's inner width, and the awkward point is 640px, where the
container and card paddings both step up and the inner width drops 48px for one
extra pixel of viewport. Clear that step and nothing wraps from 320px up.

One line is also what makes this step font-swap-proof. Earlier revisions wrapped
to two or three lines and needed `em` width caps to keep the line *count* stable
between the fallback and the loaded face; with one line there is no second line
for the two faces to disagree about, and the caps are gone. The copy is written
to that constraint — if a future headline is long enough to wrap, the constraint
is the copy, not the clamp.

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

## 2b. Anchored sections

`--nav-offset` (in `globals.css`) is how far an anchored section clears the top
of the viewport, and it is applied as `scroll-margin-top` on `section[id]`.

**Do not also set `scroll-padding-top` on `html`.** `scroll-padding` on the
scrollport and `scroll-margin` on the target both apply and they *add* — carrying
both offset every anchor by twice `--nav-offset` (measured: 176px instead of 88px)
and dropped each section well below the nav. The per-target margin is the precise
mechanism, so it is the only one.

A deep link also needs `<HashAnchorFix />` (mounted in the locale layout): the
browser scrolls the moment it parses the target, before fonts swap, before lazy
images decode and before `content-visibility` sections above it render for the
first time. All of that grows the document underneath the landing position. The
component re-lands the target on the next paint and again on `load`, and abandons
the second correction if the reader has already scrolled.

---

## 3. Brand devices

JTECH's graphic language, taken from the client's Instagram. All pure CSS/SVG —
**no image files for decoration**. Each is a real component in `components/brand/`.

| Component          | What it is                                                                |
| ------------------ | ------------------------------------------------------------------------- |
| `<Halftone />`     | Gold dot field, `11px` grid, masked to fade bottom-left, bleeding off a corner. 160–220px. **Never behind text.** |
| `<GoldRibbon />`   | SVG stroke sweeping behind a product and re-emerging. 14–18px, round caps, `gold-light → gold-deep`, draws over 1.2s. No shadow. |
| `<CornerBlob />`   | Flat gold organic shape bleeding off a corner, 30–45vw. No blur, no shadow — the client's shapes are flat. |
| `<GoldPanel />`    | Full-bleed gold gradient (`#F7D98F → #E1AA4D → #C1862C`) with diagonal light rays. Text on it is always **solid** ink — see below. |
| `<Swash />`        | 56×4px bar, radius 2px, 20px under every section headline.                 |
| `<NumberedSquare/>`| 40×40px, radius 12px, gold fill, ink numeral 15px/700.                     |
| `<Pill />`         | `ink` (black bed, white text) or `gold` (gold bed, ink text). 12px/600.    |

### Colour swatches are a summary, not a picker — except inside checkout

`<ColourSwatches>` on a product card, and the plain colour dots inside
`<QuickView>`'s detail view, both answer "what colours does this come in?"
before a click. Neither has state or a click handler — until the checkout
pass, nothing on the page had anywhere for a selection to GO, so adding one
would have been a second mechanism with no job to do.

The dots are `aria-hidden`; the accessible content is the list around them — an
`aria-label` carrying the count and one `<li>` per colour with a visually-hidden
label. Colours past the fifth still get their `<li>` and their name, only the dot
is dropped, so the spoken list matches the count instead of stopping at five.
Colour is never the only signal, exactly as for `StockDot`.

Every `background-color` reads from `variant.colour.hex`. The component defines no
colour literal, and neither should anything else outside `content/products.ts`.

**`<CheckoutView>`'s own swatches are real.** They're a different component
(`components/ui/CheckoutView.tsx`), not `<ColourSwatches>` with a handler bolted
on — the summary component's whole contract is "no state," so a picker earned
its own markup rather than quietly breaking that contract. Selecting a colour
resolves the exact variant (`lib/product.ts → resolveVariant`) and, if that
colour comes in more than one storage, narrows a second picker to just the
storage options that colour actually ships in — a variant is one SKU the shop
stocks, not an independent colour × storage grid, so the storage picker can
never offer a combination nobody sells. Built as a plain `role="group"` of
`aria-pressed` toggle buttons rather than `role="radiogroup"` / `role="radio"`:
the full ARIA radio pattern requires roving tabindex and arrow-key navigation
between options, and a subtly incomplete version of that contract is worse than
not claiming it. The delivery-method pair beside it (desk/home) uses real native
`<input type="radio">` instead, because that ARIA contract comes free from the
browser and a two-option text pill styles cleanly as one.

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

> **`GoldPanel` is currently unused.** It was the delivery section's full-bleed
> moment; that block was removed from the page, so nothing renders it today. The
> component, `content/wilayas.ts` and the `delivery` message namespace are all
> intact — they are the raw material for a `/delivery` page if one is ever built,
> not dead weight to clear out. The one-panel-per-page cap below still stands and
> is simply unspent.

`GoldPanel` and the hero card are the two exceptions to the 12% rule. Everything
else stays well under, which is what makes those two moments land.

The hero is a **surface, not a device** — `--gradient-hero`, full-bleed, running
`--color-gold` at the top edge through `--color-gold-light` at 25% to
`--color-gold-tint` at 50%. Three stops rather than two on purpose: the middle
one is what makes it descend in visible stages instead of reading as one flat
blend.

The final stop sits at **50%, not 100%** — the pale end arrives at the middle of
the hero and the bottom half rests on it, rather than the gold thinning out all
the way to the fold. CSS holds a final stop's colour past its position, so that
one number is the whole control.

It shares `--color-gold` with `GoldPanel` and stays distinct from it because it
is a **fade, not a fill**: the saturated end is confined to the top ~10% and is
gone by a quarter of the way down, so Delivery still owns the page's one
saturated gold moment.
That is the line to hold if this is ever revisited — a hero that stayed gold all
the way down would take the panel's job.

Because it is a surface, it does not spend the hero's device budget — the hero
still carries exactly one `GoldRibbon` and nothing else.

### The category rail carries its own gold

`<Categories />` has no named device, and the table above records why: the cards
carry the brand themselves. Where exactly has moved twice, so it is worth being
explicit about where it lives now.

The cards are built to the apple.com/store rail — large name, one line of detail,
product filling the lower half. They alternate two faces by index, **gradient,
gray, gradient, gray, gradient**, from parity rather than a hand-picked list, so
a sixth category keeps the rhythm on its own:

| Face       | Fill                        | Text                          |
| ---------- | --------------------------- | ----------------------------- |
| `gradient` | `--gradient-category-card`  | solid ink, title and tagline  |
| `gray`     | `--color-gray-50`           | ink title, `gray-700` tagline |

Those gradient faces **are** the section's gold. Earlier revisions put it in a
gold icon chip, then in a gold count eyebrow; both are gone, and the card is down
to name, tagline and product. If the faces ever flatten to plain white, this
section loses its brand presence entirely — that is the thing to notice before
changing them.

`--gradient-category-card` is the same three tokens in the same order as
`--gradient-hero`, deliberately: one gold descent recipe for the site. Only the
spread differs, because a ~380px card compresses the hero's stops into a hard
band. Everything on that face is solid ink for the usual reason — `gray-700`
measures 2.46:1 against the gold end.

**The section is `white`, and that follows from the cards.** One of the two faces
is `gray-50`, which is what this section's surface used to be; gray-on-gray left
those cards with no edge and they read as loose text floating on the page. The
alternation rule still holds: hero (gold fade) → this → featured (ink).

The reference floats its arrows over the cards. That part is deliberately not
copied: three other sections already use `<Carousel />`'s arrows-below idiom, and
a second carousel control on one page would be two answers to one question.

### Anything sitting on the gold end must be ink — including the chrome

All hero text is solid ink for the same reason the panel's is (see "Text on the
gold panel is solid ink"). What the full-bleed gradient added is that the
**header now sits on the most saturated part of it**, so the rule reaches past
the section and into the chrome:

| On `--color-gold` | Ratio    | Verdict            |
| ----------------- | -------- | ------------------ |
| ink               | 8.06:1   | the only safe text |
| `gray-700`        | 2.46:1   | fails AA outright  |

`<Header />` therefore switches its category links **and** `<LocaleSwitcher />`'s
inactive labels from `gray-700` to ink in the over-hero state. That is not
styling polish; without it the nav fails AA on first paint.

The logo mark is the same problem in a different form. It is gold, and gold on
gold is *invisible* rather than low-contrast — a visibility failure, not a
contrast one, which is why the "the mark is a shape, so the gold contrast rule
doesn't apply" note in `LogoMark.tsx` stops being true on a gold surface. The
header passes `markTone="current"` and drives the fill from the link's own
colour, rather than overriding it through `className`, which §7 forbids.

### The chrome sits on the card, and has two states

There is no announcement bar. Everything it carried moved somewhere better —
phone and WhatsApp into `<Header />` (and `<MobileMenu />` below `sm`, and into
`<SocialFab />`'s phone pills now that `<MobileOrderBar />` is gone), the
locale switcher into `<Header />`, and the delivery and cash-on-delivery
promise into the hero's own subhead, where it is a sentence
rather than 12px of chrome. The page now opens on the hero card itself.

The card is pulled up by `--header-height + --nav-height + 2px` so it starts at
the very top of the page, and the chrome floats over its blank top band. The
`+2px` is the two 1px hairlines those bars carry, which the height tokens don't
count. That band is `--hero-card-top`, declared once and used twice — as the
card's top padding and as the height of the sentinel both bars observe. Split
them and the bars would change state at an offset that no longer matches the
design.

`<LocalNav />` is **hidden for the whole hero**, and renders nothing at all off
the homepage. It is a secondary jump nav for a long page, not a permanent
fixture, and it must not compete with `<Header />` for the "first thing you see"
role — the reference has a single nav row on the gradient, and a second bar
pinned under the first is what reads as two navbars.

It is deliberately **not** tied to the header's own threshold. The header only
has to stop being transparent once copy reaches it, about 40px of scroll;
revealing the jump nav there meant a second bar appeared almost immediately and
then sat under the header for the entire rest of the hero. `useHeroPassed()`
watches `#hero` itself, so it appears exactly when the next section begins —
which is also the first moment its links are of any use.

It keeps its 48px of flow height in both states: collapsing the height is the
obvious way to hide it and the wrong one, because the document would shift 48px
each way as it came and went. `visibility` also takes it out of the tab order and
the accessibility tree while hidden, so no focusable links sit behind the hero.

Off the homepage it returns `null` outright — every entry is an in-page anchor
into a homepage section, so on `/categories/<slug>` the whole bar would be links
to elements that do not exist.

`<Header />` therefore has two paint states, driven by `<HeaderShell />` — the
only client code in the header, a wrapper so `<Header />` itself stays a server
component. Both bars read the same rule, `useOverHero`, so they cannot disagree
about where the hero ends:

| State       | When                                    | Paint                          |
| ----------- | --------------------------------------- | ------------------------------ |
| `over-hero` | the header has nothing but card behind it | transparent, no hairline       |
| default     | anything below that                     | white + `--color-gray-300` hairline |

Three things about it are load-bearing:

- **`border-b` is present in both states**; only its *colour* changes. Toggling
  the border itself moves the whole page by 1px each way.
- **The threshold is geometry, not a scroll number.** An IntersectionObserver
  watches the card's blank top band with the header's own height as a negative
  root margin, so the switch lands exactly where content would slide under an
  unbacked bar — and survives any change to the announcement bar's height, the
  card's padding, or the chrome's.
- **The server renders `over-hero`**, because that is correct at scroll 0 and the
  alternative flashes a white band across the card. `@media (scripting: none)`
  in `globals.css` puts both bars into their scrolled appearance where that state
  could never be left.

The header stays `sticky` in both states. The reference design's nav scrolls away
for good; on a page this long that is the part not worth copying.

| Section              | Surface      | Device                        |
| -------------------- | ------------ | ----------------------------- |
| Hero                 | gold fade    | `GoldRibbon` #1 of 2          |
| Categories           | white        | — (gold gradient card faces)  |
| Featured             | gray         | `GoldRibbon` #2 of 2 — spent  |
| Why JTECH            | white        | `NumberedSquare` ×4           |
| Our phones           | gray         | `GoldOrb` #1 of 3             |
| Our laptops          | white        | `CornerBlob` @ `.08`          |
| Accessories          | gray         | `Halftone`                    |
| Services             | white        | `CornerBlob` @ `.08`          |
| Contact              | white        | `GoldOrb` #2 of 3             |
| Footer               | ink          | `Halftone` @ `.2`             |

**No two adjacent sections share a surface.** That alternation is what gives the
page its rhythm, and it is easy to break by inserting a section without checking
its neighbours — the table above is duplicated as a comment in
`app/[locale]/page.tsx` for exactly that reason.

Hard caps: **two ribbons per page**, **two full-saturation blobs per page**
(both currently spent on the panel and the hero), **one gold panel per page**,
**up to three `GoldOrb`s per page** (two spent: `OurPhones`, `Contact`).

### The one soft shape — `<GoldOrb />`

Every other gold shape in this system is **flat by design**: `CornerBlob`'s own
comment says so, and it was correct — the client's Instagram shapes were solid
fills when it was written. Their current posts are not. They are built on soft,
glossy gold: blurred bokeh circles and a glowing ring. `<GoldOrb />` is the one
piece of the system that answers that, and it is capped at one per page for the
same reason the panel is: a soft glow reads as a considered accent exactly once,
and as atmosphere the second time.

Two are spent. `OurPhones` — a phone on a soft gold glow is what the posts
themselves show. `Contact` — which was documented as deliberately device-free,
and correctly so while it followed the full-bleed gold delivery panel; with that
panel gone the page ended on plain white, and the orb is what replaces that
weight. `OurLaptops` between them deliberately keeps a flat `CornerBlob`: a third
glow that close would read as clutter.

The cap is three, not a target. A section already has exactly one device, so a
further orb does not get *added* — it displaces whatever that section already
has, and that trade has to be worth making.

| Prop      | Range / values                 | Note                                  |
| --------- | ------------------------------ | ------------------------------------- |
| `corner`  | logical, as `CornerBlob`       | `start`/`end` mirror in RTL           |
| `size`    | 260–420px                      | diameter                              |
| `opacity` | .4–.6                          |                                       |
| `variant` | `circle` \| `ring`             | the bokeh, and Post 3's glowing halo  |

Two rules travel with it:

- **Never behind text**, the same rule `Halftone` follows and for a stronger
  reason — a blurred gradient makes the backdrop under any line unpredictable,
  so nothing on top of it can be contrast-checked at all.
- **Never behind a product.** §7's "no glow or halo behind products" is still the
  rule; this is scoped beside it, not a repeal of it. In `BrandMarquee` the orb
  sits in the corner gutter and must not drift under `SlideBanner`'s panels.

It does **not** deprecate the flat devices. `CornerBlob` and `Halftone` remain
the default everywhere else; this is the one soft shape, in one section.

### The gold pill word-highlight

An inline `bg-gold` + ink pill behind ONE emphasised word or phrase inside a
headline — the text-highlight the client's posts use. Typography, not a
positioned shape, so it is **not** subject to the one-device-per-section budget.

It inverts the gold contrast rule, which is worth stating because §1 says the
opposite for the ordinary case: brand gold is 2.1:1 as *text* on a light surface
and must be `--color-gold-text`. As a *background* it is fine, and ink on it
measures 8.06:1 — so the pill is bare `bg-gold` with ink text on it.

Two call sites, and that is the budget: `WhyJtech` (its existing `goldPhrase`)
and `FeaturedProduct`'s headline. Both go through `t.rich()` with `<em>` in the
message, so the accented word travels with the sentence per locale instead of
being positional. Always carries `box-decoration-clone`, or the pill loses its
rounding and padding on the second line when the phrase wraps.

### The white feature chip

`<FeatureChip />` — the glassy white capsule the client's posts use for stats and
feature callouts. A checkmark or icon, optionally one short line, on white with
`shadow-card`. Not a brand device and not budgeted: it is a card element, the
same way `<Pill/>` is.

The shadow is **structural, not decoration**. Every call site so far sits on a
white `<Card/>`, so white-on-white means the shadow is the only thing separating
the chip from its background — drop it and the chip disappears.

Its icon is `--color-gold-text`, never brand gold (2.1:1 on white). That is also
the only gold left on a Services card, which is worth knowing before removing it:
unlike the category cards, the chip there was never the section's brand carrier —
Services has its own `CornerBlob @ .08` — so the swap from a gold square to a
white chip cost the section nothing.

`rounded-full` rather than a sixth radius. Icon-only it reads as a disc and
matches the header's contact buttons and the hero's social chips; labelled it
reads as a pill.

### The labelled phone pill — `<SocialFab />`'s department lines

Same white-`shadow-card` disc as the plain social icon circles beside it, just
wide enough to carry an icon and a short label ("واتساب", "تصليح", "سبونسور")
instead of being icon-only — the one case in this file where a circle grows
into a pill because the content genuinely needs a visible number's context, not
for decoration.

### Diagonal section boundaries — `.diagonal-end`

A block that carries `.diagonal-end` finishes on an angle instead of a flat
horizontal line, so the surface below reads as cutting into it. `clip-path` on
the real box, not a rotated pseudo-element: nothing overflows, and there is no
second element whose background has to be kept in sync with its parent's.

The angle is `4vw`, a constant **slope** rather than a constant height — a fixed
px cut looks steep on a phone and nearly flat on a desktop. Anything inside needs
bottom padding clearing the deepest point, and a radius on the cut corner fights
the cut, so `rounded-b-none` goes with it. Mirrored under `[dir='rtl']` so the
cut runs with the reading direction.

Used **once**: the `featured` spotlight's ink block, where it meets the rail
below. That is the only boundary on the page where one surface genuinely becomes
another — everywhere else, sections simply sit next to each other, and cutting
those would be decoration.

### The colour-swap accent

The lighter-weight sibling of the gold pill: one phrase inside a headline or
subhead changes **colour** instead of gaining a filled background. Same `t.rich()`
+ `<em>` call-site pattern, so the accented phrase still travels with the
sentence per locale.

| Use | When |
| --- | ---- |
| gold pill | the phrase is the point of the sentence, and nothing else nearby is competing |
| colour-swap | the section already carries a loud gold element, or the text is a subhead rather than a headline |

Never both in one headline. `phones` is the worked example: it already carries a
`GoldOrb`, so its subhead colour-swaps to `--color-gold-text` (~5.2:1 on gray-50)
rather than adding a second filled gold shape to the same viewport.

`<SectionHeader />`'s `subhead` takes a `ReactNode` for exactly this.

### The connector-line list

Used where a section's items are a **sequence or an argument**, not a catalogue:
a thin hairline runs down the list with a marker on it at each item, so the eye
reads top to bottom instead of treating the items as interchangeable.

- `WhyJtech` — asymmetric: a short intro column beside the stacked reasons. The
  `NumberedSquare` device moved onto the line as each step's marker rather than
  floating inside a card; a numeral in the card *and* a dot on the line would
  have been two markers for one step.
- `Services` — the same pattern in two columns, because each item carries a price
  row and a CTA and would run very long in one.

Both replaced four equal-width cards in a row. That shape is right for a product
rail and wrong for four claims: it says "here are four interchangeable things",
which is the opposite of what an argument needs. The marker needs a solid
background so it masks the line behind it — otherwise the hairline runs *through*
the numeral instead of between the steps.

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
| `BrandMarquee`   | 45s linear conveyor, CSS only                   | 0 KB JS   |

### Above the fold uses `Enter`, below the fold uses `Reveal`

The hero headline is the LCP element. Gating it behind an IntersectionObserver
would hold LCP until hydration finished, which the 2.5s-on-4G target can't
absorb. `Enter` and `StaggerText` are therefore **server components** driven by
pure CSS animation, and the hero ships no client JS for its own motion.

### Reveal fails safe

`<Reveal />` renders with **no** `.reveal` class on the server, so the HTML is
visible as delivered. It adds the class (and therefore `opacity: 0`) on mount,
and only if the element is still below the fold — where hiding it is
imperceptible.

There are four separate ways a scroll reveal can strand content permanently
invisible, and all four are handled:

1. **JS never runs** (error, failed hydration, scripting disabled) → the class is
   never added, so the content is simply visible.
2. **No `IntersectionObserver`** → shown immediately.
3. **The reader lands mid-page** — a deep link, or a restored scroll position — so
   sections *above* them never intersect and never fire. `Reveal` checks for
   `rect.bottom <= 0` on mount and shows those without animating. This is the one
   that is easy to miss, because it only reproduces on a deep link.
4. **`prefers-reduced-motion`** → shown immediately; nothing is hidden at all.

The observer also uses `rootMargin: '0px 0px -10% 0px'` so elements commit
slightly *before* entering, which stops a fast scroll outrunning it and leaving a
band of the page blank.

Verified by scrolling top→bottom in 1.5-viewport jumps and back: zero elements
left at `opacity: 0`. Don't reintroduce an `opacity: 0` default.

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
  `<ProductDialogTrigger />` is a client island — the "learn more" and "order"
  links, plus the single lazily-mounted `<QuickView />` dialog behind both of
  them (was `<QuickViewTrigger />`, one link and one dialog mount; the checkout
  pass gave "order" a real destination in the same dialog instead of a
  WhatsApp deep link, so it needed the same island). Making the whole card a
  client component cost ~80ms of Total Blocking Time for one boolean per card.
- **Sections carry `content-visibility: auto`** via `.defer-offscreen`, so the
  browser skips style, layout and paint for sections still below the fold. This
  moved First Contentful Paint 2.3s → 1.7s and Speed Index 3.1s → 1.7s under
  simulated mobile throttling. `contain-intrinsic-size: auto 900px` keeps the
  scrollbar stable, and CLS stayed at 0.003.
- **The rails are capped** (`RAIL_LIMIT`, and `.slice()` in the best-sellers and
  accessories sections). The content layer holds the full catalogue; the homepage
  shows a subset, because every extra card is ~35 DOM nodes of layout work.

### The product card, sized down

`lib/rail.ts → RAIL_ITEM`/`RAIL_SIZES` shrank ~12% at every breakpoint alike
(`290px → 256px` at `xl`, the rest scaled the same ratio) — a "smaller, more
premium" card is a proportional shrink of the whole rail, not just the fixed
desktop step, or the card would visibly jump in scale at one breakpoint.

The name dropped from `text-h3` (22–28px fluid) to `text-subhead-sm` (a FIXED
19px) — deliberately fixed rather than another fluid step: a calmer, smaller
card is exactly the case where a size that stops growing past a certain
viewport reads as more controlled than one that keeps scaling with it. Its
two-line floor was re-measured against the new size and leading the same way
the original floor was measured against `text-h3` (§1's methodology, not a new
one) — `3.4375rem`, 2 × the real rendered 27.5px line box. Caught while
measuring: `leading-tight` was still attached from the `text-h3` version, where
it was a harmless duplicate of that token's own 1.25 leading; under
`text-subhead-sm` (1.45) it silently overrode the token's real leading down to
1.25. Removed — a size step's own leading should win over a generic utility
sitting next to it, and this is the reason to actually measure the rendered
value rather than compute it from the token alone.

The image bed's padding came down `p-8 → p-6` with it, and the spec-value
hover pills (`48MP` / `A18 Pro`, fading in along the bed's bottom edge) were
cut outright rather than shrunk — at the smaller footprint they landed at the
exact moment the bed is already tinting gold and the product is already
lifting and rotating, and a fourth thing fading in read as busy competing for
attention, not as a fourth premium beat. The remaining three-beat hover
choreography (bed tint, light sweep, lift+rotate) is unchanged.

#### The card grew a filled button, reversing its own rule

The card shipped on an explicit rule: **no solid button on the card face**, two
text links only, with the filled button reserved for the featured block and the
sticky mobile bar so that it kept meaning something. That is now reversed, at
the client's request and matching the reference they sent. The reasoning that
justified it stopped holding once checkout existed: ordering meant picking the
quieter of two identically-weighted links, opening a dialog, and only meeting a
button there — three steps to begin a purchase, on a shop whose traffic is
almost entirely mobile.

What keeps the filled button from becoming wallpaper is that scarcity moved from
the page down into the card. It is the only filled thing on a card, and "learn
more" was demoted from an equal text link to a 36px `expand` icon button beside
it — the same disc treatment `<Carousel />`'s arrows already use, rather than a
fourth circular style. Two links of equal weight asked the reader to choose; a
button plus an affordance tells them which one is the point. Order comes first
in the DOM, so Tab reaches the primary action first.

The badge moved off its own reserved row and onto the image bed's top-start
corner (`absolute start-3 top-3 z-20`), which is where most of the height came
from. It sits **outside** the transform wrapper deliberately: the product lifts
and rotates on hover, and a label describing the product must not travel with
it. `z-20` clears both the product (`z-10`) and `.light-sweep`'s pseudo-element,
which carries no z-index of its own. Its one-badge cap is unchanged — stacked
badges over a photo read as a rendering fault.

Measured, not estimated: **591.59px → 557.59px, −34px (−5.7%)** at `xl`. The
badge row was −36 (24px + 12px margin), spacing tightening another −18
(`mt-5→mt-4`, `mb-3→mb-2.5`, `pt-4→pt-3`, `mt-5→mt-3`), and the action row gave
+20 back (16px of text links → a 36px button row). The image bed is 320px of the
remaining 558 — dropping its `aspect-[4/5]` is the only large lever left if it
ever needs to be shorter again.

Both reserved-space floors were re-measured against this layout rather than
carried forward. The tagline's is exact (`text-sm` → a 21px line box → `42px =
2.625rem`). The name's was not: `text-subhead-sm` renders a **27.55px** line
box, so two lines is `55.10px`, and the old `3.4375rem` had rounded that down to
55px — which left a two-line name sitting 0.1px proud of the floor meant to
contain it. Now `3.4438rem`. Sub-pixel, but a floor that doesn't cover its own
worst case isn't doing the job it exists for.

### The detail view's photo gallery

`<ProductGallery />` replaced the detail view's single `variant.images[0]`. One
image per slide with dot indicators — **not** `<Carousel />`, which is a
multi-item rail with arrows and a continuous progress bar. A gallery is one
full-bleed image and a discrete "3 of 4"; sharing the component would have meant
threading a mode flag through arrows, progress bar and item widths alike.

The *mechanism* is shared rather than reinvented: the same `.snap-rail` native
scroll-snap, no transform track and no drag library, and the same RTL handling
(`scrollLeft` runs negative from the origin, so position reads from its
magnitude and `scrollTo` sign-flips off the computed direction).

The dots read the scroll position rather than driving it — `active` is derived
in the scroll handler from where the rail actually is, the same way
`<Carousel />` derives its progress bar. Clicking a dot scrolls the rail; the
rail scrolling is what updates the dot. State set on click instead would drift
the moment someone swiped. Each dot is a real button with its own label, and the
24px target is padding around a much smaller visual dot.

It collapses to a plain static frame at `images.length <= 1` — gallery chrome
around a single photo, or worse around the branded empty state, is navigation to
nowhere. That is still most of the catalogue.

### Checkout lives inside `<QuickView>`, not a second dialog

`components/ui/CheckoutView.tsx` + `components/ui/OrderConfirmation.tsx` are
two more views `<QuickView>` can show, switched to by
`<ProductCard>`'s "order" link (straight to checkout, skipping detail) and by
the detail view's own order button (in place, no close/reopen) — see the
accessibility-contract bullet above for how the shared dialog handles that.
Reusing the one dialog shell rather than building a second is both the
simpler implementation and the intended feel: one continuous panel, not a
stack of popups.

**Variant resolution.** A product's `variants` are not an independent colour ×
storage grid — each one is a SKU the shop actually stocks. `lib/product.ts`'s
`variantsForColour`/`resolveVariant` are what keep the storage picker from
ever offering "black, 256GB" when only "black, 512GB" is a real row in
`content/products.ts`.

**The fee calculator is real data, not a placeholder.** `content/wilayas.ts`'s
58 rows and their `deskFee`/`homeFee` were written for exactly this — see its
own comment. `lib/format.ts → pickWilayaName` picks `nameAr`/`nameFr`; English
falls back to `nameFr` (Algerian wilayas have no distinct English exonym, and
French is the conventional way they're referred to in mixed French/English
contexts) — a deliberate call worth knowing was made on purpose, not a gap.

**This is UI only.** `CheckoutView.handleSubmit` validates, builds a local
snapshot, and hands it to a state setter — no `fetch`, no `whatsappLink()`, no
persistence. The submit function itself is commented `PHASE 3 (not built
yet)` at the exact line a real backend call replaces. `<ProductCard>`'s
"order" link is the one CTA on the page that no longer deep-links to
WhatsApp on click — every other contact point (`<Header>`, `<MobileMenu>`,
the featured spotlight) still does.

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
- **One dialog, three views, one accessible name that keeps up.** `QuickView`
  switches between a detail view, a checkout view and a confirmation view
  in place, so `aria-labelledby` can't point at a fixed element — whichever
  view is showing renders ITS OWN heading at the shared `titleId`, so the
  dialog's accessible name always resolves to real, currently-visible text.
  Switching views also moves focus to that heading (`tabIndex={-1}`, so it's
  reachable programmatically without joining the Tab order) and resets the
  dialog's scroll to the top — the element that was focused a moment ago may
  not exist in the new view, and a silently unfocused `<body>` is a lost place
  for a screen-reader user. That focus move is skipped on the dialog's own
  initial open, which already has its own rule (first focusable element, i.e.
  the close button) and would otherwise fight this one for where focus lands.
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
4. Alternate the background against BOTH neighbours — no two adjacent sections
   share a surface. Then check any `<ProductCard>` inside it still has a bed that
   contrasts (`bed="white"` on a gray section).
5. Use `<Reveal>` for entrance motion, not `<Enter>` — `Enter` is for above the
   fold only.
6. If it appears in the sticky nav, add its id to `LOCAL_NAV_IDS` **in document
   order**. (`LocalNav` resolves the active entry from real DOM position, so a
   wrong order won't break the highlight, but the nav should still read top to
   bottom.)

## 7. Don't

- No component library, no template.
- No glow or halo behind products — the ribbon replaces it. **One scoped
  exception:** `<GoldOrb />`, up to three per page, in a section's corner gutter.
  It is never behind a product or behind text. See "The one soft shape" in §3;
  this is scoped the same way §1 scopes the hero headline's display face, rather
  than left contradicting the code.
- No gradient text, no gradient buttons, no animated gradients.
- No shadows on gold shapes.
- No gold text on white below 24px — use `text-gold-text`.
- No two brand devices in one viewport.
- No glassmorphism, no neon, no dark-mode toggle.
- No `left`/`right` in layout CSS. **One scoped exception:** `<SocialFab />`,
  the floating social widget, is pinned to the physical `right-*` corner and
  does not mirror under Arabic. Floating support widgets are a convention people
  navigate by physical position — Intercom, Crisp, apple.com/store's own — and a
  control that changes corner when you change language is harder to find, not
  more correct. Scoped to that one element, and it is `verify.mjs`'s only
  expected left/right hit.
- No `any` in TypeScript (ESLint errors on it), no unused dependencies.
- No overriding a component's colour via `className` when it sets its own — pass a
  prop instead. `<Swash className="bg-ink">` leaves both `bg-gold` and `bg-ink` in
  the class list, and which wins depends on stylesheet order, not on the order you
  wrote them. That's a coin flip; `<Swash tone="ink">` is a decision.
