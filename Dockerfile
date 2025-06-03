FROM node:20-alpine

WORKDIR /app

# Устанавливаем необходимые пакеты
RUN apk add --no-cache libc6-compat openssl

# Устанавливаем переменные окружения
ENV NODE_ENV=production

# Устанавливаем Prisma глобально
RUN npm install -g prisma@6.8.2

# Копируем файлы package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm i --legacy-peer-deps

# Копируем prisma схему
COPY prisma ./prisma

# Генерируем Prisma клиент
RUN npx prisma generate

# Копируем остальные файлы
COPY . .

# Делаем entrypoint-скрипт исполняемым
RUN chmod +x ./docker-entrypoint.sh

# Собираем приложение
RUN npm run build

# Создаем директорию для загрузок
RUN mkdir -p ./public/uploads

# Порт, который будет слушать приложение
EXPOSE 3000

# Устанавливаем entrypoint-скрипт
ENTRYPOINT ["./docker-entrypoint.sh"]

# Команда для запуска приложения
CMD ["npm", "start"] 