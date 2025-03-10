import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/session';

// Получение списка записей аудита
export async function GET(request: NextRequest) {
  try {
    const isUserAdmin = await isAdmin();

    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    // Получение параметров запроса
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Формирование условий фильтрации
    type WhereClause = {
      userId?: string;
      action?: string;
      OR?: Array<{
        details?: { contains: string; mode: 'insensitive' };
        user?: { name: { contains: string; mode: 'insensitive' } };
      }>;
    };

    const where: WhereClause = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;

    // Добавляем поиск по деталям и имени пользователя
    if (search) {
      where.OR = [
        { details: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Получение записей аудита
    const auditLogs = await db.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Получение общего количества записей
    const totalCount = await db.auditLog.count({ where });

    return NextResponse.json({
      data: auditLogs,
      meta: {
        total: totalCount,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Ошибка при получении записей аудита:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении записей аудита' },
      { status: 500 }
    );
  }
}
