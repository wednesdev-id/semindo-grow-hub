-- DropIndex
DROP INDEX "umkm_profiles_user_id_key";

-- AlterTable
ALTER TABLE "consultation_requests" ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quoted_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "session_notes" TEXT;
