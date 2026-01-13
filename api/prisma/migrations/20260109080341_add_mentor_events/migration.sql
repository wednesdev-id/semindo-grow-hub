-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "is_umkm_only" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mentor_id" TEXT;

-- CreateTable
CREATE TABLE "mentor_events" (
    "id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "venue" TEXT,
    "address" TEXT,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "max_attendees" INTEGER NOT NULL DEFAULT 50,
    "registration_end" TIMESTAMP(3),
    "type" TEXT NOT NULL DEFAULT 'workshop',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_event_attendees" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "umkm_profile_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "notes" TEXT,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "attended_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),

    CONSTRAINT "mentor_event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentor_events_slug_key" ON "mentor_events"("slug");

-- CreateIndex
CREATE INDEX "mentor_events_mentor_id_idx" ON "mentor_events"("mentor_id");

-- CreateIndex
CREATE INDEX "mentor_events_province_city_idx" ON "mentor_events"("province", "city");

-- CreateIndex
CREATE INDEX "mentor_events_start_date_idx" ON "mentor_events"("start_date");

-- CreateIndex
CREATE INDEX "mentor_event_attendees_event_id_idx" ON "mentor_event_attendees"("event_id");

-- CreateIndex
CREATE INDEX "mentor_event_attendees_umkm_profile_id_idx" ON "mentor_event_attendees"("umkm_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_event_attendees_event_id_umkm_profile_id_key" ON "mentor_event_attendees"("event_id", "umkm_profile_id");

-- CreateIndex
CREATE INDEX "courses_mentor_id_idx" ON "courses"("mentor_id");

-- AddForeignKey
ALTER TABLE "mentor_events" ADD CONSTRAINT "mentor_events_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_event_attendees" ADD CONSTRAINT "mentor_event_attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "mentor_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_event_attendees" ADD CONSTRAINT "mentor_event_attendees_umkm_profile_id_fkey" FOREIGN KEY ("umkm_profile_id") REFERENCES "umkm_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "mentor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
