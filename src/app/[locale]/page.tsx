import { getTranslations } from 'next-intl/server';
import { getFeaturedProducts, getPromotionProducts } from '@/lib/queries';
import { Hero } from '@/components/shop/hero';
import { TrustBadges } from '@/components/shop/trust-badges';
import { ProductCard } from '@/components/shop/product-card';
import { EditorialBanner } from '@/components/shop/editorial-banner';

export default async function HomePage({ params }: { params: { locale: 'en' | 'fr' | 'ar' } }) {
  const { locale } = params;
  const t = await getTranslations('home');
  const [products, promotionProducts] = await Promise.all([getFeaturedProducts(), getPromotionProducts(4)]);

  // Split products for two sections if enough
  const firstSet = products.slice(0, 4);
  const secondSet = products.slice(4);

  return (
    <div>
      {/* Hero */}
      <Hero locale={locale} />

      {/* Featured products section */}
      <section className="py-14">
        <div className="container-mobile">
          <h2 className="section-heading mb-8">{t('featured')}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-10">
            {firstSet.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial banner — lookbook style */}
      <EditorialBanner
        locale={locale}
        title={t('bestSales')}
        subtitle={t('bestSalesSubtitle')}
        ctaLabel={t('explore')}
        ctaHref={`/${locale}/best-sales`}
        bgColor="#3a3a30"
      />

      {/* Promotions section */}
      {promotionProducts.length > 0 && (
        <section className="bg-[#f7f3ed] py-14">
          <div className="container-mobile">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/45">{t('promotionsSubtitle')}</p>
                <h2 className="section-heading mt-2">{t('promotions')}</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-10">
              {promotionProducts.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Second product section */}
      {secondSet.length > 0 && (
        <section className="py-14">
          <div className="container-mobile">
            <h2 className="section-heading mb-8">{t('shopNow')}</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-10">
              {secondSet.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Second editorial — Creator's Club style */}
      <EditorialBanner
        locale={locale}
        title="Creator's Club"
        subtitle="Made For"
        ctaLabel={t('shopNow')}
        ctaHref={`/${locale}/category/shoes`}
        bgColor="#1a2e1a"
      />

      {/* Trust badges strip */}
      <TrustBadges />
    </div>
  );
}

