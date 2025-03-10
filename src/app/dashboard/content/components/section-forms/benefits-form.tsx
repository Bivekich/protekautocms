'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Заголовок обязателен',
  }),
  items: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, { message: 'Заголовок преимущества обязателен' }),
        description: z
          .string()
          .min(1, { message: 'Описание преимущества обязательно' }),
      })
    )
    .min(1, { message: 'Добавьте хотя бы одно преимущество' }),
  isActive: z.boolean().default(true),
});

type BenefitsFormValues = z.infer<typeof formSchema>;

interface BenefitsFormProps {
  pageId: string;
  section: {
    id: string;
    content: {
      title: string;
      items: {
        title: string;
        description: string;
      }[];
    };
    isActive: boolean;
  };
}

export const BenefitsForm = ({ pageId, section }: BenefitsFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BenefitsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section.content.title,
      items: section.content.items,
      isActive: section.isActive,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handleSubmit = async (values: BenefitsFormValues) => {
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
            typeName: 'Преимущества для оптовиков',
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
                <FormLabel className="text-base">Преимущества</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ title: '', description: '' })}
                >
                  Добавить преимущество
                </Button>
              </div>

              {fields.map((field, index: number) => (
                <div
                  key={field.id}
                  className="border rounded-md p-4 space-y-4 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <FormField
                    control={form.control}
                    name={`items.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Заголовок преимущества</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Введите заголовок преимущества"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание преимущества</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Введите описание преимущества"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
