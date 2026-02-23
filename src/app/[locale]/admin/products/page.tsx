import { revalidatePath } from 'next/cache';
import Image from 'next/image';
import { Prisma, ProductCategory } from '@prisma/client';
import { AdminShell } from '@/components/admin/admin-shell';
import { ProductCreateForm } from '@/components/admin/product-create-form';
import { requireAdmin } from '@/lib/auth/guard';
import { prisma } from '@/lib/db/prisma';
import { saveUploadedImages } from '@/lib/uploads';

type VariantInput = { size: string; color: string; stock: number };
const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
const NAMED_COLOR_MAP: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  blue: '#2563eb',
  navy: '#1e3a8a',
  red: '#dc2626',
  green: '#16a34a',
  yellow: '#eab308',
  gray: '#6b7280',
  grey: '#6b7280',
  beige: '#d6c0a5',
  brown: '#8b5a2b',
  cream: '#f5f1e6',
  ivory: '#fffff0',
  offwhite: '#f8f5ee'
};

function normalizeSize(value: string) {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

function normalizeColor(value: string) {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeColorKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getSwatchColor(color: string) {
  const normalized = color.trim();
  if (HEX_COLOR_RE.test(normalized)) return normalized;
  return NAMED_COLOR_MAP[normalizeColorKey(normalized)] ?? null;
}

function sanitizeVariants(raw: VariantInput[]) {
  const map = new Map<string, { size: string; color: string; stock: number }>();
  for (const variant of raw) {
    const size = normalizeSize(String(variant.size ?? ''));
    const color = normalizeColor(String(variant.color ?? ''));
    const stock = Math.max(0, Number(variant.stock || 0));
    if (!size || !color) continue;
    const key = `${size}::${color.toLowerCase()}`;
    const existing = map.get(key);
    map.set(key, existing ? { ...existing, stock: existing.stock + stock } : { size, color, stock });
  }
  return Array.from(map.values());
}

async function syncProductStock(productId: string) {
  const aggregate = await prisma.variant.aggregate({ where: { productId }, _sum: { stock: true } });
  await prisma.product.update({ where: { id: productId }, data: { stock: aggregate._sum.stock ?? 0 } });
}

async function createProduct(formData: FormData) {
  'use server';
  const category = formData.get('category') as ProductCategory;
  const slug = String(formData.get('slug') ?? '').trim();
  const variantsJson = String(formData.get('variantsJson') ?? '[]');
  const parsedVariants = sanitizeVariants(JSON.parse(variantsJson) as VariantInput[]);

  if (!slug) throw new Error('Slug is required');
  const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  if (existing) throw new Error(`Slug "${slug}" already exists. Please choose a different slug.`);

  if (parsedVariants.length === 0) throw new Error('At least one size/color variant is required');

  const files = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedImageUrls = await saveUploadedImages(files);

  if (uploadedImageUrls.length === 0) throw new Error('Please upload at least one JPG/PNG image');

  const colorTagsRaw = String(formData.get('imageColorTagsJson') ?? 'null');
  const colorTagsArr: (string | null)[] = (() => {
    try { return JSON.parse(colorTagsRaw) ?? []; } catch { return []; }
  })();

  try {
    await prisma.product.create({
      data: {
        slug, category,
        titleEn: String(formData.get('titleEn') ?? ''), titleFr: String(formData.get('titleFr') ?? ''), titleAr: String(formData.get('titleAr') ?? ''),
        descriptionEn: String(formData.get('descriptionEn') ?? ''), descriptionFr: String(formData.get('descriptionFr') ?? ''), descriptionAr: String(formData.get('descriptionAr') ?? ''),
        priceDzd: Number(formData.get('priceDzd') ?? 0),
        stock: parsedVariants.reduce((sum, v) => sum + v.stock, 0),
        featured: formData.get('featured') === 'on',
        published: true,
        images: {
          create: uploadedImageUrls.map((url, index) => ({
            url,
            altEn: 'Product image',
            altFr: 'Image produit',
            altAr: 'صورة المنتج',
            sortOrder: index,
            ...(colorTagsArr[index] ? { colorTag: colorTagsArr[index] } : {}),
          } as any))
        },
        variants: { create: parsedVariants }
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error(`Slug "${slug}" already exists. Please choose a different slug.`);
    }
    throw error;
  }
  revalidatePath('/');
}

async function updateProduct(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  await prisma.product.update({
    where: { id },
    data: { priceDzd: Number(formData.get('priceDzd') ?? 0), featured: formData.get('featured') === 'on', published: formData.get('published') === 'on' }
  });
  revalidatePath('/');
}

async function addVariant(formData: FormData) {
  'use server';
  const productId = String(formData.get('productId') ?? '');
  const size = normalizeSize(String(formData.get('size') ?? ''));
  const color = normalizeColor(String(formData.get('color') ?? ''));
  const stock = Math.max(0, Number(formData.get('stock') ?? 0));
  if (!productId || !size || !color) return;
  const existing = await prisma.variant.findFirst({
    where: { productId, size: { equals: size, mode: 'insensitive' }, color: { equals: color, mode: 'insensitive' } },
    select: { id: true }
  });
  if (existing) {
    await prisma.variant.update({ where: { id: existing.id }, data: { size, color, stock } });
  } else {
    await prisma.variant.create({ data: { productId, size, color, stock } });
  }
  await syncProductStock(productId);
  revalidatePath('/');
}

async function updateVariantStock(formData: FormData) {
  'use server';
  const variantId = String(formData.get('variantId') ?? '');
  const productId = String(formData.get('productId') ?? '');
  const stock = Number(formData.get('stock') ?? 0);
  await prisma.variant.update({ where: { id: variantId }, data: { stock: Math.max(0, stock) } });
  await syncProductStock(productId);
  revalidatePath('/');
}

async function deleteVariant(formData: FormData) {
  'use server';
  const variantId = String(formData.get('variantId') ?? '');
  const productId = String(formData.get('productId') ?? '');
  await prisma.variant.delete({ where: { id: variantId } });
  await syncProductStock(productId);
  revalidatePath('/');
}

async function deleteProduct(formData: FormData) {
  'use server';
  const id = String(formData.get('id'));
  await prisma.product.delete({ where: { id } });
  revalidatePath('/');
}

async function updateImageColorTag(formData: FormData) {
  'use server';
  const imageId = String(formData.get('imageId') ?? '');
  const colorTagRaw = String(formData.get('colorTag') ?? '').trim();
  if (!imageId) return;
  await prisma.productImage.update({
    where: { id: imageId },
    data: { colorTag: colorTagRaw || null } as any
  });
  revalidatePath('/');
}

const CATEGORY_LABELS: Record<string, string> = { pants: 'Pants', tshirts: 'T-Shirts', shoes: 'Shoes' };

export default async function AdminProductsPage({ params }: { params: { locale: string } }) {
  await requireAdmin(params.locale);

  const products = await prisma.product.findMany({
    include: { variants: { orderBy: [{ size: 'asc' }, { color: 'asc' }] }, images: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });

  const totalStock = products.reduce((a, p) => a + p.stock, 0);
  const publishedCount = products.filter((p) => p.published).length;
  const featuredCount = products.filter((p) => p.featured).length;

  return (
    <AdminShell locale={params.locale}>
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-black">Products</h1>
          <p className="mt-0.5 text-[13px] text-black/45">{products.length} total products</p>
        </div>
        <ProductCreateForm action={createProduct} />
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Total Stock', value: totalStock, icon: '📦' },
          { label: 'Published', value: publishedCount, icon: '✅' },
          { label: 'Featured', value: featuredCount, icon: '⭐' },
        ].map((stat) => (
          <div key={stat.label} className="admin-card p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-black/40">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-black">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Products list */}
      <div className="space-y-4">
        {products.map((product) => {
          const totalVariantStock = product.variants.reduce((a, v) => a + v.stock, 0);
          const isLowStock = totalVariantStock > 0 && totalVariantStock <= 5;
          const isOutOfStock = totalVariantStock === 0;

          return (
            <div key={product.id} className="admin-card overflow-hidden">
              {/* Product header */}
              <div className="flex items-start gap-4 border-b border-black/8 p-4">
                {/* Thumbnails — up to 4 with color indicators */}
                <div className="flex shrink-0 gap-1.5">
                  {product.images.length > 0 ? (
                    <>
                      {product.images.slice(0, 4).map((img) => (
                        <div key={img.id} className="relative h-16 w-12 overflow-hidden rounded-lg bg-[#f0ede8]">
                          <Image src={img.url} alt="" fill className="object-cover" sizes="48px" />
                          {(img as any).colorTag && (
                            <span className="absolute bottom-0.5 left-0.5 right-0.5 truncate rounded bg-black/60 px-1 py-0.5 text-center text-[8px] font-medium text-white">
                              {(img as any).colorTag}
                            </span>
                          )}
                        </div>
                      ))}
                      {product.images.length > 4 && (
                        <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-black/5 text-[11px] font-medium text-black/40">
                          +{product.images.length - 4}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-black/5 text-black/20">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    </div>
                  )}
                </div>

                {/* Title + meta */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-2">
                    <p className="text-[14px] font-semibold text-black">{product.titleEn}</p>
                    <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-medium text-black/50">
                      {CATEGORY_LABELS[product.category] ?? product.category}
                    </span>
                    {product.featured && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">Featured</span>
                    )}
                    {!product.published && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">Hidden</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] text-black/40 font-mono">{product.slug}</p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="text-[14px] font-semibold text-black">{product.priceDzd.toLocaleString()} DZD</span>
                    <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-green-700'
                      }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-green-500'}`} />
                      {isOutOfStock ? 'Out of stock' : `${totalVariantStock} in stock`}
                    </span>
                    {product.images.length > 0 && (
                      <span className="text-[11px] text-black/35">📷 {product.images.length} image{product.images.length !== 1 ? 's' : ''}</span>
                    )}
                    {product.variants.length > 0 && (
                      <span className="text-[11px] text-black/35">
                        {new Set(product.variants.map((v) => v.color.toLowerCase())).size} color{new Set(product.variants.map((v) => v.color.toLowerCase())).size !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick edit: price + toggles */}
              <form action={updateProduct} className="flex flex-wrap items-center gap-3 border-b border-black/8 px-4 py-3">
                <input type="hidden" name="id" value={product.id} />
                <div className="flex items-center gap-2">
                  <label className="text-[12px] text-black/40">Price</label>
                  <input
                    name="priceDzd"
                    type="number"
                    defaultValue={product.priceDzd}
                    className="admin-input-sm w-28"
                  />
                  <span className="text-[12px] text-black/40">DZD</span>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-black/60">
                  <input name="featured" type="checkbox" defaultChecked={product.featured} className="h-3.5 w-3.5 rounded" />
                  Featured
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-black/60">
                  <input name="published" type="checkbox" defaultChecked={product.published} className="h-3.5 w-3.5 rounded" />
                  Published
                </label>
                <button type="submit" className="admin-btn-secondary py-1.5 text-[12px]">
                  Save Changes
                </button>
              </form>

              {/* Variants */}
              <div className="px-4 py-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-black/35">Variants</p>
                <div className="space-y-1.5">
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center gap-2">
                      <form action={updateVariantStock} className="flex flex-1 items-center gap-2">
                        <input type="hidden" name="variantId" value={variant.id} />
                        <input type="hidden" name="productId" value={product.id} />
                        {/* Color swatch */}
                        {getSwatchColor(variant.color) ? (
                          <span
                            className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                            style={{ backgroundColor: getSwatchColor(variant.color) ?? undefined }}
                            title={variant.color}
                          />
                        ) : (
                          <span
                            className="inline-flex h-5 min-w-8 shrink-0 items-center justify-center rounded-full border border-black/10 px-1 text-[10px] font-medium uppercase text-black/35"
                            title={variant.color}
                          >
                            TXT
                          </span>
                        )}
                        {/* Size */}
                        <span className="w-12 shrink-0 text-[13px] font-medium text-black">{variant.size}</span>
                        <span className="min-w-0 flex-1 truncate text-[12px] text-black/40">{variant.color}</span>
                        {/* Stock input */}
                        <input
                          name="stock"
                          type="number"
                          min={0}
                          defaultValue={variant.stock}
                          className={`admin-input-sm w-20 text-center ${variant.stock === 0 ? 'border-red-200 text-red-600' : variant.stock <= 3 ? 'border-amber-200 text-amber-700' : ''}`}
                        />
                        <button type="submit" className="admin-btn-secondary py-1 px-2.5 text-[11px]">
                          Save
                        </button>
                      </form>
                      {/* Delete variant */}
                      <form action={deleteVariant}>
                        <input type="hidden" name="variantId" value={variant.id} />
                        <input type="hidden" name="productId" value={product.id} />
                        <button
                          type="submit"
                          className="rounded p-1.5 text-black/25 transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Remove variant"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  ))}
                </div>

                {/* Add variant inline */}
                <form action={addVariant} className="mt-3 flex items-center gap-2 border-t border-black/8 pt-3">
                  <input type="hidden" name="productId" value={product.id} />
                  <input
                    name="size"
                    placeholder="Size"
                    className="admin-input-sm w-20"
                    required
                  />
                  <input
                    name="color"
                    placeholder="Black"
                    className="admin-input-sm w-28"
                    required
                  />
                  <input
                    name="stock"
                    type="number"
                    min={0}
                    placeholder="Qty"
                    className="admin-input-sm w-20"
                    required
                  />
                  <button type="submit" className="admin-btn-secondary flex items-center gap-1 py-1.5 text-[12px]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Variant
                  </button>
                </form>
              </div>

              {/* Image color tags */}
              {product.images.length > 0 && (
                <div className="border-t border-black/8 px-4 py-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-black/35">
                    Image color tags
                  </p>
                  <div className="space-y-2">
                    {product.images.map((img, index) => (
                      <form key={img.id} action={updateImageColorTag} className="flex items-center gap-2">
                        <input type="hidden" name="imageId" value={img.id} />
                        <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded bg-[#f0ede8]">
                          <Image src={img.url} alt="" fill className="object-cover" sizes="32px" />
                        </div>
                        <span className="w-10 text-[11px] text-black/40">#{index + 1}</span>
                        <input
                          name="colorTag"
                          defaultValue={(img as any).colorTag ?? ''}
                          placeholder="Black, Navy, Off White"
                          className="admin-input-sm flex-1"
                        />
                        <button type="submit" className="admin-btn-secondary py-1.5 text-[11px]">
                          Save
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete product */}
              <div className="border-t border-black/8 px-4 py-3">
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={product.id} />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-[12px] text-red-500/70 transition-colors hover:text-red-600"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                      <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                    Delete product
                  </button>
                </form>
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="admin-card flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-black/30">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-black/50">No products yet</p>
            <p className="mt-1 text-[12px] text-black/30">Click Add New Product to get started</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
