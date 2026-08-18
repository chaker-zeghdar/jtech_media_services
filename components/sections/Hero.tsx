import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { GoldRibbon } from '@/components/brand/GoldRibbon';
import { Container } from '@/components/layout/Container';
import { Enter } from '@/components/motion/Enter';
import { StaggerText } from '@/components/motion/StaggerText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ProductImage } from '@/components/ui/ProductImage';
import { SlideBanner } from '@/components/ui/SlideBanner';
import { featuredProduct, primaryVariant } from '@/content/products';
import { settings, whatsappLink } from '@/content/settings';
import { pickLocale } from '@/lib/format';

/**
 * The hero — one inset card holding the whole opening statement.
 *
 * Oversized headline, the product floating on a soft wash with the gold ribbon
 * sweeping behind it, a zoomed detail crop pinned to the stage, the primary CTA
 * overlaid on the product, and the trust line set as a pull quote.
 *
 * ── The card's bed is NOT a second <GoldPanel /> ─────────────────────────────
 * `--gradient-hero-card` (globals.css) is a soft wash built from the PALE end of
 * the gold scale — tint through gold-light — precisely so it does not read as,
 * and must not later be "fixed" into, a duplicate of Delivery's full-saturation
 * panel. DESIGN.md allows exactly one of those per page and Delivery has it.
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
  const variant = primaryVariant(product);
  const name = pickLocale(product.name, locale);
  const shot = variant.images[0];

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
      className="relative flex min-h-hero flex-col justify-center overflow-hidden bg-white py-10 md:py-14"
    >
      <Container>
        {/* The inset card. <Container>'s own px-6/px-8 is what floats it off the
            page edges; `rounded-tile` is the largest radius the system has. */}
        <div
          className="relative overflow-hidden rounded-tile px-6 py-12 sm:px-10 md:px-14 md:py-16"
          style={{ background: 'var(--gradient-hero-card)' }}
        >
          {/* ---- Copy ----------------------------------------------------- */}
          <Enter>
            <p className="text-eyebrow uppercase text-ink">{t('eyebrow')}</p>
          </Enter>

          {/* The two width/height caps here are a CLS fix, not spacing taste.
              Both families load with `display: swap`, and IBM Plex Sans Arabic
              is markedly wider than the Arabic system fallback, so at this size
              the Arabic headline set on ONE line pre-swap and two lines after.
              The swap then dropped the product stage and everything under it by
              a full line — 0.035 measured against a 0.004 baseline.

              `rtl:max-w-[7em]` fixes the cause: it makes the line count
              font-independent. The old `max-w-[15ch]` could not, because `ch` is
              itself font-relative — it resolved to 720px under Plex but 675px
              under the fallback, which is exactly what let the narrower fallback
              fit on one line. 7em sits inside the window where BOTH faces wrap
              to two lines (the fallback's natural single-line width is ~8.2em,
              the loaded face's longest wrapped line ~6.3em), and `em` keeps that
              true as `text-hero` scales fluidly. Verified 390–1920px.

              `min-h-[2.1em]` is the belt to that braces: two lines' worth of
              line-height (a 1.05 ratio) reserved so any future rewrap still
              cannot move the stage. It costs nothing visually — Arabic and
              French both set to exactly two lines, English to three, so the
              floor is either exact or inert.

              Latin keeps `ltr:max-w-[15ch]`: Inter's fallback metrics already
              agree closely enough that English and French measured 0.000 and
              0.006, and a fixed em cap there would only narrow the column. */}
          <StaggerText
            as="h1"
            id="hero-title"
            text={t('title')}
            delayMs={120}
            className="mt-4 min-h-[2.1em] text-balance text-hero font-semibold text-ink ltr:max-w-[15ch] rtl:max-w-[7em]"
          />

          <Enter delayMs={260}>
            <p className="mt-6 max-w-[46ch] text-subhead text-ink">{t('subhead')}</p>
          </Enter>

          <Enter delayMs={320} className="mt-6">
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
              The wrapper is `relative` so the detail crop and the CTA can hang
              off the product box, while the social row can still fall back to
              normal flow below it on mobile. */}
          <div className="relative mt-10 md:mt-2">
            <Enter delayMs={160} className="relative mx-auto w-full max-w-hero">
              {/* 16:10 caps the product's rendered HEIGHT, which is what keeps
                  the 520×677 cutout inside its own resolution — see `sizes`. */}
              <div className="relative aspect-[16/10]">
                {/* No bed and no glow: the product sits on the card's own wash and
                    the ribbon is the only thing behind it. Negative insets let the
                    ribbon bleed past the product and re-emerge on both sides. */}
                <GoldRibbon id="hero" className="-inset-x-10 -inset-y-6 z-10" strokeWidth={16} />

                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <ProductImage
                    /**
                     * A client-supplied cutout (520×677), not a hero-resolution
                     * photograph — swap it when real product photography arrives.
                     *
                     * `object-contain` in a 16:10 box makes HEIGHT the binding
                     * constraint: 388px tall renders ~298px wide, well inside the
                     * 520px source. The stage's width is never the rendered
                     * width, so `sizes` declares the ~298px it actually paints at.
                     */
                    src={shot}
                    name={name}
                    width={520}
                    height={677}
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

                {/* ---- Detail crop ----------------------------------------
                    Not a stock photo: a tight zoom of the SAME real cutout,
                    scaled inside an overflow-hidden square so it reads as a macro
                    of the camera module. `object-position` is a physical
                    percentage into the artwork, which is correct — the image
                    itself does not mirror, so its framing must not either. The
                    panel's LAYOUT position is logical (`start`), so the panel
                    does mirror. */}
                {shot ? (
                  <Enter
                    delayMs={500}
                    className="absolute -bottom-2 start-0 z-30 w-24 sm:w-28 md:w-36"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-card bg-gray-50 shadow-card">
                      <Image
                        src={shot}
                        alt=""
                        width={520}
                        height={677}
                        /**
                         * The post-transform size, NOT the 96/112/144px box. The
                         * scale magnifies whatever bitmap next/image hands back,
                         * so declaring the box got a 144px source stretched past
                         * 400px and it rendered visibly soft. 420px is still a
                         * downscale from the 520px original.
                         */
                        sizes="(max-width: 767px) 320px, 420px"
                        className="absolute inset-0 h-full w-full scale-[2.8] object-cover"
                        /**
                         * Two knobs, and they do different jobs. `objectPosition`
                         * picks the vertical band (the source is portrait, so
                         * `cover` crops height, and only the Y value bites).
                         * `transformOrigin` is what the zoom happens ABOUT —
                         * without it the scale magnifies the box's centre, which
                         * landed on the gap between the two handsets and read as
                         * a random slice. Both are physical percentages into the
                         * artwork, which is correct: the image itself never
                         * mirrors, so its framing must not either.
                         *
                         * The window the pair produces is `origin * (1 - 1/scale)`
                         * wide, so 2.8 / 13% frames the rear camera module alone.
                         * At 2.15 the window was wide enough to catch the second
                         * handset's edge, which read as a seam rather than a crop.
                         */
                        style={{ objectPosition: '50% 20%', transformOrigin: '13% 20%' }}
                      />
                    </div>

                    {/* A real destination, not a decorative control: it opens the
                        fuller look at this same iPhone. `#featured` rather than a
                        <QuickView /> trigger because that is a client island and
                        the hero deliberately ships no client JS on the LCP path. */}
                    <a
                      href="#featured"
                      aria-label={`${tProduct('learnMore')} — ${name}`}
                      className="absolute -bottom-3 end-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-card transition-colors duration-200 hover:bg-gold-tint"
                    >
                      <Icon name="expand" size={16} />
                    </a>
                  </Enter>
                ) : null}
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
        </div>
      </Container>

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
