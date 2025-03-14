# ProtekCMS

Система управления контентом для компании Протек.

## Требования

- Node.js 18+
- PostgreSQL 14+

## Локальная разработка

1. Клонировать репозиторий:

```bash
git clone https://github.com/Bivekich/protekautocms.git
cd protekautocms
```

2. Установить зависимости:

```bash
npm install --legacy-peer-deps
```

3. Создать файл `.env` на основе `.env.example` и заполнить необходимые переменные окружения.

4. Запустить миграции базы данных:

```bash
npx prisma migrate dev
```

5. Запустить сервер разработки:

```bash
npm run dev
```

## Деплой на Vercel

1. Создать проект на Vercel и связать его с репозиторием.

2. Добавить переменные окружения в настройках проекта:

   - `DATABASE_URL` - URL для подключения к базе данных PostgreSQL
   - `SHADOW_DATABASE_URL` - URL для подключения к теневой базе данных (может быть таким же, как DATABASE_URL)
   - `NEXTAUTH_SECRET` - секретный ключ для NextAuth
   - `NEXTAUTH_URL` - URL вашего приложения (например, https://protekcms.vercel.app)
   - `NEXT_PUBLIC_YANDEX_MAPS_API_KEY` - API ключ для Яндекс.Карт (если используется)

3. Деплой будет автоматически запущен при пуше в репозиторий.

4. **Важно**: Если база данных уже содержит данные, но не имеет истории миграций Prisma, выполните следующую команду после деплоя:

```bash
npm run baseline
```

Эта команда пометит все существующие миграции как примененные без изменения схемы базы данных, что позволит сохранить все данные.

## Важные команды

- `npm run dev` - запуск сервера разработки
- `npm run build` - сборка проекта
- `npm run start` - запуск собранного проекта
- `npm run lint` - проверка кода линтером
- `npm run baseline` - базовое применение миграций (для существующей базы данных)
- `npx prisma studio` - запуск Prisma Studio для управления базой данных
- `npx prisma migrate dev` - создание и применение миграций в режиме разработки
- `npx prisma migrate deploy` - применение миграций в production
