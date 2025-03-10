'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  title: z.string().min(1, 'Название страницы обязательно'),
  slug: z
    .string()
    .min(1, 'URL страницы обязателен')
    .regex(
      /^[a-z0-9-]+$/,
      'URL может содержать только строчные буквы, цифры и дефисы'
    ),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface PageFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    isActive: boolean;
  };
}

export const PageForm = ({ initialData }: PageFormProps = {}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          description: initialData.description || '',
          isActive: initialData.isActive,
        }
      : {
          title: '',
          slug: '',
          description: '',
          isActive: true,
        },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/pages${initialData ? `/${initialData.id}` : ''}`,
        {
          method: initialData ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error('Что-то пошло не так');
      }

      toast.success(initialData ? 'Страница обновлена' : 'Страница создана');
      router.push('/dashboard/content');
      router.refresh();
    } catch (error) {
      toast.error('Что-то пошло не так');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название страницы</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: Контакты" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL страницы</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: contacts" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL страницы на сайте (без слешей)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание (необязательно)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Краткое описание страницы"
                      {...field}
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Активна</FormLabel>
                    <FormDescription>
                      Отображать страницу на сайте
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/content')}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {initialData ? 'Сохранить изменения' : 'Создать страницу'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
