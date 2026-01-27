-- DropIndex
DROP INDEX "umkm_profiles_user_id_key";

-- AlterTable
ALTER TABLE "consultation_requests" ADD COLUMN IF NOT EXISTS "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "quoted_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "session_notes" TEXT;
