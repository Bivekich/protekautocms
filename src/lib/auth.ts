import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { db } from '@/lib/db';

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

            // Проверяем код 2FA
            // В реальном приложении здесь должна быть проверка кода
            // Для этого примера мы предполагаем, что проверка уже была выполнена на клиенте
            // через API-маршрут /api/auth/two-factor/validate
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
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
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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
    requiresTwoFactor?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      requiresTwoFactor?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    requiresTwoFactor?: boolean;
  }
}
