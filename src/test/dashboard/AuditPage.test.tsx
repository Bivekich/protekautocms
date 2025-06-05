// vi.mock вызовы поднимаются в начало файла перед импортами
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard/audit',
  useSearchParams: () => new URLSearchParams(),
}));

// Мокаем запросы GraphQL
global.fetch = vi.fn();

// Импортируем все необходимые модули
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuditPage from '@/app/dashboard/audit/page';
import { toast } from 'sonner';

// Мокаем toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Вместо прямого мока document.createElement используем мок для методов 
// в тестах, где это необходимо
vi.mock('@/app/dashboard/audit/page', async () => {
  const actual = await vi.importActual('@/app/dashboard/audit/page');
  return {
    ...actual,
    // Можем при необходимости переопределить методы компонента здесь
  };
});

// Мокируем URL.createObjectURL для экспорта CSV
global.URL.createObjectURL = vi.fn(() => 'mock-url');

// Типизация для моков функций
type MockFunction = ReturnType<typeof vi.fn>;

// Моковые данные для тестов
const mockAuditLogs = {
  data: {
    auditLogs: {
      data: [
        {
          id: 'log-1',
          userId: 'user-1',
          action: 'LOGIN',
          targetType: 'AUTH',
          targetId: null,
          details: 'Пользователь вошел в систему',
          productId: null,
          createdAt: '2023-10-15T12:30:00Z',
          user: {
            id: 'user-1',
            name: 'Иван Иванов',
            email: 'ivan@example.com',
            role: 'admin',
            avatarUrl: 'https://example.com/avatar1.jpg',
          },
        },
        {
          id: 'log-2',
          userId: 'user-2',
          action: 'CREATE',
          targetType: 'PRODUCT',
          targetId: 'product-1',
          details: 'Создан новый продукт "Тестовый продукт"',
          productId: 'product-1',
          createdAt: '2023-10-16T10:15:00Z',
          user: {
            id: 'user-2',
            name: 'Мария Петрова',
            email: 'maria@example.com',
            role: 'manager',
            avatarUrl: 'https://example.com/avatar2.jpg',
          },
        },
      ],
      meta: {
        total: 2,
        limit: 50,
        offset: 0,
      },
    },
  },
};

// Тестовый контейнер для рендеринга компонентов
let container: HTMLDivElement;

describe('AuditPage Tests', () => {
  // Настройка перед каждым тестом
  beforeEach(() => {
    // Создаем контейнер для рендера
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    
    // Мокаем fetch для возврата данных аудита
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAuditLogs),
    });
  });

  // Очистка после каждого теста
  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.clearAllMocks();
  });

  it('отображает заголовок и подзаголовок страницы', async () => {
    // Рендерим компонент в контейнер
    render(<AuditPage />, { container });

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
    });

    // Проверяем заголовок и подзаголовок
    expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
    expect(screen.getByText('Отслеживание действий пользователей в системе')).toBeInTheDocument();
  });

  it('отображает таблицу с данными аудита', async () => {
    // Рендерим компонент
    render(<AuditPage />, { container });

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
    });

    // Проверяем наличие данных в таблице
    expect(screen.getByText('Пользователь вошел в систему')).toBeInTheDocument();
    expect(screen.getByText('Создан новый продукт "Тестовый продукт"')).toBeInTheDocument();
    
    // Проверяем имена пользователей
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
  });

  it('отображает блок фильтров', async () => {
    // Рендерим компонент
    render(<AuditPage />, { container });

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
    });

    // Проверяем наличие заголовка блока фильтров
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
    
    // Проверяем наличие выпадающих списков (combobox) для фильтрации
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThan(0);
    
    // Проверяем наличие текста со значением по умолчанию для фильтра действий
    expect(screen.getByText('Все действия')).toBeInTheDocument();
  });
  
  it('отображает кнопку экспорта', async () => {
    // Рендерим компонент
    render(<AuditPage />, { container });

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
    });

    // Проверяем наличие кнопки экспорта
    expect(screen.getByText('Экспорт')).toBeInTheDocument();
  });
}); 