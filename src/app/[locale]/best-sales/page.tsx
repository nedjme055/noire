import { getTranslations } from 'next-intl/server';
import { ProductCard } from '@/components/shop/product-card';
import { getFeaturedProducts } from '@/lib/queries';

export default async function BestSalesPage({
  params
}: {
  params: { locale: 'en' | 'fr' | 'ar' };
}) {
  const { locale } = params;
  const t = await getTranslations('home');
  const products = await getFeaturedProducts();

  return (
    <div className="container-mobile py-10">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">{t('bestSalesSubtitle')}</p>
        <h1 className="mt-2 text-3xl font-medium text-ink sm:text-4xl">{t('bestSales')}</h1>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-black/55">{t('featured')}</p>
      )}
    </div>
  );
}
