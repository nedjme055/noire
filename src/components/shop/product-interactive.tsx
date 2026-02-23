'use client';

import { useState } from 'react';
import { ProductGallery } from '@/components/shop/product-gallery';
import { AddToCart } from '@/components/shop/add-to-cart';

type GalleryImage = { url: string; colorHint?: string };
type Variant = { id: string; size: string; color: string; stock: number };
const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200';

type Props = {
    productId: string;
    slug: string;
    title: string;
    images: GalleryImage[];
    priceDzd: number;
    variants: Variant[];
};

export function ProductInteractive({ productId, slug, title, images, priceDzd, variants }: Props) {
    const [selectedColor, setSelectedColor] = useState<string | undefined>(
        variants.filter((v) => v.stock > 0)[0]?.color
    );

    return (
        <div className="grid grid-cols-1 gap-8 pt-6 sm:grid-cols-2 sm:gap-12">
            {/* Gallery — reacts to color changes instantly */}
            <ProductGallery
                images={images.length > 0 ? images : [{ url: FALLBACK_PRODUCT_IMAGE, colorHint: '' }]}
                alt={title}
                selectedColor={selectedColor}
            />

            {/* Add to cart — reports color changes up */}
            <AddToCart
                productId={productId}
                slug={slug}
                title={title}
                image={images[0]?.url ?? FALLBACK_PRODUCT_IMAGE}
                images={images}
                priceDzd={priceDzd}
                variants={variants}
                onColorChange={setSelectedColor}
            />
        </div>
    );
}
