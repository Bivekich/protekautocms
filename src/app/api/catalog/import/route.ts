import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Схема валидации для импорта товаров
const importProductSchema = z.object({
  products: z.array(
    z.object({
      name: z.string().min(1, 'Название товара обязательно'),
      sku: z.string().min(1, 'Артикул обязателен'),
      description: z.string().optional(),
      wholesalePrice: z
        .number()
        .min(0, 'Оптовая цена не может быть отрицательной'),
      retailPrice: z
        .number()
        .min(0, 'Розничная цена не может быть отрицательной'),
      stock: z.number().int().default(0),
      categoryName: z.string().optional(),
      isVisible: z.boolean().default(true),
      characteristics: z.record(z.string()).optional(),
    })
  ),
});

// POST /api/catalog/import - импорт товаров
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // В реальном приложении здесь будет логика обработки загруженного файла
    // и преобразования его в массив объектов товаров

    const body = await request.json();
    const validatedData = importProductSchema.parse(body);

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as { sku: string; error: string }[],
    };

    // Получаем все категории для поиска по имени
    const categories = await prisma.category.findMany();
    const categoryMap = new Map(
      categories.map((cat: { name: string; id: string }) => [
        cat.name.toLowerCase(),
        cat.id,
      ])
    );

    // Обрабатываем каждый товар
    for (const productData of validatedData.products) {
      try {
        // Проверка существования товара по артикулу
        const existingProduct = await prisma.product.findUnique({
          where: { sku: productData.sku },
        });

        if (existingProduct) {
          results.skipped++;
          results.errors.push({
            sku: productData.sku,
            error: 'Товар с таким артикулом уже существует',
          });
          continue;
        }

        // Создание слага из названия
        let slug = slugify(productData.name);

        // Проверка уникальности слага
        const existingProductBySlug = await prisma.product.findUnique({
          where: { slug },
        });

        if (existingProductBySlug) {
          // Если слаг уже существует, добавляем к нему случайное число
          slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
        }

        // Поиск категории по имени, если указана
        let categoryId = null;
        if (productData.categoryName) {
          categoryId =
            categoryMap.get(productData.categoryName.toLowerCase()) || null;
        }

        // Создание товара
        await prisma.product.create({
          data: {
            name: productData.name,
            slug,
            sku: productData.sku,
            description: productData.description,
            wholesalePrice: productData.wholesalePrice,
            retailPrice: productData.retailPrice,
            stock: productData.stock,
            isVisible: productData.isVisible,
            categoryId,
            // Создание характеристик, если они есть
            characteristics: productData.characteristics
              ? {
                  create: Object.entries(productData.characteristics).map(
                    ([name, value]) => ({
                      name,
                      value: String(value),
                    })
                  ),
                }
              : undefined,
          },
        });

        results.success++;
      } catch (error) {
        console.error(`Ошибка при импорте товара ${productData.sku}:`, error);
        results.failed++;
        results.errors.push({
          sku: productData.sku,
          error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        });
      }
    }

    // Запись в аудит
    await prisma.auditLog.create({
      data: {
        action: 'IMPORT_PRODUCTS',
        details: `Импорт товаров: успешно - ${results.success}, пропущено - ${results.skipped}, ошибок - ${results.failed}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Импорт успешно выполнен',
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Ошибка при импорте товаров:', error);
    return NextResponse.json(
      { error: 'Ошибка при импорте товаров' },
      { status: 500 }
    );
  }
}
