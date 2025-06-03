import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, Client } from '@prisma/client';
import { getCurrentUser } from '@/lib/session';
import { logClientAction } from '@/lib/audit';

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Обработчик OPTIONS запросов (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * GET /api/clients
 * Получение списка клиентов с фильтрацией и пагинацией
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Параметры фильтрации
    const search = searchParams.get('search') || '';
    const profileType = searchParams.get('profileType') || undefined;
    const isVerified = searchParams.has('isVerified')
      ? searchParams.get('isVerified') === 'true'
      : undefined;

    // Параметры пагинации
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Настраиваем условия поиска для Prisma
    const whereConditions: Prisma.ClientWhereInput = {};

    // Добавляем поиск, если указан поисковый запрос
    if (search) {
      whereConditions.OR = [
        { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { phone: { contains: search } },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    // Добавляем фильтр по типу профиля
    if (profileType) {
      whereConditions.profileType = profileType;
    }

    // Добавляем фильтр по статусу верификации
    if (isVerified !== undefined) {
      whereConditions.isVerified = isVerified;
    }

    // Получаем клиентов с пагинацией
    const clients = await prisma.client.findMany({
      where: whereConditions,
      orderBy: {
        registrationDate: 'desc',
      },
      skip,
      take: limit,
    });

    // Получаем общее количество клиентов для пагинации
    const total = await prisma.client.count({ where: whereConditions });

    // Форматируем данные для отображения на фронтенде
    const formattedClients = clients.map((client: Client) => ({
      id: client.id,
      profileType: client.profileType,
      name:
        client.firstName && client.lastName
          ? `${client.lastName} ${client.firstName}`
          : 'Не указано',
      email: client.email || 'Не указано',
      markup: '15%', // Это поле нужно добавить в модель Client или получать из другой таблицы
      phone: client.phone,
      registrationDate: client.registrationDate.toLocaleDateString('ru-RU'),
      registrationStatus: client.isVerified ? 'Подтвержден' : 'Не подтвержден',
    }));

    return NextResponse.json(
      {
        clients: formattedClients,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при получении списка клиентов:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * POST /api/clients
 * Создание нового клиента
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

    const { phone, email, firstName, lastName, profileType, profileId } =
      await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Номер телефона обязателен' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Проверяем, существует ли клиент с таким телефоном
    const existingClient = await prisma.client.findUnique({
      where: { phone },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Клиент с таким номером телефона уже существует' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Если не указан profileId, ищем профиль "Розничный"
    let finalProfileId = profileId;
    if (!finalProfileId) {
      const defaultProfile = await prisma.clientProfile.findFirst({
        where: { name: 'Розничный' },
      });

      if (defaultProfile) {
        finalProfileId = defaultProfile.id;
      }
    }

    // Создаем нового клиента
    const client = await prisma.client.create({
      data: {
        phone,
        email,
        firstName,
        lastName,
        profileType: profileType || 'Розничный',
        profileId: finalProfileId,
        isVerified: true, // При создании через админку клиент сразу верифицирован
        registrationDate: new Date(),
      },
    });

    // Формируем имя клиента для аудита
    const clientName =
      client.firstName && client.lastName
        ? `${client.lastName} ${client.firstName}`
        : client.phone;

    // Записываем в аудит
    await logClientAction({
      userId: currentUser.id,
      action: 'create',
      clientId: client.id,
      clientName,
    });

    return NextResponse.json(
      {
        success: true,
        client: {
          id: client.id,
          profileType: client.profileType,
          name:
            client.firstName && client.lastName
              ? `${client.lastName} ${client.firstName}`
              : 'Не указано',
          email: client.email || 'Не указано',
          markup: '15%', // Заглушка, нужно добавить в модель
          phone: client.phone,
          registrationDate: client.registrationDate.toLocaleDateString('ru-RU'),
          registrationStatus: client.isVerified
            ? 'Подтвержден'
            : 'Не подтвержден',
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при создании клиента:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}
