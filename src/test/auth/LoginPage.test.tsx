// vi.mock вызовы поднимаются в начало файла перед импортами
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/two-factor/TwoFactorForm', () => ({
  TwoFactorForm: () => <div data-testid="two-factor-form">Two Factor Form</div>,
}));

// Импортируем все необходимые модули
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../utils';
import LoginPage from '@/app/auth/login/page';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';

// Типизация для моков функций
type MockFunction = ReturnType<typeof vi.fn>;

// Создаем типы для ответа signIn
interface SignInResponse {
  error: string | null;
  ok: boolean;
  url: string | null;
  status: number;
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('рендерится форма входа', () => {
    const { getByText, getByRole, getByPlaceholderText } = render(<LoginPage />);
    
    // Проверяем, что компоненты формы отображаются
    expect(getByText('ProtekCMS')).toBeInTheDocument();
    expect(getByText('Введите данные для входа в систему')).toBeInTheDocument();
    expect(getByPlaceholderText('example@protek.ru')).toBeInTheDocument();
    expect(getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  it('проверяет валидацию полей', async () => {
    const { user, getByRole, getByText } = render(<LoginPage />);
    
    // Нажимаем кнопку без заполнения полей
    const submitButton = getByRole('button', { name: 'Войти' });
    await user.click(submitButton);
    
    // Ожидаем сообщения об ошибках валидации
    expect(getByText('Пожалуйста, введите корректный email')).toBeInTheDocument();
    expect(getByText('Пароль должен содержать минимум 6 символов')).toBeInTheDocument();
  });

  it('отправляет данные для входа', async () => {
    // Настраиваем мок для успешного входа
    (signIn as unknown as MockFunction).mockResolvedValueOnce({
      status: 200,
      url: '/dashboard',
      ok: true,
      error: null,
    } as SignInResponse);
    
    const { user, getByPlaceholderText, getByRole } = render(<LoginPage />);
    
    // Заполняем форму
    await user.type(getByPlaceholderText('example@protek.ru'), 'test@example.com');
    await user.type(getByPlaceholderText('••••••••'), 'password123');
    
    // Отправляем форму
    const submitButton = getByRole('button', { name: 'Войти' });
    await user.click(submitButton);
    
    // Проверяем, что signIn вызван с правильными параметрами
    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password123',
      redirect: false,
    });
  });

  it('отображает компонент двухфакторной аутентификации при необходимости', async () => {
    (signIn as unknown as MockFunction).mockResolvedValueOnce({
      status: 401,
      url: null,
      ok: false,
      error: 'RequiresTwoFactor',
    } as SignInResponse);
    
    const { user, getByPlaceholderText, getByRole, getByTestId } = render(<LoginPage />);
    
    // Заполняем форму
    await user.type(getByPlaceholderText('example@protek.ru'), 'test@example.com');
    await user.type(getByPlaceholderText('••••••••'), 'password123');
    
    // Отправляем форму
    const submitButton = getByRole('button', { name: 'Войти' });
    await user.click(submitButton);
    
    // Проверяем, что отображается форма 2FA
    expect(getByTestId('two-factor-form')).toBeInTheDocument();
  });

  it('отображает сообщение об ошибке при неверных учетных данных', async () => {
    (signIn as unknown as MockFunction).mockResolvedValueOnce({
      status: 401,
      url: null,
      ok: false,
      error: 'Invalid credentials',
    } as SignInResponse);
    
    const { user, getByPlaceholderText, getByRole } = render(<LoginPage />);
    
    // Заполняем форму
    await user.type(getByPlaceholderText('example@protek.ru'), 'test@example.com');
    await user.type(getByPlaceholderText('••••••••'), 'wrongpassword');
    
    // Отправляем форму
    const submitButton = getByRole('button', { name: 'Войти' });
    await user.click(submitButton);
    
    // Проверяем, что отображается сообщение об ошибке
    expect(toast.error).toHaveBeenCalledWith('Ошибка входа. Проверьте email и пароль.');
  });
}); 