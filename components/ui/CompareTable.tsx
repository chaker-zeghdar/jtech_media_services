import { useLocale, useTranslations } from 'next-intl';
import type { Product } from '@/content/schemas';
import { cn } from '@/lib/cn';
import { pickLocale } from '@/lib/format';
import { priceFrom } from '@/lib/product';
import { Price } from './Price';

type CompareTableProps = {
  products: Product[];
  className?: string;
};

/**
 * Side-by-side spec comparison.
 *
 * Deliberately NOT on the homepage — it belongs on category pages in Phase 2,
 * where a customer is actually choosing between two options. It ships now so the
 * design system is complete and the Phase 2 page is a composition job.
 *
 * Rows are the union of every spec key across the products passed in, so a spec
 * only one model has still gets a row (with an em dash for the others) instead of
 * being silently dropped.
 */
export function CompareTable({ products, className }: CompareTableProps) {
  const locale = useLocale();
  const t = useTranslations('product');

  const rowOrder: string[] = [];
  const rowLabels = new Map<string, string>();

  for (const product of products) {
    for (const spec of product.specs) {
      if (!rowLabels.has(spec.key)) {
        rowOrder.push(spec.key);
        rowLabels.set(spec.key, pickLocale(spec.label, locale));
      }
    }
  }

  return (
    // Wide content scrolls inside its own container so the page body never does.
    <div className={cn('-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0', className)}>
      <table className="w-full min-w-[560px] border-collapse text-start">
        <caption className="sr-only">{t('specs')}</caption>
        <thead>
          <tr className="border-b border-gray-300">
            <th scope="col" className="w-[28%] py-4 text-start text-caption uppercase text-gray-700">
              {t('specs')}
            </th>
            {products.map((product) => (
              <th key={product.slug} scope="col" className="py-4 text-start align-bottom">
                <span className="block text-caption uppercase text-gray-700">{product.brand}</span>
                <span className="mt-1 block text-base font-semibold">
                  {pickLocale(product.name, locale)}
                </span>
                <Price value={priceFrom(product)} size="sm" className="mt-2" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowOrder.map((key) => (
            <tr key={key} className="border-b border-gray-300">
              <th scope="row" className="py-3.5 text-start text-sm font-normal text-gray-700">
                {rowLabels.get(key)}
              </th>
              {products.map((product) => {
                const spec = product.specs.find((candidate) => candidate.key === key);
                return (
                  <td key={product.slug} className="py-3.5 text-sm font-medium">
                    {spec ? <bdi className="num">{spec.value}</bdi> : <span aria-hidden="true">—</span>}
                    {spec ? null : <span className="sr-only">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
