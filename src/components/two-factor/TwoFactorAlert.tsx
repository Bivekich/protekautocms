'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, X } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface TwoFactorAlertProps {
  userName: string;
  userId: string;
  requiresTwoFactor?: boolean;
}

export const TwoFactorAlert = ({
  userName,
  userId,
  requiresTwoFactor = false,
}: TwoFactorAlertProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Создаем уникальный ключ для localStorage, привязанный к конкретному пользователю и сессии
    const sessionId = Math.random().toString(36).substring(2, 15);
    const dismissKey = `twoFactorAlertDismissed_${userId}_${sessionId}`;

    // Показываем уведомление только если 2FA не включена
    if (!requiresTwoFactor) {
      setIsVisible(true);

      // Сохраняем ключ сессии, чтобы можно было его удалить при выходе
      sessionStorage.setItem('twoFactorSessionKey', dismissKey);
    } else {
      setIsVisible(false);
    }

    return () => {
      // Очищаем при размонтировании компонента
      sessionStorage.removeItem('twoFactorSessionKey');
    };
  }, [requiresTwoFactor, userId]);

  const handleDismiss = () => {
    // Скрываем уведомление только для текущей сессии
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Alert variant="warning" className="mb-4 relative">
      <div className="flex items-start">
        <Shield className="h-4 w-4 mt-0.5" />
        <div className="flex-1 ml-2 pr-8">
          <AlertTitle>Повысьте безопасность вашего аккаунта</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              {userName}, рекомендуем включить двухфакторную аутентификацию для
              повышения безопасности вашего аккаунта. Это дополнительный уровень
              защиты, который предотвращает несанкционированный доступ.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings/two-factor">Настроить 2FA</Link>
            </Button>
          </AlertDescription>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-3 right-3 h-6 w-6 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900"
        onClick={handleDismiss}
        aria-label="Закрыть уведомление"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </Alert>
  );
};
