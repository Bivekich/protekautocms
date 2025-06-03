import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { logClientAction } from '@/lib/audit';

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
 * GET /api/clients/[id]
 * Получение информации о конкретном клиенте
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Клиент не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Форматируем данные для отображения
    const formattedClient = {
      id: client.id,
      profileType: client.profileType,
      profileId: client.profileId,
      profile: client.profile,
      name:
        client.firstName && client.lastName
          ? `${client.lastName} ${client.firstName}`
          : 'Не указано',
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      phone: client.phone,
      registrationDate: client.registrationDate.toLocaleDateString('ru-RU'),
      isVerified: client.isVerified,
    };

    return NextResponse.json(
      { client: formattedClient },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при получении клиента:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * PUT /api/clients/[id]
 * Обновление клиента
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
    const { phone, email, firstName, lastName, profileType, profileId } =
      await request.json();

    // Проверяем существование клиента
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Клиент не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Проверяем, существует ли клиент с таким телефоном (кроме текущего)
    if (phone !== existingClient.phone) {
      const duplicateClient = await prisma.client.findUnique({
        where: { phone },
      });

      if (duplicateClient) {
        return NextResponse.json(
          { error: 'Клиент с таким номером телефона уже существует' },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Обновляем клиента
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        phone,
        email,
        firstName,
        lastName,
        profileType,
        profileId,
      },
    });

    // Формируем имя клиента для аудита
    const clientName =
      updatedClient.firstName && updatedClient.lastName
        ? `${updatedClient.lastName} ${updatedClient.firstName}`
        : updatedClient.phone;

    // Записываем в аудит
    await logClientAction({
      userId: currentUser.id,
      action: 'update',
      clientId: updatedClient.id,
      clientName,
    });

    return NextResponse.json(
      { success: true, client: updatedClient },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при обновлении клиента:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/clients/[id]
 * Удаление клиента
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

    // Проверяем существование клиента
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Клиент не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Сохраняем данные клиента для аудита
    const clientName =
      client.firstName && client.lastName
        ? `${client.lastName} ${client.firstName}`
        : client.phone;

    // Удаляем клиента
    await prisma.client.delete({
      where: { id },
    });

    // Записываем в аудит
    await logClientAction({
      userId: currentUser.id,
      action: 'delete',
      clientId: id,
      clientName,
    });

    return NextResponse.json(
      { success: true, message: 'Клиент успешно удален' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при удалении клиента:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}
