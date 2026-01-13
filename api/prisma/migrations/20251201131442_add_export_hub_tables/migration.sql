/*
  Warnings:

  - You are about to drop the column `is_verified` on the `umkm_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "umkm_profiles" DROP COLUMN "is_verified",
ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "legal_status" JSONB,
ADD COLUMN     "omzet_monthly" DECIMAL(15,2),
ADD COLUMN     "production_capacity" TEXT,
ADD COLUMN     "sales_channels" JSONB,
ADD COLUMN     "social_media" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'unverified';

-- CreateTable
CREATE TABLE "umkm_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "umkm_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "umkm_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "umkm_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_hs_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tariff" TEXT,
    "requirements" JSONB,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_hs_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "flag" TEXT,
    "market" TEXT,
    "distance" TEXT,
    "shipping_time" TEXT,
    "avg_tariff" TEXT,
    "requirements" JSONB,
    "topProducts" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_buyers" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "country_id" TEXT NOT NULL,
    "category" TEXT,
    "products" JSONB,
    "volume" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "contact_info" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_buyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UMKMProfileToUMKMTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "umkm_categories_name_key" ON "umkm_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "umkm_categories_slug_key" ON "umkm_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "umkm_tags_name_key" ON "umkm_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "export_hs_codes_code_key" ON "export_hs_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "export_countries_name_key" ON "export_countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "export_countries_code_key" ON "export_countries"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_UMKMProfileToUMKMTag_AB_unique" ON "_UMKMProfileToUMKMTag"("A", "B");

-- CreateIndex
CREATE INDEX "_UMKMProfileToUMKMTag_B_index" ON "_UMKMProfileToUMKMTag"("B");

-- AddForeignKey
ALTER TABLE "umkm_profiles" ADD CONSTRAINT "umkm_profiles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "umkm_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_buyers" ADD CONSTRAINT "export_buyers_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "export_countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UMKMProfileToUMKMTag" ADD CONSTRAINT "_UMKMProfileToUMKMTag_A_fkey" FOREIGN KEY ("A") REFERENCES "umkm_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UMKMProfileToUMKMTag" ADD CONSTRAINT "_UMKMProfileToUMKMTag_B_fkey" FOREIGN KEY ("B") REFERENCES "umkm_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
