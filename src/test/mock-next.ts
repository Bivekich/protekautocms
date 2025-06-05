// Файл для мокирования Next.js компонентов и API
import { vi } from 'vitest';
import React from 'react';

// Класс для ошибок серверных компонентов
class ServerComponentError extends Error {
  constructor(message: string) {
    super(`${message} can only be used in a Server Component`);
    this.name = 'ServerComponentError';
  }
}

// Мокирование next/navigation
vi.mock('next/navigation', () => {
  const router = {
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  };

  return {
    useRouter: vi.fn(() => router),
    usePathname: vi.fn(() => '/dashboard/audit'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
    useParams: vi.fn(() => ({})),
    redirect: vi.fn(),
  };
});

// Мокирование next/headers (вызывает ошибку при использовании в клиентском компоненте)
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => {
    throw new ServerComponentError('cookies()');
  }),
  headers: vi.fn(() => {
    throw new ServerComponentError('headers()');
  }),
}));

// Мокирование next/server
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data) => ({
      status: 200,
      body: JSON.stringify(data),
      headers: new Headers(),
    })),
    redirect: vi.fn((url) => ({
      status: 302,
      headers: new Headers({ Location: url }),
    })),
  },
}));

// Мокирование next/image с типизацией
interface ImageProps {
  src: string;
  alt: string;
  [key: string]: any;
}

vi.mock('next/image', () => ({
  default: vi.fn((props: ImageProps) => {
    const { src, alt, ...rest } = props;
    return React.createElement('img', { 
      src, 
      alt, 
      'data-testid': 'next-image', 
      ...rest 
    });
  }),
}));

// Мокирование next/link с типизацией
interface LinkProps {
  href: string;
  children: React.ReactNode;
  [key: string]: any;
}

vi.mock('next/link', () => ({
  default: vi.fn((props: LinkProps) => {
    const { href, children, ...rest } = props;
    return React.createElement(
      'a', 
      { href, 'data-testid': 'next-link', ...rest }, 
      children
    );
  }),
}));

// Экспортируем функцию для очистки всех моков
export const clearNextMocks = () => {
  vi.clearAllMocks();
}; 