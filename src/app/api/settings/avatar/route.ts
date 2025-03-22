import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/audit';
import { getCurrentUser } from '@/lib/session';

// Загрузка аватарки пользователя
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Получаем данные формы
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Проверяем наличие файла
    if (!file) {
      return NextResponse.json(
        { error: 'Файл не предоставлен' },
        { status: 400 }
      );
    }

    // Проверяем тип файла
    const mimeType = file.type;
    const isImage = mimeType.startsWith('image/');

    if (!isImage) {
      return NextResponse.json(
        { error: 'Разрешены только изображения' },
        { status: 400 }
      );
    }

    // Получаем содержимое файла
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Генерируем уникальное имя файла
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const fileName = `avatar-${currentUser.id}-${uuidv4()}.${extension}`;

    // Определяем путь для сохранения файла
    const publicDir = join(process.cwd(), 'public');
    const uploadDir = join(publicDir, 'uploads', 'avatars');
    const filePath = join(uploadDir, fileName);
    const fileUrl = `/uploads/avatars/${fileName}`;

    // Сохраняем файл
    await writeFile(filePath, buffer);

    // Обновляем пользователя в базе данных
    const updatedUser = await db.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        avatarUrl: fileUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    // Запись в аудит
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      details: 'Обновление аватарки пользователя',
    });

    // Возвращаем обновленные данные пользователя
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Ошибка при загрузке аватарки:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке аватарки' },
      { status: 500 }
    );
  }
}
