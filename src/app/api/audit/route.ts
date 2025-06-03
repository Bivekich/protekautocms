import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

// Получение списка записей аудита
export async function GET(request: NextRequest) {
  try {
    const isUserAdmin = await isAdmin(request);

    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    // Получаем текущего пользователя
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Параметры фильтрации
    const targetType = searchParams.get('targetType') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const from = searchParams.get('from')
      ? new Date(searchParams.get('from') as string)
      : undefined;
    const to = searchParams.get('to')
      ? new Date(searchParams.get('to') as string)
      : undefined;

    // Параметры пагинации
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Настраиваем условия поиска для Prisma
    const whereConditions: {
      targetType?: string;
      userId?: string;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    // Фильтр по типу цели
    if (targetType) {
      whereConditions.targetType = targetType;
    }

    // Фильтр по пользователю
    if (userId) {
      whereConditions.userId = userId;
    }

    // Фильтр по дате
    if (from || to) {
      whereConditions.createdAt = {};
      if (from) {
        whereConditions.createdAt.gte = from;
      }
      if (to) {
        whereConditions.createdAt.lte = to;
      }
    }

    // Получаем записи аудита с пагинацией и включаем данные пользователя
    const auditLogs = await prisma.auditLog.findMany({
      where: whereConditions,
      orderBy: {
        createdAt: 'desc',
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
      skip,
      take: limit,
    });

    // Получаем общее количество записей для пагинации
    const total = await prisma.auditLog.count({ where: whereConditions });

    return NextResponse.json(
      {
        data: auditLogs,
        meta: {
          total,
          limit,
          offset: skip,
        },
      },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Ошибка при получении записей аудита:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Обработчик OPTIONS запросов (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}
