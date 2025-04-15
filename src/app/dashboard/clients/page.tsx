'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ClientProfiles } from '@/components/clients/ClientProfiles';
import { ClientDiscounts } from '@/components/clients/ClientDiscounts';
import { ClientStatus } from '@/components/clients/ClientStatus';

// Определяем интерфейс для клиента
interface Client {
  id: string;
  profileType: string;
  name: string;
  email: string;
  markup: string;
  phone: string;
  registrationDate: string;
  registrationStatus: string;
}

// Немного уточнить тип для данных формы
interface ClientFormData {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  profileType: string;
  profileId?: string;
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileOptions, setProfileOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);

  // Загрузка клиентов с сервера
  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Формируем строку запроса с фильтрами
      let url = '/api/clients?';

      if (searchTerm) {
        url += `search=${encodeURIComponent(searchTerm)}&`;
      }

      if (profileFilter !== 'all') {
        url += `profileType=${encodeURIComponent(profileFilter)}&`;
      }

      if (statusFilter !== 'all') {
        url += `isVerified=${statusFilter === 'Подтвержден'}&`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных');
      }

      const data = await response.json();
      setClients(data.clients);
    } catch (err) {
      console.error('Ошибка при получении списка клиентов:', err);
      setError('Не удалось загрузить список клиентов');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, profileFilter, statusFilter]);

  // Загружаем клиентов при изменении фильтров
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Загрузка профилей при монтировании компонента
  useEffect(() => {
    fetchProfiles();
  }, []);

  // Функция для загрузки профилей клиентов
  const fetchProfiles = async () => {
    try {
      setIsLoadingProfiles(true);
      const response = await fetch('/api/client-profiles');

      if (!response.ok) {
        throw new Error('Ошибка при загрузке профилей клиентов');
      }

      const data = await response.json();
      setProfileOptions(
        data.profiles.map((profile: { id: string; name: string }) => ({
          id: profile.id,
          name: profile.name,
        }))
      );
    } catch (error) {
      console.error('Ошибка при загрузке профилей клиентов:', error);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  // Функция для добавления нового клиента
  const handleAddClient = async (formData: ClientFormData) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании клиента');
      }

      // Обновляем список клиентов
      fetchClients();

      // Закрываем диалог
      setIsAddClientDialogOpen(false);
    } catch (err) {
      console.error('Ошибка при создании клиента:', err);
      // Здесь можно добавить обработку ошибки для формы
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Клиенты</h1>
        <Button onClick={() => setIsAddClientDialogOpen(true)}>
          Добавить клиента
        </Button>
      </div>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="clients">Клиенты</TabsTrigger>
          <TabsTrigger value="profiles">Профили</TabsTrigger>
          <TabsTrigger value="discounts">Скидки</TabsTrigger>
          <TabsTrigger value="status">Статус</TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Список клиентов</CardTitle>
              <CardDescription>
                Управление клиентами интернет-магазина
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Поиск по имени, email, телефону или номеру клиента"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-64">
                  <Select
                    value={profileFilter}
                    onValueChange={setProfileFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Тип профиля" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="Розничный">Розничный</SelectItem>
                      <SelectItem value="Оптовый">Оптовый</SelectItem>
                      <SelectItem value="Юридическое лицо">
                        Юридическое лицо
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-64">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Статус регистрации" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="Подтвержден">Подтвержден</SelectItem>
                      <SelectItem value="Не подтвержден">
                        Не подтвержден
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button variant="outline">Экспорт</Button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8">Загрузка данных...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8">Клиенты не найдены</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Номер клиента</TableHead>
                        <TableHead>Тип профиля</TableHead>
                        <TableHead>Имя</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Наценка</TableHead>
                        <TableHead>Номер телефона</TableHead>
                        <TableHead>Дата регистрации</TableHead>
                        <TableHead>Статус регистрации</TableHead>
                        <TableHead>Вход</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>{client.id}</TableCell>
                          <TableCell>{client.profileType}</TableCell>
                          <TableCell>
                            <a
                              href={`/dashboard/clients/${client.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {client.name}
                            </a>
                          </TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.markup}</TableCell>
                          <TableCell>{client.phone}</TableCell>
                          <TableCell>{client.registrationDate}</TableCell>
                          <TableCell>{client.registrationStatus}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Войти
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/dashboard/clients/${client.id}`}>
                                Редактировать
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles">
          <ClientProfiles />
        </TabsContent>

        <TabsContent value="discounts">
          <ClientDiscounts />
        </TabsContent>

        <TabsContent value="status">
          <ClientStatus />
        </TabsContent>
      </Tabs>

      <Dialog
        open={isAddClientDialogOpen}
        onOpenChange={setIsAddClientDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить клиента</DialogTitle>
            <DialogDescription>
              Заполните форму для создания нового клиента
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const client = {
                phone: formData.get('phone') as string,
                firstName: formData.get('firstName') as string,
                lastName: formData.get('lastName') as string,
                email: formData.get('email') as string,
                profileType: formData.get('profileType') as string,
              };
              handleAddClient(client);
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileType">Тип профиля</Label>
                <Select name="profileType" defaultValue="Розничный">
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип профиля" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Розничный">Розничный</SelectItem>
                    <SelectItem value="Оптовый">Оптовый</SelectItem>
                    <SelectItem value="Юридическое лицо">
                      Юридическое лицо
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileId">Профиль клиента</Label>
                <Select name="profileId">
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите профиль клиента" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingProfiles ? (
                      <SelectItem value="" disabled>
                        Загрузка профилей...
                      </SelectItem>
                    ) : (
                      profileOptions.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddClientDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
