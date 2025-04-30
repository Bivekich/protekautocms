import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Настраиваем CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3001',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Обработчик OPTIONS запросов (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    // Проверяем токен авторизации
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verify(token, JWT_SECRET) as { id: string };

    // Получаем данные для обновления из тела запроса
    const body = await req.json();
    const { firstName, lastName, phone, email } = body;

    // Обновляем данные клиента в базе
    const updatedClient = await prisma.client.update({
      where: { id: decoded.id },
      data: {
        firstName,
        lastName,
        phone,
        email,
        updatedAt: new Date(),
      },
    });

    // Возвращаем обновленные данные
    return NextResponse.json(
      {
        success: true,
        message: 'Профиль успешно обновлен',
        client: {
          id: updatedClient.id,
          firstName: updatedClient.firstName,
          lastName: updatedClient.lastName,
          phone: updatedClient.phone,
          email: updatedClient.email,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error updating profile:', error);

    // Проверяем тип ошибки
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при обновлении профиля' },
      { status: 500, headers: corsHeaders }
    );
  }
}
