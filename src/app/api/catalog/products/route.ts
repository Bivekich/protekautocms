import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { createAuditLog } from '@/lib/create-audit-log';

// Типы для продуктов с категориями и изображениями
interface ProductCategoryType {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface ProductImageType {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  productId: string;
}

interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  categoryId: string | null;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: ProductCategoryType | null;
  images: ProductImageType[];
  characteristics?: Array<{ name: string; value: string }>;
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
  options: z
    .array(
      z.object({
        name: z.string().min(1, 'Название опции обязательно'),
        type: z.enum(['single', 'multiple'], {
          errorMap: () => ({
            message: 'Тип опции должен быть single или multiple',
          }),
        }),
        values: z
          .array(
            z.object({
              value: z.string().min(1, 'Значение опции обязательно'),
              price: z
                .number()
                .min(0, 'Цена не может быть отрицательной')
                .default(0),
            })
          )
          .min(1, 'Опция должна иметь хотя бы одно значение'),
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
        // Получаем все подкатегории текущей категории рекурсивно
        const allSubcategoryIds = await getAllSubcategories(categoryId);

        // Включаем товары из текущей категории и всех подкатегорий
        where.categoryId = {
          in: [categoryId, ...allSubcategoryIds],
        };
      } else {
        // Если параметр не передан, проверяем настройки категории
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
    const formattedProducts = products.map((product: ProductWithRelations) => {
      // Извлекаем данные изображений и обрабатываем их
      const productImages = product.images || [];

      // Устанавливаем основное изображение как первое из массива изображений
      const mainImage = productImages.length > 0 ? productImages[0].url : null;

      // Возвращаем обработанный объект товара
      return {
        ...product,
        mainImage,
        imageUrls: productImages.map((img: ProductImageType) => img.url),
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

    // Добавление опций, если они предоставлены
    if (validatedData.options && validatedData.options.length > 0) {
      for (const option of validatedData.options) {
        // Создаем опцию
        const createdOption = await prisma.productOption.create({
          data: {
            name: option.name,
            type: option.type,
            productId: product.id,
          },
        });

        // Создаем значения для опции
        if (option.values && option.values.length > 0) {
          await prisma.productOptionValue.createMany({
            data: option.values.map((val) => ({
              value: val.value,
              price: val.price,
              optionId: createdOption.id,
            })),
          });
        }
      }
    }

    // Запись в аудит
    await createAuditLog({
      action: 'CREATE',
      details: `Создан товар: ${product.name} (${product.sku})`,
      userId: session.user.id,
      targetId: product.id,
      targetType: 'product',
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
