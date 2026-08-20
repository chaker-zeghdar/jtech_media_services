import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { AccessoriesRail } from '@/components/sections/AccessoriesRail';
import { BestSellers } from '@/components/sections/BestSellers';
import { BrandMarquee } from '@/components/sections/BrandMarquee';
import { Categories } from '@/components/sections/Categories';
import { Contact } from '@/components/sections/Contact';
import { Delivery } from '@/components/sections/Delivery';
import { FeatureMosaic } from '@/components/sections/FeatureMosaic';
import { FeaturedProduct } from '@/components/sections/FeaturedProduct';
import { FullRange } from '@/components/sections/FullRange';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { WhyJtech } from '@/components/sections/WhyJtech';
import { routing } from '@/i18n/routing';

/**
 * The homepage.
 *
 * Two rules are enforced by this ordering, and both are easy to break by
 * inserting a section without checking:
 *
 * 1. SURFACE — no two adjacent sections share a background.
 * 2. DEVICE  — exactly one brand device per section, within the page budget.
 *
 *   Section          Surface   Device
 *   ───────────────────────────────────────────────────────
 *   Hero             gold fade GoldRibbon #1 of 2
 *   Categories       white     — (gold gradient card faces)
 *   FeaturedProduct  ink       GoldRibbon #2 of 2 — budget spent
 *   FeatureMosaic    white     — (colour blocking is the interest)
 *   FullRange        gray      Halftone
 *   BestSellers      white     CornerBlob @ .08
 *   AccessoriesRail  gray      Halftone
 *   WhyJtech         white     NumberedSquare ×4
 *   Services         gray      CornerBlob @ .08
 *   Delivery         gold      GoldPanel — the one full-bleed brand moment
 *   BrandMarquee     gray      GoldOrb — the one soft shape
 *   Contact          white     — (deliberately none)
 *   Footer           ink       Halftone @ .2
 *
 * See DESIGN.md before adding a section.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProduct />
      <FeatureMosaic />
      <FullRange />
      <BestSellers />
      <AccessoriesRail />
      <WhyJtech />
      <Services />
      <Delivery />
      <BrandMarquee />
      <Contact />
    </>
  );
}
