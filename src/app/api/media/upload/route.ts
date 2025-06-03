import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { uploadFileToS3, generateUniqueMediaFileName } from '@/lib/s3';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Получаем FormData из запроса
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string | null;
    const description = formData.get('description') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 });
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Разрешены только изображения' }, { status: 400 });
    }

    // Читаем файл как ArrayBuffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Генерируем уникальное имя файла
    const fileName = generateUniqueMediaFileName(file.name);

    // Загружаем файл в S3
    const fileUrl = await uploadFileToS3(buffer, fileName, file.type, 'media');

    // Создаем запись о медиа-файле в базе данных
    const media = await db.media.create({
      data: {
        name: file.name,
        url: fileUrl,
        type: 'image',
        size: file.size,
        mimeType: file.type,
        alt: alt || null,
        description: description || null,
        userId: currentUser.id,
      },
    });

    // Запись в аудит
    await logAction({
      userId: currentUser.id,
      action: 'CREATE',
      details: `Загрузка медиа-файла: ${file.name}`,
      targetType: 'media',
    });

    // Получаем пользователя для ответа
    const user = await db.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        twoFactorEnabled: true,
      },
    });

    return NextResponse.json({
      id: media.id,
      name: media.name,
      url: media.url,
      type: media.type,
      size: media.size,
      mimeType: media.mimeType,
      alt: media.alt,
      description: media.description,
      userId: media.userId,
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
      user: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        role: user!.role,
        avatarUrl: user!.avatarUrl,
        requiresTwoFactor: user!.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.error('Ошибка при загрузке медиа-файла:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить файл' },
      { status: 500 }
    );
  }
} 