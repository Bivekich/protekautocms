import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/create-audit-log';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { type, order, content, isActive } = body;

    // Получаем параметры маршрута асинхронно
    const { pageId } = await params;

    if (!type || order === undefined || !content) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Проверяем, существует ли страница
    const page = await db.page.findUnique({
      where: {
        id: pageId,
      },
    });

    if (!page) {
      return new NextResponse('Page not found', { status: 404 });
    }

    // Проверяем, существует ли уже секция такого типа
    const existingSection = await db.pageSection.findFirst({
      where: {
        pageId: pageId,
        type,
      },
    });

    if (existingSection) {
      return new NextResponse(`Section of type "${type}" already exists`, {
        status: 400,
      });
    }

    const section = await db.pageSection.create({
      data: {
        pageId: pageId,
        type,
        order,
        content,
        isActive,
      },
    });

    // Используем русское название типа секции
    const sectionTypeName =
      type === 'contacts' ? 'контакты' : type === 'map' ? 'карта' : type;

    await createAuditLog({
      action: 'CREATE_PAGE_SECTION',
      details: `Создана секция ${sectionTypeName} для страницы &quot;${page.title}&quot;`,
      userId: session.user.id,
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('[PAGE_SECTION_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
