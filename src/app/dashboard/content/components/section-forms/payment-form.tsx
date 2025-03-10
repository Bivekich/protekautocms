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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PageSection } from '@prisma/client';

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Заголовок обязателен',
  }),
  subtitle: z.string().min(1, {
    message: 'Подзаголовок обязателен',
  }),
  individualsTitle: z.string().min(1, {
    message: 'Заголовок для физических лиц обязателен',
  }),
  individualsImageUrl: z.string().min(1, {
    message: 'URL изображения для физических лиц обязателен',
  }),
  individualsMethods: z.string().min(1, {
    message: 'Методы оплаты для физических лиц обязательны',
  }),
  businessesTitle: z.string().min(1, {
    message: 'Заголовок для юридических лиц обязателен',
  }),
  businessesImageUrl: z.string().min(1, {
    message: 'URL изображения для юридических лиц обязателен',
  }),
  businessesMethods: z.string().min(1, {
    message: 'Методы оплаты для юридических лиц обязательны',
  }),
  importantTitle: z.string().min(1, {
    message: 'Заголовок для важной информации обязателен',
  }),
  importantPoints: z.string().min(1, {
    message: 'Важные пункты обязательны',
  }),
});

type PaymentFormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
  pageId: string;
  initialData: PageSection;
}

// Тип для контента секции "Оплата"
interface PaymentContent {
  title?: string;
  subtitle?: string;
  individuals?: {
    title?: string;
    imageUrl?: string;
    methods?: string[];
  };
  businesses?: {
    title?: string;
    imageUrl?: string;
    methods?: string[];
  };
  important?: {
    title?: string;
    points?: string[];
  };
  [key: string]: unknown;
}

export const PaymentForm = ({ pageId, initialData }: PaymentFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Преобразуем content в нужный тип
  const content = initialData.content as unknown as PaymentContent;

  const defaultValues = {
    title: content.title || '',
    subtitle: content.subtitle || '',
    individualsTitle: content.individuals?.title || '',
    individualsImageUrl: content.individuals?.imageUrl || '',
    individualsMethods: content.individuals?.methods?.join('\n') || '',
    businessesTitle: content.businesses?.title || '',
    businessesImageUrl: content.businesses?.imageUrl || '',
    businessesMethods: content.businesses?.methods?.join('\n') || '',
    importantTitle: content.important?.title || '',
    importantPoints: content.important?.points?.join('\n') || '',
  };

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      setIsLoading(true);

      const updatedContent = {
        title: values.title,
        subtitle: values.subtitle,
        individuals: {
          title: values.individualsTitle,
          imageUrl: values.individualsImageUrl,
          methods: values.individualsMethods.split('\n').filter(Boolean),
        },
        businesses: {
          title: values.businessesTitle,
          imageUrl: values.businessesImageUrl,
          methods: values.businessesMethods.split('\n').filter(Boolean),
        },
        important: {
          title: values.importantTitle,
          points: values.importantPoints.split('\n').filter(Boolean),
        },
      };

      const response = await fetch(
        `/api/pages/${pageId}/sections/${initialData.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: updatedContent,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Что-то пошло не так');
      }

      toast.success('Секция "Оплата" обновлена');
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Введите заголовок"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Подзаголовок</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Введите подзаголовок"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Для физических лиц</h3>
              <FormField
                control={form.control}
                name="individualsTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Введите заголовок для физических лиц"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="individualsImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL изображения</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Введите URL изображения"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="individualsMethods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Методы оплаты (каждый с новой строки)</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Введите методы оплаты"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Для юридических лиц</h3>
              <FormField
                control={form.control}
                name="businessesTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Введите заголовок для юридических лиц"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessesImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL изображения</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Введите URL изображения"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessesMethods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Методы оплаты (каждый с новой строки)</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Введите методы оплаты"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Важная информация</h3>
              <FormField
                control={form.control}
                name="importantTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Введите заголовок для важной информации"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="importantPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Важные пункты (каждый с новой строки)</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Введите важные пункты"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button disabled={isLoading} type="submit">
              Сохранить
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
