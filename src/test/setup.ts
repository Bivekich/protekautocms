import '@testing-library/jest-dom';
import { expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Глобальные моки и объекты
beforeEach(() => {
  // Мок для next/navigation
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    }),
    usePathname: () => '/dashboard/audit',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: vi.fn(),
  }));

  // Мок для fetch
  global.fetch = vi.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );

  // Мок для matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Мок для URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'mock-url');

  // Мок для Element.scrollTo
  Element.prototype.scrollTo = vi.fn();

  // Мок для createElement
  const originalCreateElement = document.createElement;
  document.createElement = vi.fn().mockImplementation((tag) => {
    if (tag === 'a') {
      return {
        setAttribute: vi.fn(),
        style: {},
        click: vi.fn(),
      };
    }
    return originalCreateElement.call(document, tag);
  });

  // Простой мок для localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
  });

  // Простой мок для sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
  });
});

// Очистка после каждого теста
afterEach(() => {
  cleanup();
  vi.clearAllMocks();

  // Очищаем контейнер для тестов
  const testContainer = document.getElementById('test-container');
  if (testContainer) {
    document.body.removeChild(testContainer);
  }
}); 