import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CatalogPage from '../../../../components/catalog/CatalogPage';

// Импортируем настройки для тестов
import './setup';

// Имитация компонентов
import { CatalogSidebarMock, CategoryContentMock } from '../../mocks/catalog-components';

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<CatalogPage />);
    
    // Проверяем наличие основных элементов
    expect(screen.getByTestId('catalog-sidebar-mock')).toBeInTheDocument();
    expect(screen.getByTestId('category-content-mock')).toBeInTheDocument();
  });

  it('initializes with "all" category selected', () => {
    render(<CatalogPage />);
    
    const sidebar = screen.getByTestId('catalog-sidebar-mock');
    expect(sidebar.getAttribute('data-selected-category')).toBe('all');
    
    const content = screen.getByTestId('category-content-mock');
    expect(content.getAttribute('data-category-id')).toBe('all');
  });

  it('changes tabs correctly', () => {
    render(<CatalogPage />);
    
    // Сначала должна быть активна вкладка "Каталог"
    expect(screen.getByRole('tab', { name: /каталог/i })).toHaveAttribute('data-state', 'active');
    
    // Переключаемся на вкладку "Импорт/Экспорт"
    fireEvent.click(screen.getByRole('tab', { name: /импорт\/экспорт/i }));
    
    // Теперь должна быть активна вкладка "Импорт/Экспорт"
    expect(screen.getByRole('tab', { name: /импорт\/экспорт/i })).toHaveAttribute('data-state', 'active');
  });

  it('selects category when sidebar category is clicked', () => {
    // Мокаем CatalogSidebar и его onCategorySelect функцию
    vi.mocked(CatalogSidebarMock).mockImplementationOnce(({ onCategorySelect }) => (
      <div data-testid="catalog-sidebar-mock" onClick={() => onCategorySelect('1')}>
        Mock Sidebar
      </div>
    ));
    
    render(<CatalogPage />);
    
    // Симулируем клик на сайдбар
    const sidebar = screen.getByTestId('catalog-sidebar-mock');
    fireEvent.click(sidebar);
    
    // Проверяем, что CategoryContent получил правильный categoryId
    expect(vi.mocked(CategoryContentMock)).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: '1' }),
      expect.anything()
    );
  });
}); 