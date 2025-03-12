import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Настройка otplib для использования современных методов Buffer
// Это может не сработать, так как библиотека может не поддерживать такую настройку
// Но мы можем попробовать
try {
  authenticator.options = {
    ...authenticator.options,
    window: [1, 0],
  };
} catch (error) {
  console.warn('Не удалось настроить otplib:', error);
}

// Генерация секрета для 2FA
export const generateTwoFactorSecret = (email: string) => {
  const secret = authenticator.generateSecret();
  const serviceName = 'ProtekCMS';
  const otpauth = authenticator.keyuri(email, serviceName, secret);

  return {
    secret,
    otpauth,
  };
};

// Генерация QR-кода для настройки 2FA
export const generateQRCode = async (otpauth: string): Promise<string> => {
  try {
    // Используем опции для QRCode с правильными типами
    return await QRCode.toDataURL(otpauth);
  } catch (error) {
    console.error('Ошибка при генерации QR-кода:', error);
    throw new Error('Не удалось сгенерировать QR-код');
  }
};

// Проверка TOTP кода
export const verifyTOTP = (token: string, secret: string): boolean => {
  try {
    // Удаляем пробелы и приводим к верхнему регистру
    const cleanToken = token.replace(/\s+/g, '').toUpperCase();

    // Проверяем, что токен состоит только из цифр
    if (!/^\d+$/.test(cleanToken)) {
      return false;
    }

    // Проверяем длину токена
    if (cleanToken.length !== 6) {
      return false;
    }

    return authenticator.verify({ token: cleanToken, secret });
  } catch {
    return false;
  }
};

// Включение 2FA для пользователя
export const enableTwoFactor = async (userId: string, secret: string) => {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      } as Prisma.UserUpdateInput,
    });
    return true;
  } catch (error) {
    console.error('Ошибка при включении 2FA:', error);
    return false;
  }
};

// Отключение 2FA для пользователя
export const disableTwoFactor = async (userId: string) => {
  try {
    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      } as Prisma.UserUpdateInput,
    });
    return true;
  } catch (error) {
    console.error('Ошибка при отключении 2FA:', error);
    return false;
  }
};

// Получение статуса 2FA для пользователя
export const getTwoFactorStatus = async (userId: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
      } as Prisma.UserSelect,
    });
    return user?.twoFactorEnabled === true;
  } catch (error) {
    console.error('Ошибка при получении статуса 2FA:', error);
    return false;
  }
};
