import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ProductCategory } from '@prisma/client';
import { getProductsByCategory } from '@/lib/queries';
import { ProductCard } from '@/components/shop/product-card';

const CATEGORIES: ProductCategory[] = ['pants', 'tshirts', 'shoes'];

export default async function CategoryPage({
  params,
}: {
  params: { locale: 'en' | 'fr' | 'ar'; slug: ProductCategory };
}) {
  const { slug, locale } = params;
  const t = await getTranslations('category');

  if (!CATEGORIES.includes(slug)) {
    notFound();
  }

  const products = await getProductsByCategory(slug);

  return (
    <section className="py-12">
      <div className="container-mobile">
        {/* Category header with accent line */}
        <header className="mb-12 text-center">
          <div className="mx-auto mb-4 h-px w-12 bg-black/20" />
          <h1 className="text-2xl font-light tracking-tight text-ink sm:text-3xl">
            {t(slug)}
          </h1>
          <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.2em] text-black/35">
            {products.length} {products.length === 1 ? 'item' : 'items'}
          </p>
        </header>

        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] text-black/40">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 sm:gap-x-5 sm:gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
