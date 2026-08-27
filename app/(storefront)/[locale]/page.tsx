import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { AccessoriesRail } from '@/components/sections/AccessoriesRail';
import { Categories } from '@/components/sections/Categories';
import { Contact } from '@/components/sections/Contact';
import { Featured } from '@/components/sections/Featured';
import { Hero } from '@/components/sections/Hero';
import { OurLaptops } from '@/components/sections/OurLaptops';
import { OurPhones } from '@/components/sections/OurPhones';
import { Services } from '@/components/sections/Services';
import { WhyJtech } from '@/components/sections/WhyJtech';
import { routing } from '@/i18n/routing';

/**
 * Rendered per request rather than prebuilt at deploy time, matching the
 * category page. Every section here reads the live catalogue out of Supabase,
 * and prerendering turned that into a build-time database dependency: the
 * deploy failed outright when the read came back empty.
 */
export const dynamic = 'force-dynamic';

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
 *   Featured         gray      GoldRibbon #2 of 2 — budget spent
 *                              (ink spotlight nested inside)
 *   WhyJtech         white     NumberedSquare ×4
 *   OurPhones        gray      GoldOrb #1 of 3
 *   OurLaptops       white     CornerBlob @ .08
 *   AccessoriesRail  gray      Halftone
 *   Services         white     CornerBlob @ .08
 *   Contact          white     GoldOrb #2 of 3 — replaces the gold weight
 *                              lost when the delivery block was removed
 *   Footer           ink       Halftone @ .2
 *
 *   Categories is fixed at white, which forces every parity after it — that is
 *   why Featured is gray and Services white rather than the other way round.
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
      <Featured />
      <WhyJtech />
      <OurPhones />
      <OurLaptops />
      <AccessoriesRail />
      <Services />
      <Contact />
    </>
  );
}
