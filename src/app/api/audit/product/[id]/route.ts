import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * Получение истории изменений продукта
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Получаем записи аудита, связанные с продуктом (по productId или targetId с targetType='product')
    const auditLogs = await db.auditLog.findMany({
      where: {
        OR: [
          { productId: id },
          {
            targetId: id,
            targetType: 'product',
          },
        ],
        action: {
          in: ['CREATE', 'UPDATE', 'DELETE'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error('Ошибка при получении истории изменений продукта:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении истории изменений продукта' },
      { status: 500 }
    );
  }
}
