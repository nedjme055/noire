'use client';

import { useState, useRef, useTransition, useCallback, useMemo, useEffect } from 'react';

/* ─── Types ─── */
type ColorImageGroup = { color: string; files: { file: File; preview: string }[] };

/* ─── Constants ─── */
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const QUICK_COLORS = ['Black', 'White', 'Navy', 'Blue', 'Beige', 'Gray', 'Brown', 'Red'];
const DEFAULT_STOCK = 10;

const NAMED_COLORS: Record<string, string> = {
  black: '#000000', white: '#ffffff', blue: '#2563eb', navy: '#1e3a8a',
  red: '#dc2626', green: '#16a34a', yellow: '#eab308', gray: '#6b7280',
  grey: '#6b7280', beige: '#d6c0a5', brown: '#8b5a2b', cream: '#f5f1e6',
  ivory: '#fffff0', offwhite: '#f8f5ee',
};

/* ─── Helpers ─── */
function normalizeColor(v: string) {
  const c = v.trim().replace(/\s+/g, ' ');
  return c.replace(/\b\w/g, (ch) => ch.toUpperCase());
}
function colorKey(c: string) { return c.toLowerCase().replace(/[^a-z0-9]/g, ''); }
function getHex(c: string): string | null {
  return NAMED_COLORS[colorKey(c)] ?? null;
}
function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

/* ─── Icons ─── */
const IconPlus = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconX = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCheck = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/40">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconTrash = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

