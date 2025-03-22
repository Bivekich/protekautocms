import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type ParamsType = Promise<{ id: string }>;

// POST /api/catalog/categories/[id]/toggle-include-subcategories - переключение флага включения товаров из подкатегорий
export async function POST(
  request: NextRequest,
  { params }: { params: ParamsType }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { id: categoryId } = await params;

    // Получаем текущее значение флага
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { includeSubcategoryProducts: true },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }

    // Инвертируем значение флага
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        includeSubcategoryProducts: !category.includeSubcategoryProducts,
      },
      select: {
        id: true,
        name: true,
        includeSubcategoryProducts: true,
      },
    });

    // Записываем в аудит
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_CATEGORY_SETTINGS',
        details: `${
          updatedCategory.includeSubcategoryProducts ? 'Включен' : 'Выключен'
        } показ товаров из подкатегорий для категории ${updatedCategory.name}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Ошибка при переключении флага категории:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении настроек категории' },
      { status: 500 }
    );
  }
}
