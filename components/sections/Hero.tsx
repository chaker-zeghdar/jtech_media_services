import { getLocale, getTranslations } from 'next-intl/server';
import { GoldRibbon } from '@/components/brand/GoldRibbon';
import { Container } from '@/components/layout/Container';
import { HERO_CHROME_SENTINEL_ID } from '@/components/layout/navigation';
import { Enter } from '@/components/motion/Enter';
import { StaggerText } from '@/components/motion/StaggerText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import { SlideBanner } from '@/components/ui/SlideBanner';
import { featuredProduct } from '@/content/products';
import { settings, whatsappLink } from '@/content/settings';
import { pickLocale } from '@/lib/format';

/**
 * The hero — one inset card holding the whole opening statement.
 *
 * Oversized headline, the product floating on a soft wash with the gold ribbon
 * sweeping behind it, the primary CTA overlaid on the product, and the trust
 * line set as a pull quote.
 *
 * ── The surface is NOT a second <GoldPanel /> ────────────────────────────────
 * `--gradient-hero` (globals.css) runs full gold at the top edge down through
 * gold-light to gold-tint at the bottom. It shares gold with Delivery's panel
 * but stays distinct from it because it is a fade rather than a fill: the
 * saturated end is confined to the top ~15% and is gone by halfway. DESIGN.md
 * allows exactly one full-saturation panel per page and Delivery still has it.
 *
 * All card text is solid ink, for the same reason it is on the gold panel: a
 * gradient makes the backdrop under any given line unpredictable, and at the
 * gold-light end gray-700 measures 3.1:1 while ink measures 10.1:1. Hierarchy
 * comes from size and weight, never from a lighter grey.
 *
 * Brand device: GoldRibbon #1 of 2, unchanged — still this section's one and only
 * device. The card bed is a surface, not a shape, so it doesn't spend a second.
 *
 * Everything animates through <Enter /> / <StaggerText />, both CSS-only server
 * components, so the hero ships no client JavaScript for its own motion and the
 * headline (the LCP element) paints without waiting on hydration.
 */
