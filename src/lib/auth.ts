import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Пароль', type: 'password' },
        twoFactorCode: { label: 'Код 2FA', type: 'text' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Сначала получаем пользователя без полей 2FA
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Проверяем 2FA, если оно включено
          if (user.twoFactorEnabled) {
            // Если код 2FA не предоставлен, выбрасываем ошибку
            if (!credentials.twoFactorCode) {
              throw new Error('RequiresTwoFactor');
            }

            // Проверяем код 2FA через API
            try {
              const response = await fetch(
                `${process.env.NEXTAUTH_URL}/api/auth/two-factor/validate`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: user.email,
                    token: credentials.twoFactorCode,
                  }),
                }
              );

              const data = await response.json();

              if (!response.ok || !data.success) {
                throw new Error('InvalidTwoFactorCode');
              }
            } catch (error) {
              console.error('Ошибка при проверке кода 2FA:', error);
              throw new Error('InvalidTwoFactorCode');
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl || undefined,
            requiresTwoFactor: user.twoFactorEnabled,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.avatarUrl = token.avatarUrl as string | undefined;
        session.user.requiresTwoFactor = token.requiresTwoFactor as
          | boolean
          | undefined;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatarUrl = user.avatarUrl;
        token.requiresTwoFactor = user.requiresTwoFactor;
      }

      // Обрабатываем обновление сессии
      if (trigger === 'update' && session?.user) {
        // Обновляем поле requiresTwoFactor в токене, если оно изменилось в сессии
        if (session.user.requiresTwoFactor !== undefined) {
          token.requiresTwoFactor = session.user.requiresTwoFactor;
        }
      }

      return token;
    },
  },
};

// Расширяем типы для NextAuth
declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    requiresTwoFactor?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatarUrl?: string;
      requiresTwoFactor?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    avatarUrl?: string;
    requiresTwoFactor?: boolean;
  }
}

// Интерфейс для данных пользователя
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Получает данные текущего пользователя из токена авторизации
 * @returns Данные пользователя или null, если пользователь не авторизован
 */
export async function getCurrentUser(): Promise<UserData | null> {
  try {
    const cookieStore = await cookies();
    const authToken = await cookieStore.get('authToken')?.value;

    if (!authToken) return null;

    // Верифицируем JWT токен
    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(authToken, secret) as { userId: string };

    if (!decoded?.userId) return null;

    // Получаем пользователя из БД
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Ошибка при получении текущего пользователя:', error);
    return null;
  }
}
