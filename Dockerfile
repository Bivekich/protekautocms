FROM node:20-alpine AS base

# Зависимости
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Сборка
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем Prisma клиент
RUN npx prisma generate

# Сборка Next.js
RUN npm run build

# Рабочая среда
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Запрет выполнения кода от root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Копируем только необходимые файлы
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# Скрипт для инициализации базы данных при первом запуске
# (создание директории для загрузки файлов также включено)
RUN mkdir -p /app/public/uploads

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Запускаем миграции и само приложение
CMD npx prisma migrate deploy && node server.js
