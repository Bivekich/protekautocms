import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { disableTwoFactor } from '@/lib/two-factor';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Получаем пользователя
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверяем, включен ли 2FA
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Двухфакторная аутентификация не активирована' },
        { status: 400 }
      );
    }

    // Отключаем 2FA
    const success = await disableTwoFactor(user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Не удалось отключить 2FA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Двухфакторная аутентификация успешно отключена',
      twoFactorEnabled: false,
    });
  } catch (error) {
    console.error('Ошибка при отключении 2FA:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
