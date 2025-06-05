import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CatalogPage from '../../../../components/catalog/CatalogPage';
import CatalogDashboardPage from '../../../app/dashboard/catalog/page';

// Импортируем настройки для тестов
import './setup';

// Для работы с Suspense
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual as any,
    Suspense: ({ children }: any) => children,
  };
});

describe('Каталог товаров (интеграционные тесты)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('отображает страницу каталога товаров', () => {
    render(<CatalogDashboardPage />);
    
    // Проверяем, что заголовок страницы отображается
    expect(screen.getByText('Каталог товаров')).toBeInTheDocument();
    
    // Проверяем, что компонент каталога отображается
    expect(screen.getByTestId('catalog-page-mock')).toBeInTheDocument();
  });
  
  it('отображает компоненты каталога', () => {
    render(<CatalogPage />);
    
    // Проверяем наличие основных элементов
    expect(screen.getByTestId('catalog-sidebar-mock')).toBeInTheDocument();
    expect(screen.getByTestId('category-content-mock')).toBeInTheDocument();
    
    // Проверяем вкладки
    expect(screen.getByRole('tab', { name: /каталог/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /импорт\/экспорт/i })).toBeInTheDocument();
  });
  
  it('отображает кнопки добавления товаров и категорий', () => {
    render(<CatalogPage />);
    
    // Проверяем наличие кнопок
    expect(screen.getByText(/добавить товар/i)).toBeInTheDocument();
    expect(screen.getByText(/добавить категорию/i)).toBeInTheDocument();
    expect(screen.getByText(/добавить подкатегорию/i)).toBeInTheDocument();
  });
  
  it('отображает список товаров', () => {
    render(<CatalogPage />);
    
    // Проверяем наличие списка товаров
    expect(screen.getByTestId('products-list-mock')).toBeInTheDocument();
    
    // Проверяем заголовки столбцов
    expect(screen.getByRole('columnheader', { name: /название/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /артикул/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /цена/i })).toBeInTheDocument();
    
    // Проверяем товары
    expect(screen.getByText('Товар 1')).toBeInTheDocument();
  });
}); 