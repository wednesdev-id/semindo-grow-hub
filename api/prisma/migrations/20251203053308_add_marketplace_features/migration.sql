-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_link" TEXT,
ADD COLUMN     "payment_status" TEXT NOT NULL DEFAULT 'unpaid';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "external_links" JSONB;
