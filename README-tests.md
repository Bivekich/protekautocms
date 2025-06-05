# Тестирование Next.js компонентов с директивой 'use client'

## Проблема тестирования клиентских компонентов Next.js

При тестировании Next.js компонентов с директивой `'use client'` возникают специфические проблемы, связанные с:

1. **Изоляцией серверного и клиентского кода** - Next.js разделяет компоненты на серверные и клиентские
2. **Особенностями React 19** - использование новых API и потоковой отрисовки
3. **Хуками навигации** - `useRouter`, `usePathname`, `useSearchParams` и т.д.
4. **Невозможностью использования серверных API в тестах** - `cookies()`, `headers()` и т.д.

Эти проблемы приводят к ошибкам при запуске тестов, таким как:
- "Target container is not a DOM element"
- "Cannot access X before initialization"
- "X can only be used in a Server Component"

## Решение проблемы

Для тестирования компонентов Next.js с директивой 'use client' мы используем следующий подход:

### 1. Настройка тестового окружения

В файле `src/test/setup.ts` мы настраиваем тестовое окружение:

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Мокируем хуки навигации Next.js
beforeEach(() => {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }),
    usePathname: () => '/dashboard/audit',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: vi.fn(),
  }));
  
  // Другие моки для браузерных API
  // ...
});

// Очистка после каждого теста
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
```

### 2. Настройка Vitest

В файле `vitest.config.ts` мы настраиваем Vitest для работы с Next.js:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: 'react',
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    deps: {
      inline: [
        'next/navigation',
        'next/router', 
        'next/headers',
        'next/server',
      ],
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

## Блок тестирования аудита

Тесты для страницы аудита разделены на три файла:

1. **AuditPage.test.tsx** - основные тесты страницы
   - Проверяет корректное отображение заголовка и подзаголовка
   - Проверяет отображение таблицы с данными аудита
   - Проверяет наличие фильтров для таблицы

2. **AuditPageNavigation.test.tsx** - тесты для навигации
   - Проверяет отображение информации о пагинации
   - Проверяет отображение сообщения при отсутствии данных
   - Проверяет обработку ошибок при загрузке данных

3. **AuditPageUserFilter.test.tsx** - тесты для фильтров
   - Проверяет отображение различных типов фильтров
   - Проверяет отображение записей логов для разных пользователей
   - Проверяет корректное отображение информации о записях

### Подход к тестированию

При создании тестов для блока аудита мы руководствовались следующими принципами:

1. **Простота** - тесты должны быть простыми и понятными
2. **Надежность** - тесты должны работать стабильно и не зависеть от внешних факторов
3. **Изоляция** - каждый тест должен быть изолирован от других тестов
4. **Полезность** - тесты должны проверять реальную функциональность

### Примеры тестов

```typescript
// Пример теста для проверки отображения заголовка и подзаголовка
it('отображает заголовок и подзаголовок страницы', async () => {
  render(<AuditPage />);

  await waitFor(() => {
    expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
  });

  expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
  expect(screen.getByText('Отслеживание действий пользователей в системе')).toBeInTheDocument();
});

// Пример теста для проверки отображения данных в таблице
it('отображает таблицу с данными аудита', async () => {
  render(<AuditPage />);

  await waitFor(() => {
    expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
  });

  expect(screen.getByText('Пользователь вошел в систему')).toBeInTheDocument();
  expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
});
```

## Запуск тестов

Для запуска тестов используйте команды:

```bash
# Запуск всех тестов
npm run test

# Запуск с отслеживанием изменений
npm run test:watch

# Запуск с отчетом о покрытии
npm run test:coverage

# Запуск конкретного теста
npx vitest src/test/dashboard/AuditPage.test.tsx --run
```

## Возможные проблемы и их решения

1. **Ошибка "Target container is not a DOM element"**
   - **Решение**: Не используйте прямой доступ к DOM через document.createElement/appendChild в тестируемом коде
   - **Альтернатива**: Используйте утилиты testing-library для взаимодействия с DOM

2. **Ошибка "Cannot find module 'next/navigation'"**
   - **Решение**: Добавьте `next/navigation` в список `deps.inline` в конфигурации Vitest
   - **Альтернатива**: Используйте моки для всех импортов из next/navigation

3. **Ошибки в тесте экспорта CSV**
   - **Решение**: Вместо тестирования DOM-манипуляций, проверяйте вызов toast.success
   - **Альтернатива**: Вынесите логику экспорта в отдельную функцию для упрощения тестирования

4. **Ошибки при использовании моков для DOM**
   - **Решение**: Используйте jsdom вместо happy-dom для лучшей совместимости
   - **Альтернатива**: Мокируйте только необходимые методы DOM, не переопределяйте их полностью

## Дополнительные ресурсы

- [Официальная документация Next.js по тестированию](https://nextjs.org/docs/testing)
- [Документация Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Документация Vitest](https://vitest.dev/guide/) 