// vi.mock вызовы поднимаются в начало файла перед импортами
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard/managers',
  useSearchParams: () => new URLSearchParams(),
}));

// Мокаем запросы GraphQL
global.fetch = vi.fn();

// Импортируем все необходимые модули
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManagersPage from '@/app/dashboard/managers/page';
import { toast } from 'sonner';

// Мокаем toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Типизация для моков функций
type MockFunction = ReturnType<typeof vi.fn>;

// Моковые данные для тестов
const mockManagers = {
  data: {
    users: [
      {
        id: 'user-1',
        name: 'Иван Иванов',
        email: 'ivan@protek.ru',
        role: 'ADMIN',
        avatarUrl: 'https://example.com/avatar1.jpg',
        requiresTwoFactor: true
      },
      {
        id: 'user-2',
        name: 'Мария Петрова',
        email: 'maria@protek.ru',
        role: 'MANAGER',
        avatarUrl: 'https://example.com/avatar2.jpg',
        requiresTwoFactor: false
      }
    ]
  }
};

// Моковые данные для создания пользователя
const mockCreatedUser = {
  data: {
    createUser: {
      id: 'user-3',
      name: 'Новый Пользователь',
      email: 'new@protek.ru',
      role: 'MANAGER',
      avatarUrl: null,
      requiresTwoFactor: false
    }
  }
};

// Моковые данные для обновления пользователя
const mockUpdatedUser = {
  data: {
    updateUserAdmin: {
      id: 'user-2',
      name: 'Мария Обновленная',
      email: 'maria@protek.ru',
      role: 'ADMIN',
      avatarUrl: 'https://example.com/avatar2.jpg',
      requiresTwoFactor: false
    }
  }
};

// Моковые данные для удаления пользователя
const mockDeleteUser = {
  data: {
    deleteUser: true
  }
};

// Тестовый контейнер для рендеринга компонентов
let container: HTMLDivElement;

