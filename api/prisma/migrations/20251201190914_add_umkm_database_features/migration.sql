-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "expiry_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "umkm_profiles" ADD COLUMN     "district" TEXT,
ADD COLUMN     "location" JSONB,
ADD COLUMN     "nib" TEXT,
ADD COLUMN     "npwp" TEXT,
ADD COLUMN     "readiness_index" JSONB,
ADD COLUMN     "segmentation" TEXT,
ADD COLUMN     "segmentation_reason" TEXT,
ADD COLUMN     "self_assessment_score" DECIMAL(5,2),
ADD COLUMN     "village" TEXT;

-- CreateTable
CREATE TABLE "mentoring_sessions" (
    "id" TEXT NOT NULL,
    "umkm_profile_id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "topic" TEXT NOT NULL,
    "notes" TEXT,
    "next_action" TEXT,
    "status" TEXT NOT NULL DEFAULT 'done',
    "tags" TEXT[],
    "attachments" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentoring_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mentoring_sessions" ADD CONSTRAINT "mentoring_sessions_umkm_profile_id_fkey" FOREIGN KEY ("umkm_profile_id") REFERENCES "umkm_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentoring_sessions" ADD CONSTRAINT "mentoring_sessions_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
