import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Схема валидации для обновления товара
const updateProductSchema = z.object({
  name: z.string().min(1, 'Название товара обязательно').optional(),
  description: z.string().optional().nullable(),
  wholesalePrice: z
    .number()
    .min(0, 'Оптовая цена не может быть отрицательной')
    .optional(),
  retailPrice: z
    .number()
    .min(0, 'Розничная цена не может быть отрицательной')
    .optional(),
  stock: z.number().int().optional(),
  isVisible: z.boolean().optional(),
  categoryId: z.string().nullable().optional(),
  images: z
    .array(
      z.object({
        id: z.string().optional(), // Существующее изображение имеет ID
        url: z.string().url('Некорректный URL изображения'),
        alt: z.string().optional(),
        order: z.number().int().default(0),
      })
    )
    .optional(),
  characteristics: z
    .array(
      z.object({
        id: z.string().optional(), // Существующая характеристика имеет ID
        name: z.string().min(1, 'Название характеристики обязательно'),
        value: z.string().min(1, 'Значение характеристики обязательно'),
      })
    )
    .optional(),
});

// GET /api/catalog/products/[id] - получение товара по ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        characteristics: true,
        images: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error in GET /api/catalog/products/[id]:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PATCH /api/catalog/products/[id] - обновление товара
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
    const validatedData = updateProductSchema.parse(body);

    // Проверка существования товара
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Если указано новое имя, создаем slug
    let slug: string | undefined;
    if (validatedData.name) {
      slug = slugify(validatedData.name);

      // Проверка уникальности slug
      const productWithSameSlug = await prisma.product.findFirst({
        where: { slug },
      });

      if (productWithSameSlug && productWithSameSlug.id !== id) {
        return NextResponse.json(
          { error: 'Товар с таким названием уже существует' },
          { status: 400 }
        );
      }
    }

    // Обновление товара
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name, slug }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.wholesalePrice !== undefined && {
          wholesalePrice: validatedData.wholesalePrice,
        }),
        ...(validatedData.retailPrice !== undefined && {
          retailPrice: validatedData.retailPrice,
        }),
        ...(validatedData.stock !== undefined && {
          stock: validatedData.stock,
        }),
        ...(validatedData.categoryId !== undefined && {
          categoryId: validatedData.categoryId,
        }),
        ...(validatedData.isVisible !== undefined && {
          isVisible: validatedData.isVisible,
        }),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in PATCH /api/catalog/products/[id]:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// DELETE /api/catalog/products/[id] - удаление товара
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

    // Проверка существования товара
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Удаление товара
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Товар успешно удален' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/catalog/products/[id]:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
