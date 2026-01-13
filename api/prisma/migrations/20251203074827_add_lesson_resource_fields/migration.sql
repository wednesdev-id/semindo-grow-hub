/*
  Warnings:

  - You are about to drop the column `duration` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `is_published` on the `modules` table. All the data in the column will be lost.
  - You are about to drop the `resources` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_course_id_fkey";

-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_module_id_fkey";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "duration";

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "resource_url" TEXT;

-- AlterTable
ALTER TABLE "modules" DROP COLUMN "is_published";

-- DropTable
DROP TABLE "resources";
