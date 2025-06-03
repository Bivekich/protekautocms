#!/bin/bash
set -e

# Настройки
SERVER_IP="your-server-ip"
SERVER_USER="your-server-username"
APP_NAME="protekauto-cms"
TAG="latest"

# Сборка образа
echo "Сборка Docker образа локально..."
docker build -t $APP_NAME:$TAG -f Dockerfile.simple .

# Сохранение образа в tar-архив
echo "Сохранение образа в архив..."
docker save $APP_NAME:$TAG > ${APP_NAME}-${TAG}.tar

# Отправка архива на сервер
echo "Отправка архива на сервер..."
scp ${APP_NAME}-${TAG}.tar $SERVER_USER@$SERVER_IP:/tmp/

# Удаление локального архива
echo "Удаление локального архива..."
rm ${APP_NAME}-${TAG}.tar

# Выполнение команд на сервере
echo "Загрузка образа на сервере и запуск контейнера..."
ssh $SERVER_USER@$SERVER_IP << EOF
  # Загрузка образа из архива
  docker load < /tmp/${APP_NAME}-${TAG}.tar
  rm /tmp/${APP_NAME}-${TAG}.tar

  # Переход в директорию с проектом
  cd /path/to/app

  # Запуск контейнера
  docker-compose -f docker-compose.simple.yml up -d
EOF

echo "Готово! Приложение запущено на сервере." 