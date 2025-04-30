import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode, sendSmsCode } from '@/lib/sms-service';

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
    const { phone } = await req.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { error: 'Введите корректный номер телефона' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Генерируем 5-значный код
    const code = generateVerificationCode();

    // Удаляем старые коды для этого номера
    await prisma.verificationCode.deleteMany({
      where: { phone },
    });

    // Сохраняем новый код в базу данных
    await prisma.verificationCode.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 минут
      },
    });

    // В режиме разработки просто логируем код
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] SMS to ${phone}: Your code is ${code}`);
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Отправляем SMS
    const sent = await sendSmsCode(phone, code);
    if (!sent) {
      throw new Error('Ошибка отправки SMS');
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Ошибка отправки SMS:', error);
    return NextResponse.json(
      { error: 'Ошибка отправки кода' },
      { status: 500, headers: corsHeaders }
    );
  }
}
