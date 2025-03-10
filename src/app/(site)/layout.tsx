import Link from 'next/link';
import { ReactNode } from 'react';

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const navItems = [
    { href: '/', label: 'Главная' },
    { href: '/about', label: 'О компании' },
    { href: '/payment-delivery', label: 'Оплата и доставка' },
    { href: '/wholesale', label: 'Оптовикам' },
    { href: '/contacts', label: 'Контакты' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              ПРОТЕК Автозапчасти
            </Link>
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="md:hidden">
              {/* Мобильное меню можно добавить позже */}
              <button className="p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">О компании</h3>
              <p className="text-gray-600 mb-4">
                Протек автозапчасти — это интернет-магазин автозапчастей,
                предлагающий широкий выбор деталей для автомобилей различных
                марок.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Навигация</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Телефон: +7 (XXX) XXX-XX-XX</li>
                <li>Email: info@protek-auto.ru</li>
                <li>Адрес: г. Москва, ул. Примерная, д. 123</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-500">
            <p>
              © {new Date().getFullYear()} ПРОТЕК Автозапчасти. Все права
              защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
