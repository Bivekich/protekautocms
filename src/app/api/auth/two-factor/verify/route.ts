import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyTOTP, enableTwoFactor } from '@/lib/two-factor';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { token, secret } = await request.json();

    if (!token || !secret) {
      return NextResponse.json(
        { error: 'Отсутствуют необходимые данные' },
        { status: 400 }
      );
    }

    // Получаем пользователя
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем TOTP код
    const isValid = verifyTOTP(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Неверный код подтверждения' },
        { status: 400 }
      );
    }

    // Активируем 2FA для пользователя
    const success = await enableTwoFactor(user.id, secret);

    if (!success) {
      return NextResponse.json(
        { error: 'Не удалось активировать 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Двухфакторная аутентификация успешно активирована',
    });
  } catch (error) {
    console.error('Ошибка при проверке 2FA:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
