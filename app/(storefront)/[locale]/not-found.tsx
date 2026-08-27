import { getTranslations } from 'next-intl/server';
import { Swash } from '@/components/brand/Swash';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';

export default async function NotFound() {
  const t = await getTranslations('nav');

  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-section-sm">
      <p className="num text-numeral font-semibold text-gray-300">404</p>
      <h1 className="mt-4 text-h2 font-semibold">JTECH Media Services</h1>
      <Swash />
      <div className="mt-8">
        <Button href="/">{t('categories')}</Button>
      </div>
    </Container>
  );
}
