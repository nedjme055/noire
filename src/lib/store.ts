import {Product, ProductImage, ProductCategory, ShippingWilaya} from '@prisma/client';

export type Locale = 'en' | 'fr' | 'ar';

export type ProductWithMedia = Product & {
  images: ProductImage[];
};

export function localizeProduct(product: Product, locale: Locale) {
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
