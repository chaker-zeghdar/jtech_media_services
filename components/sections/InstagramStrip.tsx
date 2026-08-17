import { getTranslations } from 'next-intl/server';
import { Halftone } from '@/components/brand/Halftone';
import { Container } from '@/components/layout/Container';
import { Section } from '@/components/layout/Section';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { settings } from '@/content/settings';
import { cn } from '@/lib/cn';

const POST_KEYS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'] as const;

/**
 * Section 10 — the Instagram strip. Brand device: Halftone.
 *
 * These are caption tiles, not fake photographs. Nothing here pretends to be a
 * real post thumbnail: each tile carries the post's headline, the account handle
 * and a link straight to the profile. When the client hands over the feed (or a
 * Phase 2 Instagram Basic Display fetch lands), swap the tile body for the image
 * and keep the caption as the alt text — the copy already lives in
 * `messages.instagram.posts.*`.
 */
export async function InstagramStrip() {
  const t = await getTranslations('instagram');
  const handle = settings.socials.instagram.handle;

  return (
    <Section
      id="instagram"
      background="gray"
      device={<Halftone corner="top-start" size={180} opacity={0.35} />}
    >
      <Container>
        <SectionHeader
          id="instagram"
          title={t('title')}
          subhead={t('subhead', { handle })}
          action={
            <Button variant="link" href={settings.socials.instagram.url} external>
              {t('cta')}
            </Button>
          }
        />

        <ul className="snap-rail mt-14 gap-4 lg:grid lg:grid-cols-6 lg:overflow-visible">
          {POST_KEYS.map((key, index) => (
            <li key={key} className="w-[58vw] sm:w-[38vw] md:w-[26vw] lg:w-auto">
              <a
                href={settings.socials.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group flex aspect-square flex-col justify-between rounded-card border p-4',
                  'transition-[transform,border-color] duration-300 ease-brand hover:-translate-y-0.5 hover:border-gold',
                  // Alternating beds so six tiles don't read as one gray block.
                  index % 3 === 1
                    ? 'border-gold/40 bg-gold-tint'
                    : 'border-gray-300 bg-white',
                )}
              >
                <Icon name="instagram" size={20} className="text-gold-text" />

                <span className="flex flex-col gap-2">
                  <span className="text-sm font-semibold leading-snug">{t(`posts.${key}`)}</span>
                  <span className="font-latin text-caption text-gray-500" dir="ltr">
                    {handle}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