/* ─── Main Component ─── */
export function ProductCreateForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // ─── Info fields ───
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [category, setCategory] = useState<string>('tshirts');
  const [priceDzd, setPriceDzd] = useState('');
  const [featured, setFeatured] = useState(false);
  const [titleEn, setTitleEn] = useState('');
  const [descEn, setDescEn] = useState('');

  // Auto-slug
  useEffect(() => {
    if (!slugManual && titleEn) setSlug(slugify(titleEn));
  }, [titleEn, slugManual]);

  // ─── Colors (simplified: just pick colors, all sizes auto-added) ───
  const [colors, setColors] = useState<string[]>(['Black']);
  const [newColor, setNewColor] = useState('');

  const addColor = useCallback((color: string) => {
    const norm = normalizeColor(color);
    if (!norm) return;
    if (colors.some((c) => colorKey(c) === colorKey(norm))) return;
    setColors((prev) => [...prev, norm]);
  }, [colors]);

  const removeColor = useCallback((idx: number) => {
    setColors((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ─── Images (color-grouped) ───
  const [colorImages, setColorImages] = useState<ColorImageGroup[]>([]);
  const [generalImages, setGeneralImages] = useState<{ file: File; preview: string }[]>([]);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Sync color groups with colors list
  useEffect(() => {
    setColorImages((prev) => {
      const existing = new Map(prev.map((g) => [colorKey(g.color), g]));
      return colors.map((color) => existing.get(colorKey(color)) ?? { color, files: [] });
    });
  }, [colors]);

  const addFilesToGroup = useCallback((groupColor: string | null, newFiles: FileList | File[]) => {
    const picked = Array.from(newFiles).filter(
      (f) => f.size > 0 && ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    if (picked.length === 0) return;
    const entries = picked.map((file) => ({ file, preview: URL.createObjectURL(file) }));

    if (groupColor === null) {
      setGeneralImages((prev) => [...prev, ...entries]);
    } else {
      setColorImages((prev) =>
        prev.map((g) =>
          colorKey(g.color) === colorKey(groupColor) ? { ...g, files: [...g.files, ...entries] } : g
        )
      );
    }
  }, []);

  const removeImageFromGroup = useCallback((groupColor: string | null, index: number) => {
    if (groupColor === null) {
      setGeneralImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setColorImages((prev) =>
        prev.map((g) =>
          colorKey(g.color) === colorKey(groupColor) ? { ...g, files: g.files.filter((_, i) => i !== index) } : g
        )
      );
    }
  }, []);

  // ─── Validation ───
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalImgCount = generalImages.length + colorImages.reduce((a, g) => a + g.files.length, 0);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!slug.trim()) e.slug = 'Slug is required';
    if (!titleEn.trim()) e.titleEn = 'Product name is required';
    if (!descEn.trim()) e.descEn = 'Description is required';
    if (!priceDzd || Number(priceDzd) <= 0) e.priceDzd = 'Price must be greater than 0';
    if (colors.length === 0) e.colors = 'Add at least one color';
    const total = generalImages.length + colorImages.reduce((a, g) => a + g.files.length, 0);
    if (total === 0) e.images = 'Upload at least one image';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [slug, titleEn, descEn, priceDzd, colors, generalImages, colorImages]);

  // ─── Submit ───
  const handleSubmit = () => {
    if (!validate()) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }

    const fd = new FormData();
    fd.append('slug', slug);
    fd.append('category', category);
    fd.append('priceDzd', priceDzd);
    fd.append('titleEn', titleEn);
    fd.append('titleFr', titleEn);
    fd.append('titleAr', titleEn);
    fd.append('descriptionEn', descEn);
    fd.append('descriptionFr', descEn);
    fd.append('descriptionAr', descEn);
    if (featured) fd.append('featured', 'on');

    // Images: general first, then per-color
    const allImages: { file: File; colorTag: string | null }[] = [];
    generalImages.forEach((e) => allImages.push({ file: e.file, colorTag: null }));
    colorImages.forEach((g) => g.files.forEach((e) => allImages.push({ file: e.file, colorTag: g.color })));
    allImages.forEach((e) => fd.append('images', e.file));
    fd.append('imageColorTagsJson', JSON.stringify(allImages.map((e) => e.colorTag)));

    // Auto-generate variants: all standard sizes × all colors, default stock
    const variants = colors.flatMap((color) =>
      STANDARD_SIZES.map((size) => ({ size, color: normalizeColor(color), stock: DEFAULT_STOCK }))
    );
    fd.append('variantsJson', JSON.stringify(variants));

    startTransition(async () => {
      try {
        await action(fd);
        showToast('success', 'Product created successfully!');
        setOpen(false);
        resetForm();
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Failed to create product');
      }
    });
  };

  const resetForm = () => {
    setSlug(''); setSlugManual(false); setCategory('tshirts'); setPriceDzd('');
    setFeatured(false); setTitleEn(''); setTitleFr(''); setTitleAr('');
    setDescEn(''); setDescFr(''); setDescAr('');
    setColors(['Black']); setNewColor('');
    setGeneralImages([]); setColorImages([]);
    setErrors({});
  };

  /* ─── Closed state ─── */
  if (!open) {
    return (
      <>
        {toast && (
          <div className={`admin-toast ${toast.type === 'success' ? 'admin-toast-success' : 'admin-toast-error'} fixed top-4 right-4 z-50`}>
            {toast.type === 'success' ? <IconCheck /> : <IconX />}
            {toast.msg}
            <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><IconX size={10} /></button>
          </div>
        )}
        <button type="button" onClick={() => setOpen(true)} className="admin-btn-primary flex items-center gap-2">
          <IconPlus size={16} /> Add New Product
        </button>
      </>
    );
  }

  /* ─── Open: Full form ─── */
  return (
    <div className="admin-card w-full">
      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type === 'success' ? 'admin-toast-success' : 'admin-toast-error'} mx-5 mt-4`}>
          {toast.type === 'success' ? <IconCheck /> : <IconX />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-auto opacity-60 hover:opacity-100"><IconX size={10} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold">New Product</h2>
          <p className="mt-0.5 text-[12px] text-black/45">Fill in the details and upload images for each color.</p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-black/40 transition-colors hover:bg-black/5 hover:text-black">
          <IconX size={16} />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* ─── SECTION 1: Basic Info ─── */}
        <fieldset>
          <legend className="admin-label mb-3">Product Information</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="admin-field">
              <label className="admin-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input">
                <option value="tshirts">T-Shirts</option>
                <option value="pants">Pants</option>
                <option value="shoes">Shoes</option>
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Price (DZD)</label>
              <input type="number" value={priceDzd} onChange={(e) => setPriceDzd(e.target.value)}
                placeholder="e.g. 4500" className={`admin-input ${errors.priceDzd ? 'border-red-400' : ''}`} />
              {errors.priceDzd && <p className="text-[11px] text-red-500 mt-1">{errors.priceDzd}</p>}
            </div>
          </div>

          {/* Product Name */}
          <div className="admin-field mt-3">
            <label className="admin-label">Product Name</label>
            <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. Legacy Tee Black" className={`admin-input ${errors.titleEn ? 'border-red-400' : ''}`} />
            {errors.titleEn && <p className="text-[11px] text-red-500 mt-1">{errors.titleEn}</p>}
          </div>

          {/* Slug */}
          <div className="admin-field mt-3">
            <label className="admin-label">Slug</label>
            <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
              placeholder="auto-generated-from-title" className={`admin-input ${errors.slug ? 'border-red-400' : ''}`} />
            {!slugManual && titleEn && <p className="text-[11px] text-black/35 mt-1">Auto-generated from title</p>}
          </div>

          {/* Description */}
          <div className="admin-field mt-3">
            <label className="admin-label">Description</label>
            <textarea value={descEn} onChange={(e) => setDescEn(e.target.value)}
              placeholder="Product description…" rows={3} className={`admin-input py-2.5 ${errors.descEn ? 'border-red-400' : ''}`} />
            {errors.descEn && <p className="text-[11px] text-red-500 mt-1">{errors.descEn}</p>}
          </div>

          {/* Featured toggle */}
          <div className="mt-3">
            <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
              <div className="relative">
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="sr-only peer" />
                <div className="h-5 w-9 rounded-full bg-black/10 peer-checked:bg-black transition-colors" />
                <div className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-black/70">Featured product</span>
            </label>
          </div>
        </fieldset>

        {/* ─── SECTION 2: Available Colors ─── */}
        <fieldset>
          <legend className="admin-label mb-3">
            Available Colors
            <span className="text-black/30 normal-case font-normal ml-2">
              All sizes ({STANDARD_SIZES.join(', ')}) are auto-added per color
            </span>
          </legend>

          {errors.colors && <p className="text-[11px] text-red-500 mb-2">{errors.colors}</p>}

          {/* Current colors */}
          <div className="flex flex-wrap gap-2 mb-3">
            {colors.map((color, i) => {
              const hex = getHex(color);
              return (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[12px] font-medium">
                  {hex && <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: hex }} />}
                  {color}
                  <button type="button" onClick={() => removeColor(i)}
                    className="ml-0.5 rounded-full p-0.5 text-black/30 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <IconX size={8} />
                  </button>
                </span>
              );
            })}
          </div>

          {/* Add color */}
          <div className="flex flex-wrap items-center gap-2">
            <input value={newColor} onChange={(e) => setNewColor(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newColor.trim()) { addColor(newColor); setNewColor(''); } } }}
              placeholder="Type a color name…" className="admin-input-sm w-40" />
            <button type="button" onClick={() => { if (newColor.trim()) { addColor(newColor); setNewColor(''); } }}
              className="admin-btn-secondary py-1.5 text-[12px]">
              Add Color
            </button>
          </div>

          {/* Quick color chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUICK_COLORS.filter((c) => !colors.some((existing) => colorKey(existing) === colorKey(c))).map((c) => {
              const hex = getHex(c);
              return (
                <button key={c} type="button" onClick={() => addColor(c)}
                  className="flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-1 text-[11px] text-black/50 hover:border-black/30 hover:text-black transition-colors">
                  {hex && <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: hex }} />}
                  {c}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* ─── SECTION 3: Images ─── */}
        <fieldset>
          <legend className="admin-label mb-3">
            Product Images
            {totalImgCount > 0 && <span className="text-black/30 normal-case font-normal ml-2">({totalImgCount} uploaded)</span>}
          </legend>

          {errors.images && <p className="text-[11px] text-red-500 mb-2">{errors.images}</p>}

          {/* General images */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-medium text-black/60">General (lifestyle shots)</p>
              {generalImages.length > 0 && (
                <button type="button" onClick={() => fileRefs.current['general']?.click()}
                  className="text-[11px] text-black/40 hover:text-black transition-colors">
                  + Add more
                </button>
              )}
            </div>
            {generalImages.length === 0 ? (
              <div className="admin-dropzone py-5" onClick={() => fileRefs.current['general']?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); addFilesToGroup(null, e.dataTransfer.files); }}>
                <div className="flex flex-col items-center gap-1">
                  <IconUpload />
                  <p className="text-[12px] text-black/40">Drop or click — JPG, PNG, WebP</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {generalImages.map((entry, i) => (
                  <ImageThumb key={i} src={entry.preview} onRemove={() => removeImageFromGroup(null, i)} />
                ))}
              </div>
            )}
            <input ref={(el) => { fileRefs.current['general'] = el; }} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
              onChange={(e) => { addFilesToGroup(null, e.target.files ?? []); e.target.value = ''; }} />
          </div>

          {/* Per-color images */}
          {colorImages.map((group) => {
            const hex = getHex(group.color);
            const key = colorKey(group.color);
            return (
              <div key={key} className="mb-3 rounded-lg border border-black/10 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {hex ? (
                      <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
                    ) : (
                      <span className="h-4 w-4 rounded-full bg-black/10" />
                    )}
                    <span className="text-[12px] font-medium text-black">{group.color}</span>
                    <span className="text-[11px] text-black/30">{group.files.length} img</span>
                  </div>
                  <button type="button" onClick={() => fileRefs.current[key]?.click()}
                    className="text-[11px] text-black/40 hover:text-black transition-colors">
                    + Upload
                  </button>
                </div>
                {group.files.length === 0 ? (
                  <div className="admin-dropzone py-4" onClick={() => fileRefs.current[key]?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                    onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); addFilesToGroup(group.color, e.dataTransfer.files); }}>
                    <p className="text-[11px] text-black/35">Drop images for <strong>{group.color}</strong> variant</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {group.files.map((entry, i) => (
                      <ImageThumb key={i} src={entry.preview} onRemove={() => removeImageFromGroup(group.color, i)} />
                    ))}
                    <div onClick={() => fileRefs.current[key]?.click()}
                      className="aspect-[3/4] flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-black/10 text-black/25 hover:border-black/20 hover:text-black/40 transition-colors">
                      <IconPlus size={16} />
                    </div>
                  </div>
                )}
                <input ref={(el) => { fileRefs.current[key] = el; }} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                  onChange={(e) => { addFilesToGroup(group.color, e.target.files ?? []); e.target.value = ''; }} />
              </div>
            );
          })}

          <p className="text-[11px] text-black/30 mt-2">💡 Each color&apos;s images will auto-switch when a customer picks that color.</p>
        </fieldset>

        {/* ─── Summary ─── */}
        <div className="rounded-lg border border-black/10 bg-black/[0.02] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-black/35 mb-2">Summary</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-black/60">
            <span>Colors: <b className="text-black">{colors.length}</b></span>
            <span>Sizes per color: <b className="text-black">{STANDARD_SIZES.length}</b></span>
            <span>Total variants: <b className="text-black">{colors.length * STANDARD_SIZES.length}</b></span>
            <span>Images: <b className="text-black">{totalImgCount}</b></span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {colors.map((c) => {
              const hex = getHex(c);
              return (
                <span key={c} className="inline-flex items-center gap-1 rounded bg-white border border-black/10 px-2 py-0.5 text-[10px]">
                  {hex && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hex }} />}
                  {c}: {STANDARD_SIZES.join(' · ')}
                </span>
              );
            })}
          </div>
        </div>

        {/* ─── Submit ─── */}
        <div className="flex gap-3 border-t border-black/10 pt-4">
          <button type="button" onClick={handleSubmit} disabled={isPending}
            className="admin-btn-primary flex-1 flex items-center justify-center gap-2">
            {isPending ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating…
              </>
            ) : (
              <>
                <IconCheck /> Create Product
              </>
            )}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="admin-btn-secondary px-5">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub: Image Thumbnail ─── */
function ImageThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="admin-thumb group aspect-[3/4]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Preview" />
      <div className="admin-thumb-actions">
        <button type="button" onClick={onRemove}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-500 transition-transform hover:scale-110">
          <IconTrash size={11} />
        </button>
      </div>
    </div>
  );
}
