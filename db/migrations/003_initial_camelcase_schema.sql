CREATE TABLE "contacts" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "email" text,
  "whatsapp" text,
  "facebookGlenn" boolean DEFAULT false,
  "facebookHandyman" boolean DEFAULT false,
  "rateFullDay" numeric,
  "rateHalfDay" numeric,
  "rateTwoHour" numeric,
  "rateHour" numeric,
  "rateJob" numeric,
  "priceReviewDate" date
);

CREATE TABLE "addresses" (
  "id" serial PRIMARY KEY,
  "contactId" integer NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
  "address" text
);

CREATE TABLE "visits" (
  "id" serial PRIMARY KEY,
  "addressId" integer NOT NULL REFERENCES "addresses"("id") ON DELETE CASCADE,
  "visitDate" date,
  "notes" text,
  "isInside" boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_addresses_contactId ON "addresses" ("contactId");
CREATE INDEX IF NOT EXISTS idx_visits_addressId ON "visits" ("addressId");
