import type { IconKey } from '@/content/schemas';
import { cn } from '@/lib/cn';

/** Keys used purely for UI chrome, on top of the content-driven IconKey set. */
export type UiIconKey = 'chevron' | 'close' | 'check' | 'menu' | 'external';

export type AnyIconKey = IconKey | UiIconKey;

/**
 * The whole icon set, inline. No icon library, no sprite request, no font.
 *
 * Every glyph is drawn on a 24×24 grid with a 1.6 stroke so they sit together at
 * any size. `chevron` points inline-end and is flipped by the RTL variant at the
 * call site (Tailwind's `rtl:` prefix), never by mirroring the path.
 */
const PATHS: Record<AnyIconKey, { d: string; fill?: boolean }[]> = {
  /* Categories --------------------------------------------------------------- */
  iphone: [{ d: 'M7.5 2.75h9a1.75 1.75 0 0 1 1.75 1.75v15a1.75 1.75 0 0 1-1.75 1.75h-9A1.75 1.75 0 0 1 5.75 19.5v-15A1.75 1.75 0 0 1 7.5 2.75Z' }, { d: 'M10 5h4' }],
  samsung: [{ d: 'M4 6.5A1.5 1.5 0 0 1 5.5 5H11v14H5.5A1.5 1.5 0 0 1 4 17.5v-11Z' }, { d: 'M13 5h5.5A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5H13V5Z' }],
  android: [{ d: 'M6 15.5v-3a6 6 0 0 1 12 0v3a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 15.5Z' }, { d: 'M8.5 7 7 4.5M15.5 7 17 4.5' }, { d: 'M10 11.5h.01M14 11.5h.01' }],
  laptop: [{ d: 'M5.5 5.75h13v9h-13v-9Z' }, { d: 'M3 17.5h18' }],
  headphones: [{ d: 'M4.5 14v-1.5a7.5 7.5 0 0 1 15 0V14' }, { d: 'M4.5 13.5h2A1.5 1.5 0 0 1 8 15v3a1.5 1.5 0 0 1-1.5 1.5h-.5A1.5 1.5 0 0 1 4.5 18v-4.5Z' }, { d: 'M19.5 13.5h-2A1.5 1.5 0 0 0 16 15v3a1.5 1.5 0 0 0 1.5 1.5h.5A1.5 1.5 0 0 0 19.5 18v-4.5Z' }],

  /* Services ----------------------------------------------------------------- */
  wrench: [{ d: 'M14.7 6.3a3.5 3.5 0 0 0 4.6 4.6l-8.4 8.4a2.2 2.2 0 0 1-3.1-3.1l8.4-8.4a3.5 3.5 0 0 0-1.5-1.5Z' }, { d: 'M17.2 3.8 14.7 6.3l3 3 2.5-2.5a4.6 4.6 0 0 0-3-3Z' }],
  unlock: [{ d: 'M6.75 11h10.5a1 1 0 0 1 1 1v7.25a1 1 0 0 1-1 1H6.75a1 1 0 0 1-1-1V12a1 1 0 0 1 1-1Z' }, { d: 'M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2' }],
  download: [{ d: 'M12 3.5v10' }, { d: 'M8 10l4 4 4-4' }, { d: 'M4.5 18.5h15' }],
  shield: [{ d: 'M12 3 19 5.5v6c0 4.2-2.9 7.4-7 9-4.1-1.6-7-4.8-7-9v-6L12 3Z' }, { d: 'M9 11.8l2.2 2.2 4-4.2' }],

  /* Delivery / trust --------------------------------------------------------- */
  truck: [{ d: 'M2.75 6.75h10.5v9H2.75v-9Z' }, { d: 'M13.25 9.75h3.9l3.1 3.1v2.9h-7v-6Z' }, { d: 'M7 18.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5ZM17.5 18.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z' }],
  cash: [{ d: 'M2.75 6.75h18.5v10.5H2.75V6.75Z' }, { d: 'M12 14.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z' }, { d: 'M6 10v4M18 10v4' }],
  clock: [{ d: 'M12 3.75a8.25 8.25 0 1 1 0 16.5 8.25 8.25 0 0 1 0-16.5Z' }, { d: 'M12 7.75V12l3 2' }],

  /* Contact ------------------------------------------------------------------ */
  phone: [{ d: 'M7.4 3.5H9l1.6 3.9-2 1.5a10.5 10.5 0 0 0 5.5 5.5l1.5-2 3.9 1.6v1.6a3 3 0 0 1-3.3 3A15.5 15.5 0 0 1 4.4 6.8a3 3 0 0 1 3-3.3Z' }],
  whatsapp: [
    {
      d: 'M12.04 2.5c-5.24 0-9.5 4.24-9.5 9.46 0 1.67.44 3.3 1.28 4.74L2.5 21.5l4.94-1.29a9.55 9.55 0 0 0 4.6 1.17c5.24 0 9.5-4.24 9.5-9.46s-4.26-9.42-9.5-9.42Zm0 17.06c-1.5 0-2.98-.4-4.26-1.16l-.3-.18-3.04.79.8-2.96-.19-.31a7.87 7.87 0 0 1-1.2-4.18c0-4.34 3.55-7.87 7.92-7.87 4.36 0 7.9 3.53 7.9 7.87s-3.54 7.87-7.9 7.87Zm4.34-5.89c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06a6.44 6.44 0 0 1-3.2-2.79c-.12-.24 0-.36.12-.5.12-.14.32-.38.42-.53.1-.16.06-.3-.02-.46-.08-.16-.55-1.35-.76-1.85-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.83-.84 2.02 0 1.19.86 2.34.98 2.5.12.16 1.69 2.7 4.1 3.68 2 .81 2.4.65 2.84.61.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z',
      fill: true,
    },
  ],
  mail: [{ d: 'M3.25 6.25h17.5v11.5H3.25V6.25Z' }, { d: 'm3.75 7 8.25 6 8.25-6' }],
  pin: [{ d: 'M12 21c4-4.4 6-7.6 6-10.2A6 6 0 0 0 6 10.8C6 13.4 8 16.6 12 21Z' }, { d: 'M12 13a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z' }],

  /* Socials ------------------------------------------------------------------ */
  instagram: [{ d: 'M7.5 3.75h9a3.75 3.75 0 0 1 3.75 3.75v9a3.75 3.75 0 0 1-3.75 3.75h-9A3.75 3.75 0 0 1 3.75 16.5v-9A3.75 3.75 0 0 1 7.5 3.75Z' }, { d: 'M12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z' }, { d: 'M17 7.25h.01' }],
  facebook: [
    {
      d: 'M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.24-1.46 1.48-1.46h1.58V4.44A21 21 0 0 0 14.25 4.3c-2.3 0-3.87 1.4-3.87 3.98v2.22H7.75v3h2.63V21h3.12Z',
      fill: true,
    },
  ],
  tiktok: [
    {
      d: 'M16.2 2.5h-2.9v12.2a2.1 2.1 0 1 1-1.6-2.04V9.7a5.1 5.1 0 1 0 4.5 5.06V9.2a5.6 5.6 0 0 0 3.3 1.07V7.35a2.9 2.9 0 0 1-2-.85 2.9 2.9 0 0 1-1.3-2.4V2.5Z',
      fill: true,
    },
  ],

  /* Specs -------------------------------------------------------------------- */
  camera: [{ d: 'M12 17.25a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Z' }, { d: 'M12 14.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z' }],
  chip: [{ d: 'M7.75 7.75h8.5v8.5h-8.5v-8.5Z' }, { d: 'M10.5 4.5v3.25M13.5 4.5v3.25M10.5 16.25v3.25M13.5 16.25v3.25M4.5 10.5h3.25M4.5 13.5h3.25M16.25 10.5h3.25M16.25 13.5h3.25' }],
  battery: [{ d: 'M3.25 8.25h14.5v7.5H3.25v-7.5Z' }, { d: 'M20 10.75v2.5' }, { d: 'M6 10.75h6v2.5H6z' }],
  screen: [{ d: 'M3.25 5.25h17.5v11h-17.5v-11Z' }, { d: 'M9 19.25h6M12 16.25v3' }],

  /* UI ----------------------------------------------------------------------- */
  chevron: [{ d: 'm9.5 5.5 6.5 6.5-6.5 6.5' }],
  close: [{ d: 'M6 6l12 12M18 6 6 18' }],
  check: [{ d: 'm5 12.5 4.5 4.5L19 7.5' }],
  menu: [{ d: 'M4 7.5h16M4 12h16M4 16.5h16' }],
  external: [{ d: 'M14 4.5h5.5V10' }, { d: 'M19.5 4.5 11 13' }, { d: 'M17 14v4.5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1H10' }],
};

type IconProps = {
  name: AnyIconKey;
  /** Rendered size in px (square). */
  size?: number;
  className?: string;
};

/**
 * Always decorative. Icons in this project sit next to a text label or inside a
 * control that already carries an accessible name, so there is no icon-only
 * control relying on the glyph to convey meaning.
 */
export function Icon({ name, size = 24, className }: IconProps) {
  const shapes = PATHS[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
    >
      {shapes.map((shape, index) => (
        <path
          key={index}
          d={shape.d}
          {...(shape.fill ? { fill: 'currentColor', stroke: 'none' } : {})}
        />
      ))}
    </svg>
  );
}
