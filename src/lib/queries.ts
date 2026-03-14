import {prisma} from '@/lib/db/prisma';
import {ProductCategory} from '@prisma/client';

type InventoryVariant = {
  id: number;
  color: string;
  size: string;
  quantity: number;
};

type InventoryProduct = {
  id: number;
  model_name: string;
  category: string;
  selling_price: number;
  image: string | null;
  total_stock: number;
  variants: InventoryVariant[];
};

type StorefrontVariant = {
  id: string;
  productId: string;
  size: string;
  color: string;
  stock: number;
  sku: string | null;
};

type StorefrontImage = {
  id: string;
  productId: string;
  url: string;
  altEn: string;
  altFr: string;
  altAr: string;
  colorTag: string | null;
  sortOrder: number;
};

type StorefrontProduct = {
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
  images: StorefrontImage[];
  variants: StorefrontVariant[];
};

const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900';

function getInventoryBaseUrl() {
  const value = process.env.INVENTORY_API_BASE_URL;
  if (!value) {
    throw new Error('INVENTORY_API_BASE_URL is missing');
  }
  return value.replace(/\/$/, '');
}

function getInventoryApiKey() {
  const value = process.env.INVENTORY_API_KEY;
  if (!value) {
    throw new Error('INVENTORY_API_KEY is missing');
  }
  return value;
}

function mapInventoryCategory(category: string): ProductCategory {
  const normalized = category.trim().toLowerCase();
  if (normalized.includes('shirt')) return 'tshirts';
  if (normalized.includes('pant')) return 'pants';
  return 'shoes';
}

function mapInventoryProduct(product: InventoryProduct): StorefrontProduct {
  const title = product.model_name;
  const imageUrl = product.image?.trim() ? product.image : FALLBACK_PRODUCT_IMAGE;

  return {
    id: String(product.id),
    slug: String(product.id),
    category: mapInventoryCategory(product.category),
    titleEn: title,
    titleFr: title,
    titleAr: title,
    descriptionEn: title,
    descriptionFr: title,
    descriptionAr: title,
    priceDzd: Math.max(0, Math.round(Number(product.selling_price) || 0)),
    stock: Math.max(0, Number(product.total_stock) || 0),
    featured: true,
    published: true,
    images: [
      {
        id: `inv-img-${product.id}`,
        productId: String(product.id),
        url: imageUrl,
        altEn: title,
        altFr: title,
        altAr: title,
        colorTag: null,
        sortOrder: 0,
      },
    ],
    variants: (product.variants || []).map((variant) => ({
      id: String(variant.id),
      productId: String(product.id),
      size: variant.size,
      color: variant.color,
      stock: Math.max(0, Number(variant.quantity) || 0),
      sku: null,
    })),
  };
}

async function fetchStoreApi(path: string) {
  const response = await fetch(`${getInventoryBaseUrl()}${path}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'X-STORE-KEY': getInventoryApiKey(),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error || `Store API request failed (${response.status})`;
    throw new Error(message);
  }

  return payload?.data ?? payload;
}

async function getStoreProducts(): Promise<StorefrontProduct[]> {
  const products = (await fetchStoreApi('/api/store/products')) as InventoryProduct[];
  return products.map(mapInventoryProduct);
}

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
  const products = await getStoreProducts();
  return products.filter((product) => product.stock > 0).slice(0, 6);
}

export async function getNewDropProducts() {
  const products = await getStoreProducts();
  return products.slice(0, 12);
}

export async function getProductsByCategory(category: ProductCategory) {
  const products = await getStoreProducts();
  return products.filter((product) => product.category === category);
}

export async function getProductBySlug(slug: string) {
  const id = Number.parseInt(slug, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  try {
    const product = (await fetchStoreApi(`/api/store/products/${id}`)) as InventoryProduct;
    return mapInventoryProduct(product);
  } catch {
    return null;
  }
}

export async function getRelatedProducts(productId: string, category: ProductCategory) {
  const products = await getStoreProducts();
  return products
    .filter((product) => product.id !== productId && product.category === category)
    .slice(0, 4);
}

export async function getAllShippingWilayas() {
  return prisma.shippingWilaya.findMany({orderBy: {code: 'asc'}});
}

export async function searchProducts(query: string) {
  const q = query.trim();
  if (!q) return [];

  const products = await getStoreProducts();
  const needle = q.toLowerCase();
  return products
    .filter((product) => {
      const haystacks = [
        product.titleEn,
        product.titleFr,
        product.titleAr,
        product.slug,
      ];
      return haystacks.some((value) => value.toLowerCase().includes(needle));
    })
    .slice(0, 24);
}
