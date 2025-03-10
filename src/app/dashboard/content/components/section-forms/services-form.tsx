'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, FieldArrayPath } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Trash2 } from 'lucide-react';

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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Заголовок обязателен',
  }),
  items: z
    .array(z.string().min(1, { message: 'Сервис не может быть пустым' }))
    .min(1, { message: 'Добавьте хотя бы один сервис' }),
  isActive: z.boolean().default(true),
});

type ServicesFormValues = z.infer<typeof formSchema>;

interface ServicesFormProps {
  pageId: string;
  section: {
    id: string;
    content: {
      title: string;
      items: string[];
    };
    isActive: boolean;
  };
}

export const ServicesForm = ({ pageId, section }: ServicesFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ServicesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section.content.title,
      items: section.content.items,
      isActive: section.isActive,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items' as FieldArrayPath<ServicesFormValues>,
  });

  const handleSubmit = async (values: ServicesFormValues) => {
    try {
      setIsLoading(true);

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
              items: values.items,
            },
            isActive: values.isActive,
            typeName: 'Сервисы для работы',
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel className="text-base">Сервисы</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append('')}
                >
                  Добавить сервис
                </Button>
              </div>

              {fields.map((field, index: number) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormControl>
                          <Input
                            placeholder="Введите название сервиса"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {form.formState.errors.items?.message && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.items.message}
                </p>
              )}
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
