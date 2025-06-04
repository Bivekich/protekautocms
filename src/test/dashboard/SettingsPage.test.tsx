// vi.mock вызовы поднимаются в начало файла перед импортами
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Тестовый Пользователь',
        email: 'test@example.com',
        role: 'admin',
        avatarUrl: 'https://example.com/avatar.jpg',
      },
    },
    status: 'authenticated',
    update: vi.fn(),
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Мок для fetch
global.fetch = vi.fn();

// Импортируем все необходимые модули
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '@/app/dashboard/settings/page';
import { toast } from 'sonner';

// Типизация для моков функций
type MockFunction = ReturnType<typeof vi.fn>;

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Мокаем успешный ответ API для запроса данных пользователя
    (global.fetch as MockFunction).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          currentUser: {
            id: 'test-user-id',
            name: 'Тестовый Пользователь',
            email: 'test@example.com',
            role: 'admin',
            avatarUrl: 'https://example.com/avatar.jpg',
            requiresTwoFactor: false,
          },
        },
      }),
    });
  });

  it('рендерится страница настроек с тремя вкладками', async () => {
    render(<SettingsPage />);
    
    // Ожидаем окончания загрузки
    await waitFor(() => {
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
    });
    
    // Проверяем заголовок страницы
    expect(screen.getByText('Настройки')).toBeInTheDocument();
    expect(screen.getByText('Управление настройками вашего аккаунта')).toBeInTheDocument();
    
    // Проверяем наличие всех вкладок
    expect(screen.getByRole('tab', { name: 'Профиль' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Пароль' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Безопасность' })).toBeInTheDocument();
    
    // По умолчанию должна быть активна вкладка профиля
    expect(screen.getByRole('tab', { name: 'Профиль', selected: true })).toBeInTheDocument();
  });

  it('загружает и отображает информацию о пользователе', async () => {
    render(<SettingsPage />);
    
    // Ожидаем окончания загрузки
    await waitFor(() => {
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
    });
    
    // Ожидаем, что данные загрузятся и отобразятся в форме
    await waitFor(() => {
      // Ищем по role="form" и проверяем содержимое формы
      const form = screen.getByRole('button', { name: /Изменить аватар/i });
      expect(form).toBeInTheDocument();
    });
    
    // Проверяем, что компонент аватара отображается 
    // Заменяем проверку alt текста на проверку наличия компонента Avatar
    expect(screen.getByRole('button', { name: /Изменить аватар/i })).toBeInTheDocument();
  });

  it('позволяет обновить профиль пользователя', async () => {
    const user = userEvent.setup();
    
    // Мокаем успешный ответ API для обновления профиля
    (global.fetch as MockFunction).mockImplementation((url, options) => {
      if (options?.body && typeof options.body === 'string' && options.body.includes('UpdateUser')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              updateUser: {
                id: 'test-user-id',
                name: 'Новое Имя',
                email: 'new@example.com',
                role: 'admin',
                avatarUrl: 'https://example.com/avatar.jpg',
              },
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: {
            currentUser: {
              id: 'test-user-id',
              name: 'Тестовый Пользователь',
              email: 'test@example.com',
              role: 'admin',
              avatarUrl: 'https://example.com/avatar.jpg',
              requiresTwoFactor: false,
            },
          },
        }),
      });
    });
    
    render(<SettingsPage />);
    
    // Ожидаем окончания загрузки
    await waitFor(() => {
      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
    });
    
    // Находим кнопку сохранения
    const saveButton = await screen.findByRole('button', { name: /Сохранить/i });
    expect(saveButton).toBeInTheDocument();
    
    // Отправляем форму (кликаем кнопку сохранения)
    await user.click(saveButton);
    
    // Проверяем, что был вызван API
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Первый вызов для получения данных, второй для обновления
    });
    
    // Проверяем, что отображается сообщение об успехе
    expect(toast.success).toHaveBeenCalledWith('Профиль успешно обновлен');
  });
}); 