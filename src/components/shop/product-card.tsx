import Image from 'next/image';
import { Link } from '@/lib/i18n/routing';
import { ProductWithMedia, getEffectivePriceDzd, getPromotionPriceDzd, localizeProduct, Locale } from '@/lib/store';
import { formatDzd } from '@/lib/utils';

export function ProductCard({ product, locale }: { product: ProductWithMedia; locale: Locale }) {
  const i18n = localizeProduct(product, locale);
  const image = product.images[0]?.url ?? 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900';
  const totalStock = product.stock ?? 0;
  const promotionPriceDzd = getPromotionPriceDzd(product);
  const effectivePriceDzd = getEffectivePriceDzd(product);

  return (
    <Link href={`/${locale}/product/${product.slug}`} className="group block">
      <article>
        {/* Image container with hover zoom + overlays */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f0ede8]">
          <Image
            src={image}
            alt={i18n.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 50vw, 25vw"
          />

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* New badge */}
          <span className="absolute left-2 top-2 rounded bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            New
          </span>

          {promotionPriceDzd ? (
            <span className="absolute right-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              Promo
            </span>
          ) : null}

          {/* Out of stock overlay */}
          {totalStock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
              <span className="rounded-full bg-black/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 space-y-0.5">
          <h3 className="line-clamp-1 text-[13px] font-medium text-ink transition-colors group-hover:text-black/70">
            {i18n.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <p className="text-[13px] font-semibold text-black/70">{formatDzd(effectivePriceDzd, locale)}</p>
              {promotionPriceDzd ? (
                <p className="text-[11px] text-black/35 line-through">{formatDzd(product.priceDzd, locale)}</p>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
