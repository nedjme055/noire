'use client';

import {createContext, useContext, useEffect, useMemo, useState} from 'react';

export type CartItem = {
  variantId?: string;
  productId: string;
  slug: string;
  title: string;
  image: string;
  size?: string;
  color?: string;
  category?: string;
  priceDzd: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  bundleDiscount: number;
  addItem: (item: CartItem) => void;
  updateQty: (
    productId: string,
    size: string | undefined,
    color: string | undefined,
    quantity: number,
    variantId?: string
  ) => void;
  removeItem: (productId: string, size?: string, color?: string, variantId?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'noire-cart-v1';

function isSameCartLine(
  a: Pick<CartItem, 'variantId' | 'productId' | 'size' | 'color'>,
  b: Pick<CartItem, 'variantId' | 'productId' | 'size' | 'color'>
) {
  if (a.variantId || b.variantId) return Boolean(a.variantId && b.variantId && a.variantId === b.variantId);
  return a.productId === b.productId && a.size === b.size && a.color === b.color;
}

export function CartProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.priceDzd * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    const hasTshirt = items.some((item) => item.category === 'tshirts');
    const hasPants = items.some((item) => item.category === 'pants');
    const bundleDiscount = hasTshirt && hasPants ? Math.round(subtotal * 0.1) : 0;

    return {
      items,
      count,
      subtotal,
      bundleDiscount,
      addItem: (item: CartItem) => {
        setItems((prev) => {
          const idx = prev.findIndex((existing) => isSameCartLine(existing, item));

          if (idx === -1) return [...prev, item];

          return prev.map((existing, i) =>
            i === idx ? {...existing, quantity: existing.quantity + item.quantity} : existing
          );
        });
      },
      updateQty: (
        productId: string,
        size: string | undefined,
        color: string | undefined,
        quantity: number,
        variantId?: string
      ) => {
        if (quantity <= 0) {
          setItems((prev) =>
            prev.filter(
              (item) =>
                !(
                  (variantId && item.variantId === variantId) ||
                  (!variantId && item.productId === productId && item.size === size && item.color === color)
                )
            )
          );
          return;
        }

        setItems((prev) =>
          prev.map((item) =>
            (variantId && item.variantId === variantId) ||
            (!variantId && item.productId === productId && item.size === size && item.color === color)
              ? { ...item, quantity }
              : item
          )
        );
      },
      removeItem: (productId: string, size?: string, color?: string, variantId?: string) => {
        setItems((prev) =>
          prev.filter(
            (item) =>
              !(
                (variantId && item.variantId === variantId) ||
                (!variantId && item.productId === productId && item.size === size && item.color === color)
              )
          )
        );
      },
      clearCart: () => setItems([])
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
