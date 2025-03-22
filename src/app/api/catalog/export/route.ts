import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { generateCSV, generateExcel } from '@/lib/export-utils';

// Схема валидации для параметров экспорта
const exportOptionsSchema = z.object({
  format: z.enum(['csv', 'excel']),
  includeImages: z.boolean().default(true),
  includeCategories: z.boolean().default(true),
  includeOptions: z.boolean().default(true),
  includeCharacteristics: z.boolean().default(true),
  categoryId: z.string().optional(),
});

// POST /api/catalog/export - экспорт товаров
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = exportOptionsSchema.parse(body);

    // Формирование условий фильтрации
    const where: Prisma.ProductWhereInput = {};

    if (validatedData.categoryId) {
      where.categoryId = validatedData.categoryId;
    }

    // Получение товаров для экспорта
    const products = await prisma.product.findMany({
      where,
      include: {
        category: validatedData.includeCategories,
        images: validatedData.includeImages,
        characteristics: validatedData.includeCharacteristics,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Запись в аудит
    await prisma.auditLog.create({
      data: {
        action: 'EXPORT_PRODUCTS',
        details: `Экспортировано товаров: ${products.length}, формат: ${validatedData.format}`,
        userId: session.user.id,
      },
    });

    // Генерация файла экспорта в зависимости от выбранного формата
    let fileContent: string | Buffer;
    let fileName: string;
    let contentType: string;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    if (validatedData.format === 'csv') {
      fileContent = generateCSV(products, {
        includeCategories: validatedData.includeCategories,
        includeImages: validatedData.includeImages,
        includeCharacteristics: validatedData.includeCharacteristics,
      });
      fileName = `products-export-${timestamp}.csv`;
      contentType = 'text/csv';
    } else {
      fileContent = generateExcel(products, {
        includeCategories: validatedData.includeCategories,
        includeImages: validatedData.includeImages,
        includeCharacteristics: validatedData.includeCharacteristics,
      });
      fileName = `products-export-${timestamp}.xlsx`;
      contentType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    // Возвращаем файл для скачивания
    const response = new NextResponse(fileContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          fileName
        )}"`,
      },
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ошибка валидации', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Ошибка при экспорте товаров:', error);
    return NextResponse.json(
      { error: 'Ошибка при экспорте товаров' },
      { status: 500 }
    );
  }
}
