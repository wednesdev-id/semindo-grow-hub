-- Add indexes for marketplace search and filter performance
-- This migration adds indexes to frequently queried columns

-- Product table indexes
CREATE INDEX IF NOT EXISTS "Product_title_idx" ON "Product"("title");
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");
CREATE INDEX IF NOT EXISTS "Product_price_idx" ON "Product"("price");
CREATE INDEX IF NOT EXISTS "Product_status_idx" ON "Product"("status");
CREATE INDEX IF NOT EXISTS "Product_isPublished_idx" ON "Product"("isPublished");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Product_storeId_idx" ON "Product"("storeId");
CREATE INDEX IF NOT EXISTS "Product_sellerId_idx" ON "Product"("sellerId");

-- Store table indexes
CREATE INDEX IF NOT EXISTS "Store_userId_idx" ON "Store"("userId");
CREATE INDEX IF NOT EXISTS "Store_isActive_idx" ON "Store"("isActive");
CREATE INDEX IF NOT EXISTS "Store_slug_idx" ON "Store"("slug");

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS "Product_status_published_idx" ON "Product"("status", "isPublished");
CREATE INDEX IF NOT EXISTS "Product_category_price_idx" ON "Product"("category", "price");
