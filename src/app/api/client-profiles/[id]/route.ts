import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { logClientProfileAction } from '@/lib/audit';

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
 * GET /api/client-profiles/[id]
 * Получение информации о конкретном профиле клиента
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const profile = await prisma.clientProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Профиль не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ profile }, { headers: corsHeaders });
  } catch (error) {
    console.error('Ошибка при получении профиля клиента:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/client-profiles/[id]
 * Обновление профиля клиента
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем текущего пользователя
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { id } = await params;
    const { name, code, comment, baseMarkup, priceMarkup, orderDiscount } =
      await request.json();

    if (!name || !baseMarkup) {
      return NextResponse.json(
        { error: 'Название и базовая наценка обязательны' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Проверяем существование профиля
    const existingProfile = await prisma.clientProfile.findUnique({
      where: { id },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Профиль не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Проверка на изменение розничного профиля
    if (existingProfile.name === 'Розничный' && name !== 'Розничный') {
      return NextResponse.json(
        { error: 'Нельзя изменять название базового розничного профиля' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Проверяем уникальность имени и кода
    const duplicateProfile = await prisma.clientProfile.findFirst({
      where: {
        OR: [
          { name, id: { not: id } },
          { code, id: { not: id } },
        ],
      },
    });

    if (duplicateProfile) {
      return NextResponse.json(
        {
          error: 'Профиль с таким названием или кодом уже существует',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Обновляем профиль
    const updatedProfile = await prisma.clientProfile.update({
      where: { id },
      data: {
        name,
        code,
        comment,
        baseMarkup,
        priceMarkup,
        orderDiscount,
      },
    });

    // Записываем в аудит
    await logClientProfileAction({
      userId: currentUser.id,
      action: 'update',
      profileId: updatedProfile.id,
      profileName: updatedProfile.name,
    });

    return NextResponse.json(
      { success: true, profile: updatedProfile },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при обновлении профиля клиента:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/client-profiles/[id]
 * Удаление профиля клиента
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Получаем текущего пользователя
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { id } = await params;

    // Проверяем существование профиля
    const profile = await prisma.clientProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Профиль не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Проверка на удаление розничного профиля
    if (profile.name === 'Розничный') {
      return NextResponse.json(
        { error: 'Нельзя удалить базовый розничный профиль' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Сохраняем данные профиля для аудита
    const profileName = profile.name;

    // Удаляем профиль
    await prisma.clientProfile.delete({
      where: { id },
    });

    // Записываем в аудит
    await logClientProfileAction({
      userId: currentUser.id,
      action: 'delete',
      profileId: id,
      profileName,
    });

    return NextResponse.json(
      { success: true, message: 'Профиль успешно удален' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при удалении профиля клиента:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}
