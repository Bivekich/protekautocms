'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import Script from 'next/script';

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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const formSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  zoom: z.coerce.number().min(1).max(20),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface MapFormProps {
  pageId: string;
  section: {
    id: string;
    type: string;
    content: {
      latitude: number;
      longitude: number;
      zoom: number;
    };
    isActive: boolean;
  };
}

export const MapForm = ({ pageId, section }: MapFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [yandexMapsLoaded, setYandexMapsLoaded] = useState(false);
  const [yandexMapsError, setYandexMapsError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ymaps.Map | null>(null);

  // Получаем API-ключ из переменных окружения
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
  const mapsApiUrl = apiKey
    ? `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
    : 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      latitude: section.content.latitude,
      longitude: section.content.longitude,
      zoom: section.content.zoom,
      isActive: section.isActive,
    },
  });

  const { watch } = form;
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const zoom = watch('zoom');

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

  // Инициализация карты после загрузки API
  useEffect(() => {
    if (!yandexMapsLoaded || !mapRef.current) return;

    try {
      const ymaps = window.ymaps;

      if (!ymaps) {
        setYandexMapsError(true);
        return;
      }

      ymaps.ready(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
        }

        mapInstanceRef.current = new ymaps.Map(mapRef.current!, {
          center: [latitude, longitude],
          zoom: zoom,
          controls: ['zoomControl', 'fullscreenControl'],
        });

        const placemark = new ymaps.Placemark(
          [latitude, longitude],
          {
            hintContent: 'Местоположение компании',
          },
          {
            preset: 'islands#redDotIcon',
          }
        );

        mapInstanceRef.current.geoObjects.add(placemark);

        // Обновление координат при клике на карту
        mapInstanceRef.current.events.add('click', (e) => {
          const coords = e.get('coords') as [number, number];
          form.setValue('latitude', coords[0]);
          form.setValue('longitude', coords[1]);

          // Обновляем маркер
          placemark.geometry.setCoordinates(coords);
        });
      });
    } catch (error) {
      console.error('Error initializing Yandex Maps:', error);
      setYandexMapsError(true);
    }
  }, [yandexMapsLoaded, latitude, longitude, zoom, form]);

  // Обновление карты при изменении координат или зума
  useEffect(() => {
    if (!yandexMapsLoaded || !mapInstanceRef.current) return;

    try {
      const ymaps = window.ymaps;

      if (!ymaps || !ymaps.ready) return;

      ymaps.ready(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter([latitude, longitude], zoom);

          // Обновляем маркер
          if (mapInstanceRef.current.geoObjects.getLength() > 0) {
            const placemark = mapInstanceRef.current.geoObjects.get(
              0
            ) as ymaps.Placemark;
            placemark.geometry.setCoordinates([latitude, longitude]);
          }
        }
      });
    } catch (error) {
      console.error('Error updating map:', error);
    }
  }, [latitude, longitude, zoom, yandexMapsLoaded]);

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
              latitude: values.latitude,
              longitude: values.longitude,
              zoom: values.zoom,
            },
            isActive: values.isActive,
            typeName: getSectionTypeName(section.type),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Что-то пошло не так');
      }

      toast.success('Карта обновлена');
      router.refresh();
    } catch (error) {
      toast.error('Что-то пошло не так');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src={mapsApiUrl}
        onLoad={() => setYandexMapsLoaded(true)}
        onError={() => setYandexMapsError(true)}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Широта</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="56.344689"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Широта в десятичном формате (от -90 до 90)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Долгота</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="37.520020"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Долгота в десятичном формате (от -180 до 180)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="zoom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Масштаб</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        placeholder="15"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Масштаб карты (от 1 до 20)
                    </FormDescription>
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

              {!apiKey && (
                <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    API-ключ Яндекс.Карт не найден. Для полноценной работы карты
                    добавьте ключ в переменную окружения
                    NEXT_PUBLIC_YANDEX_MAPS_API_KEY.
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Предпросмотр карты (кликните на карту, чтобы изменить
                  местоположение)
                </p>
                <div
                  ref={mapRef}
                  className="aspect-video bg-muted rounded-md"
                  style={{ minHeight: '300px' }}
                >
                  {!yandexMapsLoaded && !yandexMapsError && (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Загрузка карты...
                      </p>
                    </div>
                  )}
                  {yandexMapsError && (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-destructive">
                        Ошибка загрузки карты. Проверьте подключение к интернету
                        или API-ключ.
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Примечание: Для работы карты на сайте необходимо получить
                  API-ключ Яндекс.Карт
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto" disabled={isLoading}>
                Сохранить изменения
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
};
