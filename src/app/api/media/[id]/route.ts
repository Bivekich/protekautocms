import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { unlink } from 'fs/promises';
import { join } from 'path';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Функция для обработки DELETE запроса (удаление файла)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем ID файла
    const { id } = await params;

    // Находим файл в базе данных
    const media = await db.media.findUnique({
      where: { id },
    });

    // Проверяем наличие файла
    if (!media) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Удаляем файл из файловой системы
    try {
      const filePath = join(process.cwd(), 'public', media.url);
      await unlink(filePath);
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
      // Продолжаем выполнение, даже если файл не удалось удалить из файловой системы
    }

    // Удаляем запись из базы данных
    await db.media.delete({
      where: { id },
    });

    // Возвращаем результат
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
