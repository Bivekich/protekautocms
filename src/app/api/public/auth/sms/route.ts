import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode, sendSmsCode } from '@/lib/sms-service';

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

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length < 10) {
      return NextResponse.json(
        { error: 'Введите корректный номер телефона' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Генерируем 4-значный код
    const code = generateVerificationCode(4);

    // Время действия кода - 5 минут
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 5);

    // Ищем клиента по номеру телефона
    const existingClient = await prisma.client.findUnique({
      where: { phone },
    });

    if (existingClient) {
      // Обновляем код для существующего клиента
      await prisma.client.update({
        where: { id: existingClient.id },
        data: {
          smsCode: code,
          smsCodeExpires: expiration,
        },
      });
    } else {
      // Создаем временную запись для нового клиента
      await prisma.client.create({
        data: {
          phone,
          smsCode: code,
          smsCodeExpires: expiration,
          isVerified: false,
        },
      });
    }

    // В режиме разработки просто возвращаем код для тестирования
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV MODE] SMS to ${phone}: Your code is ${code}`);
      return NextResponse.json(
        {
          success: true,
          message: 'Код отправлен (режим разработки)',
          code: code,
        },
        { headers: corsHeaders }
      );
    }

    // Отправляем SMS через внешний сервис
    const smsSent = await sendSmsCode(phone, code);

    if (!smsSent) {
      console.error('Ошибка отправки SMS');
      return NextResponse.json(
        {
          error: 'Ошибка при отправке SMS',
          // Для разработки все равно возвращаем код
          ...(process.env.NODE_ENV !== 'production' && { code }),
        },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Код отправлен',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Ошибка при отправке SMS:', error);
    return NextResponse.json(
      { error: 'Ошибка при отправке SMS' },
      { status: 500, headers: corsHeaders }
    );
  }
}
