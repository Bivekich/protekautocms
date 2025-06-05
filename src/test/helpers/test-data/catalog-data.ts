// Тестовые данные для каталога

// Категории
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

// Товары
export const mockProducts = [
  { 
    id: 'prod1', 
    name: 'Товар 1', 
    slug: 'product-1', 
    sku: 'SKU001', 
    price: 100, 
    stock: 10, 
    categoryId: 'cat1',
    active: true
  },
  { 
    id: 'prod2', 
    name: 'Товар 2', 
    slug: 'product-2', 
    sku: 'SKU002', 
    price: 200, 
    stock: 0, 
    categoryId: 'cat2',
    active: false
  },
  { 
    id: 'prod3', 
    name: 'Товар 3', 
    slug: 'product-3', 
    sku: 'SKU003', 
    price: 300, 
    stock: 5, 
    categoryId: 'subcat1',
    active: true
  }
];

// Ответы от GraphQL
export const mockGraphQLResponses = {
  // Ответ на запрос всех категорий
  categories: {
    data: {
      categoriesList: {
        categories: mockCategories
      }
    }
  },
  
  // Ответ на запрос товаров из категории
  productsByCategory: (categoryId: string) => ({
    data: {
      productsList: {
        products: mockProducts.filter(p => p.categoryId === categoryId)
      }
    }
  }),
  
  // Ответ на запрос всех товаров
  allProducts: {
    data: {
      productsList: {
        products: mockProducts
      }
    }
  },
  
  // Ответ на создание категории
  createCategory: {
    data: {
      createCategory: {
        id: 'newcat1',
        name: 'Новая категория',
        slug: 'new-category',
        level: 0
      }
    }
  },
  
  // Ответ на создание товара
  createProduct: {
    data: {
      createProduct: {
        id: 'newprod1',
        name: 'Новый товар',
        slug: 'new-product',
        sku: 'NEWSKU001',
        price: 150,
        stock: 20,
        categoryId: 'cat1',
        active: true
      }
    }
  },
  
  // Ответ на обновление товара
  updateProduct: {
    data: {
      updateProduct: {
        id: 'prod1',
        name: 'Обновленный товар',
        price: 120,
        active: true
      }
    }
  },
  
  // Ответ на удаление товара
  deleteProduct: {
    data: {
      deleteProduct: {
        success: true
      }
    }
  },
  
  // Ошибка запроса
  error: {
    errors: [
      {
        message: 'Ошибка запроса',
        locations: [{ line: 1, column: 1 }],
        path: ['categoriesList']
      }
    ]
  }
}; 