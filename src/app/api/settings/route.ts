import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { getCurrentUser } from '@/lib/session';

// Получение настроек пользователя
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Ошибка при получении настроек пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении настроек пользователя' },
      { status: 500 }
    );
  }
}

// Обновление настроек пользователя
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    // Проверка существования пользователя
    const user = await db.user.findUnique({
      where: {
        id: currentUser.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверка уникальности email при его изменении
    if (email && email !== user.email) {
      const emailExists = await db.user.findUnique({
        where: {
          email,
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Пользователь с таким email уже существует' },
          { status: 400 }
        );
      }
    }

    // Подготовка данных для обновления
    type UpdateData = {
      name?: string;
      email?: string;
      password?: string;
    };

    const updateData: UpdateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Если передан новый пароль, проверяем текущий пароль
    if (newPassword && currentPassword) {
      const { compare } = await import('bcrypt');
      const isPasswordValid = await compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Текущий пароль неверен' },
          { status: 400 }
        );
      }

      updateData.password = await hash(newPassword, 10);
    }

    // Обновление пользователя
    const updatedUser = await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Запись в аудит
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      details: 'Обновление настроек профиля',
      targetId: currentUser.id,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Ошибка при обновлении настроек пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении настроек пользователя' },
      { status: 500 }
    );
  }
}
