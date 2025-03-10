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
  phone: z.string().min(1, 'Телефон обязателен'),
  address: z.string().min(1, 'Адрес обязателен'),
  workingHours: z.string().min(1, 'Часы работы обязательны'),
  inn: z.string().min(1, 'ИНН обязателен'),
  ogrn: z.string().min(1, 'ОГРН обязателен'),
  kpp: z.string().min(1, 'КПП обязателен'),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ContactsFormProps {
  pageId: string;
  section: {
    id: string;
    type: string;
    content: {
      phone: string;
      address: string;
      workingHours: string;
      inn: string;
      ogrn: string;
      kpp: string;
    };
    isActive: boolean;
  };
}

export const ContactsForm = ({ pageId, section }: ContactsFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: section.content.phone,
      address: section.content.address,
      workingHours: section.content.workingHours,
      inn: section.content.inn,
      ogrn: section.content.ogrn,
      kpp: section.content.kpp,
      isActive: section.isActive,
    },
  });

  // Получаем русское название типа секции
  const getSectionTypeName = (type: string): string => {
    switch (type) {
      case 'contacts':
        return 'контакты';
      case 'map':
        return 'карта';
      default:
        return type;
    }
  };

  const onSubmit = async (values: FormValues) => {
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
              phone: values.phone,
              address: values.address,
              workingHours: values.workingHours,
              inn: values.inn,
              ogrn: values.ogrn,
              kpp: values.kpp,
            },
            isActive: values.isActive,
            typeName: getSectionTypeName(section.type),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Что-то пошло не так');
      }

      toast.success('Контактная информация обновлена');
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl>
                    <Input placeholder="+7 (495) 123-45-67" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Московская обл., г. Дмитров, ул. Чекистская 6, комната 4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Часы работы</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ПН-ПТ 9:00 – 18:00, Сб 10:00 – 16:00, ВС – Выходной"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="inn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ИНН</FormLabel>
                    <FormControl>
                      <Input placeholder="5007117840" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ogrn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ОГРН</FormLabel>
                    <FormControl>
                      <Input placeholder="1225000146282" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="kpp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>КПП</FormLabel>
                    <FormControl>
                      <Input placeholder="500701001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Активна</FormLabel>
                    <FormDescription>
                      Отображать секцию на сайте
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
          <CardFooter>
            <Button type="submit" className="ml-auto" disabled={isLoading}>
              Сохранить изменения
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
