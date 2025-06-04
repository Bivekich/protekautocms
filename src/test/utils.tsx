import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
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

// Кастомная функция рендера с поддержкой userEvent
export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return {
    user: userEvent.setup(),
    ...rtlRender(ui, options),
  };
}

// Сохраняем исходную функцию setup для обратной совместимости
export function setup(jsx: ReactElement) {
  return render(jsx);
} 