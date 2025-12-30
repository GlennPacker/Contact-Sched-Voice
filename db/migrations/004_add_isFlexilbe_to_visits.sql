ALTER TABLE "visits"
  ADD COLUMN IF NOT EXISTS "isFlexilbe" boolean DEFAULT false;
