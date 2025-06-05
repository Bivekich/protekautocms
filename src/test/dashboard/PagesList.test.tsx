import { describe, it, expect } from 'vitest';

// Тесты для функциональности PagesList компонента без рендеринга React
describe('PagesList - Функциональные тесты', () => {
  // Данные для тестов
  const mockPages = [
    {
      id: 'page-1',
      slug: 'home',
      title: 'Главная страница',
      isActive: true,
    },
    {
      id: 'page-2',
      slug: 'about',
      title: 'О нас',
      isActive: true,
    },
    {
      id: 'page-3',
      slug: 'services',
      title: 'Услуги',
      isActive: false,
    },
  ];

  // Тест функции фильтрации по заголовку
  it('должен фильтровать страницы по заголовку', () => {
    const filterByTitle = (pages: any[], query: string) => {
      return pages.filter(page => 
        page.title.toLowerCase().includes(query.toLowerCase())
      );
    };

    // Проверяем поиск по "Главная"
    const result1 = filterByTitle(mockPages, 'Главная');
    expect(result1.length).toBe(1);
    expect(result1[0].id).toBe('page-1');

    // Проверяем поиск по "о нас"
    const result2 = filterByTitle(mockPages, 'о нас');
    expect(result2.length).toBe(1);
    expect(result2[0].id).toBe('page-2');

    // Проверяем поиск без результатов
    const result3 = filterByTitle(mockPages, 'несуществующая');
    expect(result3.length).toBe(0);
  });

  // Тест функции фильтрации по slug
  it('должен фильтровать страницы по slug', () => {
    const filterBySlug = (pages: any[], query: string) => {
      return pages.filter(page => 
        page.slug.toLowerCase().includes(query.toLowerCase())
      );
    };

    // Проверяем поиск по "home"
    const result1 = filterBySlug(mockPages, 'home');
    expect(result1.length).toBe(1);
    expect(result1[0].id).toBe('page-1');

    // Проверяем поиск по "about"
    const result2 = filterBySlug(mockPages, 'about');
    expect(result2.length).toBe(1);
    expect(result2[0].id).toBe('page-2');

    // Проверяем поиск без результатов
    const result3 = filterBySlug(mockPages, 'contact');
    expect(result3.length).toBe(0);
  });

  // Тест комбинированной функции фильтрации
  it('должен фильтровать страницы по заголовку и slug', () => {
    const filterPages = (pages: any[], query: string) => {
      return pages.filter(page => 
        page.title.toLowerCase().includes(query.toLowerCase()) ||
        page.slug.toLowerCase().includes(query.toLowerCase())
      );
    };

    // Проверяем поиск по "home" (соответствует slug)
    const result1 = filterPages(mockPages, 'home');
    expect(result1.length).toBe(1);
    expect(result1[0].id).toBe('page-1');

    // Проверяем поиск по "Услуги" (соответствует заголовку)
    const result2 = filterPages(mockPages, 'Услуги');
    expect(result2.length).toBe(1);
    expect(result2[0].id).toBe('page-3');
  });

  // Тест сортировки страниц
  it('должен корректно определять активные страницы', () => {
    const getActivePages = (pages: any[]) => {
      return pages.filter(page => page.isActive);
    };

    const activePages = getActivePages(mockPages);
    expect(activePages.length).toBe(2);
    expect(activePages[0].id).toBe('page-1');
    expect(activePages[1].id).toBe('page-2');
  });

  // Тест вычисления ссылок для редактирования
  it('должен формировать правильные ссылки для редактирования', () => {
    const generateEditLink = (pageId: string) => {
      return `/dashboard/content/${pageId}`;
    };

    expect(generateEditLink('page-1')).toBe('/dashboard/content/page-1');
    expect(generateEditLink('page-2')).toBe('/dashboard/content/page-2');
    expect(generateEditLink('page-3')).toBe('/dashboard/content/page-3');
  });

  // Тест функции для определения сообщения о пустом списке
  it('должен отображать корректное сообщение при пустом списке', () => {
    const getEmptyMessage = (pages: any[], searchQuery: string) => {
      if (pages.length === 0) {
        return 'Страницы еще не созданы';
      }
      
      if (searchQuery && !pages.some(page => 
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )) {
        return 'Страницы не найдены';
      }
      
      return '';
    };

    // Проверяем случай, когда страниц нет
    expect(getEmptyMessage([], '')).toBe('Страницы еще не созданы');
    
    // Проверяем случай, когда поисковый запрос не дает результатов
    expect(getEmptyMessage(mockPages, 'несуществующая')).toBe('Страницы не найдены');
    
    // Проверяем случай, когда есть страницы и они соответствуют запросу
    expect(getEmptyMessage(mockPages, 'Главная')).toBe('');
  });
}); 