import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Проверка, есть ли уже пользователи в системе
    const usersCount = await db.user.count();

    return NextResponse.json({ isSetup: usersCount > 0 });
  } catch (error) {
    console.error('Ошибка при проверке настройки системы:', error);
    return NextResponse.json({ isSetup: true }, { status: 500 });
  }
}
