import { NextResponse } from 'next/server';
import { verifyTOTP } from '@/lib/two-factor';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Отсутствуют необходимые данные' },
        { status: 400 }
      );
    }

    // Получаем пользователя и его секрет 2FA
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем, включен ли 2FA
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Двухфакторная аутентификация не активирована' },
        { status: 400 }
      );
    }

    // Проверяем TOTP код
    const isValid = verifyTOTP(token, user.twoFactorSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Неверный код подтверждения' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Код подтверждения верный',
    });
  } catch {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
