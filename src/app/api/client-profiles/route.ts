import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { logClientProfileAction } from '@/lib/audit';

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
 * GET /api/client-profiles
 * Получение списка профилей клиентов
 */
export async function GET() {
  try {
    const profiles = await prisma.clientProfile.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ profiles }, { headers: corsHeaders });
  } catch (error) {
    console.error('Ошибка при получении списка профилей клиентов:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/client-profiles
 * Создание нового профиля клиента
 */
export async function POST(req: NextRequest) {
  try {
    // Получаем текущего пользователя
    const currentUser = await getCurrentUser(req);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { name, code, comment, baseMarkup, priceMarkup, orderDiscount } =
      await req.json();

    if (!name || !baseMarkup) {
      return NextResponse.json(
        { error: 'Название и базовая наценка обязательны' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Проверяем уникальность имени и кода
    const existingProfile = await prisma.clientProfile.findFirst({
      where: {
        OR: [{ name }, { code }],
      },
    });

    if (existingProfile) {
      return NextResponse.json(
        {
          error: 'Профиль с таким названием или кодом уже существует',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Создаем новый профиль
    const profile = await prisma.clientProfile.create({
      data: {
        name,
        code: code || `PROF-${Date.now().toString().slice(-6)}`,
        comment,
        baseMarkup,
        priceMarkup,
        orderDiscount,
      },
    });

    // Записываем в аудит
    await logClientProfileAction({
      userId: currentUser.id,
      action: 'create',
      profileId: profile.id,
      profileName: profile.name,
    });

    return NextResponse.json(
      { success: true, profile },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при создании профиля клиента:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}
