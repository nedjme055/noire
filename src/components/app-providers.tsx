'use client';

import {CartProvider} from '@/components/shop/cart-provider';

export function AppProviders({children}: {children: React.ReactNode}) {
  return <CartProvider>{children}</CartProvider>;
}
