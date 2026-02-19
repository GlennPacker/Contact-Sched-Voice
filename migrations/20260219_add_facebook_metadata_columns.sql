ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS facebookGlennMetadata TEXT,
ADD COLUMN IF NOT EXISTS facebookHandymanMetadata TEXT;
