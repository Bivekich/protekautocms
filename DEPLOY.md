# Инструкции по деплою приложения ProtekAutoCMS

## Предварительные требования

1. Docker и Docker Compose установлены на сервере
2. Доступ к серверу через SSH
3. Доступ к базе данных PostgreSQL (приобретается отдельно)
4. Домен для вашего приложения

## Методы деплоя

В случае проблем с установкой зависимостей на сервере, можно использовать один из нескольких методов деплоя:

### Метод 1: Стандартный деплой (docker-compose)

```bash
docker-compose up -d
```

### Метод 2: Деплой с использованием Yarn (если npm не работает)

```bash
docker-compose -f docker-compose.yarn.yml up -d
```

### Метод 3: Деплой с использованием PNPM (если npm и yarn не работают)

```bash
docker-compose -f docker-compose.pnpm.yml up -d
```

### Метод 4: Локальная сборка образа и загрузка на сервер

Этот метод позволяет избежать проблем с установкой зависимостей на сервере, выполняя сборку локально:

1. Отредактируйте файл `build-and-deploy.sh`, указав данные вашего сервера
2. Запустите скрипт:
   ```bash
   ./build-and-deploy.sh
   ```

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

Запустите приложение с помощью одного из методов деплоя, описанных выше.

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

### Общие проблемы

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

### Проблемы при сборке

Если вы столкнулись с ошибкой `Failed to deploy a stack: compose build operation failed` или проблемами при установке зависимостей, попробуйте следующее:

1. **Используйте альтернативный Dockerfile с yarn:**
   ```bash
   docker-compose -f docker-compose.yarn.yml up -d
   ```

2. **Используйте альтернативный Dockerfile с pnpm:**
   ```bash
   docker-compose -f docker-compose.pnpm.yml up -d
   ```

3. **Используйте метод локальной сборки и загрузки:**
   ```bash
   ./build-and-deploy.sh
   ```

4. **Очистка Docker кэша:**
   ```bash
   docker system prune -a
   ```

5. **Проблемы с сетью:**
   Если проблемы связаны с загрузкой пакетов, проверьте сетевое соединение сервера и настройки прокси.

6. **Ошибки с зависимостями:**
   В случае проблем с конкретными пакетами, проверьте логи для определения проблемного пакета и обновите package.json для использования совместимой версии.

7. **Добавьте ваши ключи NPM (если вы используете приватные пакеты):**
   ```bash
   echo "//registry.npmjs.org/:_authToken=YOUR_AUTH_TOKEN" > .npmrc
   ``` 