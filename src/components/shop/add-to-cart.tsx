'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/components/shop/cart-provider';
import { createEventId, sendMetaEvent } from '@/lib/meta/client';

type AddToCartProps = {
  productId: string;
  slug: string;
  title: string;
  category: string;
  image: string;
  images?: Array<{ url: string; colorHint?: string }>;
  priceDzd: number;
  variants: Array<{
    id: string;
    size: string;
    color: string;
    stock: number;
  }>;
  onColorChange?: (color?: string) => void;
};

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const NAMED_COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  blue: '#2563eb',
  navy: '#1e3a8a',
  red: '#dc2626',
  green: '#16a34a',
  yellow: '#eab308',
  pink: '#ec4899',
  purple: '#7c3aed',
  gray: '#6b7280',
  grey: '#6b7280',
  beige: '#d6c0a5',
  brown: '#8b5a2b',
  cream: '#f5f1e6',
  ivory: '#fffff0',
  offwhite: '#f8f5ee'
};

function normalizeColor(value?: string) {
  return (value ?? '').toLowerCase().replace(/\s+/g, '').replace('#', '');
}

function normalizeColorToken(value?: string) {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeColorKey(value?: string) {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveSwatchColor(value?: string) {
  const raw = (value ?? '').trim();
  if (!raw) return null;
  if (HEX_COLOR_RE.test(raw)) return raw;
  const mapped = NAMED_COLOR_MAP[normalizeColorKey(raw)];
  if (mapped) return mapped;
  if (/^[a-zA-Z]+$/.test(raw)) return raw.toLowerCase();
  return null;
}

function isLightColor(swatchColor: string, originalColorLabel: string) {
  const color = swatchColor.trim();
  if (HEX_COLOR_RE.test(color)) {
    const hex = color.replace('#', '');
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.7;
  }
  const key = normalizeColorKey(originalColorLabel);
  return ['white', 'offwhite', 'ivory', 'cream', 'beige', 'yellow'].includes(key);
}

function colorTokens(value?: string) {
  const normalized = normalizeColor(value);
  const normalizedToken = normalizeColorToken(value);
  const tokens = [normalized, normalizedToken];
  if (normalized === '000000' || normalized === '000' || normalizedToken === 'black') {
    tokens.push('black', 'noir');
  }
  if (normalized === 'ffffff' || normalized === 'fff' || normalizedToken === 'white') {
    tokens.push('white', 'blanc');
  }
  if (normalizedToken === 'blue') tokens.push('navy');
  if (normalizedToken === 'navy') tokens.push('blue');
  return tokens.filter(Boolean);
}

function matchImageByColor(images: Array<{ url: string; colorHint?: string }>, color?: string) {
  if (!color) return null;
  const tokens = colorTokens(color);
  return (
    images.find((img) => {
      const hint = img.colorHint ?? '';
      const hintToken = normalizeColorToken(hint);
      const haystack = `${img.url} ${hint}`.toLowerCase().replace(/\s+/g, '');
      return tokens.some((token) => token === hintToken || haystack.includes(token));
    }) ?? null
  );
}

export function AddToCart({ productId, slug, title, category, image, images = [], priceDzd, variants, onColorChange }: AddToCartProps) {
  const t = useTranslations('product');
  const { addItem } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const availableVariants = variants.filter((v) => v.stock > 0);
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  const firstAvailable = availableVariants[0];

  const [selectedSize, setSelectedSize] = useState<string | undefined>(firstAvailable?.size);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(firstAvailable?.color);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.size === selectedSize && v.color === selectedColor),
    [selectedColor, selectedSize, variants]
  );
  const selectedImage = useMemo(
    () => matchImageByColor(images, selectedColor)?.url ?? image,
    [image, images, selectedColor]
  );

  const disabled = useMemo(() => {
    if (variants.length === 0) return false;
    if (!selectedSize || !selectedColor) return true;
    return !selectedVariant || selectedVariant.stock <= 0;
  }, [selectedColor, selectedSize, selectedVariant, variants.length]);

  const maxQuantity = useMemo(() => {
    if (variants.length === 0) return 99;
    return selectedVariant?.stock ?? 0;
  }, [selectedVariant, variants.length]);

  const hasStockForSize = (size: string) => variants.some((v) => v.size === size && v.stock > 0);
  const hasStockForColor = (color: string) => variants.some((v) => v.color === color && v.stock > 0);
  const hasStockForPair = (size?: string, color?: string) =>
    variants.some((v) => v.size === size && v.color === color && v.stock > 0);
  const isSizeCompatibleWithSelectedColor = (size: string) =>
    selectedColor ? hasStockForPair(size, selectedColor) : hasStockForSize(size);
  const isColorCompatibleWithSelectedSize = (color: string) =>
    selectedSize ? hasStockForPair(selectedSize, color) : hasStockForColor(color);

  useEffect(() => {
    if (maxQuantity <= 0) {
      setQuantity(1);
      return;
    }
    setQuantity((prev) => Math.min(Math.max(prev, 1), maxQuantity));
  }, [maxQuantity]);

  // Auto-heal invalid combinations so users never get stuck on an unavailable pair.
  useEffect(() => {
    if (availableVariants.length === 0) return;
    if (selectedSize && selectedColor && variants.some((v) => v.size === selectedSize && v.color === selectedColor && v.stock > 0)) return;
    const fallback =
      availableVariants.find((v) => v.size === selectedSize) ??
      availableVariants.find((v) => v.color === selectedColor) ??
      availableVariants[0];
    if (!fallback) return;
    if (fallback.size !== selectedSize) setSelectedSize(fallback.size);
    if (fallback.color !== selectedColor) setSelectedColor(fallback.color);
  }, [availableVariants, selectedColor, selectedSize, variants]);

  const isSizeAvailable = (size: string) => hasStockForSize(size);
  const isColorAvailable = (color: string) => hasStockForColor(color);

  useEffect(() => {
    if (!selectedColor) return;
    if (searchParams.get('color') === selectedColor) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('color', selectedColor);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, selectedColor]);

  useEffect(() => {
    onColorChange?.(selectedColor);
  }, [onColorChange, selectedColor]);

  const onAdd = () => {
    if (disabled) return;

    const cartItem = {
      variantId: selectedVariant?.id,
      productId,
      slug,
      title,
      image: selectedImage,
      size: selectedSize,
      color: selectedColor,
      category,
      priceDzd,
      quantity
    };

    addItem(cartItem);
    const eventId = createEventId();
    sendMetaEvent({
      event_name: 'AddToCart',
      event_id: eventId,
      event_source_url: window.location.href,
      value: priceDzd * quantity,
      currency: 'DZD',
      content_name: title
    });

    if ((window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', { value: priceDzd * quantity, currency: 'DZD' }, { eventID: eventId });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-5">
      {sizes.length > 0 ? (
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.15em] text-black/40">{t('size')}</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`flex h-11 min-w-11 items-center justify-center border text-[13px] font-medium transition-all ${selectedSize === size
                  ? 'border-black bg-black text-white'
                  : isSizeAvailable(size)
                    ? isSizeCompatibleWithSelectedColor(size)
                      ? 'border-black/15 bg-white text-ink hover:border-black'
                      : 'border-black/20 bg-black/[0.02] text-black/60 hover:border-black'
                    : 'cursor-not-allowed border-black/10 bg-black/5 text-black/30'
                  }`}
                onClick={() => {
                  if (!isSizeAvailable(size)) return;
                  setSelectedSize(size);
                  if (!variants.some((v) => v.size === size && v.color === selectedColor && v.stock > 0)) {
                    const nextColor = variants.find((v) => v.size === size && v.stock > 0)?.color;
                    setSelectedColor(nextColor);
                  }
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {colors.length > 0 ? (
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.15em] text-black/40">{t('color')}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const swatchColor = resolveSwatchColor(color);
              const selectedStyle =
                selectedColor === color && swatchColor
                  ? {
                    backgroundColor: swatchColor,
                    color: isLightColor(swatchColor, color) ? '#111111' : '#ffffff'
                  }
                  : undefined;
              return (
                <button
                  key={color}
                  type="button"
                  className={`min-h-11 min-w-20 border px-3 text-[13px] font-medium transition-all ${selectedColor === color
                    ? swatchColor
                      ? 'border-black'
                      : 'border-black bg-black text-white'
                    : isColorAvailable(color)
                      ? isColorCompatibleWithSelectedSize(color)
                        ? 'border-black/15 bg-white text-ink hover:border-black'
                        : 'border-black/20 bg-black/[0.02] text-black/60 hover:border-black'
                      : 'cursor-not-allowed border-black/10 bg-black/5 text-black/30'
                    }`}
                  style={selectedStyle}
                  onClick={() => {
                    if (!isColorAvailable(color)) return;
                    setSelectedColor(color);
                    if (!variants.some((v) => v.color === color && v.size === selectedSize && v.stock > 0)) {
                      const nextSize = variants.find((v) => v.color === color && v.stock > 0)?.size;
                      setSelectedSize(nextSize);
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    {swatchColor ? (
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-black/20"
                        style={{ backgroundColor: swatchColor }}
                      />
                    ) : null}
                    <span>{color}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.15em] text-black/40">{t('quantity')}</p>
        <div className="inline-flex items-center border border-black/15">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-base text-black/60 transition-colors hover:text-black disabled:cursor-not-allowed disabled:text-black/20"
            onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            disabled={quantity <= 1 || maxQuantity <= 0}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="flex h-11 min-w-12 items-center justify-center px-2 text-[14px] font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-base text-black/60 transition-colors hover:text-black disabled:cursor-not-allowed disabled:text-black/20"
            onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
            disabled={quantity >= maxQuantity || maxQuantity <= 0}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`fixed left-0 right-0 z-50 w-full px-4 py-3 bottom-[calc(env(safe-area-inset-bottom)+72px)] sm:static sm:bottom-auto sm:px-0 ${added ? 'border border-green-700 bg-green-700 text-white' : 'btn-primary'
          }`}
        disabled={disabled}
        onClick={onAdd}
      >
        {added ? 'Added to bag' : t('addToCart')}
      </button>

      {selectedVariant && selectedVariant.stock > 0 ? (
        <p className="text-xs text-black/55">{t('stockForVariant', { count: selectedVariant.stock })}</p>
      ) : (
        <p className="text-xs text-red-600">{t('outOfStock')}</p>
      )}
    </div>
  );
}
