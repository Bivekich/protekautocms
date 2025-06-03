FROM node:20.15.0-alpine

WORKDIR /app

# Устанавливаем зависимости
RUN apk add --no-cache libc6-compat openssl

# Копируем все файлы
COPY . .

# Делаем entrypoint-скрипт исполняемым
RUN chmod +x ./docker-entrypoint.sh

# Порт, который будет слушать приложение
EXPOSE 3000

# Устанавливаем entrypoint-скрипт
ENTRYPOINT ["./docker-entrypoint.sh"]

# Команда для запуска приложения
CMD ["npm", "start"] 