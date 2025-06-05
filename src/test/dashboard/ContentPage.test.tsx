// vi.mock вызовы поднимаются в начало файла перед импортами
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Мокируем запросы GraphQL
global.fetch = vi.fn();

// Мокируем компоненты из lucide-react, которые используются для иконок
vi.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loading</div>,
  PlusCircle: () => <div data-testid="plus-icon">Plus</div>
}));

// Импортируем все необходимые модули
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import ContentPage from '@/app/dashboard/content/page';
import { Page } from '@/hooks/useContentGraphQL';

// Мокируем модули ui/card, которые могут вызывать проблемы
vi.mock('@/components/ui/card', () => {
  return {
    Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
    CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
    CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
    CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  };
});

// Мокируем компонент PagesList, чтобы избежать проблем с рендерингом
vi.mock('@/app/dashboard/content/components/pages-list', () => ({
  PagesList: ({ pages }: { pages: Page[] }) => (
    <div data-testid="pages-list">
      {pages.length === 0 ? (
        <div>Страницы еще не созданы</div>
      ) : (
        <div>
          <div role="columnheader">Название</div>
          <div role="columnheader">Slug</div>
          <div role="columnheader">Статус</div>
          <div role="columnheader">Действия</div>
          {pages.map(page => (
            <div key={page.id} role="row">
              <div>{page.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}));

// Мокируем fetch для возврата данных
const setupMockFetch = (pageCount = 5) => {
  const mockPages = createMockPages(pageCount);
  
  global.fetch = vi.fn().mockImplementation((url, options) => {
    if (url === '/api/graphql') {
      const body = JSON.parse(options?.body?.toString() || '{}');
      
      if (body.query?.includes('pagesList')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              pagesList: {
                pages: mockPages,
              },
            },
          }),
        });
      }
    }
    
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  }) as unknown as typeof fetch;
};

// Мокируем fetch для пустых данных
const setupEmptyMockFetch = () => {
  global.fetch = vi.fn().mockImplementation((url, options) => {
    if (url === '/api/graphql') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: {
            pagesList: {
              pages: [],
            },
          },
        }),
      });
    }
    
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  }) as unknown as typeof fetch;
};

// Мокируем fetch для возврата ошибки
const setupErrorMockFetch = () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
};

// Мокируемые данные для тестов
const createMockPages = (count = 5) => {
  const pages: Page[] = [];
  
  for (let i = 0; i < count; i++) {
    pages.push({
      id: `page-${i + 1}`,
      slug: `test-page-${i + 1}`,
      title: `Тестовая страница ${i + 1}`,
      description: i % 2 === 0 ? `Описание страницы ${i + 1}` : undefined,
      isActive: i % 2 === 0,
      createdAt: new Date(2023, 9, 15 + i, 12, 30).toISOString(),
      updatedAt: new Date(2023, 9, 15 + i, 12, 30).toISOString(),
    });
  }
  
  return pages;
};

describe('ContentPage - Основная функциональность', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('перенаправляет на страницу логина, если сессия отсутствует', () => {
    // Мокируем отсутствие сессии
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    
    render(<ContentPage />);
    
    // Проверяем, что был вызван редирект
    expect(redirect).toHaveBeenCalledWith('/auth/login');
  });
  
  it('отображает загрузку, пока проверяется сессия', () => {
    // Мокируем загрузку сессии
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      status: 'loading',
    });
    
    render(<ContentPage />);
    
    // Проверяем, что отображается индикатор загрузки
    const loaderIcon = screen.getByTestId('loader-icon');
    expect(loaderIcon).toBeInTheDocument();
  });
  
  it('отображает список страниц, когда данные загружены', async () => {
    // Мокируем сессию
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });
    
    // Мокируем API для возврата страниц
    setupMockFetch(5);
    
    render(<ContentPage />);
    
    // Ждем, пока данные загрузятся
    await waitFor(() => {
      // Проверяем заголовок страницы
      const pageTitle = screen.getByText('Управление контентом');
      expect(pageTitle).toBeInTheDocument();
      
      // Проверяем, что компонент списка страниц отображается
      const pagesList = screen.getByTestId('pages-list');
      expect(pagesList).toBeInTheDocument();
      
      // Проверяем, что отображаются строки с данными
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);
    });
  });
  
  it('отображает пустое состояние, когда нет страниц', async () => {
    // Мокируем сессию
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });
    
    // Мокируем API для возврата пустого списка страниц
    setupEmptyMockFetch();
    
    render(<ContentPage />);
    
    // Ждем, пока данные загрузятся
    await waitFor(() => {
      // Проверяем, что отображается сообщение о пустом списке
      const emptyMessage = screen.getByText('Страницы еще не созданы');
      expect(emptyMessage).toBeInTheDocument();
    });
  });
  
  it('отображает ошибку при неудачной загрузке данных', async () => {
    // Мокируем сессию
    (useSession as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });
    
    // Мокируем API для возврата ошибки
    setupErrorMockFetch();
    
    render(<ContentPage />);
    
    // Ждем, пока попытка загрузки данных завершится ошибкой
    await waitFor(() => {
      // Проверяем, что отображается сообщение об ошибке
      const errorMessage = screen.getByText(/Ошибка:/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });
}); 