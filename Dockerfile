FROM node:20-alpine

WORKDIR /app

# Устанавливаем необходимые пакеты
RUN apk add --no-cache libc6-compat openssl

# Устанавливаем переменные окружения
ENV NODE_ENV=production

# Копируем все файлы
COPY . .

# Делаем entrypoint-скрипт исполняемым
RUN chmod +x ./docker-entrypoint.sh

# Создаем директорию для загрузок
RUN mkdir -p ./public/uploads

# Порт, который будет слушать приложение
EXPOSE 3000

# Устанавливаем entrypoint-скрипт
ENTRYPOINT ["./docker-entrypoint.sh"]

# Команда для запуска приложения
CMD ["npm", "start"] 