import {
  Category,
  ImportExportFormat,
  ExportOptions,
  ImportResult,
  Product,
  ProductFormData,
} from '@/types/catalog';

// Временная реализация API для работы с категориями
// В будущем будет заменена на реальные запросы к серверу

// Пример данных категорий
const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Электроника',
    slug: 'electronics',
    description: 'Электроника и гаджеты',
    parentId: null,
    children: [
      {
        id: 'cat2',
        name: 'Смартфоны',
        slug: 'smartphones',
        description: 'Мобильные телефоны и смартфоны',
        parentId: 'cat1',
        children: [],
      },
      {
        id: 'cat3',
        name: 'Ноутбуки',
        slug: 'laptops',
        description: 'Ноутбуки и аксессуары',
        parentId: 'cat1',
        children: [],
      },
    ],
  },
  {
    id: 'cat4',
    name: 'Одежда',
    slug: 'clothing',
    description: 'Одежда и аксессуары',
    parentId: null,
    children: [],
  },
];

// API для работы с категориями
export const categoriesApi = {
  // Получение всех категорий
  getAll: async (): Promise<Category[]> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockCategories;
  },

  // Получение категории по ID
  getById: async (id: string): Promise<Category | null> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Поиск категории в плоском списке
    const findCategory = (
      categories: Category[],
      id: string
    ): Category | null => {
      for (const category of categories) {
        if (category.id === id) {
          return category;
        }

        if (category.children.length > 0) {
          const found = findCategory(category.children, id);
          if (found) {
            return found;
          }
        }
      }

      return null;
    };

    return findCategory(mockCategories, id);
  },

  // Создание новой категории
  create: async (
    category: Omit<Category, 'id' | 'children'>
  ): Promise<Category> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 700));

    const newCategory: Category = {
      ...category,
      id: `cat${Date.now()}`,
      children: [],
    };

    return newCategory;
  },

  // Обновление категории
  update: async (
    id: string,
    data: Partial<Omit<Category, 'id' | 'children'>>
  ): Promise<Category> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 600));

    const category = await categoriesApi.getById(id);
    if (!category) {
      throw new Error(`Категория с ID ${id} не найдена`);
    }

    const updatedCategory: Category = {
      ...category,
      ...data,
    };

    return updatedCategory;
  },

  // Удаление категории
  delete: async (id: string): Promise<void> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 800));

    // В реальном приложении здесь будет запрос на удаление
    console.log(`Категория с ID ${id} удалена`);
  },

  // Получение подкатегорий
  getSubcategories: async (parentId: string): Promise<Category[]> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Поиск подкатегорий
    const findSubcategories = (
      categories: Category[],
      parentId: string
    ): Category[] => {
      const result: Category[] = [];

      for (const category of categories) {
        if (category.parentId === parentId) {
          result.push(category);
        }

        if (category.children.length > 0) {
          const found = findSubcategories(category.children, parentId);
          result.push(...found);
        }
      }

      return result;
    };

    return findSubcategories(mockCategories, parentId);
  },
};

// API для импорта/экспорта
export const importExportApi = {
  // Экспорт данных
  exportData: async (
    format: ImportExportFormat,
    options: ExportOptions
  ): Promise<string> => {
    // GraphQL мутация для экспорта
    const exportMutation = `
      mutation ExportCatalog($input: ExportInput!) {
        exportCatalog(input: $input)
      }
    `;

    const variables = {
      input: {
        format,
        includeImages: options.includeImages,
        includeCategories: options.includeCategories,
        includeOptions: options.includeOptions,
        includeCharacteristics: options.includeCharacteristics,
      },
    };

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: exportMutation,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при выполнении запроса');
      }

      const result = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      // Возвращаем URL для скачивания
      return result.data.exportCatalog;
    } catch (error) {
      console.error('Ошибка при экспорте данных:', error);
      throw error;
    }
  },

  // Импорт данных
  importData: async (
    file: File,
    format: ImportExportFormat
  ): Promise<ImportResult> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // В реальном приложении здесь будет логика импорта данных
    console.log(`Импорт данных из файла ${file.name} в формате ${format}`);

    // Пример результата импорта
    return {
      success: true,
      totalItems: 10,
      importedItems: 8,
      errors: [
        'Товар с SKU ABC123 уже существует',
        'Неверный формат цены для товара XYZ789',
      ],
    };
  },
};

