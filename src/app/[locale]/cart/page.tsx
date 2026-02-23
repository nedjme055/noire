import {CartPageClient} from '@/components/shop/cart-page';

export default function CartPage({params}: {params: {locale: string}}) {
  return <CartPageClient locale={params.locale} />;
}
