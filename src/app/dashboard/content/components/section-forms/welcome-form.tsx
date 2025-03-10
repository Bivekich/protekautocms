'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

// Схема валидации для формы
const formSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  description: z.string().min(1, 'Описание обязательно'),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Тип для данных формы
type WelcomeFormValues = z.infer<typeof formSchema>;

// Интерфейс для пропсов компонента
interface WelcomeFormProps {
  pageId: string;
  sectionId?: string;
  defaultValues?: WelcomeFormValues;
  onSuccess?: () => void;
}

export const WelcomeForm = ({
  pageId,
  sectionId,
  defaultValues,
  onSuccess,
}: WelcomeFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Инициализация формы с дефолтными значениями
  const form = useForm<WelcomeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: '',
      description: '',
      imageUrl: '',
      isActive: true,
    },
  });

  // Обработчик отправки формы
  const onSubmit = async (values: WelcomeFormValues) => {
    try {
      setIsLoading(true);

      // Формируем данные для отправки
      const data = {
        pageId,
        type: 'welcome',
        content: {
          title: values.title,
          description: values.description,
          imageUrl: values.imageUrl,
        },
        isActive: values.isActive,
      };

      // Определяем URL и метод запроса в зависимости от наличия sectionId
      const url = sectionId ? `/api/sections/${sectionId}` : '/api/sections';
      const method = sectionId ? 'PATCH' : 'POST';

      // Отправляем запрос
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Произошла ошибка при сохранении секции');
      }

      // Показываем уведомление об успешном сохранении
      toast.success(
        sectionId ? 'Секция успешно обновлена' : 'Секция успешно создана'
      );

      // Обновляем страницу и вызываем колбэк onSuccess
      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error('Произошла ошибка при сохранении секции');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Заголовок</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Введите заголовок"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Введите описание"
                  disabled={isLoading}
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL изображения</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Введите URL изображения"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Активность</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Отображать секцию на сайте
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {sectionId ? 'Сохранить изменения' : 'Создать секцию'}
        </Button>
      </form>
    </Form>
  );
};
