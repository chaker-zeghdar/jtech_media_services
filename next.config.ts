import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // AVIF first, WebP fallback. Every <ProductImage /> passes explicit sizes.
    formats: ['image/avif', 'image/webp'],
    // Matches the breakpoints the product grid and carousels actually request.
    deviceSizes: [360, 420, 640, 828, 1080, 1200, 1680, 1920],
    imageSizes: [64, 96, 128, 176, 256, 320, 420],
  },
  eslint: {
    dirs: ['app', 'components', 'content', 'i18n', 'lib'],
  },
  experimental: {
    /**
     * Inlines the stylesheet into the document instead of linking it.
     *
     * The single CSS file was the page's only render-blocking request, and on
     * simulated 4G that round trip alone cost ~1.1s of First Contentful Paint —
     * the largest single item in the Lighthouse report. The whole sheet is ~8.5KB,
     * so inlining it is comfortably cheaper than a separate request on the
     * high-latency mobile connections most of this traffic arrives on.
     */
    inlineCss: true,
  },
};

export default withNextIntl(nextConfig);
