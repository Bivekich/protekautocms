import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { logAction } from '@/lib/audit';

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Обработчик OPTIONS запросов (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/discounts
 * Получение списка скидок и промокодов
 */
export async function GET() {
  try {
    // Получаем текущего пользователя
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const discounts = await prisma.discount.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        profiles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ discounts }, { headers: corsHeaders });
  } catch (error) {
    console.error('Ошибка при получении списка скидок:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/discounts
 * Создание новой скидки или промокода
 */
export async function POST(req: NextRequest) {
  try {
    // Получаем текущего пользователя
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const {
      name,
      type,
      code,
      profileIds,
      minOrderAmount,
      discountPercent,
      fixedDiscount,
    } = await req.json();

    // Базовые проверки
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Название и тип скидки обязательны' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Проверка типа скидки
    if (type !== 'Промокод' && type !== 'Скидка') {
      return NextResponse.json(
        { error: 'Недопустимый тип скидки' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Для промокода код обязателен
    if (type === 'Промокод' && !code) {
      return NextResponse.json(
        { error: 'Для промокода необходимо указать код' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Должен быть указан либо процент скидки, либо фиксированная сумма
    if (!discountPercent && !fixedDiscount) {
      return NextResponse.json(
        { error: 'Необходимо указать процент скидки или фиксированную сумму' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Проверка существования профилей
    if (profileIds && profileIds.length > 0) {
      const profilesCount = await prisma.clientProfile.count({
        where: {
          id: {
            in: profileIds,
          },
        },
      });

      if (profilesCount !== profileIds.length) {
        return NextResponse.json(
          { error: 'Один или несколько профилей не существуют' },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Создаем скидку
    const discount = await prisma.discount.create({
      data: {
        name,
        type,
        code: type === 'Промокод' ? code : null,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        fixedDiscount: fixedDiscount ? parseFloat(fixedDiscount) : null,
        profiles: {
          connect: profileIds?.map((id: string) => ({ id })) || [],
        },
      },
    });

    // Запись в аудит
    await logAction({
      userId: currentUser.id,
      action: 'CREATE',
      details: `Создание ${
        type === 'Промокод' ? 'промокода' : 'скидки'
      }: ${name}`,
      targetId: discount.id,
      targetType: 'discount',
    });

    return NextResponse.json(
      { success: true, discount },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при создании скидки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}
