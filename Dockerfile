FROM node:20-alpine

# Устанавливаем зависимости, необходимые для Prisma
RUN apk add --no-cache libc6-compat openssl

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы проекта
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Устанавливаем зависимости
RUN npm install --omit=dev

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