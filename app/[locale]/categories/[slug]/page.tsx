import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ['iphone', 'samsung', 'android', 'pc', 'accessories'].map((slug) => ({ locale, slug })),
  );
}

type PageParams = { params: Promise<{ locale: string; slug: string }> };

export default async function CategoryPage({ params }: PageParams) {
  const { locale, slug } = await params;

  return (
    <main>
      <h1>{slug}</h1>
      <p>{locale}</p>
    </main>
  );
}
