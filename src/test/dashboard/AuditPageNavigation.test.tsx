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

// Моковые данные для тестов с пагинацией
const createMockAuditLogs = (total = 60) => {
  const items = [];
  
  for (let i = 0; i < Math.min(total, 50); i++) {
    items.push({
      id: `log-${i + 1}`,
      userId: i % 2 === 0 ? 'user-1' : 'user-2',
      action: i % 4 === 0 ? 'LOGIN' : i % 4 === 1 ? 'CREATE' : i % 4 === 2 ? 'UPDATE' : 'DELETE',
      targetType: i % 4 === 0 ? 'AUTH' : i % 4 === 1 ? 'PRODUCT' : i % 4 === 2 ? 'USER' : 'CONTENT',
      targetId: i % 4 !== 0 ? `target-${i}` : null,
      details: `Тестовая запись #${i + 1}`,
      productId: i % 4 === 1 ? `product-${i}` : null,
      createdAt: new Date(2023, 9, 15 + (i % 30), 12, 30, i).toISOString(),
      user: {
        id: i % 2 === 0 ? 'user-1' : 'user-2',
        name: i % 2 === 0 ? 'Иван Иванов' : 'Мария Петрова',
        email: i % 2 === 0 ? 'ivan@example.com' : 'maria@example.com',
        role: i % 2 === 0 ? 'admin' : 'manager',
        avatarUrl: i % 2 === 0 ? 'https://example.com/avatar1.jpg' : 'https://example.com/avatar2.jpg',
      },
    });
  }
  
  return {
    data: {
      auditLogs: {
        data: items,
        meta: {
          total,
          limit: 50,
          offset: 0,
        },
      },
    },
  };
};

// Мокируем fetch для возврата данных
const setupMockFetch = (totalItems = 60) => {
  const mockData = createMockAuditLogs(totalItems);
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData),
  });
};

// Мокируем fetch для пустых данных
const setupEmptyMockFetch = () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      data: {
        auditLogs: {
          data: [],
          meta: {
            total: 0,
            limit: 50,
            offset: 0,
          },
        },
      },
    }),
  });
};

describe('AuditPage - Навигация', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает информацию о записях', async () => {
    // Настраиваем мок для случая с 60 записями
    setupMockFetch(60);
    
    render(<AuditPage />);
    
    // Ждем пока компонент полностью загрузится
    await waitFor(() => {
      expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
    });
    
    // Проверяем наличие записей в таблице
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1); // Заголовок + строки данных
  });
  
  it('показывает сообщение при отсутствии данных', async () => {
    // Настраиваем мок для случая с пустыми данными
    setupEmptyMockFetch();
    
    render(<AuditPage />);
    
    // Ждем пока компонент полностью загрузится
    await waitFor(() => {
      expect(screen.getByText('Журнал аудита')).toBeInTheDocument();
    });
    
    // В этом случае должно появиться сообщение о пустых данных
    // Ищем сообщение о пустых данных, которое может отображаться по-разному
    // Например, "Нет записей" или "Нет данных"
    const emptyMessage = screen.getByText(/нет/i);
    expect(emptyMessage).toBeInTheDocument();
  });
  
  it('обрабатывает ошибки при загрузке данных', async () => {
    // Мокируем ошибку при загрузке данных
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    
    render(<AuditPage />);
    
    // Ждем пока компонент попытается загрузить данные и вызовет toast.error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
    
    // Проверяем, что метод toast.error был вызван
    expect(toast.error).toHaveBeenCalled();
  });
}); 