import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/create-audit-log';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Получаем параметры маршрута асинхронно
    const { pageId } = await params;

    const page = await db.page.findUnique({
      where: {
        id: pageId,
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!page) {
      return new NextResponse('Page not found', { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('[PAGE_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { title, slug, description, isActive } = body;

    // Получаем параметры маршрута асинхронно
    const { pageId } = await params;

    if (!title || !slug) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Проверяем, существует ли другая страница с таким slug
    const existingPage = await db.page.findFirst({
      where: {
        slug,
        id: {
          not: pageId,
        },
      },
    });

    if (existingPage) {
      return new NextResponse('Page with this slug already exists', {
        status: 400,
      });
    }

    const page = await db.page.update({
      where: {
        id: pageId,
      },
      data: {
        title,
        slug,
        description,
        isActive,
      },
    });

    await createAuditLog({
      action: 'UPDATE_PAGE',
      details: `Обновлена страница &quot;${title}&quot;`,
      userId: session.user.id,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('[PAGE_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Получаем параметры маршрута асинхронно
    const { pageId } = await params;

    const page = await db.page.findUnique({
      where: {
        id: pageId,
      },
    });

    if (!page) {
      return new NextResponse('Page not found', { status: 404 });
    }

    // Удаляем страницу и все связанные секции (каскадное удаление)
    await db.page.delete({
      where: {
        id: pageId,
      },
    });

    await createAuditLog({
      action: 'DELETE_PAGE',
      details: `Удалена страница &quot;${page.title}&quot;`,
      userId: session.user.id,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PAGE_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
