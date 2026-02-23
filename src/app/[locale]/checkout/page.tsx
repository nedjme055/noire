import {CheckoutPageClient} from '@/components/shop/checkout-page';
import {getAllShippingWilayas} from '@/lib/queries';
import {localizeWilaya} from '@/lib/store';

export default async function CheckoutPage({params}: {params: {locale: 'en' | 'fr' | 'ar'}}) {
  const wilayas = await getAllShippingWilayas();

  return (
    <CheckoutPageClient
      locale={params.locale}
      wilayas={wilayas.map((w) => ({
        code: w.code,
        name: localizeWilaya(w, params.locale),
        homePriceDzd: w.homePriceDzd,
        stopdeskPriceDzd: w.stopdeskPriceDzd
      }))}
    />
  );
}
