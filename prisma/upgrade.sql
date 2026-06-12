-- Idempotent incremental upgrade for existing databases (test platform).
-- Safe to run on every boot: each step guards against "already exists".
-- Adds the MerchantSite/CallbackLog tables and the site/callback columns on
-- orders that the hosted-checkout + merchant-notification flow needs.

-- Enums -------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "SiteStatus" AS ENUM ('ACTIVE', 'DISABLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CallbackStatus" AS ENUM ('NA', 'PENDING', 'SENT', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- orders: new columns + relax linkId ------------------------------------
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "siteId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "externalOrderId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "returnUrl" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "callbackUrl" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "callbackStatus" "CallbackStatus" NOT NULL DEFAULT 'NA';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "callbackAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "callbackLastError" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "callbackAt" TIMESTAMP(3);
ALTER TABLE "orders" ALTER COLUMN "linkId" DROP NOT NULL;

-- Tables -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "merchant_sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT NOT NULL,
    "callbackUrl" TEXT,
    "status" "SiteStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "merchant_sites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "callback_logs" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT,
    "signatureOk" BOOLEAN NOT NULL DEFAULT false,
    "headers" JSONB,
    "body" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "callback_logs_pkey" PRIMARY KEY ("id")
);

-- Indexes ----------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "merchant_sites_apiKey_key" ON "merchant_sites"("apiKey");
CREATE INDEX IF NOT EXISTS "merchant_sites_ownerId_idx" ON "merchant_sites"("ownerId");
CREATE INDEX IF NOT EXISTS "callback_logs_apiKey_idx" ON "callback_logs"("apiKey");
CREATE INDEX IF NOT EXISTS "orders_siteId_idx" ON "orders"("siteId");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_siteId_externalOrderId_key" ON "orders"("siteId", "externalOrderId");

-- Foreign keys -----------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE "merchant_sites" ADD CONSTRAINT "merchant_sites_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "orders" ADD CONSTRAINT "orders_siteId_fkey"
    FOREIGN KEY ("siteId") REFERENCES "merchant_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
