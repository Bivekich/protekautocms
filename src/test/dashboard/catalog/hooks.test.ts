import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useCatalogGraphQLMock from '../../helpers/mocks/useCatalogGraphQLMock';
import { mockCategories, mockProducts } from '../../helpers/test-data/catalog-data';

// Импортируем настройки для тестов
import '../catalog/setup';

describe('useCatalogGraphQL (мок)', () => {
  // Получаем мок-объект из нашего мока
  const hookMock = useCatalogGraphQLMock();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('возвращает список категорий', async () => {
    const result = await hookMock.getCategories();
    
    expect(result).toHaveProperty('categories');
    expect(result.categories).toEqual(mockCategories);
  });

  it('возвращает список товаров для категории "all"', async () => {
    const result = await hookMock.getCategoryProducts('all');
    
    expect(result).toHaveProperty('products');
    expect(result.products).toEqual(mockProducts);
  });

  it('возвращает список товаров для конкретной категории', async () => {
    const result = await hookMock.getCategoryProducts('cat1');
    
    expect(result).toHaveProperty('products');
    expect(result.products).toEqual(mockProducts.filter(p => p.categoryId === 'cat1'));
  });

  it('создает новую категорию', async () => {
    const result = await hookMock.createCategory({ name: 'Новая категория' });
    
    expect(result).toHaveProperty('id', 'newcat1');
    expect(result).toHaveProperty('name', 'Новая категория');
  });

  it('создает новый товар', async () => {
    const result = await hookMock.createProduct({
      name: 'Новый товар',
      sku: 'NEWSKU001',
      categoryId: 'cat1'
    });
    
    expect(result).toHaveProperty('id', 'newprod1');
    expect(result).toHaveProperty('name', 'Новый товар');
    expect(result).toHaveProperty('sku', 'NEWSKU001');
  });

  it('обновляет товар', async () => {
    const result = await hookMock.updateProduct({
      id: 'prod1',
      name: 'Обновленный товар',
      price: 120
    });
    
    expect(result).toHaveProperty('id', 'prod1');
    expect(result).toHaveProperty('name', 'Обновленный товар');
    expect(result).toHaveProperty('price', 120);
  });

  it('удаляет товар', async () => {
    const result = await hookMock.deleteProduct('prod1');
    
    expect(result).toHaveProperty('success', true);
  });

  it('импортирует товары', async () => {
    const result = await hookMock.importProducts(new File([], 'import.xlsx'));
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('importedCount', 5);
  });

  it('экспортирует товары', async () => {
    const result = await hookMock.exportProducts();
    
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('fileUrl');
  });
}); 