describe('ManagersPage Tests', () => {
  // Настройка перед каждым тестом
  beforeEach(() => {
    // Создаем контейнер для рендера
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
    
    // Мокаем fetch для возврата данных менеджеров
    global.fetch = vi.fn().mockImplementation((url, options) => {
      const body = JSON.parse(options?.body as string);
      
      if (body.query.includes('Users')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockManagers),
        });
      }
      
      if (body.query.includes('CreateUser')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCreatedUser),
        });
      }
      
      if (body.query.includes('UpdateUserAdmin')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUpdatedUser),
        });
      }
      
      if (body.query.includes('DeleteUser')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDeleteUser),
        });
      }
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  // Очистка после каждого теста
  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.clearAllMocks();
  });

  it('отображает заголовок и подзаголовок страницы', async () => {
    // Рендерим компонент в контейнер
    render(<ManagersPage />, { container });

    // Проверяем заголовок и подзаголовок
    expect(screen.getByText('Менеджеры')).toBeInTheDocument();
    expect(screen.getByText('Управление пользователями системы')).toBeInTheDocument();
  });

  it('загружает и отображает список менеджеров', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    });

    // Проверяем наличие данных в таблице
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
    expect(screen.getByText('ivan@protek.ru')).toBeInTheDocument();
    expect(screen.getByText('maria@protek.ru')).toBeInTheDocument();
  });

  it('отображает роли пользователей корректно', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    });

    // Проверяем корректное отображение ролей в таблице
    // Ищем конкретно в строках таблицы, а не во всем документе
    const rows = screen.getAllByRole('row');
    
    // Первая строка - заголовок, вторая и третья - данные
    const firstUserRow = rows[1];
    const secondUserRow = rows[2];
    
    // Проверяем роли в строках
    expect(within(firstUserRow).getByText('Администратор')).toBeInTheDocument();
    expect(within(secondUserRow).getByText('Менеджер')).toBeInTheDocument();
  });

  it('отображает статус 2FA пользователей корректно', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    });

    // Находим ячейки таблицы со статусом 2FA
    const rows = screen.getAllByRole('row');
    
    // Первая строка - заголовок, вторая строка - первый пользователь
    const firstUserRow = rows[1];
    const secondUserRow = rows[2];
    
    // Проверяем статус 2FA в строках
    const firstUser2FA = within(firstUserRow).getByText('Да');
    const secondUser2FA = within(secondUserRow).getByText('Нет');
    
    expect(firstUser2FA).toBeInTheDocument();
    expect(secondUser2FA).toBeInTheDocument();
  });

  it('открывает диалог добавления менеджера по нажатию на кнопку', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });
    const user = userEvent.setup();

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Добавить')).toBeInTheDocument();
    });

    // Нажимаем на кнопку добавления
    await user.click(screen.getByText('Добавить'));

    // Проверяем, что диалог открылся
    expect(screen.getByText('Добавить менеджера')).toBeInTheDocument();
    expect(screen.getByText('Заполните форму для добавления нового менеджера')).toBeInTheDocument();
    
    // Проверяем наличие полей формы
    expect(screen.getByLabelText('Имя')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
    expect(screen.getByLabelText('Роль')).toBeInTheDocument();
  });

  it('добавляет нового менеджера успешно', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });
    const user = userEvent.setup();

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Добавить')).toBeInTheDocument();
    });

    // Нажимаем на кнопку добавления
    await user.click(screen.getByText('Добавить'));

    // Заполняем форму
    const nameInput = screen.getByLabelText('Имя');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Пароль');
    
    await user.type(nameInput, 'Новый Пользователь');
    await user.type(emailInput, 'new@protek.ru');
    await user.type(passwordInput, 'password123');
    
    // Имитируем выбор роли
    // Вместо попытки кликнуть по опциям выпадающего списка, напрямую меняем значение формы
    // используя событие change на элементе select
    const selectElement = screen.getByLabelText('Роль');
    fireEvent.change(selectElement, { target: { value: 'MANAGER' } });
    
    // Отправляем форму
    await user.click(screen.getByRole('button', { name: 'Добавить' }));
    
    // Проверяем, что был вызван запрос и показано уведомление об успехе
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', expect.anything());
      expect(toast.success).toHaveBeenCalledWith('Менеджер успешно добавлен');
    });
  });

  it('открывает диалог редактирования менеджера', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });
    const user = userEvent.setup();

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
    });

    // Находим кнопку редактирования для второго пользователя
    const rows = screen.getAllByRole('row');
    const row = rows[2]; // Вторая строка с данными (первая - заголовок)
    
    // Ищем все кнопки в строке и находим ту, которая содержит иконку карандаша
    const buttons = within(row).getAllByRole('button');
    // Используем find чтобы найти кнопку с svg иконкой карандаша
    const editButton = buttons.find(button => {
      return button.querySelector('.lucide-pencil') !== null;
    });
    
    expect(editButton).toBeDefined();
    
    // Нажимаем на кнопку редактирования
    await user.click(editButton!);
    
    // Проверяем, что диалог открылся
    await waitFor(() => {
      expect(screen.getByText('Редактировать менеджера')).toBeInTheDocument();
      expect(screen.getByText('Измените данные менеджера')).toBeInTheDocument();
    });
    
    // Проверяем, что поля предзаполнены данными пользователя
    const nameInput = screen.getByLabelText('Имя');
    const emailInput = screen.getByLabelText('Email');
    
    expect(nameInput).toHaveValue('Мария Петрова');
    expect(emailInput).toHaveValue('maria@protek.ru');
  });

  it('обновляет данные менеджера успешно', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });
    const user = userEvent.setup();

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
    });

    // Находим кнопку редактирования для второго пользователя
    const rows = screen.getAllByRole('row');
    const row = rows[2]; // Вторая строка с данными (первая - заголовок)
    
    // Ищем все кнопки в строке и находим ту, которая содержит иконку карандаша
    const buttons = within(row).getAllByRole('button');
    const editButton = buttons.find(button => {
      return button.querySelector('.lucide-pencil') !== null;
    });
    
    expect(editButton).toBeDefined();
    
    // Нажимаем на кнопку редактирования
    await user.click(editButton!);
    
    // Дожидаемся открытия диалога
    await waitFor(() => {
      expect(screen.getByText('Редактировать менеджера')).toBeInTheDocument();
    });
    
    // Изменяем имя пользователя
    const nameInput = screen.getByLabelText('Имя');
    await user.clear(nameInput);
    await user.type(nameInput, 'Мария Обновленная');
    
    // Имитируем выбор роли напрямую через событие change
    const selectElement = screen.getByLabelText('Роль');
    fireEvent.change(selectElement, { target: { value: 'ADMIN' } });
    
    // Отправляем форму
    const saveButton = screen.getByRole('button', { name: 'Сохранить' });
    await user.click(saveButton);
    
    // Проверяем, что был вызван запрос и показано уведомление об успехе
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', expect.anything());
      expect(toast.success).toHaveBeenCalledWith('Данные менеджера обновлены');
    });
  });

  it('открывает диалог подтверждения удаления менеджера', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });
    const user = userEvent.setup();

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
    });

    // Находим кнопку удаления для второго пользователя
    const rows = screen.getAllByRole('row');
    const row = rows[2]; // Вторая строка с данными (первая - заголовок)
    
    // Ищем все кнопки в строке и находим ту, которая содержит иконку корзины
    const buttons = within(row).getAllByRole('button');
    const deleteButton = buttons.find(button => {
      return button.querySelector('.lucide-trash2') !== null;
    });
    
    expect(deleteButton).toBeDefined();
    
    // Нажимаем на кнопку удаления
    await user.click(deleteButton!);
    
    // Проверяем, что диалог подтверждения открылся
    await waitFor(() => {
      expect(screen.getByText('Удалить менеджера?')).toBeInTheDocument();
      expect(screen.getByText(/Вы уверены, что хотите удалить менеджера Мария Петрова/)).toBeInTheDocument();
    });
    
    // Проверяем наличие кнопок подтверждения и отмены
    expect(screen.getByText('Отмена')).toBeInTheDocument();
    expect(screen.getByText('Удалить')).toBeInTheDocument();
  });

  it('удаляет менеджера успешно', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });
    const user = userEvent.setup();

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
    });

    // Находим кнопку удаления для второго пользователя
    const rows = screen.getAllByRole('row');
    const row = rows[2]; // Вторая строка с данными (первая - заголовок)
    
    // Ищем все кнопки в строке и находим ту, которая содержит иконку корзины
    const buttons = within(row).getAllByRole('button');
    const deleteButton = buttons.find(button => {
      return button.querySelector('.lucide-trash2') !== null;
    });
    
    expect(deleteButton).toBeDefined();
    
    // Нажимаем на кнопку удаления
    await user.click(deleteButton!);
    
    // Дожидаемся открытия диалога подтверждения
    await waitFor(() => {
      expect(screen.getByText('Удалить менеджера?')).toBeInTheDocument();
    });
    
    // Нажимаем на кнопку подтверждения
    await user.click(screen.getByRole('button', { name: 'Удалить' }));
    
    // Проверяем, что был вызван запрос и показано уведомление об успехе
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', expect.anything());
      expect(toast.success).toHaveBeenCalledWith('Менеджер успешно удален');
    });
  });

  it('фильтрует менеджеров по поисковому запросу', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });
    const user = userEvent.setup();

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
      expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
    });

    // Вводим поисковый запрос
    const searchInput = screen.getByPlaceholderText('Поиск...');
    await user.type(searchInput, 'Иван');
    
    // Проверяем, что отображается только Иван Иванов
    expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    expect(screen.queryByText('Мария Петрова')).not.toBeInTheDocument();
    
    // Очищаем поисковый запрос
    await user.clear(searchInput);
    await user.type(searchInput, 'maria@protek.ru');
    
    // Проверяем, что отображается только Мария Петрова
    expect(screen.queryByText('Иван Иванов')).not.toBeInTheDocument();
    expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
    
    // Очищаем поисковый запрос нажатием на кнопку X
    // Находим кнопку X через поиск по иконке
    const buttons = screen.getAllByRole('button');
    const clearButton = buttons.find(button => {
      return button.querySelector('.lucide-x') !== null;
    });
    
    expect(clearButton).toBeDefined();
    await user.click(clearButton!);
    
    // Проверяем, что отображаются все менеджеры
    await waitFor(() => {
      expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
      expect(screen.getByText('Мария Петрова')).toBeInTheDocument();
    });
  });

  it('показывает сообщение, если нет результатов поиска', async () => {
    // Рендерим компонент
    render(<ManagersPage />, { container });
    const user = userEvent.setup();

    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    });

    // Вводим поисковый запрос, по которому нет результатов
    const searchInput = screen.getByPlaceholderText('Поиск...');
    await user.type(searchInput, 'Несуществующий пользователь');
    
    // Проверяем, что отображается сообщение об отсутствии результатов
    expect(screen.getByText('Менеджеры не найдены')).toBeInTheDocument();
  });

  it('отображает сообщение о загрузке при инициализации', async () => {
    // Переопределяем мок fetch, чтобы он не возвращал данные сразу
    global.fetch = vi.fn().mockImplementation(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve(mockManagers),
          });
        }, 100); // Задержка 100мс
      });
    });
    
    // Рендерим компонент
    render(<ManagersPage />, { container });
    
    // Проверяем наличие сообщения о загрузке
    expect(screen.getByText('Загрузка менеджеров...')).toBeInTheDocument();
    
    // Ожидаем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Иван Иванов')).toBeInTheDocument();
    }, { timeout: 200 });
    
    // Проверяем, что сообщение о загрузке больше не отображается
    expect(screen.queryByText('Загрузка менеджеров...')).not.toBeInTheDocument();
  });

  it('показывает ошибку при неудачной загрузке менеджеров', async () => {
    // Переопределяем мок fetch, чтобы он возвращал ошибку
    global.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          errors: [{ message: 'Ошибка загрузки пользователей' }]
        }),
      });
    });
    
    // Подготавливаем консоль к перехвату ошибок
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Рендерим компонент
    render(<ManagersPage />, { container });
    
    // Ожидаем вызова toast.error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не удалось загрузить список менеджеров');
    });
    
    // Проверяем, что ошибка была залогирована
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Восстанавливаем консоль
    consoleErrorSpy.mockRestore();
  });
}); 