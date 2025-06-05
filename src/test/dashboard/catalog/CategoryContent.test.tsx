import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryContent from '../../../../components/catalog/CategoryContent';
import { useCatalogGraphQL } from '@/hooks/useCatalogGraphQL';

// Мокаем хук useCatalogGraphQL
vi.mock('@/hooks/useCatalogGraphQL', () => ({
  useCatalogGraphQL: vi.fn(),
}));

// Мокаем fetch для API вызовов
global.fetch = vi.fn();

// Мокаем window.location
const mockLocation = {
  href: '',
  search: '',
  pathname: '/dashboard/catalog',
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('CategoryContent', () => {
  const mockCategory = {
    id: 'category1',
    name: 'Тестовая категория',
    slug: 'test-category',
    level: 0,
    order: 1,
    parentId: null,
    isVisible: true,
    includeSubcategoryProducts: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subcategories: [
      {
        id: 'subcategory1',
        name: 'Тестовая подкатегория',
        slug: 'test-subcategory',
        level: 1,
        order: 1,
        parentId: 'category1',
        isVisible: true,
        includeSubcategoryProducts: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subcategories: [],
        productsCount: 3,
      },
    ],
    productsCount: 5,
  };

  const mockRootCategories = [
    {
      id: 'category1',
      name: 'Категория 1',
      slug: 'category-1',
      level: 0,
      order: 1,
      parentId: null,
      isVisible: true,
      includeSubcategoryProducts: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subcategories: [],
      productsCount: 5,
    },
    {
      id: 'category2',
      name: 'Категория 2',
      slug: 'category-2',
      level: 0,
      order: 2,
      parentId: null,
      isVisible: true,
      includeSubcategoryProducts: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subcategories: [],
      productsCount: 3,
    },
  ];

  const mockOnCategorySelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.search = '';
    
    // Базовый мок для хука
    (useCatalogGraphQL as any).mockReturnValue({
      loading: false,
      error: null,
      getCategories: vi.fn().mockResolvedValue({
        categories: mockRootCategories,
      }),
      getCategory: vi.fn().mockResolvedValue(mockCategory),
      getProducts: vi.fn().mockResolvedValue({
        products: [],
        pagination: { pages: 1, total: 0 },
      }),
    });

    // Мок для fetch API
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    });
  });

  it('отображает категории верхнего уровня для "all"', async () => {
    render(
      <CategoryContent 
        categoryId="all" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Проверяем, что отображаются категории верхнего уровня
    await waitFor(() => {
      expect(screen.getByText('Категория 1')).toBeInTheDocument();
      expect(screen.getByText('Категория 2')).toBeInTheDocument();
    });
  });

  it('отображает подкатегории для конкретной категории', async () => {
    render(
      <CategoryContent 
        categoryId="category1" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Проверяем, что отображаются подкатегории
    await waitFor(() => {
      expect(screen.getByText('Тестовая подкатегория')).toBeInTheDocument();
    });
  });

  it('отображает кнопку добавления товара', async () => {
    render(
      <CategoryContent 
        categoryId="category1" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Проверяем наличие кнопки добавления товара
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /добавить товар/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  it('отображает кнопку добавления подкатегории', async () => {
    render(
      <CategoryContent 
        categoryId="category1" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Проверяем наличие кнопки добавления подкатегории
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /добавить подкатегорию/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  it('перенаправляет на страницу добавления товара при клике на кнопку', async () => {
    render(
      <CategoryContent 
        categoryId="category1" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Находим кнопку добавления товара и кликаем по ней
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /добавить товар/i });
      fireEvent.click(addButton);
    });
    
    // Проверяем, что произошло перенаправление на страницу добавления товара
    expect(window.location.href).toBe('/dashboard/catalog/add-product?categoryId=category1');
  });

  it('открывает диалог добавления подкатегории при клике на кнопку', async () => {
    render(
      <CategoryContent 
        categoryId="category1" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Находим кнопку добавления подкатегории и кликаем по ней
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /добавить подкатегорию/i });
      fireEvent.click(addButton);
    });
    
    // Проверяем, что открылся диалог добавления подкатегории
    await waitFor(() => {
      expect(screen.getByText('Добавление подкатегории')).toBeInTheDocument();
    });
  });

  it('отображает переключатель включения товаров из подкатегорий', async () => {
    render(
      <CategoryContent 
        categoryId="category1" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Проверяем наличие переключателя
    await waitFor(() => {
      expect(screen.getByText(/Включать товары из подкатегорий/i)).toBeInTheDocument();
    });
  });

  it('отображает строку поиска', () => {
    render(
      <CategoryContent 
        categoryId="category1" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Проверяем наличие строки поиска
    expect(screen.getByPlaceholderText(/Поиск товаров/i)).toBeInTheDocument();
  });

  it('обновляет URL при выполнении поиска', async () => {
    render(
      <CategoryContent 
        categoryId="category1" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Находим поле поиска, вводим запрос и отправляем форму
    const searchInput = screen.getByPlaceholderText(/Поиск товаров/i);
    fireEvent.change(searchInput, { target: { value: 'тестовый запрос' } });
    
    // Находим форму поиска и отправляем её
    const searchForm = searchInput.closest('form');
    fireEvent.submit(searchForm!);
    
    // Проверяем, что URL обновился
    expect(window.location.search).toContain('search=тестовый%20запрос');
  });
}); 