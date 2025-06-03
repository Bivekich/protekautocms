import { NextRequest, NextResponse } from 'next/server';
import { logAction } from '@/lib/audit';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Создаем запись в аудите о входе пользователя
    await logAction({
      userId: currentUser.id,
      action: 'Вход в систему',
      targetType: 'auth',
      details: 'Успешная авторизация пользователя',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при создании записи аудита:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании записи аудита' },
      { status: 500 }
    );
  }
}
