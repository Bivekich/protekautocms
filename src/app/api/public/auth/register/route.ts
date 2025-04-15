import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';

// Настраиваем CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Обработчик OPTIONS запросов (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '30d';

export async function POST(req: Request) {
  try {
    const { phone, firstName, lastName, email } = await req.json();

    if (!phone || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Ищем клиента по номеру телефона
    const client = await prisma.client.findUnique({
      where: { phone },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Клиент не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Генерируем JWT токен
    const token = sign(
      {
        id: client.id,
        phone: client.phone,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Обновляем клиента
    const updatedClient = await prisma.client.update({
      where: { id: client.id },
      data: {
        firstName,
        lastName,
        email,
        isVerified: true,
        profileType: 'Розничный', // Устанавливаем розничный профиль по умолчанию
        authToken: token,
      },
    });

    return NextResponse.json(
      {
        success: true,
        token,
        client: {
          id: updatedClient.id,
          phone: updatedClient.phone,
          firstName: updatedClient.firstName,
          lastName: updatedClient.lastName,
          email: updatedClient.email,
          isVerified: updatedClient.isVerified,
          profileType: updatedClient.profileType,
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500, headers: corsHeaders }
    );
  }
}
