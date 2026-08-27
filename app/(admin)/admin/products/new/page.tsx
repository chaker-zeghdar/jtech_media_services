import Link from 'next/link';
import { ProductForm } from '@/components/admin/ProductForm';
import { getCategories } from '@/lib/queries/categories';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-gray-700 hover:text-ink">
        ← كل المنتجات
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">منتج جديد</h1>

      <div className="mt-8">
        <ProductForm product={null} categories={categories} />
      </div>
    </div>
  );
}
