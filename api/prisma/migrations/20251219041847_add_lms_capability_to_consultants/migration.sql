/*
  Warnings:

  - You are about to drop the column `buffer_time_minutes` on the `consultant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `consultant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `max_sessions_per_day` on the `consultant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `previous_roles` on the `consultant_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `response_rate` on the `consultant_profiles` table. All the data in the column will be lost.
  - You are about to alter the column `hourly_rate` on the `consultant_profiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `average_rating` on the `consultant_profiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(3,2)` to `DoublePrecision`.
  - You are about to drop the column `category_id` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail_url` on the `courses` table. All the data in the column will be lost.
  - Made the column `title` on table `consultant_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bio` on table `consultant_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `years_experience` on table `consultant_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hourly_rate` on table `consultant_profiles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `courses` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_category_id_fkey";

-- AlterTable
ALTER TABLE "consultant_profiles" DROP COLUMN "buffer_time_minutes",
DROP COLUMN "currency",
DROP COLUMN "max_sessions_per_day",
DROP COLUMN "previous_roles",
DROP COLUMN "response_rate",
ADD COLUMN     "can_teach_courses" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consultation_type_id" TEXT,
ADD COLUMN     "instructor_bio" TEXT,
ADD COLUMN     "total_courses_created" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "total_students" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "bio" SET NOT NULL,
ALTER COLUMN "industries" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "years_experience" SET NOT NULL,
ALTER COLUMN "certifications" SET DATA TYPE TEXT,
ALTER COLUMN "education" SET DATA TYPE TEXT,
ALTER COLUMN "hourly_rate" SET NOT NULL,
ALTER COLUMN "hourly_rate" SET DATA TYPE INTEGER,
ALTER COLUMN "average_rating" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "category_id",
DROP COLUMN "thumbnail_url",
ADD COLUMN     "courseCategoryId" TEXT,
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "enrollment_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "instructor_id" TEXT,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'Indonesian',
ADD COLUMN     "learning_outcomes" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "review_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "target_audience" TEXT,
ADD COLUMN     "thumbnail" TEXT,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "level" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "consultant_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_courseCategoryId_fkey" FOREIGN KEY ("courseCategoryId") REFERENCES "course_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultant_profiles" ADD CONSTRAINT "consultant_profiles_consultation_type_id_fkey" FOREIGN KEY ("consultation_type_id") REFERENCES "consultation_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
