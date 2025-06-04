import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { POST } from '@/app/api/setup/route';
import { GET } from '@/app/api/setup/check/route';
import { db } from '@/lib/db';

// Мокаем Prisma и bcrypt
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
}));

describe('Setup API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/setup', () => {
    it('создает администратора, если нет пользователей в системе', async () => {
      // Подготавливаем данные для теста
      const requestData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
      };

      // Мокаем запрос
      const request = {
        json: vi.fn().mockResolvedValue(requestData),
      } as unknown as NextRequest;

      // Мокаем пустую базу данных
      (db.user.count as any).mockResolvedValue(0);

      // Мокаем создание пользователя
      (db.user.create as any).mockResolvedValue({
        id: '1',
        name: requestData.name,
        email: requestData.email,
        role: 'ADMIN',
        createdAt: new Date(),
      });

      // Вызываем тестируемую функцию
      const response = await POST(request);
      const responseData = await response.json();

      // Проверяем результаты
      expect(response.status).toBe(201);
      expect(responseData).toEqual(expect.objectContaining({
        id: '1',
        name: requestData.name,
        email: requestData.email,
        role: 'ADMIN',
      }));

      // Проверяем, что функции были вызваны с правильными параметрами
      expect(bcrypt.hash).toHaveBeenCalledWith(requestData.password, 10);
      expect(db.user.create).toHaveBeenCalledWith({
        data: {
          name: requestData.name,
          email: requestData.email,
          password: 'hashed_password',
          role: 'ADMIN',
          twoFactorEnabled: false,
        },
      });
    });

    it('возвращает ошибку, если в системе уже есть пользователи', async () => {
      // Подготавливаем данные для теста
      const requestData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
      };

      // Мокаем запрос
      const request = {
        json: vi.fn().mockResolvedValue(requestData),
      } as unknown as NextRequest;

      // Мокаем базу данных с существующими пользователями
      (db.user.count as any).mockResolvedValue(1);

      // Вызываем тестируемую функцию
      const response = await POST(request);
      const responseData = await response.json();

      // Проверяем результаты
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Система уже настроена. Невозможно создать первого администратора.',
      });

      // Проверяем, что создание пользователя не было вызвано
      expect(db.user.create).not.toHaveBeenCalled();
    });

    it('возвращает ошибку при отсутствии обязательных полей', async () => {
      // Подготавливаем неполные данные для теста
      const requestData = {
        name: 'Admin User',
        // отсутствует email и password
      };

      // Мокаем запрос
      const request = {
        json: vi.fn().mockResolvedValue(requestData),
      } as unknown as NextRequest;

      // Мокаем пустую базу данных
      (db.user.count as any).mockResolvedValue(0);

      // Вызываем тестируемую функцию
      const response = await POST(request);
      const responseData = await response.json();

      // Проверяем результаты
      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Необходимо указать имя, email и пароль',
      });

      // Проверяем, что создание пользователя не было вызвано
      expect(db.user.create).not.toHaveBeenCalled();
    });

    it('обрабатывает ошибки при создании пользователя', async () => {
      // Подготавливаем данные для теста
      const requestData = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
      };

      // Мокаем запрос
      const request = {
        json: vi.fn().mockResolvedValue(requestData),
      } as unknown as NextRequest;

      // Мокаем пустую базу данных
      (db.user.count as any).mockResolvedValue(0);

      // Мокаем ошибку при создании пользователя
      (db.user.create as any).mockRejectedValue(new Error('Database error'));

      // Мокаем console.error, чтобы не засорять вывод теста
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Вызываем тестируемую функцию
      const response = await POST(request);
      const responseData = await response.json();

      // Проверяем результаты
      expect(response.status).toBe(500);
      expect(responseData).toEqual({
        error: 'Ошибка при создании администратора',
      });

      // Проверяем, что ошибка была залогирована
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Восстанавливаем console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('GET /api/setup/check', () => {
    it('возвращает isSetup: true, если есть пользователи в системе', async () => {
      // Мокаем базу данных с существующими пользователями
      (db.user.count as any).mockResolvedValue(1);

      // Вызываем тестируемую функцию
      const response = await GET();
      const responseData = await response.json();

      // Проверяем результаты
      expect(responseData).toEqual({ isSetup: true });
    });

    it('возвращает isSetup: false, если нет пользователей в системе', async () => {
      // Мокаем пустую базу данных
      (db.user.count as any).mockResolvedValue(0);

      // Вызываем тестируемую функцию
      const response = await GET();
      const responseData = await response.json();

      // Проверяем результаты
      expect(responseData).toEqual({ isSetup: false });
    });

    it('обрабатывает ошибки при проверке', async () => {
      // Мокаем ошибку при запросе к базе данных
      (db.user.count as any).mockRejectedValue(new Error('Database error'));

      // Мокаем console.error, чтобы не засорять вывод теста
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Вызываем тестируемую функцию
      const response = await GET();
      const responseData = await response.json();

      // Проверяем результаты - при ошибке считаем систему настроенной для безопасности
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ isSetup: true });

      // Проверяем, что ошибка была залогирована
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Восстанавливаем console.error
      consoleErrorSpy.mockRestore();
    });
  });
}); 