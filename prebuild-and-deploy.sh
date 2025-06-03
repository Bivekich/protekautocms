#!/bin/bash
set -e

echo "Установка зависимостей..."
npm install --legacy-peer-deps

echo "Генерация Prisma клиента..."
npx prisma generate

echo "Сборка приложения..."
npm run build:no-check

echo "Сборка Docker образа..."
docker build -t protekauto-cms:latest -f Dockerfile.prebuild .

echo "Образ собран успешно! Теперь вы можете загрузить его на сервер"
echo "Для деплоя на сервере используйте docker-compose up -d" 