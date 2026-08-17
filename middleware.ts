import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Run on page routes only — skip /api, /_next, and anything with a file
  // extension (product images, favicon, robots.txt …).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
