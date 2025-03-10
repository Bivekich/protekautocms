import { NextResponse } from 'next/server';
import { createAuditLog } from '@/lib/audit';
import { getCurrentUser } from '@/lib/session';

export async function POST() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Создаем запись в аудите о входе пользователя
    await createAuditLog({
      userId: currentUser.id,
      action: 'LOGIN',
      details: 'Вход в систему',
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
