import { prisma } from '@/lib/db/prisma';
import { ProductCategory, ProductWithMedia } from '@/lib/store';

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
  promotion_price?: number | null;
  promo_price?: number | null;
  sale_price?: number | null;
  discount_price?: number | null;
  image?: string | null;
  variants: InventoryVariant[];
};

const INVENTORY_BASE_URL = process.env.INVENTORY_API_BASE_URL || '';
const INVENTORY_API_KEY = process.env.INVENTORY_API_KEY || '';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200';

function buildHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (INVENTORY_API_KEY) headers['X-STORE-KEY'] = INVENTORY_API_KEY;
  return headers;
}

function buildUrl(path: string) {
  if (!INVENTORY_BASE_URL) {
    throw new Error('INVENTORY_API_BASE_URL is not set');
  }
  if (INVENTORY_BASE_URL.endsWith('/') && path.startsWith('/')) {
    return `${INVENTORY_BASE_URL.slice(0, -1)}${path}`;
  }
  if (!INVENTORY_BASE_URL.endsWith('/') && !path.startsWith('/')) {
    return `${INVENTORY_BASE_URL}/${path}`;
  }
  return `${INVENTORY_BASE_URL}${path}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

function slugForProduct(product: InventoryProduct) {
  return `${slugify(product.model_name)}-${product.id}`;
}

function extractIdFromSlug(slug: string) {
  const match = slug.match(/-(\d+)$/);
  if (match) return match[1];
  if (/^\d+$/.test(slug)) return slug;
  return null;
}

function mapCategory(category: string): ProductCategory {
  if (category === 'Pants') return 'pants';
  if (category === 'Shoes') return 'shoes';
  return 'tshirts';
}

function normalizeImageUrl(image?: string | null) {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith('http')) return image;
  return buildUrl(image.startsWith('/') ? image : `/${image}`);
}

function normalizePromotionPrice(product: InventoryProduct) {
  const regularPrice = Math.round(Number(product.selling_price || 0));
  const rawPromotionPrice =
    product.promotion_price ??
    product.promo_price ??
    product.sale_price ??
    product.discount_price ??
    null;

  if (rawPromotionPrice == null) return null;

  const promotionPrice = Math.round(Number(rawPromotionPrice));
  if (!Number.isFinite(promotionPrice) || promotionPrice <= 0 || promotionPrice >= regularPrice) {
    return null;
  }

  return promotionPrice;
}

function mapInventoryProduct(product: InventoryProduct): ProductWithMedia {
  const variants = product.variants.map((v) => ({
    id: String(v.id),
    size: v.size || '',
    color: v.color || '',
    stock: Number(v.quantity || 0),
  }));
  const stock = variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id: String(product.id),
    slug: slugForProduct(product),
    category: mapCategory(product.category),
    priceDzd: Math.round(Number(product.selling_price || 0)),
    promotionPriceDzd: normalizePromotionPrice(product),
    stock,
    published: true,
    titleEn: product.model_name,
    titleFr: product.model_name,
    titleAr: product.model_name,
    descriptionEn: '',
    descriptionFr: '',
    descriptionAr: '',
    images: [{ url: normalizeImageUrl(product.image) }],
    variants,
  };
}

async function fetchInventory<T>(path: string, options?: RequestInit) {
  const res = await fetch(buildUrl(path), {
    ...options,
    headers: { ...buildHeaders(), ...(options?.headers || {}) },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Inventory API failed: ${res.status}`);
  }
  const json = await res.json();
  return (json.data ?? json) as T;
}

async function getInventoryProducts(): Promise<ProductWithMedia[]> {
  const data = await fetchInventory<InventoryProduct[]>('/api/store/products');
  return data.map(mapInventoryProduct);
}

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
  return (
    settings ??
    prisma.siteSettings.create({
      data: {
        id: 'main',
      },
    })
  );
}

export async function getFeaturedProducts() {
  const products = await getInventoryProducts();
  return products.slice(0, 6);
}

export async function getNewDropProducts() {
  const products = await getInventoryProducts();
  return products.slice(0, 12);
}

export async function getProductsByCategory(category: ProductCategory) {
  const products = await getInventoryProducts();
  return products.filter((p) => p.category === category);
}

export async function getProductBySlug(slug: string) {
  const id = extractIdFromSlug(slug);
  if (id) {
    const product = await fetchInventory<InventoryProduct>(`/api/store/products/${id}`);
    return mapInventoryProduct(product);
  }

  const products = await getInventoryProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(productId: string, category: ProductCategory) {
  const products = await getInventoryProducts();
  return products.filter((p) => p.category === category && p.id !== productId).slice(0, 4);
}

export async function getAllShippingWilayas() {
  return prisma.shippingWilaya.findMany({ orderBy: { code: 'asc' } });
}

export async function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const products = await getInventoryProducts();
  return products.filter((p) => p.titleEn.toLowerCase().includes(q)).slice(0, 24);
}
