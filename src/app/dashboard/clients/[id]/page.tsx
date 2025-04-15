'use client';

import { useEffect, useState, useCallback, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { GarageList } from '@/components/clients/garage/GarageList';
import { ContactsList } from '@/components/clients/contacts/ContactsList';
import { LegalEntitiesList } from '@/components/clients/legal-entities/LegalEntitiesList';
import { RequisitesList } from '@/components/clients/requisites/RequisitesList';
import { ContractsList } from '@/components/clients/contracts/ContractsList';
import { fetchWithCache, clearCacheEntry } from '@/../lib/cache';

// Интерфейс данных клиента
interface ClientData {
  id: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileType: string;
  status: string;
  isVerified: boolean;
  registrationDate: string;
  lastLoginDate: string | null;
  markup: number;
  discount: number;
  balance: number;
  city: string | null;
  personalManager: string | null;
  comment: string | null;
  notificationType: string | null;
  createdAt: string;
  updatedAt: string;
  addresses: Array<{
    id: string;
    title: string | null;
    country: string;
    city: string;
    street: string;
    house: string;
    apartment: string | null;
    postalCode: string | null;
    isDefault: boolean;
  }>;
  autos: Array<{
    id: string;
    name: string;
    vinOrFrame: string;
    codeType: string;
    make: string | null;
    model: string | null;
    modification: string | null;
    year: number | null;
    licensePlate: string | null;
    mileage: number | null;
    comment: string | null;
  }>;
  contacts: Array<{
    id: string;
    phone: string | null;
    email: string | null;
    comment: string | null;
  }>;
  contracts: Array<{
    id: string;
    number: string;
    date: string;
    name: string | null;
    ourLegalEntityId: string | null;
    clientLegalEntityId: string | null;
    balance: number;
    currency: string;
    isActive: boolean;
    isDefault: boolean;
    type: string | null;
    relation: string | null;
    deferred: boolean;
    creditLimit: number | null;
    deferredDays: number | null;
  }>;
  legalEntities: Array<{
    id: string;
    shortName: string;
    fullName: string | null;
    form: string | null;
    legalAddress: string | null;
    actualAddress: string | null;
    taxSystem: string | null;
    responsiblePhone: string | null;
    responsiblePosition: string | null;
    responsibleName: string | null;
    accountant: string | null;
    signatory: string | null;
    kpp: string | null;
    ogrn: string | null;
    inn: string;
    vatPercent: number;
  }>;
  requisites: Array<{
    id: string;
    legalEntityId: string;
    name: string;
    accountNumber: string;
    bankName: string | null;
    bik: string | null;
    correspondentAccount: string | null;
  }>;
  orders: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export default function ClientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const { toast } = useToast();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileType: '',
    markup: '0',
    city: '',
    personalManager: '',
    comment: '',
    notificationType: 'SMS',
    discount: '0',
    status: 'REGULAR',
    balance: '0',
  });

  // Устанавливаем активную вкладку из URL при монтировании
  useEffect(() => {
    if (
      tabParam &&
      [
        'details',
        'addresses',
        'garage',
        'contacts',
        'contracts',
        'legal',
        'requisites',
        'orders',
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Мемоизированная функция загрузки данных клиента
  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);

      // Используем нашу библиотеку кэширования
      const cacheKey = `client-${id}`;
      const data = await fetchWithCache<{ client: ClientData }>(
        cacheKey,
        async () => {
          const controller = new AbortController();
          const signal = controller.signal;

          // Установка таймаута для запроса
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          try {
            const response = await fetch(`/api/clients/${id}`, {
              headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
              },
              signal,
            });

            if (!response.ok) {
              throw new Error('Failed to fetch client data');
            }

            return await response.json();
          } finally {
            clearTimeout(timeoutId);
          }
        }
      );

      setClient(data.client);
      setFormData({
        firstName: data.client.firstName || '',
        lastName: data.client.lastName || '',
        email: data.client.email || '',
        profileType: data.client.profileType,
        markup: data.client.markup?.toString() || '0',
        city: data.client.city || '',
        personalManager: data.client.personalManager || '',
        comment: data.client.comment || '',
        notificationType: data.client.notificationType || 'SMS',
        discount: data.client.discount?.toString() || '0',
        status: data.client.status || 'REGULAR',
        balance: data.client.balance?.toString() || '0',
      });
    } catch (error) {
      console.error('Error fetching client data:', error);

      // Не показываем ошибку, если запрос был отменен
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные клиента',
          variant: 'destructive',
        });

        // При ошибке авторизации перенаправляем на страницу логина
        if (error instanceof Error && error.message.includes('Unauthorized')) {
          router.push('/auth/login');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [id, toast, router]);

  // Загрузка данных клиента при монтировании
  useEffect(() => {
    // Очищаем предыдущий таймер если он есть
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }

    // Устанавливаем таймер для дебаунсинга
    fetchTimerRef.current = setTimeout(() => {
      fetchClient();
    }, 100);

    // Очистка при размонтировании
    return () => {
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
    };
  }, [id, fetchClient]);

  // Обработчик изменения полей формы
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработчик сохранения данных
  const handleSave = async () => {
    setSaving(true);
    try {
      // Подготавливаем данные для отправки - числовые поля преобразуем в числа
      const dataToSend = {
        ...formData,
        markup: parseFloat(formData.markup) || 0,
        discount: parseFloat(formData.discount) || 0,
        balance: parseFloat(formData.balance) || 0,
      };

      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to update client data');
      }

      const data = await response.json();

      // Очищаем кэш для этого клиента после обновления
      clearCacheEntry(`client-${id}`);

      setClient(data.client);
      toast({
        title: 'Успех',
        description: 'Данные клиента обновлены',
      });
    } catch (error) {
      console.error('Error updating client data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные клиента',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Загрузка данных клиента...</span>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <p className="text-lg mb-4">Клиент не найден</p>
        <Button onClick={() => router.push('/dashboard/clients')}>
          Вернуться к списку клиентов
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Управление клиентом: {client.firstName} {client.lastName}
        </h1>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/clients')}
        >
          Назад к списку
        </Button>
      </div>

      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="details">Общие настройки</TabsTrigger>
          <TabsTrigger value="addresses">Адреса доставки</TabsTrigger>
          <TabsTrigger value="garage">Гараж</TabsTrigger>
          <TabsTrigger value="contacts">Контакты</TabsTrigger>
          <TabsTrigger value="contracts">Договоры</TabsTrigger>
          <TabsTrigger value="legal">Юр. лица</TabsTrigger>
          <TabsTrigger value="requisites">Реквизиты</TabsTrigger>
          <TabsTrigger value="orders">История заказов</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Общие настройки</CardTitle>
              <CardDescription>
                Основные данные и настройки аккаунта клиента
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clientId">Номер клиента</Label>
                    <Input id="clientId" value={client.id} disabled />
                  </div>

                  <div>
                    <Label htmlFor="firstName">Имя</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">Фамилия</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Номер телефона</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={client.phone}
                      disabled
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Город</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileType">Тип профиля</Label>
                    <Select
                      value={formData.profileType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, profileType: value }))
                      }
                    >
                      <SelectTrigger id="profileType">
                        <SelectValue placeholder="Выберите тип профиля" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RETAIL">Розничный</SelectItem>
                        <SelectItem value="WHOLESALE">Оптовый</SelectItem>
                        <SelectItem value="LEGAL_ENTITY">Юр. лицо</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Статус регистрации</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REGULAR">Обычный</SelectItem>
                        <SelectItem value="PREMIUM">Премиум</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="WHOLESALE">Оптовый</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="markup">Наценка (%)</Label>
                    <Input
                      id="markup"
                      name="markup"
                      type="number"
                      value={formData.markup}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="discount">Скидка (%)</Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      value={formData.discount}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="balance">Баланс</Label>
                    <Input
                      id="balance"
                      name="balance"
                      type="number"
                      value={formData.balance}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="personalManager">Личный менеджер</Label>
                    <Input
                      id="personalManager"
                      name="personalManager"
                      value={formData.personalManager}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notificationType">Уведомления</Label>
                    <Select
                      value={formData.notificationType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          notificationType: value,
                        }))
                      }
                    >
                      <SelectTrigger id="notificationType">
                        <SelectValue placeholder="Выберите тип уведомлений" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="BOTH">SMS и Email</SelectItem>
                        <SelectItem value="NONE">Отключены</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="regDate">Дата регистрации</Label>
                    <Input
                      id="regDate"
                      value={new Date(
                        client.registrationDate
                      ).toLocaleDateString()}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="comment">Комментарий</Label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/clients')}
                >
                  Отмена
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить изменения'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Адреса доставки</CardTitle>
              <CardDescription>
                Управление адресами доставки клиента
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Здесь будет таблица адресов и форма добавления адреса */}
              <p>Функционал адресов доставки в разработке</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="garage">
          <Card>
            <CardHeader>
              <CardTitle>Гараж</CardTitle>
              <CardDescription>Автомобили клиента</CardDescription>
            </CardHeader>
            <CardContent>
              {client && client.autos ? (
                <GarageList clientId={client.id} initialAutos={client.autos} />
              ) : (
                <p>Функционал гаража в разработке</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Контакты</CardTitle>
              <CardDescription>Контактные данные клиента</CardDescription>
            </CardHeader>
            <CardContent>
              {client && client.contacts ? (
                <ContactsList
                  clientId={client.id}
                  initialContacts={client.contacts}
                />
              ) : (
                <p>Функционал контактов в разработке</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Договоры</CardTitle>
              <CardDescription>Управление договорами клиента</CardDescription>
            </CardHeader>
            <CardContent>
              {client && client.contracts ? (
                <ContractsList
                  clientId={client.id}
                  initialContracts={client.contracts}
                />
              ) : (
                <p>Функционал договоров в разработке</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Юридические лица</CardTitle>
              <CardDescription>Юридические лица клиента</CardDescription>
            </CardHeader>
            <CardContent>
              {client && client.legalEntities ? (
                <LegalEntitiesList
                  clientId={client.id}
                  initialEntities={client.legalEntities}
                />
              ) : (
                <p>Функционал юр. лиц в разработке</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requisites">
          <Card>
            <CardHeader>
              <CardTitle>Реквизиты</CardTitle>
              <CardDescription>Банковские реквизиты клиента</CardDescription>
            </CardHeader>
            <CardContent>
              {client && client.requisites ? (
                <RequisitesList
                  clientId={client.id}
                  initialRequisites={client.requisites}
                />
              ) : (
                <p>Функционал реквизитов в разработке</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>История заказов</CardTitle>
              <CardDescription>Заказы клиента</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Здесь будет таблица заказов */}
              <p>Функционал истории заказов в разработке</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
