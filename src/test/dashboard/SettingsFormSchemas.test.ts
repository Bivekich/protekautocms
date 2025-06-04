import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Импортируем схемы валидации из компонента страницы настроек
// Примечание: Мы определяем схемы здесь, так как в реальном приложении они могут быть приватными
// и не экспортироваться напрямую из файла компонента

// Схема валидации формы профиля
const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Имя должно содержать минимум 2 символа' }),
  email: z.string().email({ message: 'Пожалуйста, введите корректный email' }),
});

// Схема валидации формы пароля
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, {
    message: 'Текущий пароль должен содержать минимум 6 символов',
  }),
  newPassword: z.string().min(6, {
    message: 'Новый пароль должен содержать минимум 6 символов',
  }),
  confirmPassword: z.string().min(6, {
    message: 'Подтверждение пароля должно содержать минимум 6 символов',
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Пароли должны совпадать',
  path: ['confirmPassword'],
});

describe('Схемы валидации форм настроек', () => {
  describe('profileFormSchema', () => {
    it('валидирует корректные данные профиля', () => {
      const validData = {
        name: 'Иван Иванов',
        email: 'ivan@example.com',
      };
      
      const result = profileFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });
    
    it('возвращает ошибку при слишком коротком имени', () => {
      const invalidData = {
        name: 'И',
        email: 'ivan@example.com',
      };
      
      const result = profileFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        expect(formattedErrors.name?._errors).toContain('Имя должно содержать минимум 2 символа');
      }
    });
    
    it('возвращает ошибку при некорректном email', () => {
      const invalidData = {
        name: 'Иван Иванов',
        email: 'invalid-email',
      };
      
      const result = profileFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        expect(formattedErrors.email?._errors).toContain('Пожалуйста, введите корректный email');
      }
    });
  });
  
  describe('passwordFormSchema', () => {
    it('валидирует корректные данные пароля', () => {
      const validData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };
      
      const result = passwordFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });
    
    it('возвращает ошибку при слишком коротком текущем пароле', () => {
      const invalidData = {
        currentPassword: '12345',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };
      
      const result = passwordFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        expect(formattedErrors.currentPassword?._errors).toContain('Текущий пароль должен содержать минимум 6 символов');
      }
    });
    
    it('возвращает ошибку при слишком коротком новом пароле', () => {
      const invalidData = {
        currentPassword: 'password123',
        newPassword: '12345',
        confirmPassword: '12345',
      };
      
      const result = passwordFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        expect(formattedErrors.newPassword?._errors).toContain('Новый пароль должен содержать минимум 6 символов');
      }
    });
    
    it('возвращает ошибку при несовпадении паролей', () => {
      const invalidData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword123',
      };
      
      const result = passwordFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const formattedErrors = result.error.format();
        expect(formattedErrors.confirmPassword?._errors).toContain('Пароли должны совпадать');
      }
    });
  });
}); 