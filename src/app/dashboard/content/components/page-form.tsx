'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { useContentGraphQL, Page, UpdatePageInput, CreatePageInput } from '@/hooks/useContentGraphQL';

const formSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  slug: z.string().min(1, 'Slug обязателен'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

interface PageFormProps {
  initialData?: Page;
}

export const PageForm = ({ initialData }: PageFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { updatePage, createPage } = useContentGraphQL();

  const isEditMode = !!initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      if (isEditMode && initialData) {
        const input: UpdatePageInput = {
          title: values.title,
          slug: values.slug,
          description: values.description,
          isActive: values.isActive,
        };

        await updatePage(initialData.id, input);
        toast.success('Страница обновлена');
      } else {
        const input: CreatePageInput = {
          title: values.title,
          slug: values.slug,
          description: values.description,
          isActive: values.isActive,
        };

        await createPage(input);
        toast.success('Страница создана');
        router.push('/dashboard/content'); // Перенаправляем на список страниц после создания
      }

      router.refresh();
    } catch (error) {
      toast.error('Что-то пошло не так');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
        <CardDescription>
          Основные настройки страницы сайта
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название страницы</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Название страницы"
                      {...field}
                    />
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
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="page-url"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    URL страницы (например: contacts, about)
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
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={loading}
                      placeholder="Описание страницы"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Краткое описание страницы для SEO
                  </FormDescription>
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
                    <FormLabel className="text-base">
                      Активная страница
                    </FormLabel>
                    <FormDescription>
                      Показывать страницу на сайте
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      disabled={loading}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button disabled={loading} type="submit">
              {isEditMode ? 'Сохранить изменения' : 'Создать страницу'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
