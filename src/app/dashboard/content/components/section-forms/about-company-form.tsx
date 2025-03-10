'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Trash2, Plus } from 'lucide-react';

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
import { Card, CardContent } from '@/components/ui/card';

// Схема валидации для формы
const formSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  features: z
    .array(
      z.object({
        title: z.string().min(1, 'Заголовок преимущества обязателен'),
        description: z.string().min(1, 'Описание преимущества обязательно'),
      })
    )
    .min(1, 'Добавьте хотя бы одно преимущество'),
  isActive: z.boolean().default(true),
});

// Тип для данных формы
type AboutCompanyFormValues = z.infer<typeof formSchema>;

// Интерфейс для пропсов компонента
interface AboutCompanyFormProps {
  pageId: string;
  sectionId?: string;
  defaultValues?: AboutCompanyFormValues;
  onSuccess?: () => void;
}

export const AboutCompanyForm = ({
  pageId,
  sectionId,
  defaultValues,
  onSuccess,
}: AboutCompanyFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Инициализация формы с дефолтными значениями
  const form = useForm<AboutCompanyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: '',
      features: [
        {
          title: '',
          description: '',
        },
      ],
      isActive: true,
    },
  });

  // Инициализация массива полей для features
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'features',
  });

  // Обработчик отправки формы
  const onSubmit = async (values: AboutCompanyFormValues) => {
    try {
      setIsLoading(true);

      // Формируем данные для отправки
      const data = {
        pageId,
        type: 'about_company',
        content: {
          title: values.title,
          features: values.features,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel className="text-base">Преимущества</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  title: '',
                  description: '',
                })
              }
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить преимущество
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Преимущество {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isLoading || fields.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`features.${index}.title`}
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
                    name={`features.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Введите описание"
                            disabled={isLoading}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
