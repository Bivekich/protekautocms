import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { generateTwoFactorSecret, generateQRCode } from '@/lib/two-factor';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token?.email) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Получаем пользователя
    const user = await db.user.findUnique({
      where: { email: token.email },
      select: { id: true, email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Если 2FA уже включен, возвращаем статус
    if (user.twoFactorEnabled) {
      return NextResponse.json({
        twoFactorEnabled: true,
      });
    }

    // Генерируем секрет и QR-код
    const { secret, otpauth } = generateTwoFactorSecret(user.email);
    const qrCodeUrl = await generateQRCode(otpauth);

    // Временно сохраняем секрет в сессии (в реальном приложении лучше использовать временное хранилище)
    // В этом примере мы просто возвращаем секрет клиенту, но в продакшене это небезопасно

    return NextResponse.json({
      twoFactorEnabled: false,
      secret,
      qrCodeUrl,
    });
  } catch (error) {
    console.error('Ошибка при настройке 2FA:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
