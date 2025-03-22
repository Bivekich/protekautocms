import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
import { Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';

type TwoFactorSetupProps = {
  onComplete?: () => void;
};

export const TwoFactorSetup = ({ onComplete }: TwoFactorSetupProps) => {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Загружаем данные для настройки 2FA
  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/auth/two-factor/setup');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Не удалось загрузить данные для настройки 2FA'
          );
        }

        if (data.twoFactorEnabled) {
          setTwoFactorEnabled(true);
        } else {
          setQrCode(data.qrCodeUrl);
          setSecret(data.secret);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetupData();
  }, []);

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !secret) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/auth/two-factor/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, secret }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось проверить код');
      }

      setSuccess('Двухфакторная аутентификация успешно настроена');
      setTwoFactorEnabled(true);

      // Обновляем сессию пользователя, чтобы уведомление исчезло
      await update({
        ...session,
        user: {
          ...session?.user,
          requiresTwoFactor: true,
        },
      });

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик отключения 2FA
  const handleDisable = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/auth/two-factor/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось отключить 2FA');
      }

      setSuccess('Двухфакторная аутентификация успешно отключена');
      setTwoFactorEnabled(false);
      setQrCode(null);
      setSecret(null);

      // Обновляем сессию пользователя при отключении 2FA
      await update({
        ...session,
        user: {
          ...session?.user,
          requiresTwoFactor: false,
        },
      });

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !qrCode && !twoFactorEnabled) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-full">
      <CardHeader>
        <CardTitle>Двухфакторная аутентификация</CardTitle>
        <CardDescription>
          {twoFactorEnabled
            ? 'Двухфакторная аутентификация включена для вашей учетной записи'
            : 'Настройте двухфакторную аутентификацию для повышения безопасности'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {twoFactorEnabled ? (
          <div className="text-left py-4">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-lg font-medium">
                  Двухфакторная аутентификация активирована
                </p>
                <p className="text-muted-foreground mt-2">
                  Теперь при входе в систему вам потребуется ввести код из
                  приложения аутентификатора
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {qrCode && (
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="bg-white p-2 rounded-lg self-start">
                    <Image
                      src={qrCode}
                      alt="QR-код для настройки 2FA"
                      width={192}
                      height={192}
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground mb-2">
                      Отсканируйте QR-код с помощью приложения аутентификатора
                      (Google Authenticator, Microsoft Authenticator, Authy и
                      т.д.)
                    </p>
                    {secret && (
                      <p className="text-xs text-muted-foreground">
                        Или введите этот код вручную:{' '}
                        <span className="font-mono">{secret}</span>
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4 mt-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Введите код из приложения"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="max-w-xs"
                      maxLength={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-auto"
                    disabled={isLoading || token.length !== 6}
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Подтвердить
                  </Button>
                </form>
              </div>
            )}
          </>
        )}
      </CardContent>

      {twoFactorEnabled && (
        <CardFooter className="flex justify-start">
          <Button
            variant="outline"
            className="w-auto text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDisable}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Отключить двухфакторную аутентификацию
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
