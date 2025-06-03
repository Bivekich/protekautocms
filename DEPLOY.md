# Инструкции по деплою приложения ProtekAutoCMS

## Предварительные требования

1. Docker и Docker Compose установлены на сервере
2. Доступ к серверу через SSH
3. Доступ к базе данных PostgreSQL (приобретается отдельно)
4. Домен для вашего приложения

## Шаги по деплою

### 1. Подготовка окружения

1. Скопируйте файлы проекта на сервер:
```bash
git clone <your-repo-url> /path/to/app
cd /path/to/app
```

2. Отредактируйте файл `stack.env`, указав правильные значения переменных окружения:
```bash
nano stack.env
```

Особое внимание обратите на следующие параметры:
- `DATABASE_URL` - строка подключения к вашей базе данных
- `NEXTAUTH_URL` - URL вашего сайта
- `NEXT_PUBLIC_API_URL` - URL вашего API (обычно совпадает с URL сайта)
- Секреты для JWT и NextAuth

### 2. Запуск приложения

Запустите приложение с помощью Docker Compose:
```bash
docker-compose up -d
```

Проверьте, что контейнер запустился успешно:
```bash
docker-compose ps
```

### 3. Настройка Nginx для проксирования запросов (опционально)

Если вы хотите использовать Nginx в качестве прокси-сервера, создайте конфигурационный файл:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Настройка SSL с Let's Encrypt (опционально)

Установите Certbot и настройте SSL-сертификат:
```bash
certbot --nginx -d your-domain.com
```

### 5. Мониторинг и логи

Просмотр логов приложения:
```bash
docker-compose logs -f app
```

## Обновление приложения

Для обновления приложения выполните следующие команды:
```bash
cd /path/to/app
git pull
docker-compose build
docker-compose up -d
```

## Резервное копирование

Регулярно делайте резервные копии вашей базы данных:
```bash
pg_dump -h your-db-host -U your-db-user -d your-db-name > backup_$(date +%Y%m%d).sql
```

## Устранение неполадок

1. Проверьте статус контейнера:
   ```bash
   docker-compose ps
   ```

2. Проверьте логи приложения:
   ```bash
   docker-compose logs -f app
   ```

3. Проверьте соединение с базой данных:
   ```bash
   curl http://localhost:3000/api/health
   ``` 