export async function Hero() {
  const locale = await getLocale();
  const t = await getTranslations('hero');
  const tProduct = await getTranslations('product');
  const tA11y = await getTranslations('a11y');
  // Reuses the alt text <BrandMarquee /> already has for these same four photos.
  const tSocial = await getTranslations('social');

  const product = featuredProduct();
  const name = pickLocale(product.name, locale);

  /**
   * The client's four real channels — matching the reference's four-icon count
   * without inventing an X or Dribbble presence they don't have. WhatsApp leads
   * because it is the actual orders line, not just another profile.
   */
  const socials = [
    {
      key: 'whatsapp',
      icon: 'whatsapp',
      label: tA11y('openWhatsapp'),
      href: whatsappLink(tProduct('generalMessage')),
    },
    {
      key: 'instagram',
      icon: 'instagram',
      label: tA11y('openInstagram'),
      href: settings.socials.instagram.url,
    },
    {
      key: 'facebook',
      icon: 'facebook',
      label: tA11y('openFacebook'),
      href: settings.socials.facebook.url,
    },
    {
      key: 'tiktok',
      icon: 'tiktok',
      label: tA11y('openTiktok'),
      href: settings.socials.tiktok.url,
    },
  ] as const;

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      /**
       * The negative top margin is what puts the sticky chrome ON the card
       * rather than in a bar above it: with <AnnouncementBar /> gone the card
       * now starts at the very top of the page, and <Header /> floats over its
       * blank top band exactly as the reference's nav does. It cancels the flow
       * height of both bars — <LocalNav /> is hidden up here but still occupies
       * its 48px, because collapsing that would shift the document by 48px every
       * time it came and went. The offsets come from the same custom properties
       * the sticky tops are built from, so the card and the chrome cannot drift
       * apart. The +2px is the two 1px hairlines those bars carry: the height
       * tokens describe their content boxes and so don't count borders, and
       * without it the card starts two pixels low and a white sliver shows above
       * it.
       *
       * Only the paint order changes — neither bar is repositioned, and neither
       * stops being sticky. The section is `relative` with no z-index, which
       * creates no stacking context, so the chrome's `z-nav` still wins over the
       * card's internal z-20/z-30 layers.
       */
      className="relative mt-[calc(-1*(var(--header-height)+var(--nav-height)+2px))] flex min-h-hero flex-col justify-center overflow-hidden bg-white pb-10 md:pb-14"
    >
      {/* Full bleed, and no radius. The gradient is the page's opening surface
          now rather than a card floating on white: it runs edge to edge, meets
          the transparent header at the top and the full-bleed proof strip below,
          so there is no corner left where a radius would read as anything but a
          gap. The CONTENT still sits in <Container>, the same column every other
          section on the page uses — full-bleed background, normal content width.
          Same split <SlideBanner /> uses further down.

          `--hero-card-top` is the blank band the chrome floats over; the
          sentinel below is the same height, from the same token. */}
      <div
        className="relative overflow-hidden pb-12 pt-[var(--hero-card-top)] md:pb-16"
        style={{ background: 'var(--gradient-hero)' }}
      >
        {/* The blank strip the header floats over. <HeaderShell /> watches it
            to decide when to stop being transparent — see the note there for
            why the threshold is expressed as geometry rather than a scroll
            number. Purely a measuring device: no paint, no hit area. */}
        <div
          id={HERO_CHROME_SENTINEL_ID}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{ height: 'var(--hero-card-top)' }}
        />

        <Container>
          {/* ---- Copy ----------------------------------------------------- */}
          <Enter>
            <p className="text-center text-eyebrow uppercase text-ink">{t('eyebrow')}</p>
          </Enter>

          {/* ── The headline is the one documented display-face exception ──
              `text-hero-display` (tailwind.config.ts) is Inter at 900 with tight
              leading and heavy negative tracking — the deliberate bend of
              DESIGN.md §1's "no display face", recorded there too.

              This step used to carry a set of Arabic overrides (bold instead of
              900, normal tracking, looser leading) because the headline was
              Arabic copy and Plex Arabic stops at 700 while negative tracking
              pulls a joined script apart. The headline is now the brand name —
              the same Latin string in all three locales — so those overrides
              went with the copy that needed them. See `font-latin` and `dir` on
              the element itself.

              `mt-[0.3em]` rather than a fixed step because leading below 1 lets
              the ink overflow the line box by ~0.15em; at a fixed 16px the
              ascenders touched the eyebrow from 1024px up.

              ── No width caps, deliberately ──
              Earlier revisions capped this in `em` to keep the line COUNT
              font-independent, back when the headline ran to two or three lines
              and the two faces disagreed about where it wrapped. One line is a
              stronger guarantee than any cap was — there is no second line to
              disagree about — and one Latin string in every locale removes the
              last reason a cap existed. The size that keeps it to one line is
              enforced in the clamp. */}
          <StaggerText
            as="h1"
            id="hero-title"
            text={t('title')}
            delayMs={120}
            /**
             * The headline is now the brand name, which is the SAME Latin string
             * in all three locales — so it renders identically in all three, and
             * the Arabic-script overrides that used to live here are gone with
             * the Arabic copy they existed for.
             *
             * NO `font-latin` here, deliberately. It would be a no-op: on the
             * Arabic page `--font-stack-latin` is invalid at computed-value time
             * (it references `--font-inter`, which layout.tsx only defines for
             * the Latin locales), so `.font-latin` silently falls back to
             * inherited. Making it work would mean loading Inter on the Arabic
             * critical path — the exact cost layout.tsx measured at ~1.1s of FCP
             * and rejected. The headline therefore sets in Inter on fr/en and in
             * the system grotesque on ar; both are clean, and neither costs a
             * request. Flagged rather than silently traded away.
             *
             * `dir="ltr"` is not cosmetic. Each word is its own `inline-block`,
             * and bidi treats an inline-block as a neutral object rather than
             * reading the strong-LTR text inside it — without this the Arabic
             * page lays the WORDS out right-to-left and the headline reads
             * "Services Media JTECH".
             */
            dir="ltr"
            className="mt-[0.3em] text-center text-hero-display text-ink"
          />

          {/* Centred with the headline, and deliberately heavier than the plain
              `text-subhead` it was: at 136px the headline was leaving this
              reading as small print under a billboard. `text-h3` + medium puts
              it a clear step below the headline in both size and weight while
              still carrying its own presence, so the pair reads as one block.

              `max-w-[52ch] mx-auto` matters more now than it did left-aligned —
              centring makes ragged line lengths obvious, and the three locales'
              subheads differ in length. The measure keeps all three to a similar
              number of lines instead of one locale running much wider. */}
          <Enter delayMs={260}>
            <p className="mx-auto mt-6 max-w-[52ch] text-center text-h3 font-medium leading-[1.4] text-ink">
              {t('subhead')}
            </p>
          </Enter>

          <Enter delayMs={320} className="mt-6 flex justify-center">
            <Button
              variant="link"
              surface="gold"
              href={whatsappLink(tProduct('generalMessage'))}
              external
            >
              {t('ctaSecondary')}
            </Button>
          </Enter>

          {/* ---- Product stage --------------------------------------------
              The wrapper is `relative` so the CTA can hang off the product box,
              while the social row can still fall back to normal flow below it
              on mobile. */}
          <div className="relative mt-10 md:mt-2">
            <Enter delayMs={160} className="relative mx-auto w-full max-w-hero">
              {/* 16:10 caps the product's rendered HEIGHT — the box the ribbon
                  sweeps behind and the CTA overlays, independent of the source
                  image's own aspect ratio. */}
              <div className="relative aspect-[16/10]">
                {/* No bed and no glow: the product sits on the card's own wash and
                    the ribbon is the only thing behind it. Negative insets let the
                    ribbon bleed past the product and re-emerge on both sides. */}
                <GoldRibbon id="hero" className="-inset-x-10 -inset-y-6 z-10" strokeWidth={16} />

                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <ProductImage
                    /**
                     * A fixed hero-only cutout at /public/hero.png (370×370,
                     * square, four colourways), not the per-variant product photo
                     * — deliberately independent of `product.variants`, so this
                     * stage doesn't change if the featured product's own image
                     * does. Swap the file to change what the hero shows.
                     */
                    src="/hero.png"
                    name={name}
                    width={370}
                    height={370}
                    priority
                    sizes="(max-width: 767px) 45vw, 300px"
                    className="drop-shadow-product"
                  />
                </div>

                {/* ---- Primary CTA, overlaid on the product ---------------- */}
                <Enter delayMs={420} className="absolute inset-x-0 top-2/3 z-30 mx-auto w-fit">
                  {/* Same component, same copy, same destination — only the shape
                      changes, so Button's shared markup stays untouched for every
                      other caller. `pe-2` alongside Button's own `px-6` is safe:
                      they are different properties (padding-inline-end vs
                      padding-inline) and Tailwind emits the longhand after the
                      shorthand, so this is not the coin-flip DESIGN.md warns about
                      for two utilities setting the SAME property. */}
                  <Button href="#range" className="pe-2 shadow-card">
                    {t('ctaPrimary')}
                    <span
                      aria-hidden="true"
                      className="ms-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold text-ink"
                    >
                      <Icon name="chevron" size={16} className="rtl:-scale-x-100" />
                    </span>
                  </Button>
                </Enter>
              </div>
            </Enter>

            {/* ---- Social row -----------------------------------------------
                ONE instance, never duplicated: pinned to the stage's inline-end
                top on md+, and plain flow below the product on mobile. A second
                copy behind a `hidden` class would put every link in the
                accessibility tree twice, and DESIGN.md doesn't allow
                "desktop-only" as a reason to drop functional links. */}
            <Enter
              delayMs={560}
              className="mt-8 flex items-center justify-center gap-2.5 md:absolute md:end-0 md:top-0 md:z-30 md:mt-0 md:justify-end"
            >
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-card transition-colors duration-200 hover:bg-gold-tint"
                >
                  <Icon name={social.icon} size={17} />
                </a>
              ))}
            </Enter>
          </div>

          {/* ---- Pull quote ------------------------------------------------
              Reuses `hero.trust`, the client's own real trust line, rather than
              inventing testimonial copy that doesn't exist. The glyph is
              decorative and aria-hidden, so its low alpha is a decoration
              question, not a text-contrast one; the line itself is solid ink. */}
          <Enter delayMs={620}>
            <figure className="mt-12 flex max-w-[52ch] items-start gap-4">
              <span
                aria-hidden="true"
                className="select-none font-latin text-numeral-sm font-semibold leading-[0.8] text-ink/20"
              >
                &ldquo;
              </span>
              <blockquote className="text-base text-ink">{t('trust')}</blockquote>
            </figure>
          </Enter>
        </Container>
      </div>

      {/* ---- Proof strip -----------------------------------------------------
          Third size pass: stopped nudging the pixel value up inside the centred
          column and gave it what it actually needed — its own full-bleed row,
          the same structural move `BrandMarquee` already uses for these same
          four panels. Outside <Container> on purpose, so nothing here caps its
          width; the mask fade in `.marquee-viewport` handles the edges. */}
      <Enter delayMs={480} className="mt-10 w-full">
        <SlideBanner
          panelClassName="w-48 md:w-72"
          sizes="(max-width: 767px) 192px, 288px"
          // Full-bleed now, so one pass (4 × 288px = 1152px) isn't wide enough to
          // cover a 1920px+ screen without a bare patch — same reasoning
          // BrandMarquee documents for its own reps={2}.
          reps={2}
          // Runs the opposite physical way from BrandMarquee on purpose — a
          // deliberate choice, not the RTL bug the `dir="ltr"` fix above
          // addresses. That fix stays either way: without it this would mirror
          // per locale on top of being reversed, instead of just being reversed.
          reverse
          // Full-bleed spans the whole viewport width, so ":hover" would fire
          // on almost any cursor position while this band is on screen —
          // including while the user is just scrolling past it — which read as
          // the banner randomly freezing. Keyboard `:focus-within` pause still
          // applies; see the prop's own note on <SlideBanner />.
          pauseOnHover={false}
          label={tSocial('marqueeLabel')}
          href="#social"
        />
      </Enter>
    </section>
  );
}
