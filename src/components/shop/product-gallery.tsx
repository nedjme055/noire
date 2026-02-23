'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';

type GalleryImage = {
  url: string;
  colorHint?: string;
};

/** Normalize a color string for comparison: lowercase, no spaces/special chars */
function normalizeColorKey(value?: string) {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Find all images matching the selected color.
 * Uses direct colorHint comparison (set from DB colorTag).
 */
function getImagesForColor(images: GalleryImage[], color?: string): GalleryImage[] {
  if (!color) return images;
  const selectedKey = normalizeColorKey(color);
  if (!selectedKey) return images;

  const matched = images.filter((img) => {
    if (!img.colorHint) return false;
    const hintKey = normalizeColorKey(img.colorHint);
    // Direct match
    if (hintKey === selectedKey) return true;
    // Case-insensitive trimmed match
    if (img.colorHint.trim().toLowerCase() === color.trim().toLowerCase()) return true;
    return false;
  });

  // If we found color-specific images, show those first, then general images (no colorHint)
  if (matched.length > 0) {
    const generalImages = images.filter((img) => !img.colorHint);
    return [...matched, ...generalImages];
  }

  // No match — show all images
  return images;
}

export function ProductGallery({
  images,
  alt,
  selectedColor,
}: {
  images: GalleryImage[];
  alt: string;
  selectedColor?: string;
}) {
  // Get the filtered/reordered images for the current color
  const displayImages = useMemo(
    () => getImagesForColor(images, selectedColor),
    [images, selectedColor]
  );

  const [activeUrl, setActiveUrl] = useState<string>(displayImages[0]?.url ?? '');

  // When color changes, switch to the first matching image
  useEffect(() => {
    if (displayImages.length > 0) {
      setActiveUrl(displayImages[0].url);
    }
  }, [selectedColor, displayImages]);

  if (images.length === 0) return null;

  const activeImage = displayImages.find((img) => img.url === activeUrl) ?? displayImages[0];

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f0ede8]">
        <Image
          key={activeUrl}
          src={activeImage.url}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 640px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnail strip — only shown if more than 1 image */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => {
            const isActive = img.url === activeUrl;
            return (
              <button
                key={`${img.url}-${i}`}
                type="button"
                onClick={() => setActiveUrl(img.url)}
                className={`relative h-20 w-16 shrink-0 overflow-hidden bg-[#f0ede8] transition-all ${isActive ? 'ring-2 ring-black ring-offset-1' : 'opacity-60 hover:opacity-100'
                  }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image
                  src={img.url}
                  alt={`${alt} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
