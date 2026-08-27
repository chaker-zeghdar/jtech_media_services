'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const SECTIONS = [
  { href: '/admin', label: 'الرئيسية' },
  { href: '/admin/products', label: 'المنتجات' },
  { href: '/admin/orders', label: 'الطلبات' },
] as const;

/**
 * The admin section nav, split out as the layout's only client island so the
 * layout itself can stay a server component (it reads the session, which needs
 * server `cookies()`).
 *
 * `/admin` is matched exactly and the others by prefix — otherwise the
 * dashboard link, being a prefix of every admin path, would light up on every
 * page. The nested product routes (`/admin/products/new`, `/admin/products/[id]`)
 * are meant to keep "المنتجات" active, which the prefix match gives for free.
 */
function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="أقسام لوحة التحكم" className="flex items-center gap-5">
      {SECTIONS.map((section) => {
        const active = isActive(pathname, section.href);
        return (
          <Link
            key={section.href}
            href={section.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'text-sm transition-colors',
              active ? 'font-medium text-ink' : 'text-gray-700 hover:text-ink',
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
