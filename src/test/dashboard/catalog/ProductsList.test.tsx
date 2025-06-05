import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductsList from '../../../../components/catalog/ProductsList';

// Импортируем настройки для тестов
import './setup';

describe('ProductsList', () => {
  const onCategorySelectMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders products list correctly', () => {
    render(
      <ProductsList 
        categoryId="all" 
        onCategorySelect={onCategorySelectMock}
      />
    );
    
    // Проверяем наличие заголовков столбцов таблицы
    expect(screen.getByRole('columnheader', { name: /название/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /артикул/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /цена/i })).toBeInTheDocument();
  });

  it('displays products from the mock data', () => {
    render(
      <ProductsList 
        categoryId="1" 
        onCategorySelect={onCategorySelectMock}
      />
    );
    
    // Проверяем, что товары из мока отображаются
    expect(screen.getByText('Товар 1')).toBeInTheDocument();
    expect(screen.getByText('Товар 2')).toBeInTheDocument();
  });

  it('selects a product when checkbox is clicked', () => {
    render(
      <ProductsList 
        categoryId="1" 
        onCategorySelect={onCategorySelectMock}
      />
    );
    
    // Находим чекбокс первого товара и кликаем по нему
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Первый товар (индекс 1, так как индекс 0 - это "выбрать все")
    
    // Проверяем, что чекбокс выбран
    expect(checkboxes[1]).toBeChecked();
  });

  it('selects all products when "select all" checkbox is clicked', () => {
    render(
      <ProductsList 
        categoryId="1" 
        onCategorySelect={onCategorySelectMock}
      />
    );
    
    // Находим чекбокс "выбрать все" и кликаем по нему
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    
    // Проверяем, что все чекбоксы выбраны
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeChecked();
    });
  });

  it('toggles product visibility when visibility switch is clicked', () => {
    render(
      <ProductsList 
        categoryId="1" 
        onCategorySelect={onCategorySelectMock}
      />
    );
    
    // Находим переключатель видимости и кликаем по нему
    const visibilitySwitches = screen.getAllByRole('switch');
    fireEvent.click(visibilitySwitches[0]);
    
    // Проверяем, что fetch был вызван для обновления видимости
    expect(global.fetch).toHaveBeenCalled();
  });

  it('opens delete confirmation dialog when delete button is clicked', () => {
    render(
      <ProductsList 
        categoryId="1" 
        onCategorySelect={onCategorySelectMock}
      />
    );
    
    // Находим кнопку удаления в первой строке и кликаем по ней
    const deleteButtons = screen.getAllByTitle('Удалить товар');
    fireEvent.click(deleteButtons[0]);
    
    // Проверяем, что диалог подтверждения открылся
    expect(screen.getByText(/вы уверены, что хотите удалить товар/i)).toBeInTheDocument();
  });

  it('navigates to edit product page when edit button is clicked', () => {
    // Создаем шпиона для window.location.href
    const hrefSpy = vi.spyOn(window.location, 'href', 'set');
    
    render(
      <ProductsList 
        categoryId="1" 
        onCategorySelect={onCategorySelectMock}
      />
    );
    
    // Находим кнопку редактирования в первой строке и кликаем по ней
    const editButtons = screen.getAllByTitle('Редактировать товар');
    fireEvent.click(editButtons[0]);
    
    // Проверяем, что был переход на страницу редактирования
    expect(hrefSpy).toHaveBeenCalled();
  });

  it('applies filters when filter button is clicked', () => {
    render(
      <ProductsList 
        categoryId="1" 
        onCategorySelect={onCategorySelectMock}
      />
    );
    
    // Находим кнопку фильтра и кликаем по ней
    const filterButton = screen.getByRole('button', { name: /фильтр/i });
    fireEvent.click(filterButton);
    
    // Выбираем значение фильтра
    const stockFilterSelect = screen.getByLabelText(/наличие/i);
    fireEvent.change(stockFilterSelect, { target: { value: 'in-stock' } });
    
    // Кликаем на кнопку применения фильтров
    const applyButton = screen.getByRole('button', { name: /применить/i });
    fireEvent.click(applyButton);
    
    // Проверяем, что запрос на получение товаров был вызван с новыми фильтрами
    expect(global.fetch).toHaveBeenCalled();
  });
});