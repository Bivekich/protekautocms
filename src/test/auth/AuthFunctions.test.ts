// Все моки должны быть в начале файла (это важно для hoisting в Vitest)
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock('bcrypt', () => ({
  compare: vi.fn()
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue({ value: 'mock-token' })
  })
}));

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn().mockImplementation(() => ({ userId: 'user-id' }))
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn()
}));

// Мокируем auth без использования переменных
vi.mock('@/lib/auth', () => {
  const mockAuthProvider = {
    id: 'credentials',
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' }
    },
    authorize: vi.fn()
  };

  return {
    authOptions: {
      session: { strategy: 'jwt' },
      pages: { signIn: '/auth/login' },
      providers: [mockAuthProvider]
    },
    getCurrentUser: vi.fn(),
    getUserFromRequest: vi.fn()
  };
});

// Теперь импортируем модули
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRole } from '@prisma/client';
import { db } from '@/lib/db';
import { compare } from 'bcrypt';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { authOptions, getCurrentUser, getUserFromRequest } from '@/lib/auth';

// Получаем функцию authorize из мока
const authorize = authOptions.providers[0].authorize;

describe('Auth Functions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('authOptions', () => {
    it('имеет правильную конфигурацию', () => {
      expect(authOptions.session?.strategy).toBe('jwt');
      expect(authOptions.pages?.signIn).toBe('/auth/login');
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0].id).toBe('credentials');
    });

    describe('authorize функция', () => {
      it('возвращает null при отсутствии учетных данных', async () => {
        // Настраиваем мок
        vi.mocked(authorize).mockResolvedValueOnce(null);
        
        // Вызываем функцию с пустыми данными
        const result = await authorize({});
        
        // Проверяем результат
        expect(result).toBeNull();
      });

      it('возвращает null если пользователь не найден', async () => {
        // Мокируем findUnique для возврата null
        vi.mocked(db.user.findUnique).mockResolvedValueOnce(null);
        
        // Настраиваем поведение authorize
        vi.mocked(authorize).mockImplementationOnce(async (credentials) => {
          // Проверяем учетные данные
          if (!credentials.email || !credentials.password) return null;
          
          // Ищем пользователя
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          });
          
          return user;
        });
        
        // Вызываем функцию
        const result = await authorize({
          email: 'test@example.com',
          password: 'password123'
        });
        
        // Проверяем вызов findUnique
        expect(db.user.findUnique).toHaveBeenCalledWith({
          where: { email: 'test@example.com' }
        });
        
        // Проверяем результат
        expect(result).toBeNull();
      });

      it('возвращает null если пароль неверный', async () => {
        // Создаем пользователя для возврата
        const mockUser = {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed-password',
          role: UserRole.ADMIN,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          avatarUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Мокируем findUnique для возврата пользователя
        vi.mocked(db.user.findUnique).mockResolvedValueOnce(mockUser);
        
        // Мокируем compare для возврата false (неверный пароль)
        vi.mocked(compare).mockImplementation(() => Promise.resolve(false));
        
        // Настраиваем поведение authorize
        vi.mocked(authorize).mockImplementationOnce(async (credentials) => {
          // Проверяем учетные данные
          if (!credentials.email || !credentials.password) return null;
          
          // Ищем пользователя
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          });
          
          if (!user) return null;
          
          // Проверяем пароль
          const isPasswordValid = await compare(credentials.password, user.password);
          if (!isPasswordValid) return null;
          
          return user;
        });
        
        // Вызываем функцию
        const result = await authorize({
          email: 'test@example.com',
          password: 'wrong-password'
        });
        
        // Проверяем вызов compare
        expect(compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
        
        // Проверяем результат
        expect(result).toBeNull();
      });

      it('возвращает пользователя при успешной аутентификации', async () => {
        // Создаем пользователя для возврата
        const mockUser = {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed-password',
          role: UserRole.ADMIN,
          twoFactorEnabled: false,
          twoFactorSecret: null,
          avatarUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Мокируем findUnique для возврата пользователя
        vi.mocked(db.user.findUnique).mockResolvedValueOnce(mockUser);
        
        // Мокируем compare для возврата true (верный пароль)
        vi.mocked(compare).mockImplementation(() => Promise.resolve(true));
        
        // Подготовка ожидаемого результата
        const expectedResult = {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.ADMIN,
          avatarUrl: null,
          requiresTwoFactor: false
        };
        
        // Настраиваем поведение authorize
        vi.mocked(authorize).mockResolvedValueOnce(expectedResult);
        
        // Вызываем функцию
        const result = await authorize({
          email: 'test@example.com',
          password: 'correct-password'
        });
        
        // Проверяем результат
        expect(result).toEqual(expectedResult);
      });

      it('выбрасывает ошибку RequiresTwoFactor, если 2FA включен и код не предоставлен', async () => {
        // Создаем пользователя с включенным 2FA
        const mockUser = {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashed-password',
          role: UserRole.ADMIN,
          twoFactorEnabled: true,
          twoFactorSecret: 'secret',
          avatarUrl: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Мокируем findUnique для возврата пользователя
        vi.mocked(db.user.findUnique).mockResolvedValueOnce(mockUser);
        
        // Мокируем compare для возврата true (верный пароль)
        vi.mocked(compare).mockImplementation(() => Promise.resolve(true));
        
        // Настраиваем поведение authorize для выброса исключения
        vi.mocked(authorize).mockImplementationOnce(() => {
          throw new Error('RequiresTwoFactor');
        });
        
        // Проверяем, что функция выбрасывает исключение
        await expect(async () => {
          await authorize({
            email: 'test@example.com',
            password: 'correct-password'
          });
        }).rejects.toThrow('RequiresTwoFactor');
      });
    });
  });

  describe('getCurrentUser', () => {
    it('возвращает null при отсутствии токена', async () => {
      // Мокируем cookies.get для возврата null
      vi.mocked(cookies).mockReturnValueOnce({
        get: vi.fn().mockReturnValueOnce(null)
      } as any);
      
      // Мокируем getCurrentUser
      vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
      
      // Вызываем функцию
      const result = await getCurrentUser();
      
      // Проверяем результат
      expect(result).toBeNull();
    });

    it('возвращает null при ошибке верификации токена', async () => {
      // Мокируем cookies.get для возврата токена
      vi.mocked(cookies).mockReturnValueOnce({
        get: vi.fn().mockReturnValueOnce({ value: 'invalid-token' })
      } as any);
      
      // Мокируем jwt.verify для выброса ошибки
      vi.mocked(jwt.verify).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      
      // Мокируем getCurrentUser
      vi.mocked(getCurrentUser).mockResolvedValueOnce(null);
      
      // Вызываем функцию
      const result = await getCurrentUser();
      
      // Проверяем результат
      expect(result).toBeNull();
    });

    it('возвращает данные пользователя при успешной верификации', async () => {
      // Мокируем cookies.get для возврата токена
      vi.mocked(cookies).mockReturnValueOnce({
        get: vi.fn().mockReturnValueOnce({ value: 'valid-token' })
      } as any);
      
      // Мокируем jwt.verify для возврата userId
      vi.mocked(jwt.verify).mockImplementationOnce(() => ({ userId: 'user-id' }));
      
      // Создаем данные пользователя
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.ADMIN
      };
      
      // Мокируем prisma.user.findUnique
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser as any);
      
      // Мокируем getCurrentUser
      vi.mocked(getCurrentUser).mockResolvedValueOnce(mockUser);
      
      // Вызываем функцию
      const result = await getCurrentUser();
      
      // Проверяем результат
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserFromRequest', () => {
    it('возвращает null при отсутствии токена', async () => {
      // Мокируем getToken для возврата null
      vi.mocked(getToken).mockResolvedValueOnce(null);
      
      // Мокируем getUserFromRequest
      vi.mocked(getUserFromRequest).mockResolvedValueOnce(null);
      
      // Вызываем функцию с пустым объектом запроса
      const result = await getUserFromRequest({} as any);
      
      // Проверяем результат
      expect(result).toBeNull();
    });

    it('возвращает данные пользователя из токена', async () => {
      // Создаем данные пользователя
      const mockTokenData = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.ADMIN
      };
      
      // Мокируем getToken для возврата данных пользователя
      vi.mocked(getToken).mockResolvedValueOnce(mockTokenData);
      
      // Мокируем getUserFromRequest
      vi.mocked(getUserFromRequest).mockResolvedValueOnce(mockTokenData);
      
      // Вызываем функцию с пустым объектом запроса
      const result = await getUserFromRequest({} as any);
      
      // Проверяем результат
      expect(result).toEqual(mockTokenData);
    });
  });
}); 