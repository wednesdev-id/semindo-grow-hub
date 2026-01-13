-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid,
  url text NOT NULL,
  thumbnail_url text,
  width integer,
  height integer,
  size integer,
  format text,
  is_thumbnail boolean DEFAULT false,
  sort_order integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE IF EXISTS product_images
  ADD CONSTRAINT fk_product_images_product
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);