-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MERCHANT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('ONE_TIME', 'REUSABLE');

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'WAITING', 'CONFIRMING', 'PARTIALLY_PAID', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('UNPAID', 'PROCESSING', 'SENT');

-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "CallbackStatus" AS ENUM ('NA', 'PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MERCHANT',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "payoutMethod" TEXT,
    "payoutAddress" TEXT,
    "payoutNotes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_links" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "type" "LinkType" NOT NULL DEFAULT 'ONE_TIME',
    "status" "LinkStatus" NOT NULL DEFAULT 'ACTIVE',
    "creatorId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_sites" (
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

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "linkId" TEXT,
    "siteId" TEXT,
    "externalOrderId" TEXT,
    "description" TEXT,
    "returnUrl" TEXT,
    "callbackUrl" TEXT,
    "creatorId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "payCurrency" TEXT,
    "payAmount" DECIMAL(36,8),
    "payAddress" TEXT,
    "nowPaymentId" TEXT,
    "actuallyPaid" DECIMAL(36,8),
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "payerEmail" TEXT,
    "paidAt" TIMESTAMP(3),
    "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'UNPAID',
    "payoutTxRef" TEXT,
    "payoutAt" TIMESTAMP(3),
    "payoutNote" TEXT,
    "callbackStatus" "CallbackStatus" NOT NULL DEFAULT 'NA',
    "callbackAttempts" INTEGER NOT NULL DEFAULT 0,
    "callbackLastError" TEXT,
    "callbackAt" TIMESTAMP(3),
    "lastIpn" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "callback_logs" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT,
    "signatureOk" BOOLEAN NOT NULL DEFAULT false,
    "headers" JSONB,
    "body" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "callback_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_links_slug_key" ON "payment_links"("slug");

-- CreateIndex
CREATE INDEX "payment_links_creatorId_idx" ON "payment_links"("creatorId");

-- CreateIndex
CREATE INDEX "payment_links_status_idx" ON "payment_links"("status");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_sites_apiKey_key" ON "merchant_sites"("apiKey");

-- CreateIndex
CREATE INDEX "merchant_sites_ownerId_idx" ON "merchant_sites"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_reference_key" ON "orders"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "orders_nowPaymentId_key" ON "orders"("nowPaymentId");

-- CreateIndex
CREATE INDEX "orders_creatorId_idx" ON "orders"("creatorId");

-- CreateIndex
CREATE INDEX "orders_linkId_idx" ON "orders"("linkId");

-- CreateIndex
CREATE INDEX "orders_siteId_idx" ON "orders"("siteId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_payoutStatus_idx" ON "orders"("payoutStatus");

-- CreateIndex
CREATE UNIQUE INDEX "orders_siteId_externalOrderId_key" ON "orders"("siteId", "externalOrderId");

-- CreateIndex
CREATE INDEX "callback_logs_apiKey_idx" ON "callback_logs"("apiKey");

-- AddForeignKey
ALTER TABLE "payment_links" ADD CONSTRAINT "payment_links_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_sites" ADD CONSTRAINT "merchant_sites_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "payment_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "merchant_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

