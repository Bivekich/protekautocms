import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Схема валидации для обновления категории
const updateCategorySchema = z.object({
  name: z.string().min(1, 'Название категории обязательно').optional(),
  description: z.string().optional().nullable(),
  parentId: z.string().nullable().optional(),
  isVisible: z.boolean().optional(),
  includeSubcategoryProducts: z.boolean().optional(),
  imageUrl: z.string().optional().nullable(),
});

// GET /api/catalog/categories/[id] - получение категории по ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
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
  } catch (error) {
    console.error('Error in GET /api/catalog/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PATCH /api/catalog/categories/[id] - обновление категории
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Проверка существования категории
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }

    // Если указан parentId, проверяем его валидность
    if (
      validatedData.parentId !== undefined &&
      validatedData.parentId !== null
    ) {
      // Проверка на циклическую зависимость
      if (validatedData.parentId === id) {
        return NextResponse.json(
          { error: 'Категория не может быть родителем самой себя' },
          { status: 400 }
        );
      }

      // Проверка существования родительской категории
      const parentCategory = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Родительская категория не найдена' },
          { status: 404 }
        );
      }

      // Проверка, не является ли новый родитель потомком текущей категории
      const isDescendant = await checkIfDescendant(id, validatedData.parentId);

      if (isDescendant) {
        return NextResponse.json(
          { error: 'Нельзя создать циклическую зависимость категорий' },
          { status: 400 }
        );
      }
    }

    // Если указано новое имя, создаем slug
    let slug: string | undefined;
    if (validatedData.name) {
      slug = slugify(validatedData.name);

      // Проверка уникальности slug
      const categoryWithSameSlug = await prisma.category.findFirst({
        where: { slug },
      });

      if (categoryWithSameSlug && categoryWithSameSlug.id !== id) {
        return NextResponse.json(
          { error: 'Категория с таким названием уже существует' },
          { status: 400 }
        );
      }
    }

    // Обновление категории
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name, slug }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.parentId !== undefined && {
          parentId: validatedData.parentId,
        }),
        ...(validatedData.isVisible !== undefined && {
          isVisible: validatedData.isVisible,
        }),
        ...(validatedData.includeSubcategoryProducts !== undefined && {
          includeSubcategoryProducts: validatedData.includeSubcategoryProducts,
        }),
        ...(validatedData.imageUrl !== undefined && {
          imageUrl: validatedData.imageUrl,
        }),
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in PATCH /api/catalog/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE /api/catalog/categories/[id] - удаление категории
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Проверка существования категории
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: true,
        products: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }

    // Проверка наличия подкатегорий
    if (category.subcategories.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить категорию, содержащую подкатегории' },
        { status: 400 }
      );
    }

    // Проверка наличия товаров
    if (category.products.length > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить категорию, содержащую товары' },
        { status: 400 }
      );
    }

    // Удаление категории
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Категория успешно удалена' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/catalog/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Вспомогательная функция для проверки, является ли одна категория потомком другой
async function checkIfDescendant(
  categoryId: string,
  potentialDescendantId: string
): Promise<boolean> {
  const potentialDescendant = await prisma.category.findUnique({
    where: { id: potentialDescendantId },
    select: { parentId: true },
  });

  if (!potentialDescendant || !potentialDescendant.parentId) {
    return false;
  }

  if (potentialDescendant.parentId === categoryId) {
    return true;
  }

  return checkIfDescendant(categoryId, potentialDescendant.parentId);
}
