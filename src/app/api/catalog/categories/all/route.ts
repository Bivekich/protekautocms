import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Category as PrismaCategory } from '@prisma/client';

type CategoryWithSubcats = PrismaCategory & {
  subcategories: CategoryWithSubcats[];
};

export async function GET() {
  try {
    // Получаем все категории, сортируем по уровню и порядку
    const categories = await prisma.category.findMany({
      orderBy: [{ level: 'asc' }, { order: 'asc' }, { name: 'asc' }],
    });

    console.log('Получено категорий из базы данных:', categories.length);

    // Выводим уровни категорий для отладки
    categories.forEach((cat) => {
      console.log(
        `Категория ${cat.name} (ID: ${cat.id}), уровень: ${
          cat.level
        }, родитель: ${cat.parentId || 'нет'}`
      );
    });

    // Преобразуем плоский список в древовидную структуру
    const categoryMap = new Map<string, CategoryWithSubcats>();

    // Сначала создаем Map с id категорий в качестве ключей
    categories.forEach((category) => {
      categoryMap.set(category.id, {
        ...category,
        subcategories: [],
      });
    });

    // Строим дерево категорий
    const rootCategories: CategoryWithSubcats[] = [];

    categories.forEach((category) => {
      const categoryWithSubcategories = categoryMap.get(category.id);

      if (category.parentId === null) {
        // Если это корневая категория
        if (categoryWithSubcategories) {
          rootCategories.push(categoryWithSubcategories);
        }
      } else {
        // Если это подкатегория, добавляем её в родительскую категорию
        const parentCategory = categoryMap.get(category.parentId);
        if (parentCategory && categoryWithSubcategories) {
          parentCategory.subcategories.push(categoryWithSubcategories);
        }
      }
    });

    // Логируем корневые категории и их подкатегории
    console.log('Корневые категории:', rootCategories.length);
    rootCategories.forEach((root) => {
      console.log(
        `Корневая категория ${root.name}, подкатегорий: ${root.subcategories.length}`
      );
      root.subcategories.forEach((sub) => {
        console.log(
          `  -> Подкатегория ${sub.name}, подкатегорий: ${sub.subcategories.length}`
        );
        sub.subcategories.forEach((subsub) => {
          console.log(
            `      --> Под-подкатегория ${subsub.name}, подкатегорий: ${subsub.subcategories.length}`
          );
        });
      });
    });

    return NextResponse.json(rootCategories);
  } catch (error) {
    console.error('Ошибка при получении структуры категорий:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении структуры категорий' },
      { status: 500 }
    );
  }
}
