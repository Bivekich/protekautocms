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
const JWT_EXPIRES_IN = '30d'; // Токен действителен 30 дней

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Телефон и код обязательны' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Ищем клиента по номеру телефона
    const client = await prisma.client.findUnique({
      where: { phone },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Проверяем код
    if (
      !client.smsCode ||
      client.smsCode !== code ||
      !client.smsCodeExpires ||
      new Date() > client.smsCodeExpires
    ) {
      return NextResponse.json(
        { error: 'Неверный или просроченный код' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Определяем, требуется ли регистрация
    const needsRegistration =
      !client.isVerified || !client.firstName || !client.lastName;

    // Генерируем JWT токен
    const token = sign(
      {
        id: client.id,
        phone: client.phone,
        isVerified: client.isVerified,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Обновляем клиента
    await prisma.client.update({
      where: { id: client.id },
      data: {
        lastLoginDate: new Date(),
        authToken: token,
        smsCode: null, // Сбрасываем код после использования
        smsCodeExpires: null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        token,
        client: {
          id: client.id,
          phone: client.phone,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          isVerified: client.isVerified,
          profileType: client.profileType,
        },
        needsRegistration,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return NextResponse.json(
      { error: 'Ошибка авторизации' },
      { status: 500, headers: corsHeaders }
    );
  }
}
