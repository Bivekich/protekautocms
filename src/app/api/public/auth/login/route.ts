import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';

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
    const { phone, code } = await req.json();

    // Проверяем код
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        phone,
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'INVALID_CODE' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Находим или создаем клиента
    let client = await prisma.client.findUnique({
      where: { phone },
    });

    let needsRegistration = false;

    if (!client) {
      client = await prisma.client.create({
        data: {
          phone,
          isVerified: true,
        },
      });
      needsRegistration = true;
    }

    // Удаляем использованный код
    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    });

    // Генерируем JWT токен
    const token = sign(
      {
        id: client.id,
        phone: client.phone,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    return NextResponse.json(
      {
        success: true,
        token,
        client: {
          id: client.id,
          phone: client.phone,
          firstName: client.firstName || '',
          lastName: client.lastName || '',
          email: client.email || '',
          isVerified: client.isVerified,
        },
        needsRegistration,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    return NextResponse.json(
      { error: 'Ошибка авторизации' },
      { status: 500, headers: corsHeaders }
    );
  }
}
