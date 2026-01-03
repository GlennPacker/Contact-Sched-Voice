-- Add nullable earliestDate column to visits for deferred recurrence handling
ALTER TABLE visits
ADD COLUMN IF NOT EXISTS "earliestDate" date;
