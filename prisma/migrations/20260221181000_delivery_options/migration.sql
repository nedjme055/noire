-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('home', 'yalidine');

-- AlterTable Order
ALTER TABLE "Order"
ADD COLUMN "delivery_method" "DeliveryMethod" NOT NULL DEFAULT 'home',
ADD COLUMN "delivery_option_price" INTEGER NOT NULL DEFAULT 0;

-- AlterTable SiteSettings
ALTER TABLE "SiteSettings"
ADD COLUMN "deliveryHomePrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "deliveryYalidinePrice" INTEGER NOT NULL DEFAULT 0;
