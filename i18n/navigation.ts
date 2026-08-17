import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware navigation primitives. Always import Link/redirect/usePathname
 * from here rather than from `next/link` or `next/navigation`, otherwise the
 * `as-needed` prefix is lost and /fr links fall back to Arabic.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
