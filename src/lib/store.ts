import { ShippingWilaya } from '@prisma/client';

export type Locale = 'en' | 'fr' | 'ar';

export type ProductCategory = 'tshirts' | 'pants' | 'shoes';

export type ProductImage = {
  url: string;
  altEn?: string | null;
  altFr?: string | null;
  altAr?: string | null;
  colorTag?: string | null;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  stock: number;
};

export type ProductWithMedia = {
  id: string;
  slug: string;
  category: ProductCategory;
  priceDzd: number;
  promotionPriceDzd?: number | null;
  stock: number;
  published: boolean;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descriptionEn?: string | null;
  descriptionFr?: string | null;
  descriptionAr?: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export function localizeProduct(product: ProductWithMedia, locale: Locale) {
  if (locale === 'fr') {
    return {
      title: product.titleFr,
      description: product.descriptionFr || ''
    };
  }

  if (locale === 'ar') {
    return {
      title: product.titleAr,
      description: product.descriptionAr || ''
    };
  }

  return {
    title: product.titleEn,
    description: product.descriptionEn || ''
  };
}

export function getPromotionPrice(product: ProductWithMedia) {
  const promotion = Number(product.promotionPriceDzd ?? 0);
  if (!Number.isFinite(promotion) || promotion <= 0 || promotion >= product.priceDzd) return null;
  return promotion;
}

export function getEffectivePrice(product: ProductWithMedia) {
  return getPromotionPrice(product) ?? product.priceDzd;
}

export function localizeWilaya(wilaya: ShippingWilaya, locale: Locale) {
  if (locale === 'fr') return wilaya.nameFr;
  if (locale === 'ar') return wilaya.nameAr;
  return wilaya.nameEn;
}

export function categoryLabel(category: ProductCategory, locale: Locale) {
  const labels = {
    en: {pants: 'Pants', tshirts: 'T-Shirts', shoes: 'Shoes'},
    fr: {pants: 'Pantalons', tshirts: 'T-shirts', shoes: 'Chaussures'},
    ar: {pants: '??????', tshirts: '?????', shoes: '?????'}
  };

  return labels[locale][category];
}
