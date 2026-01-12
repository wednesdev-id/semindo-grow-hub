-- CreateTable
CREATE TABLE "expertise_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'Briefcase',
    "category_group" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expertise_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultant_expertise" (
    "id" TEXT NOT NULL,
    "consultant_id" TEXT NOT NULL,
    "expertise_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultant_expertise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expertise_audit_logs" (
    "id" TEXT NOT NULL,
    "expertise_id" TEXT,
    "action" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "changed_by" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expertise_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expertise_categories_name_key" ON "expertise_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "expertise_categories_slug_key" ON "expertise_categories"("slug");

-- CreateIndex
CREATE INDEX "expertise_categories_is_active_is_deleted_idx" ON "expertise_categories"("is_active", "is_deleted");

-- CreateIndex
CREATE INDEX "expertise_categories_slug_idx" ON "expertise_categories"("slug");

-- CreateIndex
CREATE INDEX "consultant_expertise_consultant_id_idx" ON "consultant_expertise"("consultant_id");

-- CreateIndex
CREATE INDEX "consultant_expertise_expertise_id_idx" ON "consultant_expertise"("expertise_id");

-- CreateIndex
CREATE UNIQUE INDEX "consultant_expertise_consultant_id_expertise_id_key" ON "consultant_expertise"("consultant_id", "expertise_id");

-- CreateIndex
CREATE INDEX "expertise_audit_logs_expertise_id_idx" ON "expertise_audit_logs"("expertise_id");

-- CreateIndex
CREATE INDEX "expertise_audit_logs_changed_by_idx" ON "expertise_audit_logs"("changed_by");

-- AddForeignKey
ALTER TABLE "expertise_categories" ADD CONSTRAINT "expertise_categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultant_expertise" ADD CONSTRAINT "consultant_expertise_consultant_id_fkey" FOREIGN KEY ("consultant_id") REFERENCES "consultant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultant_expertise" ADD CONSTRAINT "consultant_expertise_expertise_id_fkey" FOREIGN KEY ("expertise_id") REFERENCES "expertise_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expertise_audit_logs" ADD CONSTRAINT "expertise_audit_logs_expertise_id_fkey" FOREIGN KEY ("expertise_id") REFERENCES "expertise_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expertise_audit_logs" ADD CONSTRAINT "expertise_audit_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
