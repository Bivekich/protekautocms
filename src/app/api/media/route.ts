import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Функция для обработки GET запроса (получение списка медиа-файлов)
export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем параметры запроса
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Формируем условия запроса
    const where = type ? { type } : {};

    // Получаем общее количество файлов
    const totalCount = await db.media.count({ where });

    // Получаем список файлов
    const media = await db.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Возвращаем результат
    return NextResponse.json({
      media,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Функция для обработки POST запроса (загрузка файла)
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем данные формы
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;
    const description = formData.get('description') as string;

    // Проверяем наличие файла
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Проверяем тип файла
    const mimeType = file.type;
    const isImage = mimeType.startsWith('image/');

    if (!isImage) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Получаем содержимое файла
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Генерируем уникальное имя файла
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const fileName = `${uuidv4()}.${extension}`;

    // Определяем путь для сохранения файла
    const publicDir = join(process.cwd(), 'public');
    const uploadDir = join(publicDir, 'uploads');
    const filePath = join(uploadDir, fileName);
    const fileUrl = `/uploads/${fileName}`;

    // Сохраняем файл
    await writeFile(filePath, buffer);

    // Сохраняем информацию о файле в базе данных
    const media = await db.media.create({
      data: {
        name: originalName,
        url: fileUrl,
        type: 'image',
        size: file.size,
        mimeType,
        alt: alt || null,
        description: description || null,
        userId: session.user.id,
      },
    });

    // Возвращаем результат
    return NextResponse.json(media);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
