CREATE TABLE "calendars" (
  "id" serial PRIMARY KEY,
  "visitId" integer NOT NULL REFERENCES "visits"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  CONSTRAINT unique_visit_date UNIQUE ("visitId", "date")
);

CREATE INDEX IF NOT EXISTS idx_calendars_visitId ON "calendars" ("visitId");
