import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAuditLog } from '@/lib/create-audit-log';

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
  options: z
    .array(
      z.object({
        id: z.string().optional(), // Существующая опция имеет ID
        name: z.string().min(1, 'Название опции обязательно'),
        type: z.enum(['single', 'multiple'], {
          errorMap: () => ({
            message: 'Тип опции должен быть single или multiple',
          }),
        }),
        values: z
          .array(
            z.object({
              id: z.string().optional(), // Существующее значение имеет ID
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
        options: {
          include: {
            values: true,
          },
        },
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

    // Обработка опций, если они предоставлены
    if (validatedData.options) {
      // Получаем существующие опции товара
      const existingOptions = await prisma.productOption.findMany({
        where: { productId: id },
        include: { values: true },
      });

      // Создаем Set с ID существующих опций для быстрого поиска
      const existingOptionIds = new Set(
        existingOptions.map((opt: { id: string }) => opt.id)
      );

      // Проходимся по каждой опции из запроса
      for (const option of validatedData.options) {
        if (option.id && existingOptionIds.has(option.id)) {
          // Обновляем существующую опцию
          await prisma.productOption.update({
            where: { id: option.id },
            data: {
              name: option.name,
              type: option.type,
            },
          });

          // Обрабатываем значения опции
          const existingValues =
            existingOptions.find((opt: { id: string }) => opt.id === option.id)
              ?.values || [];
          const existingValueIds = new Set(
            existingValues.map((val: { id: string }) => val.id)
          );

          // Обрабатываем каждое значение опции
          for (const value of option.values) {
            if (value.id && existingValueIds.has(value.id)) {
              // Обновляем существующее значение
              await prisma.productOptionValue.update({
                where: { id: value.id },
                data: {
                  value: value.value,
                  price: value.price,
                },
              });
            } else {
              // Создаем новое значение
              await prisma.productOptionValue.create({
                data: {
                  value: value.value,
                  price: value.price,
                  optionId: option.id,
                },
              });
            }
          }

          // Удаляем значения, которых нет в запросе
          const valueIdsToKeep = new Set(
            option.values.filter((v) => v.id).map((v) => v.id as string)
          );
          for (const existingValue of existingValues) {
            if (!valueIdsToKeep.has(existingValue.id)) {
              await prisma.productOptionValue.delete({
                where: { id: existingValue.id },
              });
            }
          }
        } else {
          // Создаем новую опцию
          const newOption = await prisma.productOption.create({
            data: {
              name: option.name,
              type: option.type,
              productId: id,
            },
          });

          // Создаем значения для новой опции
          for (const value of option.values) {
            await prisma.productOptionValue.create({
              data: {
                value: value.value,
                price: value.price,
                optionId: newOption.id,
              },
            });
          }
        }
      }

      // Удаляем опции, которых нет в запросе
      const optionIdsToKeep = new Set(
        validatedData.options.filter((o) => o.id).map((o) => o.id as string)
      );
      for (const existingOption of existingOptions) {
        if (!optionIdsToKeep.has(existingOption.id)) {
          await prisma.productOption.delete({
            where: { id: existingOption.id },
          });
        }
      }
    }

    // После успешного обновления, создаем запись в аудите
    await createAuditLog({
      action: 'UPDATE',
      details: `Обновление товара: ${existingProduct.name}`,
      userId: session.user.id,
      targetId: id,
      targetType: 'product',
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

    // Создаем запись в аудите о удалении
    await createAuditLog({
      action: 'DELETE',
      details: `Удаление товара: ${product.name}`,
      userId: session.user.id,
      targetId: id,
      targetType: 'product',
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
