# Инструкция по деплою

## Вариант 1: Стандартный деплой (сборка на сервере)

1. Клонировать репозиторий:
```
git clone <url_репозитория>
cd protekauto-cms
```

2. Настроить переменные окружения:
   - Отредактируйте файл `stack.env`, указав правильную строку подключения к вашей БД и другие параметры

3. Сборка и запуск:
```bash
docker-compose up -d
```

## Вариант 2: Предварительная сборка локально (рекомендуется)

Этот вариант позволяет избежать проблем со сборкой на сервере.

### Локальная машина:

1. Запустите скрипт предварительной сборки:
```bash
./prebuild-and-deploy.sh
```

2. Сохраните образ в архив:
```bash
docker save protekauto-cms:latest > protekauto-cms.tar
```

3. Загрузите архив на сервер:
```bash
scp protekauto-cms.tar user@your-server:/tmp/
```

### На сервере:

1. Загрузите образ из архива:
```bash
docker load < /tmp/protekauto-cms.tar
```

2. Создайте файл `docker-compose.prebuild.yml` и `stack.env`

3. Запустите контейнер:
```bash
docker-compose -f docker-compose.prebuild.yml up -d
```

## Настройка домена (опционально)

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

## Обновление приложения

Для обновления используйте тот же подход, что и при первоначальном деплое.

### Для варианта 1:
```
git pull
docker-compose build
docker-compose up -d
```

### Для варианта 2:
Повторите все шаги из варианта 2, начиная с локальной сборки. 