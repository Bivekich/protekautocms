import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    // Обновляем только разрешенные поля
    const updatedSession = {
      ...session,
      user: {
        ...session.user,
        ...(name && { name }),
        ...(email && { email }),
      },
    };

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Ошибка при обновлении сессии:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении сессии' },
      { status: 500 }
    );
  }
}
