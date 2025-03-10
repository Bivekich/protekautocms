'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Заголовок обязателен',
  }),
  subtitle: z.string().min(1, {
    message: 'Подзаголовок обязателен',
  }),
  imageUrl: z.string().min(1, {
    message: 'URL изображения обязателен',
  }),
  isActive: z.boolean().default(true),
});

type HeroFormValues = z.infer<typeof formSchema>;

interface HeroFormProps {
  pageId: string;
  section: {
    id: string;
    content: {
      title: string;
      subtitle: string[];
      imageUrl: string;
    };
    isActive: boolean;
  };
}

export const HeroForm = ({ pageId, section }: HeroFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Преобразуем массив подзаголовков в строку для формы
  const subtitleString = section.content.subtitle.join('\n');

  const form = useForm<HeroFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section.content.title,
      subtitle: subtitleString,
      imageUrl: section.content.imageUrl,
      isActive: section.isActive,
    },
  });

  const handleSubmit = async (values: HeroFormValues) => {
    try {
      setIsLoading(true);

      // Преобразуем строку подзаголовков обратно в массив
      const subtitleArray = values.subtitle
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      const response = await fetch(
        `/api/pages/${pageId}/sections/${section.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: {
              title: values.title,
              subtitle: subtitleArray,
              imageUrl: values.imageUrl,
            },
            isActive: values.isActive,
            typeName: 'Заголовок и основная информация',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Что-то пошло не так');
      }

      toast.success('Секция успешно обновлена');
      router.refresh();
    } catch (error) {
      toast.error('Что-то пошло не так');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заголовок</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите заголовок" {...field} />
                  </FormControl>
                  <FormDescription>
                    Заголовок секции, который будет отображаться на странице
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Подзаголовки</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите подзаголовки, каждый с новой строки"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormDescription>
                    Введите подзаголовки, каждый с новой строки
                  </FormDescription>
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
                    <Input placeholder="Введите URL изображения" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL изображения, которое будет отображаться в секции
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
                      Активность секции
                    </FormLabel>
                    <FormDescription>
                      Если выключено, секция не будет отображаться на странице
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

            <Button type="submit" disabled={isLoading}>
              Сохранить изменения
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
