import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { AccessoriesRail } from '@/components/sections/AccessoriesRail';
import { BestSellers } from '@/components/sections/BestSellers';
import { Categories } from '@/components/sections/Categories';
import { Contact } from '@/components/sections/Contact';
import { Delivery } from '@/components/sections/Delivery';
import { FeaturedProduct } from '@/components/sections/FeaturedProduct';
import { FullRange } from '@/components/sections/FullRange';
import { Hero } from '@/components/sections/Hero';
import { InstagramStrip } from '@/components/sections/InstagramStrip';
import { Services } from '@/components/sections/Services';
import { WhyJtech } from '@/components/sections/WhyJtech';
import { routing } from '@/i18n/routing';

/**
 * The homepage, in the order fixed by the brief. Exactly one brand device per
 * section — the running budget across the page is:
 *
 *   Hero            GoldRibbon  #1 of 2
 *   Categories      — (gold icon chips)
 *   FeaturedProduct GoldRibbon  #2 of 2 — ribbon budget spent
 *   FullRange       Halftone
 *   BestSellers     CornerBlob  @ .08
 *   AccessoriesRail Halftone
 *   WhyJtech        NumberedSquare ×4
 *   Services        CornerBlob  @ .08
 *   Delivery        GoldPanel   — the one full-bleed brand moment
 *   InstagramStrip  Halftone
 *   Contact         — (deliberately none)
 *   Footer          Halftone    @ .2
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
      <FullRange />
      <BestSellers />
      <AccessoriesRail />
      <WhyJtech />
      <Services />
      <Delivery />
      <InstagramStrip />
      <Contact />
    </>
  );
}
