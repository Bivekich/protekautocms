'use client';

import { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Lock, Save, Camera } from 'lucide-react';
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

// Функция для выполнения GraphQL запросов
async function fetchGraphQL(query: string, variables?: Record<string, unknown>) {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

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
    requiresTwoFactor?: boolean;
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

  // Загрузка данных пользователя через GraphQL
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchGraphQL(CURRENT_USER_QUERY);
        
        if (!data.currentUser) {
          throw new Error('Ошибка при загрузке данных пользователя');
        }
        
        setUserData(data.currentUser);

        // Инициализация формы профиля с полученными данными
        profileForm.reset({
          name: data.currentUser.name,
          email: data.currentUser.email,
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

  // Обработчик отправки формы профиля через GraphQL
  const handleProfileSubmit = async (
    values: z.infer<typeof profileFormSchema>
  ) => {
    setIsProfileSubmitting(true);

    try {
      const data = await fetchGraphQL(UPDATE_USER_MUTATION, {
        input: {
          name: values.name,
          email: values.email,
        },
      });

      const updatedUser = data.updateUser;
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

  // Обработчик отправки формы пароля через GraphQL
  const handlePasswordSubmit = async (
    values: z.infer<typeof passwordFormSchema>
  ) => {
    setIsPasswordSubmitting(true);

    try {
      await fetchGraphQL(CHANGE_PASSWORD_MUTATION, {
        input: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });

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

  // Обработчик загрузки аватарки через GraphQL с base64
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

      // Преобразуем файл в base64
      const base64Image = await fileToBase64(file);
      
      // Отправляем запрос на загрузку аватара
      const data = await fetchGraphQL(UPLOAD_AVATAR_BASE64_MUTATION, {
        base64Image,
      });

      const updatedUser = data.uploadAvatarBase64;
      setUserData((prev) => prev ? { ...prev, avatarUrl: updatedUser.avatarUrl } : null);

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
    }
  };

  // Функция для преобразования файла в base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Обработчик клика по кнопке выбора файла
  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Если данные загружаются, показываем загрузочное состояние
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-[500px]">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">
          Управление настройками вашего аккаунта
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="password">Пароль</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
              <CardDescription>
                Обновите информацию о вашем профиле
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={userData?.avatarUrl || ''}
                      alt={userData?.name || 'Аватар'}
                    />
                    <AvatarFallback>
                      {userData?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mb-1"
                      onClick={handleAvatarButtonClick}
                      disabled={isAvatarUploading}
                    >
                      {isAvatarUploading ? (
                        'Загрузка...'
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Изменить аватар
                        </>
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF. Максимум 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

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
                          <Input
                            placeholder="Ваше имя"
                            {...field}
                            disabled={isProfileSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Ваше полное имя, которое будет отображаться в системе.
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
                            placeholder="email@example.com"
                            {...field}
                            disabled={isProfileSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Ваш email адрес, который используется для входа в
                          систему.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isProfileSubmitting}
                      className="w-[150px]"
                    >
                      {isProfileSubmitting ? (
                        'Сохранение...'
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Сохранить
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Пароль</CardTitle>
              <CardDescription>Изменение пароля аккаунта</CardDescription>
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
                          <Input
                            placeholder="••••••••"
                            type="password"
                            {...field}
                            disabled={isPasswordSubmitting}
                          />
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
                          <Input
                            placeholder="••••••••"
                            type="password"
                            {...field}
                            disabled={isPasswordSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Минимум 6 символов. Используйте надежный пароль.
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
                          <Input
                            placeholder="••••••••"
                            type="password"
                            {...field}
                            disabled={isPasswordSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isPasswordSubmitting}
                      className="w-[150px]"
                    >
                      {isPasswordSubmitting ? (
                        'Сохранение...'
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Сохранить
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${userData?.requiresTwoFactor ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <span className="text-sm font-medium">
                      {userData?.requiresTwoFactor 
                        ? 'Включено' 
                        : 'Отключено'}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() =>
                      (window.location.href = '/dashboard/settings/two-factor')
                    }
                  >
                    {userData?.requiresTwoFactor 
                      ? 'Управление настройками 2FA' 
                      : 'Настроить двухфакторную аутентификацию'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
