-- Add color to Variant with safe default for existing rows
ALTER TABLE "Variant" ADD COLUMN "color" TEXT NOT NULL DEFAULT 'Default';

-- Add variant reference + color snapshot on order items
ALTER TABLE "OrderItem" ADD COLUMN "variantId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "color" TEXT;

-- Add unique constraint for product + size + color
CREATE UNIQUE INDEX "Variant_productId_size_color_key" ON "Variant"("productId", "size", "color");

-- Add relation between OrderItem and Variant
ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_variantId_fkey"
FOREIGN KEY ("variantId") REFERENCES "Variant"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
