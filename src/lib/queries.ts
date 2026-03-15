import {prisma} from '@/lib/db/prisma';
import {ProductCategory} from '@prisma/client';

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({where: {id: 'main'}});
  return (
    settings ??
    prisma.siteSettings.create({
      data: {
        id: 'main'
      }
    })
  );
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: {featured: true, published: true},
    include: {images: {orderBy: {sortOrder: 'asc'}}},
    take: 6,
    orderBy: {createdAt: 'desc'}
  });
}

export async function getNewDropProducts() {
  return prisma.product.findMany({
    where: {published: true},
    include: {images: {orderBy: {sortOrder: 'asc'}}},
    take: 12,
    orderBy: {createdAt: 'desc'}
  });
}

export async function getProductsByCategory(category: ProductCategory) {
  return prisma.product.findMany({
    where: {category, published: true},
    include: {images: {orderBy: {sortOrder: 'asc'}}},
    orderBy: {createdAt: 'desc'}
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: {slug},
    include: {
      images: {orderBy: {sortOrder: 'asc'}},
      variants: {orderBy: {size: 'asc'}}
    }
  });
}

export async function getRelatedProducts(productId: string, category: ProductCategory) {
  return prisma.product.findMany({
    where: {
      id: {not: productId},
      category,
      published: true
    },
    include: {images: {orderBy: {sortOrder: 'asc'}}},
    take: 4,
    orderBy: {createdAt: 'desc'}
  });
}

export async function getAllShippingWilayas() {
  return prisma.shippingWilaya.findMany({orderBy: {code: 'asc'}});
}

export async function searchProducts(query: string) {
  const q = query.trim();
  if (!q) return [];

  return prisma.product.findMany({
    where: {
      published: true,
      OR: [
        {titleEn: {contains: q, mode: 'insensitive'}},
        {titleFr: {contains: q, mode: 'insensitive'}},
        {titleAr: {contains: q, mode: 'insensitive'}},
        {slug: {contains: q, mode: 'insensitive'}}
      ]
    },
    include: {images: {orderBy: {sortOrder: 'asc'}}},
    orderBy: {createdAt: 'desc'},
    take: 24
  });
}
