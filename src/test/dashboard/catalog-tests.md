# Тестирование каталога товаров

## Проблемы при тестировании

При тестировании компонентов каталога возникают следующие проблемы:

1. **Проблема с алиасами импортов**: Vitest не может разрешить импорты с алиасами вида `@/components/ui/*` в компонентах каталога.
2. **Сложная структура компонентов**: Компоненты каталога используют множество UI компонентов и имеют сложную иерархию.

## Рекомендации по тестированию

Для успешного тестирования каталога товаров рекомендуется следующий подход:

1. **Использовать e2e тесты** вместо модульных для тестирования интерфейса каталога.

2. **Создать тестовый сервер** для тестирования API-запросов каталога:
   ```typescript
   // Пример тестирования API
   import { test, expect } from 'vitest';
   import { createTestServer } from '../helpers/test-server';
   
   test('API - получение списка категорий', async () => {
     const { server, client } = createTestServer();
     const response = await client.get('/api/catalog/categories');
     expect(response.status).toBe(200);
     expect(response.data).toHaveProperty('categories');
   });
   ```

3. **Тестировать хуки** отдельно от компонентов:
   ```typescript
   // Пример тестирования хука useCatalogGraphQL
   import { test, expect, vi } from 'vitest';
   import { renderHook } from '@testing-library/react';
   import { useCatalogGraphQL } from '../hooks/useCatalogGraphQL';
   
   test('useCatalogGraphQL - получение категорий', async () => {
     // Мокаем fetch
     global.fetch = vi.fn().mockResolvedValue({
       ok: true,
       json: () => Promise.resolve({ 
         data: { 
           categoriesList: { 
             categories: [{ id: '1', name: 'Категория 1' }] 
           } 
         } 
       }),
     });
     
     const { result } = renderHook(() => useCatalogGraphQL());
     const categories = await result.current.getCategories();
     
     expect(categories).toHaveProperty('categories');
     expect(categories.categories[0]).toHaveProperty('id', '1');
   });
   ```

4. **Тестировать логику обработки данных** отдельно от компонентов:
   ```typescript
   // Пример тестирования функции фильтрации товаров
   import { test, expect } from 'vitest';
   import { filterProducts } from '../utils/catalog-filters';
   
   test('filterProducts - фильтрация по наличию', () => {
     const products = [
       { id: '1', stock: 10 },
       { id: '2', stock: 0 },
     ];
     
     const filtered = filterProducts(products, { stockFilter: 'in-stock' });
     expect(filtered).toHaveLength(1);
     expect(filtered[0].id).toBe('1');
   });
   ```

5. **Использовать тестирование снимками** для проверки компонентов каталога:
   ```typescript
   // Пример тестирования снимком
   import { test, expect } from 'vitest';
   import { render } from '@testing-library/react';
   import ProductCard from '../components/catalog/ProductCard';
   
   test('ProductCard - рендер', () => {
     const { container } = render(
       <ProductCard 
         product={{ 
           id: '1', 
           name: 'Товар 1', 
           price: 100, 
           image: '/img/product.jpg' 
         }} 
       />
     );
     
     expect(container).toMatchSnapshot();
   });
   ```

## Организация тестов

Рекомендуется следующая структура для тестов каталога:

```
src/
  test/
    api/
      catalog.test.ts     # Тесты API каталога
    hooks/
      useCatalogGraphQL.test.ts   # Тесты хуков каталога
    utils/
      catalog-filters.test.ts     # Тесты утилит каталога
    e2e/
      catalog-flow.test.ts        # E2E тесты каталога
```

## Мокирование данных

Для тестирования компонентов каталога следует создать набор тестовых данных:

```typescript
// Пример моков данных
export const mockCategories = [
  { id: 'cat1', name: 'Категория 1', slug: 'category-1', level: 0 },
  { 
    id: 'cat2', 
    name: 'Категория 2', 
    slug: 'category-2', 
    level: 0,
    subcategories: [
      { id: 'subcat1', name: 'Подкатегория 1', slug: 'subcategory-1', level: 1 }
    ]
  }
];

export const mockProducts = [
  { 
    id: 'prod1', 
    name: 'Товар 1', 
    slug: 'product-1', 
    sku: 'SKU001', 
    price: 100, 
    stock: 10, 
    categoryId: 'cat1' 
  },
  { 
    id: 'prod2', 
    name: 'Товар 2', 
    slug: 'product-2', 
    sku: 'SKU002', 
    price: 200, 
    stock: 0, 
    categoryId: 'cat2' 
  }
];
``` 