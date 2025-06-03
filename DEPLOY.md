# Простая инструкция по деплою

## 1. Подготовка

1. Клонировать репозиторий:
```
git clone <url_репозитория>
cd protekauto-cms
```

2. Настроить переменные окружения:
- Отредактируйте файл `stack.env`, указав правильную строку подключения к вашей БД и другие параметры

## 2. Сборка и запуск

### Сборка образа локально

```bash
docker build -t protekauto-cms:latest .
```

### Запуск контейнера

```bash
docker-compose up -d
```

## 3. Проверка

Проверьте, что приложение работает:
```
curl http://localhost:3000
```

## 4. Настройка домена (опционально)

1. Установите Nginx:
```
sudo apt-get install nginx
```

2. Скопируйте файл nginx.conf:
```
sudo cp nginx.conf /etc/nginx/sites-available/protekauto-cms
```

3. Активируйте конфигурацию:
```
sudo ln -s /etc/nginx/sites-available/protekauto-cms /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

4. Настройте DNS для вашего домена, чтобы он указывал на IP-адрес сервера

## 5. Обновление приложения

Для обновления:
```
git pull
docker-compose build
docker-compose up -d
``` 