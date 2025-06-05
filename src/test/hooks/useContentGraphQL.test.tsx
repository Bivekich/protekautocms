import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useContentGraphQL, Page, PageSection } from '@/hooks/useContentGraphQL';

// Мокируем fetch
global.fetch = vi.fn();

describe('useContentGraphQL', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock страниц для тестирования
  const mockPages: Page[] = [
    {
      id: 'page-1',
      slug: 'home',
      title: 'Главная страница',
      description: 'Описание главной страницы',
      isActive: true,
      createdAt: '2023-10-15T12:30:00Z',
      updatedAt: '2023-10-15T12:30:00Z',
    },
    {
      id: 'page-2',
      slug: 'about',
      title: 'О нас',
      isActive: true,
      createdAt: '2023-10-16T12:30:00Z',
      updatedAt: '2023-10-16T12:30:00Z',
    },
  ];

  // Mock секций для тестирования
  const mockSections: PageSection[] = [
    {
      id: 'section-1',
      pageId: 'page-1',
      type: 'hero',
      order: 1,
      content: { title: 'Заголовок героя', description: 'Описание героя' },
      isActive: true,
      createdAt: '2023-10-15T12:30:00Z',
      updatedAt: '2023-10-15T12:30:00Z',
    },
    {
      id: 'section-2',
      pageId: 'page-1',
      type: 'text',
      order: 2,
      content: { title: 'Текстовый блок', content: 'Содержимое текстового блока' },
      isActive: true,
      createdAt: '2023-10-15T12:30:00Z',
      updatedAt: '2023-10-15T12:30:00Z',
    },
  ];

  // Mock страницы с секциями
  const mockPageWithSections: Page = {
    ...mockPages[0],
    sections: mockSections,
  };

  describe('getPages', () => {
    it('успешно получает список страниц', async () => {
      // Мокируем ответ fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            pagesList: {
              pages: mockPages,
            },
          },
        }),
      });

      // Рендерим хук
      const { result } = renderHook(() => useContentGraphQL());

      // Вызываем метод getPages внутри act
      let pages;
      await act(async () => {
        pages = await result.current.getPages();
      });

      // Проверяем результат
      expect(pages).toEqual(mockPages);
      
      // Проверяем, что loading сброшен в false
      expect(result.current.loading).toBe(false);
      
      // Проверяем, что ошибок нет
      expect(result.current.error).toBeNull();
      
      // Проверяем, что fetch был вызван с правильными параметрами
      expect(fetch).toHaveBeenCalledWith('/api/graphql', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.any(String),
      }));
      
      // Проверяем параметры запроса
      const requestBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(requestBody.query).toContain('pagesList');
      expect(requestBody.variables).toEqual({ includeHidden: false });
    });

    it('обрабатывает ошибку при запросе списка страниц', async () => {
      // Мокируем ошибку fetch
      const errorMessage = 'Ошибка сети';
      global.fetch = vi.fn().mockImplementationOnce(() => {
        return Promise.reject(new Error(errorMessage));
      });

      // Рендерим хук
      const { result } = renderHook(() => useContentGraphQL());

      // Вызываем метод getPages и ожидаем ошибку
      await expect(
        result.current.getPages()
      ).rejects.toThrow();

      // Даём время для обновления состояния
      await waitFor(() => {
        // Проверяем, что loading сброшен в false после ошибки
        expect(result.current.loading).toBe(false);
        
        // Проверяем, что ошибка установлена
        expect(result.current.error).toBe(errorMessage);
      });
    });
  });

  describe('getPage', () => {
    it('успешно получает страницу по ID', async () => {
      // Мокируем ответ fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            page: mockPageWithSections,
          },
        }),
      });

      // Рендерим хук
      const { result } = renderHook(() => useContentGraphQL());

      // Вызываем метод getPage внутри act
      let page;
      await act(async () => {
        page = await result.current.getPage('page-1');
      });

      // Проверяем результат
      expect(page).toEqual(mockPageWithSections);
      
      // Проверяем, что loading сброшен в false
      expect(result.current.loading).toBe(false);
      
      // Проверяем, что ошибок нет
      expect(result.current.error).toBeNull();
      
      // Проверяем параметры запроса
      const requestBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(requestBody.query).toContain('page');
      expect(requestBody.variables).toEqual({ id: 'page-1', slug: undefined });
    });

    it('успешно получает страницу по slug', async () => {
      // Мокируем ответ fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            page: mockPageWithSections,
          },
        }),
      });

      // Рендерим хук
      const { result } = renderHook(() => useContentGraphQL());

      // Вызываем метод getPage с slug внутри act
      let page;
      await act(async () => {
        page = await result.current.getPage(undefined, 'home');
      });

      // Проверяем результат
      expect(page).toEqual(mockPageWithSections);
      
      // Проверяем параметры запроса
      const requestBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(requestBody.variables).toEqual({ id: undefined, slug: 'home' });
    });

    it('выбрасывает ошибку, если не указан ни ID, ни slug', async () => {
      // Рендерим хук
      const { result } = renderHook(() => useContentGraphQL());

      // Вызываем метод getPage без параметров внутри act
      await expect(
        act(async () => {
          await result.current.getPage();
        })
      ).rejects.toThrow('Необходимо указать id или slug');
    });
  });

  describe('createPage', () => {
    it('успешно создает новую страницу', async () => {
      const newPage = {
        slug: 'new-page',
        title: 'Новая страница',
        description: 'Описание новой страницы',
        isActive: true,
      };

      const createdPage = {
        id: 'new-page-id',
        ...newPage,
        createdAt: '2023-10-20T12:30:00Z',
        updatedAt: '2023-10-20T12:30:00Z',
      };

      // Мокируем ответ fetch
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            createPage: createdPage,
          },
        }),
      });

      // Рендерим хук
      const { result } = renderHook(() => useContentGraphQL());

      // Вызываем метод createPage внутри act
      let page;
      await act(async () => {
        page = await result.current.createPage(newPage);
      });

      // Проверяем результат
      expect(page).toEqual(createdPage);
      
      // Проверяем параметры запроса
      const requestBody = JSON.parse((fetch as any).mock.calls[0][1].body);
      expect(requestBody.query).toContain('createPage');
      expect(requestBody.variables).toEqual({ input: newPage });
    });
  });
}); 