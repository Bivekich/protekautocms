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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AuditPage from '@/app/dashboard/audit/page';
import { toast } from 'sonner';

// Мокаем toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Моковые данные для пользователей
const mockUsers = [
  {
    id: 'user-1',
    name: 'Иван Иванов',
    email: 'ivan@example.com',
    role: 'admin',
    avatarUrl: 'https://example.com/avatar1.jpg',
  },
  {
    id: 'user-2',
    name: 'Мария Петрова',
    email: 'maria@example.com',
    role: 'manager',
    avatarUrl: 'https://example.com/avatar2.jpg',
  },
];

// Функция для создания моковых логов с разными пользователями
const createMockLogs = () => {
  const logs = [
    {
      id: 'log-1',
      userId: 'user-1',
      action: 'LOGIN',
      targetType: 'AUTH',
      targetId: null,
      details: 'Действие пользователя Иван Иванов',
      productId: null,
      createdAt: new Date(2023, 9, 15, 12, 30, 0).toISOString(),
      user: mockUsers[0],
    },
    {
      id: 'log-2',
      userId: 'user-2',
      action: 'CREATE',
      targetType: 'PRODUCT',
      targetId: 'product-1',
      details: 'Действие пользователя Мария Петрова',
      productId: 'product-1',
      createdAt: new Date(2023, 9, 16, 12, 30, 0).toISOString(),
      user: mockUsers[1],
    }
  ];
  
  return {
    data: {
      auditLogs: {
        data: logs,
        meta: {
          total: logs.length,
          limit: 50,
          offset: 0,
        },
      },
    },
  };
};

// Настраиваем моки для тестов
const setupMockData = () => {
  const mockData = createMockLogs();
  
  // Мокируем fetch для возврата тестовых данных
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData),
  });
};

describe('AuditPage - Отображение логов разных пользователей', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockData();
  });

  it('отображает записи для разных пользователей', async () => {
    render(<AuditPage />);
    
    // Ждем пока компонент полностью загрузится
    await waitFor(() => {
      expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
    });
    
    // Проверяем наличие блока фильтров
    expect(screen.getByText('Фильтры')).toBeInTheDocument();
    
    // Проверяем наличие выпадающих списков для фильтров
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThan(0);
  });
  
  it('отображает логи для разных пользователей', async () => {
    render(<AuditPage />);
    
    // Ждем пока компонент полностью загрузится
    await waitFor(() => {
      expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
    });
    
    // Проверяем, что отображаются логи обоих пользователей
    expect(screen.getByText('Действие пользователя Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText('Действие пользователя Мария Петрова')).toBeInTheDocument();
  });
  
  it('отображает разные типы действий', async () => {
    render(<AuditPage />);
    
    // Ждем пока компонент полностью загрузится
    await waitFor(() => {
      expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
    });
    
    // Проверяем отображение разных типов действий
    expect(screen.getByText('LOGIN')).toBeInTheDocument();
    expect(screen.getByText('CREATE')).toBeInTheDocument();
  });
}); 