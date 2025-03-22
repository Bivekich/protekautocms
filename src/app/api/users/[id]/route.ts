import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { getCurrentUser, isAdmin } from '@/lib/session';

// Получение пользователя по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isUserAdmin = await isAdmin();
    const currentUser = await getCurrentUser();
    const { id } = await params;

    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Проверка прав: админ может получить любого пользователя,
    // обычный пользователь - только себя
    if (!isUserAdmin && currentUser.id !== id) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const user = await db.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        avatarUrl: true,
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
    console.error('Ошибка при получении пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении пользователя' },
      { status: 500 }
    );
  }
}

// Обновление пользователя
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const isUserAdmin = await isAdmin();
    const { id } = await params;

    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Проверка прав: админ может обновить любого пользователя,
    // обычный пользователь - только себя
    if (!isUserAdmin && currentUser.id !== id) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    // Проверка существования пользователя
    const existingUser = await db.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверка уникальности email при его изменении
    if (email && email !== existingUser.email) {
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
      role?: 'ADMIN' | 'MANAGER';
    };

    const updateData: UpdateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hash(password, 10);

    // Только админ может менять роль
    if (role && isUserAdmin) updateData.role = role;

    // Обновление пользователя
    const updatedUser = await db.user.update({
      where: {
        id: id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        avatarUrl: true,
      },
    });

    // Запись в аудит
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      details: `Обновление пользователя: ${updatedUser.name}`,
      targetId: updatedUser.id,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении пользователя' },
      { status: 500 }
    );
  }
}

// Удаление пользователя
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const isUserAdmin = await isAdmin();
    const { id } = await params;

    if (!currentUser || !isUserAdmin) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    // Проверка существования пользователя
    const existingUser = await db.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Запрет на удаление самого себя
    if (currentUser.id === id) {
      return NextResponse.json(
        { error: 'Нельзя удалить самого себя' },
        { status: 400 }
      );
    }

    // Удаление пользователя
    await db.user.delete({
      where: {
        id: id,
      },
    });

    // Запись в аудит
    await createAuditLog({
      userId: currentUser.id,
      action: 'DELETE',
      details: `Удаление пользователя: ${existingUser.name}`,
      targetId: id,
    });

    return NextResponse.json(
      { message: 'Пользователь успешно удален' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении пользователя' },
      { status: 500 }
    );
  }
}
