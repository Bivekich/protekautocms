import { Category } from '@/types/catalog';

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
  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
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
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
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
};
