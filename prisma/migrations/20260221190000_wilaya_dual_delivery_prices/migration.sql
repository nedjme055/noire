-- Rename delivery enum value
ALTER TYPE "DeliveryMethod" RENAME VALUE 'yalidine' TO 'stopdesk';

-- Replace single shipping price by two prices per wilaya
ALTER TABLE "ShippingWilaya"
ADD COLUMN "home_price_dzd" INTEGER,
ADD COLUMN "stopdesk_price_dzd" INTEGER;

UPDATE "ShippingWilaya"
SET
  "home_price_dzd" = "priceDzd",
  "stopdesk_price_dzd" = GREATEST("priceDzd" - 150, 0)
WHERE "home_price_dzd" IS NULL OR "stopdesk_price_dzd" IS NULL;

ALTER TABLE "ShippingWilaya"
ALTER COLUMN "home_price_dzd" SET NOT NULL,
ALTER COLUMN "stopdesk_price_dzd" SET NOT NULL;

ALTER TABLE "ShippingWilaya"
DROP COLUMN "priceDzd";

-- Delivery prices now live in ShippingWilaya rows, remove global settings fields
ALTER TABLE "SiteSettings"
DROP COLUMN "deliveryHomePrice",
DROP COLUMN "deliveryYalidinePrice";