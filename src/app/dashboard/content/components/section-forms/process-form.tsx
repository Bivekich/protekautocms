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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

// Определяем схему формы
const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Заголовок обязателен',
  }),
  steps: z
    .array(z.string().min(1, { message: 'Шаг не может быть пустым' }))
    .min(1, { message: 'Добавьте хотя бы один шаг' }),
  isActive: z.boolean().default(true),
});

// Определяем тип на основе схемы
type ProcessFormValues = z.infer<typeof formSchema>;

interface ProcessFormProps {
  pageId: string;
  section: {
    id: string;
    content: {
      title: string;
      steps: string[];
    };
    isActive: boolean;
  };
}

export const ProcessForm = ({ pageId, section }: ProcessFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: section.content.title,
      steps: section.content.steps,
      isActive: section.isActive,
    },
  });

  // Используем явную типизацию для useFieldArray
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps' as FieldArrayPath<ProcessFormValues>,
  });

  const handleSubmit = async (values: ProcessFormValues) => {
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
              steps: values.steps,
            },
            isActive: values.isActive,
            typeName: 'Процесс',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при обновлении секции');
      }

      toast.success('Секция успешно обновлена');
      router.refresh();
    } catch (error) {
      console.error('Ошибка при обновлении секции:', error);
      toast.error('Не удалось обновить секцию');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Заголовок</FormLabel>
              <FormControl>
                <Input placeholder="Как мы работаем" {...field} />
              </FormControl>
              <FormDescription>
                Заголовок секции, отображаемый на странице
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Шаги процесса</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append('')}
            >
              Добавить шаг
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`steps.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="sr-only">
                            Шаг {index + 1}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={`Шаг ${index + 1}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Удалить шаг</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Добавьте хотя бы один шаг процесса
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Активность</FormLabel>
                <FormDescription>Отображать секцию на странице</FormDescription>
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
          {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </form>
    </Form>
  );
};
