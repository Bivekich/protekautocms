'use client';

import { useState } from 'react';
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

// Фейковые данные для клиентов
const clients = [
  {
    id: '123421',
    profileType: 'Розничный',
    name: 'Иванов Иван Иванович',
    email: 'ivanov@example.com',
    markup: '15%',
    phone: '+7 (900) 123-45-67',
    registrationDate: '12.03.2024',
    registrationStatus: 'Подтвержден',
  },
  {
    id: '123422',
    profileType: 'Оптовый',
    name: 'Петров Петр Петрович',
    email: 'petrov@example.com',
    markup: '10%',
    phone: '+7 (900) 987-65-43',
    registrationDate: '10.03.2024',
    registrationStatus: 'Не подтвержден',
  },
  {
    id: '123423',
    profileType: 'Юридическое лицо',
    name: 'ООО Рога и Копыта',
    email: 'info@rogaikopyta.ru',
    markup: '5%',
    phone: '+7 (495) 123-45-67',
    registrationDate: '05.03.2024',
    registrationStatus: 'Подтвержден',
  },
  {
    id: '123424',
    profileType: 'Розничный',
    name: 'Сидоров Сидор Сидорович',
    email: 'sidorov@example.com',
    markup: '15%',
    phone: '+7 (900) 111-22-33',
    registrationDate: '01.03.2024',
    registrationStatus: 'Подтвержден',
  },
  {
    id: '123425',
    profileType: 'Юридическое лицо',
    name: 'ИП Смирнов А.А.',
    email: 'smirnov@example.com',
    markup: '7%',
    phone: '+7 (900) 444-55-66',
    registrationDate: '28.02.2024',
    registrationStatus: 'Подтвержден',
  },
];

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);

  // Фильтрация клиентов
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.id.includes(searchTerm);

    const matchesProfile =
      profileFilter === 'all' || client.profileType === profileFilter;
    const matchesStatus =
      statusFilter === 'all' || client.registrationStatus === statusFilter;

    return matchesSearch && matchesProfile && matchesStatus;
  });

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
                    {filteredClients.map((client) => (
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

      {/* Диалог добавления клиента */}
      <Dialog
        open={isAddClientDialogOpen}
        onOpenChange={setIsAddClientDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Добавить нового клиента</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом клиенте. Обязательные поля отмечены
              звездочкой (*).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clientType" className="text-right">
                Тип клиента *
              </Label>
              <Select defaultValue="physical">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите тип клиента" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Физическое лицо</SelectItem>
                  <SelectItem value="legal">Юридическое лицо</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Имя *
              </Label>
              <Input id="name" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Телефон *
              </Label>
              <Input id="phone" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                Город
              </Label>
              <Input id="city" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profile" className="text-right">
                Тип профиля *
              </Label>
              <Select defaultValue="retail">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите профиль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Розничный</SelectItem>
                  <SelectItem value="wholesale">Оптовый</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddClientDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button type="submit">Создать клиента</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
