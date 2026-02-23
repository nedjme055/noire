import { getTranslations } from 'next-intl/server';
import { ProductCard } from '@/components/shop/product-card';
import { getNewDropProducts } from '@/lib/queries';

export default async function NewDropPage({
  params
}: {
  params: { locale: 'en' | 'fr' | 'ar' };
}) {
  const { locale } = params;
  const t = await getTranslations('home');
  const products = await getNewDropProducts();

  return (
    <section className="py-12">
      <div className="container-mobile">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-4 h-px w-12 bg-black/20" />
          <h1 className="text-2xl font-light tracking-tight text-ink sm:text-3xl">{t('shopNow')}</h1>
          <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.2em] text-black/35">
            {t('newDropSubtitle')}
          </p>
        </header>

        {products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] text-black/40">{t('featured')}</p>
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
