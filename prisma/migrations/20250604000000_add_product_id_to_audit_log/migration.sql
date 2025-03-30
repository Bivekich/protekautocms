-- Добавление полей productId и targetType в таблицу AuditLog
ALTER TABLE "AuditLog" ADD COLUMN "productId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "targetType" TEXT;

-- Создание индекса для productId
CREATE INDEX "AuditLog_productId_idx" ON "AuditLog"("productId");
