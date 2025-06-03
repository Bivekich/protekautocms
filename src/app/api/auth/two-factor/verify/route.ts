import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifyTOTP, enableTwoFactor } from '@/lib/two-factor';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { token: totpToken, secret } = await request.json();

    if (!totpToken || !secret) {
      return NextResponse.json(
        { error: 'Отсутствуют необходимые данные' },
        { status: 400 }
      );
    }

    // Получаем пользователя
    const user = await db.user.findUnique({
      where: { email: token.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем TOTP код
    const isValid = verifyTOTP(totpToken, secret);

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
      twoFactorEnabled: true,
    });
  } catch (error) {
    console.error('Ошибка при проверке 2FA:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
