import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

/**
 * Получение истории изменений продукта
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const productId = await params.id;

    // Получаем записи аудита, связанные с продуктом (по productId или targetId с targetType='product')
    const auditLogs = await db.auditLog.findMany({
      where: {
        OR: [
          { productId: productId },
          {
            targetId: productId,
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
