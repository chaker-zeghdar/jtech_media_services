import type { Config } from 'tailwindcss';

/**
 * JTECH design tokens.
 *
 * The default Tailwind palette is REPLACED, not extended — `theme.colors` sits at
 * the top level so `bg-red-500`, `text-slate-700` etc. simply do not exist. If a
 * colour isn't in this file it isn't in the design system.
 *
 * Accessibility contract baked into the names:
 *   gold      — fill / shape colour on light surfaces. NEVER text on white (~2:1).
 *   gold-text — the only gold permitted for text on white (#8A6524, ~5.3:1).
 *   gold      — fine as TEXT on the ink surface (#E1AA4D on #1D1D1F, ~7.9:1).
 *
 * See DESIGN.md for the one-brand-device-per-section rule.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    // ---- Colour: full replacement of the default palette ------------------
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: 'var(--color-white)',
      ink: 'var(--color-ink)',
      gray: {
        50: 'var(--color-gray-50)',
        100: 'var(--color-gray-100)',
        300: 'var(--color-gray-300)',
        500: 'var(--color-gray-500)',
        700: 'var(--color-gray-700)',
      },
      gold: {
        DEFAULT: 'var(--color-gold)',
        light: 'var(--color-gold-light)',
        deep: 'var(--color-gold-deep)',
        tint: 'var(--color-gold-tint)',
        text: 'var(--color-gold-text)',
      },
      green: 'var(--color-green)',
      amber: 'var(--color-amber)',
    },

    // ---- Radii: only the five the system allows ---------------------------
    borderRadius: {
      none: '0',
      chip: '12px', // icon chips, NumberedSquare
      card: '18px', // cards, product image beds
      tile: '24px', // large feature tiles
      full: '999px', // buttons, pills
    },

    // ---- Type scale (§4) -------------------------------------------------
    fontFamily: {
      // Script-aware: `--font-ui` is swapped per-locale in globals.css so the
      // Arabic layout picks up SF Arabic / IBM Plex Sans Arabic from the same class.
      sans: 'var(--font-ui)',
      latin: 'var(--font-stack-latin)',
      arabic: 'var(--font-stack-arabic)',
    },
    fontSize: {
      caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
      pill: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '600' }],
      sm: ['0.875rem', { lineHeight: '1.5' }],
      base: ['1.0625rem', { lineHeight: '1.6' }], // 17px body
      subhead: ['1.3125rem', { lineHeight: '1.4' }], // 21px
      'subhead-sm': ['1.1875rem', { lineHeight: '1.45' }], // 19px mobile subhead
      eyebrow: ['0.8125rem', { lineHeight: '1.3', letterSpacing: '0.06em', fontWeight: '600' }],
      // Fluid headline steps. min → max across the 390px…1440px viewport range.
      h3: ['clamp(1.375rem, 1.1rem + 1.2vw, 1.75rem)', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      h2: ['clamp(1.75rem, 1.2rem + 2.4vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.012em' }],
      section: ['clamp(2rem, 1.1rem + 4vw, 3.5rem)', { lineHeight: '1.07', letterSpacing: '-0.015em' }],
      hero: ['clamp(2.5rem, 1.1rem + 6.2vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      numeral: ['clamp(2.75rem, 1.4rem + 5.4vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
      'numeral-sm': ['clamp(2rem, 1.4rem + 2.6vw, 3rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    letterSpacing: {
      tight: '-0.02em',
      snug: '-0.015em',
      normal: '0',
      wide: '0.01em',
      wider: '0.06em',
    },

    extend: {
      // ---- Layout shell (§3) ---------------------------------------------
      maxWidth: {
        prose: '980px', // centred content column
        shell: '1680px', // page shell
        hero: '620px', // the hero product stage
      },
      minHeight: {
        // The hero owns the viewport. A token rather than an arbitrary value so
        // it stays inside the scale the rest of the system uses.
        hero: '88vh',
      },
      spacing: {
        section: '7.5rem', // 120px desktop section padding
        'section-sm': '4.5rem', // 72px mobile
        gutter: '1.5rem',
      },
      // ---- Motion (§6) ---------------------------------------------------
      transitionTimingFunction: {
        brand: 'cubic-bezier(.28,.11,.32,1)',
      },
      transitionDuration: {
        reveal: '600ms',
        ribbon: '1200ms',
      },
      boxShadow: {
        // Grounds a product cutout on its bed.
        product: '0 24px 28px rgba(0,0,0,.14)',
        'product-hover': '0 30px 36px rgba(0,0,0,.16)',
        /**
         * Lifts a card container off the page. Measured off apple.com/store,
         * where every card casts this exact shadow at every size — a 313px
         * accessory card and a 400×500 tile share both it and an 18px radius.
         * One recipe, reused; card-scale surfaces only, never pills or chips.
         */
        card: '2px 4px 12px rgba(0,0,0,.08)',
        nav: '0 1px 0 0 var(--color-gray-300)',
        modal: '0 40px 80px -20px rgba(0,0,0,.28)',
      },
      backgroundImage: {
        // Diagonal light rays over the brand gradient. Ink text clears AA across
        // every stop: 12.0:1 on the lightest, 5.3:1 on the deepest.
        'gold-panel':
          'linear-gradient(105deg, rgba(255,255,255,.30) 8%, transparent 19%, rgba(255,255,255,.20) 35%, transparent 47%), linear-gradient(135deg, #F7D98F, #E1AA4D 45%, #C1862C)',
        'gold-ribbon': 'linear-gradient(135deg, var(--color-gold-light), var(--color-gold-deep))',
      },
      zIndex: {
        nav: '40',
        bar: '45',
        menu: '50',
        modal: '60',
      },
      /**
       * NOTE: the @keyframes themselves live in app/globals.css, not here.
       *
       * Tailwind only emits a keyframe block when a matching `animate-*` utility
       * appears in the scanned content. Several of this project's animations are
       * driven from raw CSS rules (`.light-sweep`, `.enter`, `.enter-word`), and
       * those references are invisible to the content scanner — declaring the
       * keyframes in config got `sweep-light` purged and silently broke the
       * ProductCard hover sweep. Raw CSS keyframes are never purged.
       */
      animation: {
        'draw-ribbon': 'draw-ribbon 1200ms cubic-bezier(.28,.11,.32,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
