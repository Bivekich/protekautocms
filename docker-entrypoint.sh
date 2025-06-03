#!/bin/sh
set -e

# Устанавливаем зависимости
echo "Installing dependencies..."
npm install --legacy-peer-deps --no-fund --no-audit

# Генерируем Prisma клиент
echo "Generating Prisma client..."
npx prisma generate

# Собираем приложение
echo "Building application..."
npm run build:no-check

# Создаем директорию для загрузок
mkdir -p ./public/uploads

# Запускаем миграции Prisma
echo "Running database migrations..."
npx prisma migrate deploy

# Запускаем приложение
echo "Starting application..."
exec "$@" 