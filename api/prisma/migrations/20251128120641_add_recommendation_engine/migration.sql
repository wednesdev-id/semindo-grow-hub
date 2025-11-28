/*
  Warnings:

  - A unique constraint covering the columns `[assessment_id,question_id]` on the table `assessment_responses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "recommendation_rules" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "category_id" TEXT,
    "minScore" DECIMAL(5,2),
    "maxScore" DECIMAL(5,2),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "actionItems" JSONB NOT NULL,
    "resources" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_recommendations" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "actionItems" JSONB NOT NULL,
    "resources" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_responses_assessment_id_question_id_key" ON "assessment_responses"("assessment_id", "question_id");

-- AddForeignKey
ALTER TABLE "recommendation_rules" ADD CONSTRAINT "recommendation_rules_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "assessment_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_rules" ADD CONSTRAINT "recommendation_rules_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "assessment_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_recommendations" ADD CONSTRAINT "assessment_recommendations_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
