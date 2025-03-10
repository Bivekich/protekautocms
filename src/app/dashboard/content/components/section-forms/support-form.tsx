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
  description: z.string().min(1, {
    message: 'Описание обязательно',
  }),
  telegram: z.string().optional(),
  whatsapp: z.string().optional(),
  isActive: z.boolean().default(true),
});

type SupportFormValues = z.infer<typeof formSchema>;

interface SupportFormProps {
  pageId: string;
  section: {
    id: string;
    content: {
      title: string;
      description: string[];
      contacts: {
        telegram: string;
        whatsapp: string;
      };
    };
    isActive: boolean;
  };
}

export const SupportForm = ({ pageId, section }: SupportFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Преобразуем массив описаний в строку для формы
  const descriptionString = section.content.description.join('\n');

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section.content.title,
      description: descriptionString,
      telegram: section.content.contacts.telegram,
      whatsapp: section.content.contacts.whatsapp,
      isActive: section.isActive,
    },
  });

  const handleSubmit = async (values: SupportFormValues) => {
    try {
      setIsLoading(true);

      // Преобразуем строку описаний обратно в массив
      const descriptionArray = values.description
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
              description: descriptionArray,
              contacts: {
                telegram: values.telegram || '',
                whatsapp: values.whatsapp || '',
              },
            },
            isActive: values.isActive,
            typeName: 'Поддержка оптовых клиентов',
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Введите описание, каждый абзац с новой строки"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormDescription>
                    Введите описание, каждый абзац с новой строки
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telegram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ссылка на Telegram</FormLabel>
                    <FormControl>
                      <Input placeholder="https://t.me/username" {...field} />
                    </FormControl>
                    <FormDescription>
                      Ссылка на Telegram канал или чат
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ссылка на WhatsApp</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://wa.me/79001234567"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Ссылка на WhatsApp чат</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
