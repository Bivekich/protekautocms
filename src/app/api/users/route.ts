import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { getCurrentUser, isAdmin } from '@/lib/session';

// Получение списка пользователей
export async function GET() {
  try {
    const isUserAdmin = await isAdmin();

    if (!isUserAdmin) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении пользователей' },
      { status: 500 }
    );
  }
}

// Создание нового пользователя
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const isUserAdmin = await isAdmin();

    if (!currentUser || !isUserAdmin) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Проверка существования пользователя
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await hash(password, 10);

    // Создание пользователя
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Запись в аудит
    await createAuditLog({
      userId: currentUser.id,
      action: 'CREATE',
      details: `Создание нового пользователя: ${name}`,
      targetId: user.id,
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании пользователя' },
      { status: 500 }
    );
  }
}
