-- Создание таблицы Client, если она не существует
CREATE TABLE IF NOT EXISTS "Client" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "profileType" TEXT NOT NULL DEFAULT 'RETAIL',
  "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastLoginDate" TIMESTAMP(3),
  "markup" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Client_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Client_phone_key" UNIQUE ("phone")
);

-- Добавление новых полей в таблицу Client
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'REGULAR';
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "discount" DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "balance" DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS "settings" JSONB;

-- Создание таблицы Address
CREATE TABLE IF NOT EXISTS "Address" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "title" TEXT,
  "country" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "house" TEXT NOT NULL,
  "apartment" TEXT,
  "postalCode" TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Address_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Address_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Создание индекса на clientId в таблице Address
CREATE INDEX IF NOT EXISTS "Address_clientId_idx" ON "Address"("clientId");

-- Создание таблицы Order
CREATE TABLE IF NOT EXISTS "Order" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "total" DECIMAL(10, 2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Создание индекса на clientId в таблице Order
CREATE INDEX IF NOT EXISTS "Order_clientId_idx" ON "Order"("clientId");

-- Функция для генерации CUID
CREATE OR REPLACE FUNCTION generate_cuid()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := 'c';
  i INTEGER;
BEGIN
  FOR i IN 1..24 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
