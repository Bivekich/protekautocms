'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TwoFactorSetup } from '@/components/two-factor/TwoFactorSetup';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TwoFactorPage() {
  const router = useRouter();
  const [setupComplete, setSetupComplete] = useState(false);

  const handleComplete = () => {
    setSetupComplete(true);
  };

  const handleBack = () => {
    router.push('/dashboard/settings');
  };

  return (
    <div className="w-full max-w-full py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к настройкам
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Двухфакторная аутентификация
          </h1>
          <p className="text-muted-foreground">
            Настройте двухфакторную аутентификацию для повышения безопасности
            вашей учетной записи
          </p>
        </div>

        <div className="grid gap-8">
          <TwoFactorSetup onComplete={handleComplete} />

          {setupComplete && (
            <div className="text-left">
              <Button variant="outline" onClick={handleBack}>
                Вернуться к настройкам
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
