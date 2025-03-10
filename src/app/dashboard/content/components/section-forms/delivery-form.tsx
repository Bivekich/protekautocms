'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { X } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Заголовок обязателен',
  }),
  subtitle: z.string().min(1, {
    message: 'Подзаголовок обязателен',
  }),
  moscowTitle: z.string().min(1, {
    message: 'Заголовок для Москвы обязателен',
  }),
  moscowDetails: z.string().min(1, {
    message: 'Детали доставки по Москве обязательны',
  }),
  regionsTitle: z.string().min(1, {
    message: 'Заголовок для регионов обязателен',
  }),
  regionsDetails: z.string().min(1, {
    message: 'Детали доставки по регионам обязательны',
  }),
  companies: z.array(
    z.object({
      name: z.string().min(1, {
        message: 'Название компании обязательно',
      }),
      imageUrl: z.string().min(1, {
        message: 'URL изображения обязателен',
      }),
    })
  ),
});

type DeliveryFormValues = z.infer<typeof formSchema>;

interface DeliveryFormProps {
  pageId: string;
  initialData: PageSection;
}

// Тип для контента секции "Доставка"
interface DeliveryContent {
  title?: string;
  subtitle?: string;
  moscow?: {
    title?: string;
    details?: string[];
  };
  regions?: {
    title?: string;
    details?: string[];
  };
  companies?: Array<{
    name: string;
    imageUrl: string;
    id?: string;
  }>;
  [key: string]: unknown;
}

export const DeliveryForm = ({ pageId, initialData }: DeliveryFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Преобразуем content в нужный тип
  const content = initialData.content as unknown as DeliveryContent;

  const defaultValues = {
    title: content.title || '',
    subtitle: content.subtitle || '',
    moscowTitle: content.moscow?.title || '',
    moscowDetails: content.moscow?.details?.join('\n') || '',
    regionsTitle: content.regions?.title || '',
    regionsDetails: content.regions?.details?.join('\n') || '',
    companies: content.companies || [{ name: '', imageUrl: '' }],
  };

  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'companies',
  });

  const onSubmit = async (values: DeliveryFormValues) => {
    try {
      setIsLoading(true);

      const updatedContent = {
        title: values.title,
        subtitle: values.subtitle,
        moscow: {
          title: values.moscowTitle,
          details: values.moscowDetails.split('\n').filter(Boolean),
        },
        regions: {
          title: values.regionsTitle,
          details: values.regionsDetails.split('\n').filter(Boolean),
        },
        companies: values.companies,
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

      toast.success('Секция "Доставка" обновлена');
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
              <h3 className="text-lg font-medium">
                Доставка по Москве и области
              </h3>
              <FormField
                control={form.control}
                name="moscowTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Введите заголовок для доставки по Москве"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="moscowDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Детали доставки (каждый пункт с новой строки)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Введите детали доставки"
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
              <h3 className="text-lg font-medium">Доставка по регионам</h3>
              <FormField
                control={form.control}
                name="regionsTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Введите заголовок для доставки по регионам"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="regionsDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Детали доставки (каждый пункт с новой строки)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Введите детали доставки"
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Транспортные компании</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '', imageUrl: '' })}
                >
                  Добавить компанию
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-4 p-4 border rounded-md relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <FormField
                    control={form.control}
                    name={`companies.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название компании</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            placeholder="Введите название компании"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`companies.${index}.imageUrl`}
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
                </div>
              ))}
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
