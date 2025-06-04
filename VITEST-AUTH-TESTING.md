# Тестирование аутентификации с Vitest в Next.js

Это руководство объясняет, как настроить и использовать Vitest для тестирования компонентов и функций аутентификации в приложении Next.js.

## Установка

Установите необходимые зависимости:

```bash
npm install -D vitest @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event happy-dom @vitejs/plugin-react
```

## Конфигурация Vitest

Создайте файл `vitest.config.ts` в корне проекта:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

## Настройка окружения для тестов

Создайте файл `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Очистка после каждого теста
afterEach(() => {
  cleanup();
});
```

## Утилиты для тестирования

Создайте файл `src/test/utils.tsx` с вспомогательными функциями:

```typescript
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Мок для useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Мок для next-auth/react 
vi.mock('next-auth/react', () => {
  return {
    signIn: vi.fn(),
    useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
    SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

// Настройка тестового пользовательского интерфейса
export function setup(jsx: ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}
```

## Примеры тестов

### Тестирование страницы входа

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { setup } from '../utils';
import LoginPage from '@/app/auth/login/page';

// Мокаем дополнительные модули, если необходимо
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Мокаем компоненты, которые не нужно тестировать
vi.mock('@/components/two-factor/TwoFactorForm', () => ({
  TwoFactorForm: () => <div data-testid="two-factor-form">Two Factor Form</div>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерится форма входа', () => {
    render(<LoginPage />);
    
    // Проверяем, что компоненты формы отображаются
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('проверяет валидацию полей', async () => {
    const { user } = setup(<LoginPage />);
    
    // Нажимаем кнопку без заполнения полей
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);
    
    // Ожидаем сообщения об ошибках валидации
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  it('отправляет данные для входа', async () => {
    // Создаем мок для функции signIn
    const signInMock = vi.fn().mockResolvedValue({
      status: 200,
      url: '/dashboard',
      ok: true,
      error: null,
    });
    
    // Обновляем мок для модуля next-auth/react
    vi.mock('next-auth/react', () => ({
      signIn: signInMock,
      SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
    }));
    
    const { user } = setup(<LoginPage />);
    
    // Заполняем форму
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    // Отправляем форму
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(submitButton);
    
    // Проверяем, что signIn вызван с правильными параметрами
    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });
  });
});
```

### Тестирование функций аутентификации

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions } from '@/lib/auth';

// Мокаем зависимости
vi.mock('bcrypt', () => ({
  compare: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Для более сложных моков используйте importOriginal
vi.mock('jsonwebtoken', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    verify: vi.fn(() => ({ userId: 'user-id' })),
  };
});

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authOptions', () => {
    it('имеет правильную конфигурацию', () => {
      // Проверка основных настроек
      expect(authOptions.session?.strategy).toBe('jwt');
      expect(authOptions.pages?.signIn).toBe('/auth/login');
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0].id).toBe('credentials');
    });
  });
});
```

## Запуск тестов

Добавьте следующие скрипты в `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

Запустите тесты:

```bash
npm test
```

## Советы и рекомендации

1. **Моки должны соответствовать типам**. При мокинге модулей убедитесь, что возвращаемые значения соответствуют ожидаемым типам.

2. **Мокинг модулей с importOriginal**. Для сложных модулей используйте `importOriginal` для сохранения оригинальной функциональности:

   ```typescript
   vi.mock('next-auth/react', async (importOriginal) => {
     const actual = await importOriginal();
     return {
       ...actual,
       signIn: vi.fn(),
     };
   });
   ```

3. **Очистка моков**. Используйте `vi.clearAllMocks()` в `beforeEach` для сброса состояния моков перед каждым тестом.

4. **Тестирование асинхронных операций**. Используйте `waitFor` для ожидания асинхронных операций:

   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

5. **Мокинг глобальных API**. Для глобальных API, таких как `fetch`, используйте моки:

   ```typescript
   global.fetch = vi.fn().mockImplementation(() => 
     Promise.resolve({
       ok: true,
       json: () => Promise.resolve({ success: true }),
     } as Response)
   );
   ```

6. **Типизация сложных моков**. Для сложных моков создавайте интерфейсы типов:

   ```typescript
   interface SignInResponse {
     error: string | null;
     ok: boolean;
     url: string | null;
     status: number;
   }
   
   const mockSignIn = vi.fn().mockResolvedValue({
     status: 200,
     url: '/dashboard',
     ok: true,
     error: null,
   } as SignInResponse);
   ```

7. **Изоляция тестов**. Используйте моки для изоляции тестируемого компонента от его зависимостей. 