FROM node:20-alpine AS base

# Установка зависимостей
FROM base AS deps
WORKDIR /app

# Копируем сначала только файлы Prisma
COPY prisma ./prisma/

# Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Сборка приложения
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Генерация Prisma клиента
RUN npx prisma generate

# Сборка Next.js
RUN npm run build

# Рабочее окружение
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Создание пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Копирование необходимых файлов
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Создание директории для загрузки файлов
RUN mkdir -p /app/public/uploads

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Запуск миграций и приложения
CMD npx prisma migrate deploy && node server.js
