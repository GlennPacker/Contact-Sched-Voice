ALTER TABLE "calendars"
  ADD COLUMN IF NOT EXISTS "time" varchar(32);
