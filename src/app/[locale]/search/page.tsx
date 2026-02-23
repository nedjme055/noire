import {getTranslations} from 'next-intl/server';
import {ProductCard} from '@/components/shop/product-card';
import {searchProducts} from '@/lib/queries';

export default async function SearchPage({
  params,
  searchParams
}: {
  params: {locale: 'en' | 'fr' | 'ar'};
  searchParams: {q?: string};
}) {
  const t = await getTranslations('search');
  const query = (searchParams.q ?? '').trim();
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="container-mobile py-8 sm:py-10">
      <h1 className="section-heading mb-6">{t('title')}</h1>

      <form action={`/${params.locale}/search`} className="mx-auto mb-8 flex max-w-xl items-center gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder={t('placeholder')}
          className="h-12 w-full rounded-full border border-black/15 px-4 text-[15px] outline-none transition-colors focus:border-black"
          aria-label={t('placeholder')}
        />
        <button type="submit" className="btn-primary h-12 rounded-full px-5 py-0">
          {t('button')}
        </button>
      </form>

      {!query ? <p className="text-center text-sm text-black/50">{t('start')}</p> : null}
      {query && products.length === 0 ? (
        <p className="text-center text-sm text-black/50">{t('empty', {query})}</p>
      ) : null}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={params.locale} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

