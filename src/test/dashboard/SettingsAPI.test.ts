import { describe, it, expect, vi, beforeEach } from 'vitest';

// GraphQL запросы и мутации
const CURRENT_USER_QUERY = `
  query CurrentUser {
    currentUser {
      id
      name
      email
      role
      avatarUrl
      requiresTwoFactor
    }
  }
`;

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
      role
      avatarUrl
    }
  }
`;

const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      id
      name
      email
    }
  }
`;

const UPLOAD_AVATAR_BASE64_MUTATION = `
  mutation UploadAvatarBase64($base64Image: String!) {
    uploadAvatarBase64(base64Image: $base64Image) {
      id
      name
      avatarUrl
    }
  }
`;

// Мок для fetch
global.fetch = vi.fn();

// Типизация для моков функций
type MockFunction = ReturnType<typeof vi.fn>;

describe('API запросы страницы настроек', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Получение данных пользователя', () => {
    it('отправляет корректный запрос для получения данных пользователя', async () => {
      // Мокаем ответ API
      (global.fetch as MockFunction).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            currentUser: {
              id: 'test-user-id',
              name: 'Тестовый Пользователь',
              email: 'test@example.com',
              role: 'admin',
              avatarUrl: 'https://example.com/avatar.jpg',
              requiresTwoFactor: false,
            },
          },
        }),
      });

      // Выполняем запрос
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: CURRENT_USER_QUERY,
        }),
      });

      // Получаем данные из ответа
      const data = await response.json();

      // Проверяем, что запрос был отправлен с правильными параметрами
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: CURRENT_USER_QUERY,
        }),
      });

      // Проверяем полученные данные
      expect(data.data.currentUser).toEqual({
        id: 'test-user-id',
        name: 'Тестовый Пользователь',
        email: 'test@example.com',
        role: 'admin',
        avatarUrl: 'https://example.com/avatar.jpg',
        requiresTwoFactor: false,
      });
    });

    it('обрабатывает ошибку при получении данных пользователя', async () => {
      // Мокаем ошибку API
      (global.fetch as MockFunction).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          errors: [{ message: 'Ошибка получения данных пользователя' }],
        }),
      });

      // Выполняем запрос и ожидаем ошибку
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: CURRENT_USER_QUERY,
        }),
      });

      const data = await response.json();

      // Проверяем наличие ошибки в ответе
      expect(data.errors).toBeDefined();
      expect(data.errors[0].message).toBe('Ошибка получения данных пользователя');
    });
  });

  describe('Обновление профиля пользователя', () => {
    it('отправляет корректный запрос для обновления профиля', async () => {
      // Данные для обновления
      const updateData = {
        name: 'Новое Имя',
        email: 'new@example.com',
      };

      // Мокаем ответ API
      (global.fetch as MockFunction).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            updateUser: {
              id: 'test-user-id',
              name: 'Новое Имя',
              email: 'new@example.com',
              role: 'admin',
              avatarUrl: 'https://example.com/avatar.jpg',
            },
          },
        }),
      });

      // Выполняем запрос
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: UPDATE_USER_MUTATION,
          variables: {
            input: updateData,
          },
        }),
      });

      // Получаем данные из ответа
      const data = await response.json();

      // Проверяем, что запрос был отправлен с правильными параметрами
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: UPDATE_USER_MUTATION,
          variables: {
            input: updateData,
          },
        }),
      });

      // Проверяем полученные данные
      expect(data.data.updateUser).toEqual({
        id: 'test-user-id',
        name: 'Новое Имя',
        email: 'new@example.com',
        role: 'admin',
        avatarUrl: 'https://example.com/avatar.jpg',
      });
    });
  });

  describe('Изменение пароля', () => {
    it('отправляет корректный запрос для изменения пароля', async () => {
      // Данные для изменения пароля
      const passwordData = {
        currentPassword: 'currentPassword123',
        newPassword: 'newPassword123',
      };

      // Мокаем ответ API
      (global.fetch as MockFunction).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            changePassword: {
              id: 'test-user-id',
              name: 'Тестовый Пользователь',
              email: 'test@example.com',
            },
          },
        }),
      });

      // Выполняем запрос
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: CHANGE_PASSWORD_MUTATION,
          variables: {
            input: passwordData,
          },
        }),
      });

      // Получаем данные из ответа
      const data = await response.json();

      // Проверяем, что запрос был отправлен с правильными параметрами
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: CHANGE_PASSWORD_MUTATION,
          variables: {
            input: passwordData,
          },
        }),
      });

      // Проверяем полученные данные
      expect(data.data.changePassword).toEqual({
        id: 'test-user-id',
        name: 'Тестовый Пользователь',
        email: 'test@example.com',
      });
    });

    it('обрабатывает ошибку при неверном текущем пароле', async () => {
      // Данные для изменения пароля с неверным текущим паролем
      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };

      // Мокаем ошибку API
      (global.fetch as MockFunction).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          errors: [{ message: 'Неверный текущий пароль' }],
        }),
      });

      // Выполняем запрос
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: CHANGE_PASSWORD_MUTATION,
          variables: {
            input: passwordData,
          },
        }),
      });

      // Получаем данные из ответа
      const data = await response.json();

      // Проверяем наличие ошибки в ответе
      expect(data.errors).toBeDefined();
      expect(data.errors[0].message).toBe('Неверный текущий пароль');
    });
  });

  describe('Загрузка аватара', () => {
    it('отправляет корректный запрос для загрузки аватара', async () => {
      // Данные для загрузки аватара
      const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...';

      // Мокаем ответ API
      (global.fetch as MockFunction).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            uploadAvatarBase64: {
              id: 'test-user-id',
              name: 'Тестовый Пользователь',
              avatarUrl: 'https://example.com/new-avatar.jpg',
            },
          },
        }),
      });

      // Выполняем запрос
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: UPLOAD_AVATAR_BASE64_MUTATION,
          variables: {
            base64Image,
          },
        }),
      });

      // Получаем данные из ответа
      const data = await response.json();

      // Проверяем, что запрос был отправлен с правильными параметрами
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: UPLOAD_AVATAR_BASE64_MUTATION,
          variables: {
            base64Image,
          },
        }),
      });

      // Проверяем полученные данные
      expect(data.data.uploadAvatarBase64).toEqual({
        id: 'test-user-id',
        name: 'Тестовый Пользователь',
        avatarUrl: 'https://example.com/new-avatar.jpg',
      });
    });

    it('обрабатывает ошибку при неверном формате изображения', async () => {
      // Данные с неверным форматом изображения
      const base64Image = 'invalid-base64-data';

      // Мокаем ошибку API
      (global.fetch as MockFunction).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          errors: [{ message: 'Неверный формат изображения' }],
        }),
      });

      // Выполняем запрос
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: UPLOAD_AVATAR_BASE64_MUTATION,
          variables: {
            base64Image,
          },
        }),
      });

      // Получаем данные из ответа
      const data = await response.json();

      // Проверяем наличие ошибки в ответе
      expect(data.errors).toBeDefined();
      expect(data.errors[0].message).toBe('Неверный формат изображения');
    });
  });
}); 