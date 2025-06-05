import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Мокаем Next.js компоненты перед импортом
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  })),
  usePathname: vi.fn(() => '/dashboard/audit'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
}));

// Создаем базовый контейнер для тестов
const setupTestContainer = () => {
  // Очищаем предыдущий контейнер, если он существует
  const existingContainer = document.getElementById('test-container');
  if (existingContainer) {
    document.body.removeChild(existingContainer);
  }
  
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
  return container;
};

// Создаем обертку для провайдеров
interface AllProvidersProps {
  children: ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  return <>{children}</>;
};

// Функция для рендеринга компонентов
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'container' | 'wrapper'>
) => {
  // Создаем контейнер и присоединяем его к документу
  const container = setupTestContainer();
  
  // Используем React.act вместо react-dom/test-utils.act
  let renderResult: any;
  React.act(() => {
    renderResult = render(ui, { 
      container, 
      wrapper: AllProviders,
      ...options 
    });
  });
  
  return renderResult;
};

// Добавляем функцию для дебага содержимого контейнера
export const debugContainer = () => {
  const container = document.getElementById('test-container');
  if (container) {
    console.log('Container HTML:', container.innerHTML);
  } else {
    console.log('Test container not found');
  }
};

// Переэкспортируем всё из testing-library
export * from '@testing-library/react';

// Заменяем оригинальный render нашей кастомной функцией
export { customRender as render }; 