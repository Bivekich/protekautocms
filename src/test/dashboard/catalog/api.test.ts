import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockGraphQLResponses } from '../../helpers/test-data/catalog-data';

// Импортируем настройки для тестов
import './setup';

describe('Catalog API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Мокаем fetch для GraphQL запросов
    global.fetch = vi.fn().mockImplementation((url, options) => {
      const body = JSON.parse(options?.body as string);
      const query = body.query;
      
      // Определяем тип запроса и возвращаем соответствующий мок-ответ
      if (query.includes('categoriesList')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGraphQLResponses.categories)
        });
      }
      
      if (query.includes('productsList') && body.variables?.categoryId) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGraphQLResponses.productsByCategory(body.variables.categoryId))
        });
      }
      
      if (query.includes('productsList') && !body.variables?.categoryId) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGraphQLResponses.allProducts)
        });
      }
      
      if (query.includes('createCategory')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGraphQLResponses.createCategory)
        });
      }
      
      if (query.includes('createProduct')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGraphQLResponses.createProduct)
        });
      }
      
      if (query.includes('updateProduct')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGraphQLResponses.updateProduct)
        });
      }
      
      if (query.includes('deleteProduct')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockGraphQLResponses.deleteProduct)
        });
      }
      
      // Для неизвестных запросов возвращаем ошибку
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve(mockGraphQLResponses.error)
      });
    });
  });
  
  it('получает список категорий', async () => {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { 
          categoriesList { 
            categories { 
              id 
              name 
              slug 
              level 
              subcategories { 
                id 
                name 
                slug 
                level 
              } 
            } 
          } 
        }`
      })
    });
    
    const data = await response.json();
    
    expect(data).toEqual(mockGraphQLResponses.categories);
    expect(data.data.categoriesList.categories).toHaveLength(2);
    expect(data.data.categoriesList.categories[0].id).toBe('cat1');
  });
  
  it('получает список товаров для категории', async () => {
    const categoryId = 'cat1';
    
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query ($categoryId: ID!) { 
          productsList(categoryId: $categoryId) { 
            products { 
              id 
              name 
              sku 
              price 
              stock 
              categoryId 
              active 
            } 
          } 
        }`,
        variables: { categoryId }
      })
    });
    
    const data = await response.json();
    
    expect(data).toEqual(mockGraphQLResponses.productsByCategory(categoryId));
    expect(data.data.productsList.products).toHaveLength(1);
    expect(data.data.productsList.products[0].categoryId).toBe(categoryId);
  });
  
  it('создает новую категорию', async () => {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation ($name: String!) { 
          createCategory(input: { name: $name }) { 
            id 
            name 
            slug 
            level 
          } 
        }`,
        variables: { name: 'Новая категория' }
      })
    });
    
    const data = await response.json();
    
    expect(data).toEqual(mockGraphQLResponses.createCategory);
    expect(data.data.createCategory.name).toBe('Новая категория');
  });
  
  it('создает новый товар', async () => {
    const productInput = {
      name: 'Новый товар',
      sku: 'NEWSKU001',
      price: 150,
      stock: 20,
      categoryId: 'cat1',
      active: true
    };
    
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation ($input: ProductInput!) { 
          createProduct(input: $input) { 
            id 
            name 
            slug 
            sku 
            price 
            stock 
            categoryId 
            active 
          } 
        }`,
        variables: { input: productInput }
      })
    });
    
    const data = await response.json();
    
    expect(data).toEqual(mockGraphQLResponses.createProduct);
    expect(data.data.createProduct.name).toBe('Новый товар');
    expect(data.data.createProduct.sku).toBe('NEWSKU001');
  });
  
  it('обновляет товар', async () => {
    const productUpdateInput = {
      id: 'prod1',
      name: 'Обновленный товар',
      price: 120
    };
    
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation ($input: ProductUpdateInput!) { 
          updateProduct(input: $input) { 
            id 
            name 
            price 
            active 
          } 
        }`,
        variables: { input: productUpdateInput }
      })
    });
    
    const data = await response.json();
    
    expect(data).toEqual(mockGraphQLResponses.updateProduct);
    expect(data.data.updateProduct.name).toBe('Обновленный товар');
    expect(data.data.updateProduct.price).toBe(120);
  });
  
  it('удаляет товар', async () => {
    const productId = 'prod1';
    
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation ($id: ID!) { 
          deleteProduct(id: $id) { 
            success 
          } 
        }`,
        variables: { id: productId }
      })
    });
    
    const data = await response.json();
    
    expect(data).toEqual(mockGraphQLResponses.deleteProduct);
    expect(data.data.deleteProduct.success).toBe(true);
  });
}); 