// API для работы с товарами
export const productsApi = {
  // Получение всех товаров
  getAll: async (): Promise<Product[]> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 700));

    // В реальном приложении здесь будет запрос на получение товаров
    return [
      {
        id: 'prod1',
        name: 'Товар 1',
        slug: 'product-1',
        sku: 'SKU-001',
        description: 'Описание товара 1',
        wholesalePrice: 100,
        retailPrice: 150,
        stock: 10,
        isVisible: true,
        categoryId: 'cat2',
        createdAt: new Date(),
        updatedAt: new Date(),
        mainImage: '/uploads/sample-image.jpg', // Добавляем моковое изображение
      },
      {
        id: 'prod2',
        name: 'Товар 2',
        slug: 'product-2',
        sku: 'SKU-002',
        description: 'Описание товара 2',
        wholesalePrice: 200,
        retailPrice: 250,
        stock: 5,
        isVisible: true,
        categoryId: 'cat3',
        createdAt: new Date(),
        updatedAt: new Date(),
        mainImage: '/uploads/another-image.jpg', // Добавляем моковое изображение
      },
    ];
  },

  // Получение товара по ID
  getById: async (id: string): Promise<Product | null> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 500));

    // В реальном приложении здесь будет запрос на получение товара
    if (id === 'prod1') {
      return {
        id: 'prod1',
        name: 'Товар 1',
        slug: 'product-1',
        sku: 'SKU-001',
        description: 'Описание товара 1',
        wholesalePrice: 100,
        retailPrice: 150,
        stock: 10,
        isVisible: true,
        categoryId: 'cat2',
        createdAt: new Date(),
        updatedAt: new Date(),
        mainImage: '/uploads/sample-image.jpg', // Добавляем моковое изображение
      };
    }

    return null;
  },

  // Создание нового товара
  create: async (data: ProductFormData): Promise<Product> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 800));

    // В реальном приложении здесь будет запрос на создание товара
    const newProduct = {
      id: `prod${Date.now()}`,
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      wholesalePrice: data.wholesalePrice,
      retailPrice: data.retailPrice,
      stock: data.stock,
      isVisible: data.visible,
      categoryId: data.categoryIds[0] || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrls: data.images || [], // Сохраняем изображения в поле imageUrls
      mainImage: data.images && data.images.length > 0 ? data.images[0] : null, // Используем первое изображение из массива как главное
    };

    console.log('Создан новый товар с изображениями:', newProduct);
    return newProduct;
  },

  // Обновление товара
  update: async (
    id: string,
    data: Partial<ProductFormData>
  ): Promise<Product> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 600));

    // В реальном приложении здесь будет запрос на обновление товара
    const updatedProduct = {
      id,
      name: data.name || 'Товар',
      slug: data.slug || 'product',
      sku: data.sku || 'SKU',
      description: data.description || '',
      wholesalePrice: data.wholesalePrice || 0,
      retailPrice: data.retailPrice || 0,
      stock: data.stock || 0,
      isVisible: data.visible || false,
      categoryId: data.categoryIds?.[0] || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      imageUrls: data.images || [], // Сохраняем изображения в поле imageUrls
      mainImage: data.images && data.images.length > 0 ? data.images[0] : null, // Используем первое изображение из массива как главное
    };

    console.log('Обновлен товар с изображениями:', updatedProduct);
    return updatedProduct;
  },

  // Удаление товара
  delete: async (id: string): Promise<void> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 700));

    // В реальном приложении здесь будет запрос на удаление товара
    console.log(`Товар с ID ${id} удален`);
  },

  // Получение товаров по категории
  getByCategory: async (categoryId: string | null): Promise<Product[]> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Получение категории для проверки includeSubcategoryProducts
    const category =
      categoryId !== 'all' && categoryId
        ? await categoriesApi.getById(categoryId)
        : null;

    // Получаем все товары (в реальном API здесь будет фильтрация на сервере)
    const allProducts = await productsApi.getAll();

    if (categoryId === 'all' || !categoryId) {
      return allProducts;
    }

    // Если включена опция отображения товаров из подкатегорий
    if (category?.includeSubcategoryProducts) {
      // Получаем все ID подкатегорий
      const subcategories = await categoriesApi.getSubcategories(categoryId);
      const subcategoryIds = subcategories.map((subcat) => subcat.id);

      // Включаем товары из текущей категории и всех её подкатегорий
      return allProducts.filter(
        (product) =>
          product.categoryId === categoryId ||
          (product.categoryId && subcategoryIds.includes(product.categoryId))
      );
    }

    // Если опция не включена, возвращаем только товары из текущей категории
    return allProducts.filter((product) => product.categoryId === categoryId);
  },

  // Поиск товаров
  search: async (
    query: string,
    categoryId?: string | null
  ): Promise<Product[]> => {
    try {
      // Используем API сервера вместо моковых данных
      const url = new URL('/api/catalog/products', window.location.origin);
      url.searchParams.append('search', query);
      if (categoryId) {
        url.searchParams.append('categoryId', categoryId);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Ошибка при поиске товаров');
      }

      const data = await response.json();

      console.log('Получены данные от API (поиск):', data);
      if (data.products && data.products.length > 0) {
        console.log(
          'Первый найденный товар:',
          JSON.stringify(data.products[0], null, 2)
        );
      }

      // Преобразуем полученные данные в формат, который ожидается в компоненте
      const transformedProducts = data.products.map(
        (product: {
          id: string;
          name: string;
          slug: string;
          sku: string;
          description?: string | null;
          wholesalePrice: number;
          retailPrice: number;
          stock: number;
          isVisible: boolean;
          categoryId: string | null;
          mainImage?: string | null;
          imageUrls?: string[];
          images?: {
            id: string;
            url: string;
            alt?: string | null;
            order: number;
            productId: string;
          }[];
        }) => {
          // Определяем URL для основного изображения
          let mainImageUrl = product.mainImage;

          // Если mainImage не определен, пробуем использовать imageUrls или images
          if (
            !mainImageUrl &&
            product.imageUrls &&
            product.imageUrls.length > 0
          ) {
            mainImageUrl = product.imageUrls[0];
          } else if (
            !mainImageUrl &&
            product.images &&
            product.images.length > 0
          ) {
            mainImageUrl = product.images[0].url;
          }

          const result = {
            ...product,
            mainImage: mainImageUrl,
            // Убеждаемся, что imageUrls существует
            imageUrls:
              product.imageUrls ||
              (product.images ? product.images.map((img) => img.url) : []),
          };

          console.log('Преобразованный товар для поиска:', {
            id: result.id,
            name: result.name,
            mainImage: result.mainImage,
            imageUrls: result.imageUrls,
            imagesCount: product.images?.length || 0,
          });

          return result;
        }
      );

      return transformedProducts;
    } catch (error) {
      console.error('Ошибка при поиске товаров:', error);

      // Возвращаем пустой массив в случае ошибки
      return [];
    }
  },

  // Изменение видимости товара
  toggleVisibility: async (id: string, visible: boolean): Promise<void> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 400));

    // В реальном приложении здесь будет запрос на изменение видимости товара
    console.log(`Изменение видимости товара с ID ${id} на ${visible}`);

    // Обновляем товар
    await productsApi.update(id, { visible });
  },

  // Массовое удаление товаров
  bulkDelete: async (ids: string[]): Promise<void> => {
    // Имитация задержки запроса
    await new Promise((resolve) => setTimeout(resolve, 800));

    // В реальном приложении здесь будет запрос на массовое удаление товаров
    console.log(`Удаление товаров с ID: ${ids.join(', ')}`);

    // Удаляем товары по одному
    for (const id of ids) {
      await productsApi.delete(id);
    }
  },
};
