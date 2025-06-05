import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../utils';
import { TwoFactorForm } from '@/components/two-factor/TwoFactorForm';

// Мокаем модули
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Мокаем fetch API
global.fetch = vi.fn();

// Создаем типы для ответа signIn
interface SignInResponse {
  error: string | null;
  ok: boolean;
  url: string | null;
  status: number;
}

describe('TwoFactorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Сбрасываем моки
    vi.mocked(global.fetch).mockReset();
    vi.mocked(global.fetch).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response)
    );
  });

  it('рендерится форма двухфакторной аутентификации', () => {
    const { getByText, getByPlaceholderText, getByRole } = render(
      <TwoFactorForm 
        email="test@example.com" 
        password="password123" 
        callbackUrl="/dashboard" 
      />
    );
    
    // Проверяем, что компоненты формы отображаются
    expect(getByText('Двухфакторная аутентификация')).toBeInTheDocument();
    expect(getByPlaceholderText('Введите 6-значный код')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Подтвердить' })).toBeInTheDocument();
  });

  it('кнопка отправки формы отключена, если код не введен', () => {
    const { getByRole } = render(
      <TwoFactorForm 
        email="test@example.com" 
        password="password123" 
      />
    );
    
    // Проверяем, что кнопка отключена
    const submitButton = getByRole('button', { name: 'Подтвердить' });
    expect(submitButton).toBeDisabled();
  });

  it('отправляет запрос на валидацию и выполняет вход при верном коде', async () => {
    const mockSignIn = vi.mocked(await import('next-auth/react')).signIn;
    mockSignIn.mockResolvedValue({
      status: 200,
      url: '/dashboard',
      ok: true,
      error: null,
    } as SignInResponse);
    
    // Мокаем fetch для успешной валидации
    vi.mocked(global.fetch).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response)
    );
    
    // Сохраняем оригинальный window.location
    const { location } = window;
    
    // Переопределяем объект с минимально необходимыми свойствами
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    });
    
    const { user, getByPlaceholderText, getByRole } = render(
      <TwoFactorForm 
        email="test@example.com" 
        password="password123" 
        callbackUrl="/dashboard" 
      />
    );
    
    // Вводим код
    const codeInput = getByPlaceholderText('Введите 6-значный код');
    await user.type(codeInput, '123456');
    
    // Отправляем форму
    const submitButton = getByRole('button', { name: 'Подтвердить' });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);
    
    // Проверяем вызов API и signIn
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/two-factor/validate',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('123456'),
      })
    );
    
    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      redirect: false,
      email: 'test@example.com',
      password: 'password123',
      twoFactorCode: '123456',
      callbackUrl: '/dashboard',
    });
    
    // Восстанавливаем window.location
    Object.defineProperty(window, 'location', {
      writable: true, 
      value: location,
    });
  });

  it('отображает ошибку при неверном коде', async () => {
    // Мокаем fetch для неуспешной валидации
    vi.mocked(global.fetch).mockImplementation(() => 
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Неверный код подтверждения' }),
      } as Response)
    );
    
    const { user, getByPlaceholderText, getByRole, getByText } = render(
      <TwoFactorForm 
        email="test@example.com" 
        password="password123" 
      />
    );
    
    // Вводим код
    const codeInput = getByPlaceholderText('Введите 6-значный код');
    await user.type(codeInput, '123456');
    
    // Отправляем форму
    const submitButton = getByRole('button', { name: 'Подтвердить' });
    await user.click(submitButton);
    
    // Проверяем, что отображается сообщение об ошибке
    expect(getByText('Неверный код подтверждения')).toBeInTheDocument();
  });
}); 