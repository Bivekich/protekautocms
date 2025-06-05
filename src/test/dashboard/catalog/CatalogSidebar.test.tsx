import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CatalogSidebar from '../../../../components/catalog/CatalogSidebar';
import { useCatalogGraphQL } from '@/hooks/useCatalogGraphQL';

// Мокаем хук useCatalogGraphQL
vi.mock('@/hooks/useCatalogGraphQL', () => ({
  useCatalogGraphQL: vi.fn(),
}));

// Мокаем fetch для API вызовов
global.fetch = vi.fn();

describe('CatalogSidebar', () => {
  const mockCategories = [
    {
      id: 'all',
      name: 'Все товары',
      slug: 'all',
      level: 0,
      order: 0,
      parentId: null,
      isVisible: true,
      includeSubcategoryProducts: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subcategories: [],
      productsCount: 0,
    },
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
      subcategories: [
        {
          id: 'subcategory1',
          name: 'Подкатегория 1',
          slug: 'subcategory-1',
          level: 1,
          order: 1,
          parentId: 'category1',
          isVisible: true,
          includeSubcategoryProducts: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subcategories: [],
          productsCount: 5,
        },
      ],
      productsCount: 10,
    },
    {
      id: 'category2',
      name: 'Категория 2',
      slug: 'category-2',
      level: 0,
      order: 2,
      parentId: null,
      isVisible: false, // скрытая категория
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
    
    // Базовый мок для хука
    (useCatalogGraphQL as any).mockReturnValue({
      loading: false,
      error: null,
      getCategories: vi.fn().mockResolvedValue({
        categories: mockCategories.slice(1), // Без "Все товары", оно добавляется в компоненте
      }),
      deleteCategory: vi.fn().mockResolvedValue({ success: true }),
    });

    // Мок для fetch API
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ success: true }),
    });
  });

  it('отображает список категорий, включая "Все товары"', async () => {
    render(
      <CatalogSidebar 
        selectedCategory="all" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    // Ждем загрузки категорий
    await waitFor(() => {
      expect(screen.getByText('Все товары')).toBeInTheDocument();
      expect(screen.getByText('Категория 1')).toBeInTheDocument();
      expect(screen.getByText('Категория 2')).toBeInTheDocument();
    });
  });

  it('выделяет выбранную категорию', async () => {
    render(
      <CatalogSidebar 
        selectedCategory="category1" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    await waitFor(() => {
      const selectedCategory = screen.getByText('Категория 1').closest('div');
      expect(selectedCategory).toHaveClass('bg-accent');
    });
  });

  it('вызывает onCategorySelect при клике на категорию', async () => {
    render(
      <CatalogSidebar 
        selectedCategory="all" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Категория 1')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Категория 1'));
    
    expect(mockOnCategorySelect).toHaveBeenCalledWith('category1');
  });

  it('отображает подкатегории при разворачивании родительской категории', async () => {
    render(
      <CatalogSidebar 
        selectedCategory="all" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Категория 1')).toBeInTheDocument();
    });
    
    // Находим иконку разворачивания и кликаем по ней
    const expandIcon = screen.getAllByTestId('expand-category-icon')[0];
    fireEvent.click(expandIcon);
    
    // Проверяем, что подкатегория отображается
    await waitFor(() => {
      expect(screen.getByText('Подкатегория 1')).toBeInTheDocument();
    });
  });

  it('отображает количество товаров в категории', async () => {
    render(
      <CatalogSidebar 
        selectedCategory="all" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    await waitFor(() => {
      const categoryWithProducts = screen.getByText('(10)');
      expect(categoryWithProducts).toBeInTheDocument();
    });
  });

  it('отображает иконку скрытой категории для невидимых категорий', async () => {
    render(
      <CatalogSidebar 
        selectedCategory="all" 
        onCategorySelect={mockOnCategorySelect}
      />
    );
    
    await waitFor(() => {
      // Проверяем наличие индикатора скрытой категории рядом с "Категория 2"
      const hiddenCategory = screen.getByText('Категория 2').closest('div');
      expect(hiddenCategory).toHaveClass('opacity-50');
    });
  });
}); 