
-- Create visittypes table (all lowercase, plural)
CREATE TABLE IF NOT EXISTS visittypes (
  id serial PRIMARY KEY,
  label text NOT NULL
);


-- Create tools table (all lowercase, plural)
CREATE TABLE IF NOT EXISTS tools (
  id serial PRIMARY KEY,
  visittypeid integer REFERENCES visittypes(id),
  tool text NOT NULL
);


-- Add visittypeids to visits table (CSV-style, no FK)
ALTER TABLE visits ADD COLUMN visittypeids text;
