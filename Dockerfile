FROM node:20.15.0-alpine

WORKDIR /app

# Устанавливаем зависимости
RUN apk add --no-cache libc6-compat openssl

# Копируем файлы проекта
COPY . .

# Создаем директорию для загрузок
RUN mkdir -p ./public/uploads

# Установка зависимостей напрямую, без скриптов
RUN npm install --legacy-peer-deps

# Генерируем Prisma клиент
RUN npx prisma generate

# Для production
ENV NODE_ENV=production

# Порт, который будет слушать приложение
EXPOSE 3000

# Прямой запуск без скриптов
CMD ["npm", "start"] 