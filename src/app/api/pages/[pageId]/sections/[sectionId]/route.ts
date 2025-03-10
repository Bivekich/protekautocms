import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/create-audit-log';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pageId: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { content, isActive, typeName } = body;

    // Получаем параметры маршрута асинхронно
    const { pageId, sectionId } = await params;

    if (!content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Проверяем, существует ли секция
    const section = await db.pageSection.findUnique({
      where: {
        id: sectionId,
        pageId: pageId,
      },
      include: {
        page: true,
      },
    });

    if (!section) {
      return new NextResponse('Section not found', { status: 404 });
    }

    const updatedSection = await db.pageSection.update({
      where: {
        id: sectionId,
      },
      data: {
        content,
        isActive: isActive !== undefined ? isActive : section.isActive,
      },
    });

    // Используем русское название типа секции, если оно предоставлено
    const sectionTypeName = typeName || section.type;

    await createAuditLog({
      action: 'UPDATE_PAGE_SECTION',
      details: `Обновлена секция ${sectionTypeName} для страницы &quot;${section.page.title}&quot;`,
      userId: session.user.id,
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('[PAGE_SECTION_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pageId: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Получаем параметры маршрута асинхронно
    const { pageId, sectionId } = await params;

    // Проверяем, существует ли секция
    const section = await db.pageSection.findUnique({
      where: {
        id: sectionId,
        pageId: pageId,
      },
      include: {
        page: true,
      },
    });

    if (!section) {
      return new NextResponse('Section not found', { status: 404 });
    }

    await db.pageSection.delete({
      where: {
        id: sectionId,
      },
    });

    // Используем русское название типа секции
    const sectionTypeName =
      section.type === 'contacts'
        ? 'контакты'
        : section.type === 'map'
        ? 'карта'
        : section.type;

    await createAuditLog({
      action: 'DELETE_PAGE_SECTION',
      details: `Удалена секция ${sectionTypeName} со страницы &quot;${section.page.title}&quot;`,
      userId: session.user.id,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PAGE_SECTION_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
