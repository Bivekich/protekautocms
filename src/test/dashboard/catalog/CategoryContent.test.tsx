import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryContent from '../../../../components/catalog/CategoryContent';

// Импортируем настройки для тестов
import './setup';

describe('CategoryContent', () => {
  const onCategorySelectMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with "all" category', () => {
    render(
      <CategoryContent 
        categoryId="all" 
        onCategorySelect={onCategorySelectMock} 
      />
    );
    
    // Проверяем, что компонент отображает корректную информацию для категории "Все товары"
    expect(screen.getByText(/добавить товар/i)).toBeInTheDocument();
  });

  it('passes categoryId to component', () => {
    render(
      <CategoryContent 
        categoryId="1" 
        onCategorySelect={onCategorySelectMock} 
      />
    );
    
    // Проверяем, что categoryId передан в компонент
    const content = screen.getByTestId('category-content-mock');
    expect(content.getAttribute('data-category-id')).toBe('1');
  });

  it('calls onCategorySelect when a subcategory is clicked', () => {
    render(
      <CategoryContent 
        categoryId="1" 
        onCategorySelect={onCategorySelectMock} 
      />
    );
    
    // Симулируем клик на контент категории
    const content = screen.getByTestId('category-content-mock');
    fireEvent.click(content);
    
    // Проверяем, что функция была вызвана с правильным ID
    expect(onCategorySelectMock).toHaveBeenCalledWith('1');
  });
}); 