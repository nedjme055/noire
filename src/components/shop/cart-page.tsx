'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/routing';
import { useCart } from '@/components/shop/cart-provider';
import { formatDzd } from '@/lib/utils';

const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200';

export function CartPageClient({ locale }: { locale: string }) {
  const t = useTranslations('cart');
  const { items, subtotal, updateQty, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-mobile flex flex-col items-center justify-center py-24 text-center">
        {/* Empty cart icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/[0.04]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-black/25">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </div>
        <p className="mt-5 text-[14px] font-medium text-black/50">{t('empty')}</p>
        <Link href={`/${locale}`} className="btn-primary mt-6 inline-flex px-8">
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-mobile py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-heading">{t('title') || 'Your Bag'}</h1>
        <span className="text-[12px] text-black/40">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="space-y-0 border-t border-black/[0.06]">
        {items.map((item) => {
          const itemImage = item.image?.trim() ? item.image : FALLBACK_PRODUCT_IMAGE;
          return (
          <article
            key={item.variantId ?? `${item.productId}-${item.size}-${item.color}`}
            className="flex gap-4 border-b border-black/[0.06] py-5 sm:gap-6"
          >
            {/* Product image */}
            <div className="relative h-28 w-22 shrink-0 overflow-hidden bg-[#f0ede8] sm:h-32 sm:w-24">
              <Image src={itemImage} alt={item.title} fill className="object-cover" sizes="96px" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[14px] font-medium text-ink">{item.title}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {item.size && (
                      <span className="inline-flex items-center rounded bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-black/50">
                        {t('size')}: {item.size}
                      </span>
                    )}
                    {item.color && (
                      <span className="inline-flex items-center gap-1.5 rounded bg-black/[0.04] px-2 py-0.5 text-[11px] font-medium text-black/50">
                        <span className="inline-block h-2.5 w-2.5 rounded-full border border-black/15" style={{ backgroundColor: item.color }} />
                        {t('color')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[14px] font-semibold text-ink">{formatDzd(item.priceDzd * item.quantity, locale)}</p>
                  {item.originalPriceDzd && item.originalPriceDzd > item.priceDzd ? (
                    <p className="text-[11px] text-black/35 line-through">
                      {formatDzd(item.originalPriceDzd * item.quantity, locale)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                {/* Quantity controls */}
                <div className="inline-flex items-center overflow-hidden rounded-lg border border-black/10">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center text-sm text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                    onClick={() =>
                      updateQty(item.productId, item.size, item.color, item.quantity - 1, item.variantId)
                    }
                  >
                    −
                  </button>
                  <span className="flex h-8 min-w-8 items-center justify-center border-x border-black/10 px-2 text-[13px] font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center text-sm text-black/40 transition-colors hover:bg-black/5 hover:text-black"
                    onClick={() =>
                      updateQty(item.productId, item.size, item.color, item.quantity + 1, item.variantId)
                    }
                  >
                    +
                  </button>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  className="text-[12px] text-black/35 transition-colors hover:text-red-500"
                  onClick={() => removeItem(item.productId, item.size, item.color, item.variantId)}
                >
                  {t('remove')}
                </button>
              </div>
            </div>
          </article>
          );
        })}
      </div>

      {/* Totals */}
      <div className="mt-6 rounded-xl border border-black/[0.06] bg-[#FAFAF8] p-5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] uppercase tracking-wider text-black/45">{t('subtotal')}</span>
          <span className="text-[16px] font-semibold text-ink">{formatDzd(subtotal, locale)}</span>
        </div>
        <p className="mt-1 text-[11px] text-black/30">{t('shippingNote')}</p>
      </div>

      <Link
        href={`/${locale}/checkout`}
        className="btn-primary fixed left-0 right-0 z-50 w-full px-4 py-3.5 text-center bottom-[calc(env(safe-area-inset-bottom)+72px)] sm:static sm:mt-5 sm:rounded-lg sm:px-0 sm:py-3.5"
      >
        {t('checkout')}
      </Link>
    </div>
  );
}
