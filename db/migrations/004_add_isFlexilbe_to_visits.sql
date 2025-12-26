-- Migration: add isFlexilbe to visits
-- Adds a boolean column "isFlexilbe" to the visits table (camelCase column name quoted)

ALTER TABLE "visits"
  ADD COLUMN IF NOT EXISTS "isFlexilbe" boolean DEFAULT false;

-- End of migration
