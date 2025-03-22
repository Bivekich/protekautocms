import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Схема валидации для создания категории
const createCategorySchema = z.object({
  name: z.string().min(1, 'Название категории обязательно'),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  isVisible: z.boolean().optional().default(true),
  includeSubcategoryProducts: z.boolean().optional().default(false),
  imageUrl: z.string().optional(),
});

// GET /api/catalog/categories - получение всех категорий
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeHidden = searchParams.get('includeHidden') === 'true';
    const categoryId = searchParams.get('id');

    // Если запрашивается конкретная категория по ID
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          subcategories: {
            where: includeHidden ? {} : { isVisible: true },
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
            include: {
              _count: {
                select: {
                  products: true,
                },
              },
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Категория не найдена' },
          { status: 404 }
        );
      }

      return NextResponse.json(category);
    }

    // Иначе возвращаем все категории
    // Формируем условие запроса в зависимости от параметра includeHidden
    const where = includeHidden ? {} : { isVisible: true };

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ level: 'asc' }, { order: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении категорий' },
      { status: 500 }
    );
  }
}

// POST /api/catalog/categories - создание новой категории
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Проверка родительской категории, если указана
    let level = 1;
    if (validatedData.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Родительская категория не найдена' },
          { status: 404 }
        );
      }

      level = parentCategory.level + 1;
    }

    // Создание слага из названия
    const slug = slugify(validatedData.name);

    // Проверка уникальности в пределах одного родителя
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: validatedData.name,
        parentId: validatedData.parentId,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          error:
            'Категория с таким названием уже существует в указанной родительской категории',
        },
        { status: 400 }
      );
    }

    // Генерируем уникальный слаг, если нужно
    let uniqueSlug = slug;
    let slugCounter = 1;

    while (true) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existingSlug) break;

      // Если слаг занят, добавляем числовой суффикс
      uniqueSlug = `${slug}-${slugCounter}`;
      slugCounter++;
    }

    // Определение порядка
    const maxOrderCategory = await prisma.category.findFirst({
      where: { parentId: validatedData.parentId },
      orderBy: { order: 'desc' },
    });

    const order = maxOrderCategory ? maxOrderCategory.order + 1 : 0;

    // Создание категории
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: uniqueSlug,
        description: validatedData.description,
        parentId: validatedData.parentId,
        level,
        order,
        isVisible: validatedData.isVisible,
        includeSubcategoryProducts: validatedData.includeSubcategoryProducts,
        imageUrl: validatedData.imageUrl,
      },
    });

    // Запись в аудит
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_CATEGORY',
        details: `Создана категория: ${category.name}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Ошибка при создании категории:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании категории' },
      { status: 500 }
    );
  }
}
