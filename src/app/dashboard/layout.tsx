'use client';

import { useState } from 'react';
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
  ChevronDown,
  Image,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
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

// Определение навигационных элементов
const navigationItems = [
  {
    title: 'Главная',
    href: '/dashboard',
    icon: BarChart3,
    adminOnly: false,
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
    title: 'API Документация',
    href: '/dashboard/api-docs',
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

  // Проверка аутентификации
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Загрузка...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const user = session?.user;
  const isAdmin = user?.role === 'ADMIN';

  // Обработчик выхода из системы
  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Боковая панель для десктопа */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="p-4 h-16 flex items-center border-b">
          <Link href="/dashboard" className="flex items-center">
            <h1 className="text-xl font-bold">ProtekCMS</h1>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
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
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.name || ''} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {isAdmin ? 'Администратор' : 'Менеджер'}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
      </aside>

      {/* Мобильная навигация */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="absolute top-4 left-4">
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
          <nav className="flex-1 p-4 space-y-1">
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
          <Separator />
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.name || ''} />
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-sm">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {isAdmin ? 'Администратор' : 'Менеджер'}
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Настройки</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Выйти</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center justify-end px-4 md:px-6">
          <div className="md:hidden w-6" />{' '}
          {/* Пространство для кнопки меню на мобильных */}
          <h1 className="text-lg font-semibold md:hidden mx-auto">ProtekCMS</h1>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
