import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { getAdminProduct } from '@/lib/queries/admin';
import { getCategories } from '@/lib/queries/categories';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProduct(id), getCategories()]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-gray-700 hover:text-ink">
        ← كل المنتجات
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{product.name}</h1>
      <p className="mt-1 text-sm text-gray-500" dir="ltr">
        {product.slug}
      </p>

      <div className="mt-8">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
