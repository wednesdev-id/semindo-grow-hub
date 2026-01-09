/*
  Warnings:

  - You are about to drop the column `instructor_id` on the `courses` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_instructor_id_fkey";

-- AlterTable
ALTER TABLE "consultation_requests" ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quoted_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "session_notes" TEXT;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "instructor_id",
ADD COLUMN     "consultant_instructor_id" TEXT,
ADD COLUMN     "mentor_instructor_id" TEXT;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_mentor_instructor_id_fkey" FOREIGN KEY ("mentor_instructor_id") REFERENCES "mentor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_consultant_instructor_id_fkey" FOREIGN KEY ("consultant_instructor_id") REFERENCES "consultant_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
