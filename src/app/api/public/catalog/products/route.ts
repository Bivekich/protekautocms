import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Product } from '@prisma/client';

// Типы для продуктов с категориями и изображениями
interface ProductWithRelations extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    parent?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  } | null;
  images: Array<{ url: string }>;
  characteristics: Array<{ name: string; value: string }>;
}

// Функция для рекурсивного получения всех подкатегорий
async function getAllSubcategories(parentId: string): Promise<string[]> {
  const directChildren = await prisma.category.findMany({
    where: { parentId },
    select: { id: true },
  });

  if (directChildren.length === 0) return [];

  const childIds = directChildren.map((cat: { id: string }) => cat.id);
  let allDescendants: string[] = [...childIds];

  // Рекурсивно получаем подкатегории для каждой дочерней категории
  for (const childId of childIds) {
    const descendants = await getAllSubcategories(childId);
    allDescendants = [...allDescendants, ...descendants];
  }

  return allDescendants;
}

// GET /api/public/catalog/products - публичный метод для получения списка товаров
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const includeSubcategories =
      searchParams.get('includeSubcategories') === 'true';

    // Формирование условий фильтрации
    const where: Prisma.ProductWhereInput = {
      // Показываем только видимые товары
      isVisible: true,
    };

    if (categoryId) {
      if (includeSubcategories) {
        // Получаем все подкатегории текущей категории рекурсивно
        const allSubcategoryIds = await getAllSubcategories(categoryId);

        // Включаем товары из текущей категории и всех подкатегорий
        where.categoryId = {
          in: [categoryId, ...allSubcategoryIds],
        };
      } else {
        // Проверяем настройки категории
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
          select: { includeSubcategoryProducts: true },
        });

        if (category?.includeSubcategoryProducts) {
          // Получаем все подкатегории текущей категории рекурсивно
          const allSubcategoryIds = await getAllSubcategories(categoryId);

          // Включаем товары из текущей категории и всех подкатегорий
          where.categoryId = {
            in: [categoryId, ...allSubcategoryIds],
          };
        } else {
          // Если флаг не включен или категория не найдена, фильтруем только по текущей категории
          where.categoryId = categoryId;
        }
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Показываем только товары, которые есть в наличии
    where.stock = { gt: 0 };

    // Получение общего количества товаров
    const totalCount = await prisma.product.count({ where });

    // Получение товаров с пагинацией
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        characteristics: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Форматирование ответа
    const formattedProducts = products.map((product: ProductWithRelations) => {
      // Извлекаем данные изображений и обрабатываем их
      const productImages = product.images || [];

      // Устанавливаем основное изображение как первое из массива изображений
      const mainImage = productImages.length > 0 ? productImages[0].url : null;

      // Возвращаем обработанный объект товара
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        retailPrice: product.retailPrice,
        stock: product.stock,
        categoryId: product.categoryId,
        category: product.category,
        mainImage,
        imageUrls: productImages.map((img: { url: string }) => img.url),
        characteristics: product.characteristics,
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении товаров' },
      { status: 500 }
    );
  }
}
