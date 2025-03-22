import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';

// Создание первого администратора
export async function POST(request: NextRequest) {
  try {
    // Проверка, есть ли уже пользователи в системе
    const usersCount = await db.user.count();

    if (usersCount > 0) {
      return NextResponse.json(
        {
          error:
            'Система уже настроена. Невозможно создать первого администратора.',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Необходимо указать имя, email и пароль' },
        { status: 400 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await hash(password, 10);

    // Создание администратора
    const admin = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        twoFactorEnabled: false,
      },
    });

    return NextResponse.json(
      {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании администратора' },
      { status: 500 }
    );
  }
}
