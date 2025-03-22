import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyTOTP } from '@/lib/two-factor';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: 'Отсутствуют необходимые данные' },
        { status: 400 }
      );
    }

    // Получаем пользователя с его секретом 2FA
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
        { status: 400 }
      );
    }

    // Проверяем, включена ли 2FA для пользователя
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        {
          error:
            'Двухфакторная аутентификация не активирована для пользователя',
        },
        { status: 400 }
      );
    }

    // Проверяем TOTP код
    const isValid = verifyTOTP(token, user.twoFactorSecret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Неверный код двухфакторной аутентификации' },
        { status: 400 }
      );
    }

    // Если код верный, возвращаем успешный ответ
    return NextResponse.json({
      success: true,
      message: 'Код подтвержден успешно',
      userId: user.id,
    });
  } catch (error) {
    console.error('Ошибка при валидации 2FA:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
