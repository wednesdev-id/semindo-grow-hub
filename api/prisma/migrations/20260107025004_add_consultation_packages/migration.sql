-- AlterTable
ALTER TABLE "consultation_requests" ADD COLUMN     "package_id" TEXT;

-- CreateTable
CREATE TABLE "consultation_packages" (
    "id" TEXT NOT NULL,
    "consultant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultation_packages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "consultation_packages" ADD CONSTRAINT "consultation_packages_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "consultant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_requests" ADD CONSTRAINT "consultation_requests_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "consultation_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
