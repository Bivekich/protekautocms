// vi.mock вызовы поднимаются в начало файла перед импортами
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Тестовый Пользователь',
        email: 'test@example.com',
        role: 'admin',
        avatarUrl: 'https://example.com/avatar.jpg',
      },
    },
    status: 'authenticated',
    update: vi.fn(),
  })),
}));

// Импортируем необходимые модули
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabsList, TabsTrigger, Tabs } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Компонент для тестирования вкладок настроек
const SettingsTabs = () => (
  <Tabs defaultValue="profile" className="space-y-4">
    <TabsList>
      <TabsTrigger value="profile">Профиль</TabsTrigger>
      <TabsTrigger value="password">Пароль</TabsTrigger>
      <TabsTrigger value="security">Безопасность</TabsTrigger>
    </TabsList>
  </Tabs>
);

// Компонент для тестирования карточки профиля
const ProfileCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Профиль</CardTitle>
      <CardDescription>Обновите информацию о вашем профиле</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback>ТП</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm" className="mb-1">
              Изменить аватар
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, GIF. Максимум 5MB.
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Компонент для тестирования карточки безопасности
const SecurityCard = ({ requiresTwoFactor = false }) => (
  <Card>
    <CardHeader>
      <CardTitle>Безопасность</CardTitle>
      <CardDescription>Настройки безопасности вашей учетной записи</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Двухфакторная аутентификация</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Повысьте безопасность вашей учетной записи, добавив
            дополнительный уровень защиты при входе
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${requiresTwoFactor ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            <span className="text-sm font-medium">
              {requiresTwoFactor ? 'Включено' : 'Отключено'}
            </span>
          </div>
          
          <Button variant="outline">
            {requiresTwoFactor 
              ? 'Управление настройками 2FA' 
              : 'Настроить двухфакторную аутентификацию'}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

describe('Компоненты UI страницы настроек', () => {
  describe('SettingsTabs', () => {
    it('рендерит вкладки настроек', () => {
      render(<SettingsTabs />);
      
      expect(screen.getByRole('tab', { name: 'Профиль' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Пароль' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Безопасность' })).toBeInTheDocument();
    });
    
    it('позволяет переключаться между вкладками', async () => {
      const user = userEvent.setup();
      render(<SettingsTabs />);
      
      // По умолчанию должна быть активна вкладка профиля
      expect(screen.getByRole('tab', { name: 'Профиль', selected: true })).toBeInTheDocument();
      
      // Переключаемся на вкладку пароля
      await user.click(screen.getByRole('tab', { name: 'Пароль' }));
      expect(screen.getByRole('tab', { name: 'Пароль', selected: true })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Профиль', selected: false })).toBeInTheDocument();
      
      // Переключаемся на вкладку безопасности
      await user.click(screen.getByRole('tab', { name: 'Безопасность' }));
      expect(screen.getByRole('tab', { name: 'Безопасность', selected: true })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Пароль', selected: false })).toBeInTheDocument();
    });
  });
  
  describe('ProfileCard', () => {
    it('рендерит карточку профиля с аватаром и кнопкой изменения', () => {
      render(<ProfileCard />);
      
      expect(screen.getByText('Профиль')).toBeInTheDocument();
      expect(screen.getByText('Обновите информацию о вашем профиле')).toBeInTheDocument();
      expect(screen.getByText('ТП')).toBeInTheDocument(); // Проверяем fallback вместо картинки
      expect(screen.getByRole('button', { name: 'Изменить аватар' })).toBeInTheDocument();
      expect(screen.getByText('JPG, PNG, GIF. Максимум 5MB.')).toBeInTheDocument();
    });
  });
  
  describe('SecurityCard', () => {
    it('рендерит карточку безопасности с отключенной 2FA', () => {
      render(<SecurityCard requiresTwoFactor={false} />);
      
      expect(screen.getByText('Безопасность')).toBeInTheDocument();
      expect(screen.getByText('Настройки безопасности вашей учетной записи')).toBeInTheDocument();
      expect(screen.getByText('Двухфакторная аутентификация')).toBeInTheDocument();
      expect(screen.getByText('Отключено')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Настроить двухфакторную аутентификацию' })).toBeInTheDocument();
    });
    
    it('рендерит карточку безопасности с включенной 2FA', () => {
      render(<SecurityCard requiresTwoFactor={true} />);
      
      expect(screen.getByText('Включено')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Управление настройками 2FA' })).toBeInTheDocument();
    });
  });
}); 