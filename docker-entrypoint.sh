#!/bin/sh
set -e

# Установка зависимостей, если node_modules не существует
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci --only=production
fi

# Генерация Prisma клиента
echo "Generating Prisma client..."
npx prisma generate

# Сборка приложения, если .next не существует
if [ ! -d ".next" ]; then
  echo "Building application..."
  npm run build
fi

# Запускаем миграции Prisma
echo "Running database migrations..."
npx prisma migrate deploy

# Запускаем приложение
echo "Starting application..."
exec "$@" 