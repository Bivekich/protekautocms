import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверка, настроена ли система
  // Не используем Prisma напрямую в middleware, так как это Edge Runtime
  if (pathname !== '/setup' && pathname !== '/api/setup/check') {
    try {
      // Вместо прямого обращения к базе данных, делаем запрос к API
      const response = await fetch(new URL('/api/setup/check', request.url));
      const { isSetup } = await response.json();

      if (!isSetup) {
        return NextResponse.redirect(new URL('/setup', request.url));
      }
    } catch (error) {
      console.error('Ошибка при проверке настройки системы:', error);
      // В случае ошибки, позволяем пользователю продолжить
    }
  }

  // Защита маршрутов панели администратора
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Проверка прав для доступа к страницам только для администраторов
    if (
      (pathname.startsWith('/dashboard/managers') ||
        pathname.startsWith('/dashboard/audit')) &&
      token.role !== 'ADMIN'
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
