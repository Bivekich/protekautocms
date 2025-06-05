import { vi } from 'vitest';
import { mockCategories, mockProducts, mockGraphQLResponses } from '../test-data/catalog-data';

// Мок для хука useCatalogGraphQL
const useCatalogGraphQLMock = vi.fn().mockReturnValue({
  // Получение категорий
  getCategories: vi.fn().mockResolvedValue({
    categories: mockCategories
  }),
  
  // Получение товаров в категории
  getCategoryProducts: vi.fn().mockImplementation((categoryId) => {
    if (categoryId === 'all') {
      return Promise.resolve({
        products: mockProducts
      });
    }
    
    return Promise.resolve({
      products: mockProducts.filter(p => p.categoryId === categoryId)
    });
  }),
  
  // Создание категории
  createCategory: vi.fn().mockResolvedValue({
    id: 'newcat1',
    name: 'Новая категория',
    slug: 'new-category',
    level: 0
  }),
  
  // Создание товара
  createProduct: vi.fn().mockResolvedValue({
    id: 'newprod1',
    name: 'Новый товар',
    slug: 'new-product',
    sku: 'NEWSKU001',
    price: 150,
    stock: 20,
    categoryId: 'cat1',
    active: true
  }),
  
  // Обновление товара
  updateProduct: vi.fn().mockResolvedValue({
    id: 'prod1',
    name: 'Обновленный товар',
    price: 120,
    active: true
  }),
  
  // Удаление товара
  deleteProduct: vi.fn().mockResolvedValue({
    success: true
  }),
  
  // Импорт товаров
  importProducts: vi.fn().mockResolvedValue({
    success: true,
    importedCount: 5
  }),
  
  // Экспорт товаров
  exportProducts: vi.fn().mockResolvedValue({
    success: true,
    fileUrl: 'http://example.com/export.xlsx'
  }),
  
  // Состояние загрузки
  loading: false,
  
  // Состояние ошибки
  error: null
});

// Мокаем хук useCatalogGraphQL
vi.mock('../../../hooks/useCatalogGraphQL', () => ({
  default: useCatalogGraphQLMock
}));

export default useCatalogGraphQLMock; 