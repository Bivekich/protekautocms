import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Получаем параметры маршрута асинхронно
    const { slug } = await params;

    const page = await db.page.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        sections: {
          where: {
            isActive: true,
          },
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
    console.error('[PUBLIC_PAGE_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
