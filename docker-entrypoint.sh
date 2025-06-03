#!/bin/sh
set -e

# Запускаем миграции Prisma
echo "Running database migrations..."
npx prisma migrate deploy

# Запускаем приложение
echo "Starting application..."
exec "$@" 