import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { logAction } from '@/lib/audit';

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Обработчик OPTIONS запросов (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/discounts/[id]
 * Получение информации о конкретной скидке
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Получаем текущего пользователя
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const discount = await prisma.discount.findUnique({
      where: { id },
      include: {
        profiles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!discount) {
      return NextResponse.json(
        { error: 'Скидка не найдена' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ discount }, { headers: corsHeaders });
  } catch (error) {
    console.error('Ошибка при получении скидки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/discounts/[id]
 * Обновление информации о скидке
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Получаем текущего пользователя
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование скидки
    const existingDiscount = await prisma.discount.findUnique({
      where: { id },
      include: {
        profiles: true,
      },
    });

    if (!existingDiscount) {
      return NextResponse.json(
        { error: 'Скидка не найдена' },
        { status: 404, headers: corsHeaders }
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
    } = await request.json();

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

    // Обновляем связи с профилями
    // Сначала удаляем все существующие связи
    await prisma.discount.update({
      where: { id },
      data: {
        profiles: {
          disconnect: existingDiscount.profiles.map(
            (profile: { id: string }) => ({
              id: profile.id,
            })
          ),
        },
      },
    });

    // Обновляем скидку с новыми данными
    const updatedDiscount = await prisma.discount.update({
      where: { id },
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
      include: {
        profiles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Запись в аудит
    await logAction({
      userId: currentUser.id,
      action: 'UPDATE',
      details: `Обновление ${
        type === 'Промокод' ? 'промокода' : 'скидки'
      }: ${name}`,
      targetId: id,
      targetType: 'discount',
    });

    return NextResponse.json(
      { success: true, discount: updatedDiscount },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при обновлении скидки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/discounts/[id]
 * Удаление скидки
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Получаем текущего пользователя
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование скидки
    const discount = await prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      return NextResponse.json(
        { error: 'Скидка не найдена' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Удаляем скидку
    await prisma.discount.delete({
      where: { id },
    });

    // Запись в аудит
    await logAction({
      userId: currentUser.id,
      action: 'DELETE',
      details: `Удаление ${
        discount.type === 'Промокод' ? 'промокода' : 'скидки'
      }: ${discount.name}`,
      targetId: id,
      targetType: 'discount',
    });

    return NextResponse.json(
      { success: true, message: 'Скидка успешно удалена' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при удалении скидки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}
