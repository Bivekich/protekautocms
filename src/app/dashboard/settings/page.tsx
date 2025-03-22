'use client';

import { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { User, Lock, Save, Camera } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Схема валидации формы профиля
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Имя должно содержать минимум 2 символа',
  }),
  email: z.string().email({
    message: 'Пожалуйста, введите корректный email',
  }),
});

// Схема валидации формы пароля
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(6, {
      message: 'Пароль должен содержать минимум 6 символов',
    }),
    newPassword: z.string().min(6, {
      message: 'Пароль должен содержать минимум 6 символов',
    }),
    confirmPassword: z.string().min(6, {
      message: 'Пароль должен содержать минимум 6 символов',
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  } | null>(null);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Инициализация формы профиля
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Инициализация формы пароля
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Загрузка данных пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/settings');

        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных пользователя');
        }

        const data = await response.json();
        setUserData(data);

        // Инициализация формы профиля с полученными данными
        profileForm.reset({
          name: data.name,
          email: data.email,
        });
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
        toast.error('Не удалось загрузить данные пользователя');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [profileForm]);

  // Обработчик отправки формы профиля
  const handleProfileSubmit = async (
    values: z.infer<typeof profileFormSchema>
  ) => {
    setIsProfileSubmitting(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при обновлении профиля');
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);

      // Обновляем сессию с новыми данными
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });

      toast.success('Профиль успешно обновлен');
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при обновлении профиля'
      );
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  // Обработчик отправки формы пароля
  const handlePasswordSubmit = async (
    values: z.infer<typeof passwordFormSchema>
  ) => {
    setIsPasswordSubmitting(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при изменении пароля');
      }

      toast.success('Пароль успешно изменен');
      passwordForm.reset();
    } catch (error) {
      console.error('Ошибка при изменении пароля:', error);
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при изменении пароля'
      );
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  // Обработчик загрузки аватарки
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера файла (не более 5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5 МБ');
      return;
    }

    try {
      setIsAvatarUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/settings/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при загрузке аватарки');
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);

      // Обновляем сессию с новыми данными
      await update({
        ...session,
        user: {
          ...session?.user,
          avatarUrl: updatedUser.avatarUrl,
        },
      });

      toast.success('Аватарка успешно обновлена');
    } catch (error) {
      console.error('Ошибка при загрузке аватарки:', error);
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при загрузке аватарки'
      );
    } finally {
      setIsAvatarUploading(false);
      // Сбрасываем значение input, чтобы можно было загрузить тот же файл повторно
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!userData && isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">
          Управление настройками вашего профиля
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="password">Пароль</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
              <CardDescription>
                Управление информацией вашего профиля
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={userData?.avatarUrl || ''}
                      alt={userData?.name || ''}
                    />
                    <AvatarFallback className="text-2xl">
                      {userData?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <div className="relative">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAvatarUploading}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={isAvatarUploading}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{userData?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {userData?.email}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Роль:{' '}
                    {userData?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
                  </p>
                </div>
              </div>

              <Separator />

              <Form {...profileForm}>
                <form
                  onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Иван Иванов"
                              className="pl-10"
                              disabled={isProfileSubmitting}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Ваше полное имя, которое будет отображаться в системе
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@protek.ru"
                            disabled={isProfileSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Ваш email адрес, используемый для входа в систему
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isProfileSubmitting}>
                    {isProfileSubmitting ? (
                      'Сохранение...'
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Сохранить изменения
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Пароль</CardTitle>
              <CardDescription>
                Изменение пароля для входа в систему
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Текущий пароль</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              disabled={isPasswordSubmitting}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Новый пароль</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              disabled={isPasswordSubmitting}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Пароль должен содержать минимум 6 символов
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Подтверждение пароля</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-10"
                              disabled={isPasswordSubmitting}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPasswordSubmitting}>
                    {isPasswordSubmitting ? (
                      'Сохранение...'
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Изменить пароль
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Безопасность</CardTitle>
              <CardDescription>
                Настройки безопасности вашей учетной записи
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">
                    Двухфакторная аутентификация
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Повысьте безопасность вашей учетной записи, добавив
                    дополнительный уровень защиты при входе
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    (window.location.href = '/dashboard/settings/two-factor')
                  }
                >
                  Настроить двухфакторную аутентификацию
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
