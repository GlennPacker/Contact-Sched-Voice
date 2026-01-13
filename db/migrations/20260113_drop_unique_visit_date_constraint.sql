-- Migration to drop the unique constraint 'unique_visit_date' from the calendars table
ALTER TABLE calendars DROP CONSTRAINT IF EXISTS unique_visit_date;
