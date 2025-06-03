'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  BarChart3,
  Users,
  Settings,
  ClipboardList,
  Menu,
  X,
  LogOut,
  Image,
  Shield,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import { TwoFactorAlert } from '@/components/two-factor/TwoFactorAlert';

// Определение навигационных элементов
const navigationItems = [
  {
    title: 'Главная',
    href: '/dashboard',
    icon: BarChart3,
    adminOnly: false,
    badge: 'Верстка',
  },
  {
    title: 'Клиенты (UI)',
    href: '/dashboard/clients',
    icon: Users,
    adminOnly: false,
    badge: 'Верстка',
  },
  {
    title: 'Контент',
    href: '/dashboard/content',
    icon: ClipboardList,
    adminOnly: false,
  },
  {
    title: 'Каталог товаров',
    href: '/dashboard/catalog',
    icon: ClipboardList,
    adminOnly: false,
  },
  {
    title: 'Галерея',
    href: '/dashboard/media',
    icon: Image,
    adminOnly: false,
  },
  {
    title: 'Менеджеры',
    href: '/dashboard/managers',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'Аудит',
    href: '/dashboard/audit',
    icon: ClipboardList,
    adminOnly: false,
  },
  {
    title: 'GraphQL Документация',
    href: '/dashboard/graphql-docs',
    icon: Settings,
    adminOnly: false,
  },
  {
    title: 'Настройки',
    href: '/dashboard/settings',
    icon: Settings,
    adminOnly: false,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
    requiresTwoFactor?: boolean;
  } | null>(null);

  // Проверка аутентификации
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }

    if (session?.user) {
      // Обновляем состояние пользователя из сессии
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        avatarUrl: session.user.avatarUrl,
        requiresTwoFactor: session.user.requiresTwoFactor,
      });
    }
  }, [status, router, session]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Загрузка...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const isAdmin = user?.role === 'ADMIN';

  // Обработчик выхода из системы
  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Боковая панель для десктопа */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white dark:bg-gray-800 dark:border-gray-700 fixed h-screen">
        <div className="p-4 h-16 flex items-center border-b">
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-xl font-bold">ProtekCMS</h1>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            // Пропускаем элементы, доступные только админам, если пользователь не админ
            if (item.adminOnly && !isAdmin) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-50'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-xs rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Мобильная навигация */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-20"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <div className="p-4 h-16 flex items-center justify-between border-b">
            <Link href="/dashboard" className="flex items-center">
              <h1 className="text-xl font-bold">ProtekCMS</h1>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
            {navigationItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    pathname === item.href
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50'
                      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-50'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-xs rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="flex flex-1 items-center gap-4">
            {/* Для мобильных устройств показываем только иконку */}
            <div className="md:hidden">
              <Shield className="h-6 w-6" />
            </div>
            {/* Для десктопа не показываем логотип, так как он уже есть в боковой панели */}
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 py-1 h-auto rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {/* Информация о пользователе */}
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
                    </p>
                  </div>
                  <Avatar className="h-8 w-8">
                    {user?.avatarUrl ? (
                      <AvatarImage
                        src={user.avatarUrl}
                        alt={user.name || 'Аватар пользователя'}
                      />
                    ) : (
                      <AvatarFallback>
                        {user?.name
                          ? user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                          : 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Настройки</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {user && !user.requiresTwoFactor && (
            <TwoFactorAlert
              userName={user.name}
              userId={user.id}
              requiresTwoFactor={user.requiresTwoFactor}
            />
          )}
          {children}
        </main>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
