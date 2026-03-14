import {ProductCategory, ShippingWilaya} from '@prisma/client';

export type Locale = 'en' | 'fr' | 'ar';

export type ProductImageLike = {
  id: string;
  productId: string;
  url: string;
  altEn: string;
  altFr: string;
  altAr: string;
  colorTag: string | null;
  sortOrder: number;
};

export type ProductVariantLike = {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
  sku: string | null;
};

export type ProductWithMedia = {
  id: string;
  slug: string;
  category: ProductCategory;
  titleEn: string;
  titleFr: string;
  titleAr: string;
  descriptionEn: string;
  descriptionFr: string;
  descriptionAr: string;
  priceDzd: number;
  stock: number;
  featured: boolean;
  published: boolean;
  images: ProductImageLike[];
  variants?: ProductVariantLike[];
};

export function localizeProduct(product: ProductWithMedia, locale: Locale) {
  if (locale === 'fr') {
    return {
      title: product.titleFr,
      description: product.descriptionFr
    };
  }

  if (locale === 'ar') {
    return {
      title: product.titleAr,
      description: product.descriptionAr
    };
  }

  return {
    title: product.titleEn,
    description: product.descriptionEn
  };
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
