import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

type TwoFactorFormProps = {
  email: string;
  password: string;
  callbackUrl?: string;
};

export const TwoFactorForm = ({
  email,
  password,
  callbackUrl = '/dashboard',
}: TwoFactorFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      // Сначала проверяем код через API
      const validateResponse = await fetch('/api/auth/two-factor/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });

      const validateData = await validateResponse.json();

      if (!validateResponse.ok) {
        throw new Error(validateData.error || 'Неверный код подтверждения');
      }

      // Если код верный, выполняем вход
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        twoFactorCode: token,
        callbackUrl,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Перенаправляем пользователя
      window.location.href = result?.url || callbackUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Двухфакторная аутентификация</CardTitle>
        <CardDescription>
          Введите код из приложения аутентификатора для входа в систему
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Введите 6-значный код"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="text-center text-lg tracking-widest"
              maxLength={6}
              required
              autoFocus
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Код двухфакторной аутентификации"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || token.length !== 6}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Подтвердить
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center text-center">
        <p className="text-sm text-muted-foreground">
          Код меняется каждые 30 секунд. Убедитесь, что время на вашем
          устройстве синхронизировано.
        </p>
      </CardFooter>
    </Card>
  );
};
