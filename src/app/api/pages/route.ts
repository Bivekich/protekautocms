import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/create-audit-log';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const pages = await db.page.findMany({
      orderBy: {
        title: 'asc',
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('[PAGES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { title, slug, description, isActive } = body;

    if (!title || !slug) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Проверяем, существует ли страница с таким slug
    const existingPage = await db.page.findUnique({
      where: {
        slug,
      },
    });

    if (existingPage) {
      return new NextResponse('Page with this slug already exists', {
        status: 400,
      });
    }

    const page = await db.page.create({
      data: {
        title,
        slug,
        description,
        isActive,
      },
    });

    await createAuditLog({
      action: 'CREATE_PAGE',
      details: `Создана страница &quot;${title}&quot;`,
      userId: session.user.id,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('[PAGES_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
