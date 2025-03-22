import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Схема валидации для создания товара
const createProductSchema = z.object({
  name: z.string().min(1, 'Название товара обязательно'),
  sku: z.string().min(1, 'Артикул обязателен'),
  description: z.string().optional(),
  wholesalePrice: z.number().min(0, 'Оптовая цена не может быть отрицательной'),
  retailPrice: z.number().min(0, 'Розничная цена не может быть отрицательной'),
  stock: z.number().int().default(0),
  categoryId: z.string().optional(),
  isVisible: z.boolean().default(true),
  images: z
    .array(
      z.object({
        url: z.string().refine(
          (url) => {
            // Поддержка абсолютных URL и относительных URL, начинающихся с /uploads/
            return (
              url.startsWith('http://') ||
              url.startsWith('https://') ||
              url.startsWith('/uploads/')
            );
          },
          {
            message:
              'Некорректный URL изображения. URL должен начинаться с http://, https:// или /uploads/',
          }
        ),
        alt: z.string().optional(),
      })
    )
    .optional(),
  characteristics: z
    .array(
      z.object({
        name: z.string().min(1, 'Название характеристики обязательно'),
        value: z.string().min(1, 'Значение характеристики обязательно'),
      })
    )
    .optional(),
});

// GET /api/catalog/products - получение списка товаров
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Получаем параметры фильтрации
    const stockFilter = searchParams.get('stock');
    const visibilityFilter = searchParams.get('visibility');
    const includeSubcategories =
      searchParams.get('includeSubcategories') === 'true';

    // Формирование условий фильтрации
    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      // Если передан параметр включения подкатегорий, используем его напрямую
      if (includeSubcategories) {
        // Получаем все подкатегории текущей категории
        const subcategories = await prisma.category.findMany({
          where: {
            parentId: categoryId,
          },
          select: { id: true },
        });

        // Если у категории есть подкатегории
        if (subcategories.length > 0) {
          // Получаем ID всех подкатегорий
          const subcategoryIds = subcategories.map((cat) => cat.id);

          // Включаем товары из текущей категории и всех подкатегорий
          where.categoryId = {
            in: [categoryId, ...subcategoryIds],
          };
        } else {
          // Если подкатегорий нет, фильтруем только по текущей категории
          where.categoryId = categoryId;
        }
      } else {
        // Если параметр не передан, проверяем настройки категории
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
          select: { includeSubcategoryProducts: true },
        });

        if (category?.includeSubcategoryProducts) {
          // Получаем все подкатегории текущей категории
          const subcategories = await prisma.category.findMany({
            where: {
              parentId: categoryId,
            },
            select: { id: true },
          });

          // Если у категории есть подкатегории и включен флаг includeSubcategoryProducts
          if (subcategories.length > 0) {
            // Получаем ID всех подкатегорий
            const subcategoryIds = subcategories.map((cat) => cat.id);

            // Включаем товары из текущей категории и всех подкатегорий
            where.categoryId = {
              in: [categoryId, ...subcategoryIds],
            };
          } else {
            // Если подкатегорий нет, фильтруем только по текущей категории
            where.categoryId = categoryId;
          }
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

    // Добавляем фильтрацию по наличию товара
    if (stockFilter) {
      if (stockFilter === 'instock') {
        where.stock = { gt: 0 }; // Товары в наличии (stock > 0)
      } else if (stockFilter === 'outofstock') {
        where.stock = { equals: 0 }; // Товары не в наличии (stock = 0)
      }
    }

    // Добавляем фильтрацию по видимости товара
    if (visibilityFilter) {
      if (visibilityFilter === 'visible') {
        where.isVisible = true; // Только видимые товары
      } else if (visibilityFilter === 'hidden') {
        where.isVisible = false; // Только скрытые товары
      }
    }

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
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Форматирование ответа
    const formattedProducts = products.map((product) => {
      // Извлекаем данные изображений и обрабатываем их
      const productImages = product.images || [];

      // Устанавливаем основное изображение как первое из массива изображений
      const mainImage = productImages.length > 0 ? productImages[0].url : null;

      // Возвращаем обработанный объект товара
      return {
        ...product,
        mainImage,
        imageUrls: productImages.map((img) => img.url),
        images: productImages, // Включаем все изображения в ответ
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

// POST /api/catalog/products - создание нового товара
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Создание слага из названия
    let slug = slugify(validatedData.name);

    // Проверка уникальности слага
    const existingProductBySlug = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProductBySlug) {
      // Если слаг уже существует, добавляем к нему случайное число
      slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }

    // Проверка уникальности артикула
    const existingProductBySku = await prisma.product.findUnique({
      where: { sku: validatedData.sku },
    });

    if (existingProductBySku) {
      return NextResponse.json(
        { error: 'Товар с таким артикулом уже существует' },
        { status: 400 }
      );
    }

    // Проверка существования категории, если указана
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Указанная категория не существует' },
          { status: 400 }
        );
      }
    }

    // Создание товара
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        slug,
        sku: validatedData.sku,
        description: validatedData.description,
        wholesalePrice: validatedData.wholesalePrice,
        retailPrice: validatedData.retailPrice,
        stock: validatedData.stock,
        categoryId: validatedData.categoryId,
        isVisible: validatedData.isVisible,
      },
      include: {
        category: true,
      },
    });

    // Добавление изображений, если они предоставлены
    if (validatedData.images && validatedData.images.length > 0) {
      await prisma.productImage.createMany({
        data: validatedData.images.map((image, index) => ({
          productId: product.id,
          url: image.url,
          alt: image.alt || product.name,
          order: index,
        })),
      });
    }

    // Добавление характеристик, если они предоставлены
    if (
      validatedData.characteristics &&
      validatedData.characteristics.length > 0
    ) {
      await prisma.productCharacteristic.createMany({
        data: validatedData.characteristics.map((char) => ({
          productId: product.id,
          name: char.name,
          value: char.value,
        })),
      });
    }

    // Запись в аудит
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_PRODUCT',
        details: `Создан товар: ${product.name} (${product.sku})`,
        userId: session.user.id,
      },
    });

    // Получение созданного товара со всеми связанными данными
    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        characteristics: true,
      },
    });

    return NextResponse.json(createdProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Ошибка при создании товара:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании товара' },
      { status: 500 }
    );
  }
}
