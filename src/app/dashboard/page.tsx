'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Временные данные для демонстрации
const mockOrders = [
  {
    id: '123453',
    date: '18.02.2025',
    client: 'Макс',
    amount: '45 678 руб.',
    status: 'Получен',
    isNew: true,
  },
  {
    id: '123454',
    date: '17.02.2025',
    client: 'Алексей',
    amount: '12 345 руб.',
    status: 'Получен',
    isNew: false,
  },
  {
    id: '123455',
    date: '18.02.2025',
    client: 'Иван',
    amount: '78 900 руб.',
    status: 'Получен',
    isNew: true,
  },
];

const mockVinRequests = [
  {
    id: '123453',
    date: '18.02.2025',
    client: 'Макс',
    status: 'Новый',
    request: 'Тормозные колодки на Volkswagen Passat',
    isNew: true,
  },
  {
    id: '123454',
    date: '17.02.2025',
    client: 'Алексей',
    status: 'Не обработан',
    request: 'Масляный фильтр для Toyota Camry 2018',
    isNew: false,
  },
  {
    id: '123455',
    date: '18.02.2025',
    client: 'Иван',
    status: 'Новый',
    request: 'Комплект свечей зажигания для BMW X5',
    isNew: true,
  },
];

const mockClients = [
  {
    id: '10001',
    name: 'Максим Петров',
    phone: '+7 (999) 123-45-67',
    status: 'Сбой авторизации',
  },
  {
    id: '10002',
    name: 'ООО "АвтоТрейд"',
    phone: '+7 (495) 987-65-43',
    status: 'Смена типа пользователя',
  },
  {
    id: '10003',
    name: 'Анна Сидорова',
    phone: '+7 (912) 345-67-89',
    status: 'Сбой авторизации',
  },
];

export default function DashboardPage() {
  const [, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
        <p className="text-muted-foreground">
          Добро пожаловать в систему управления контентом Protek Auto.
        </p>
      </div>

      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="vin-requests">VIN-запросы</TabsTrigger>
          <TabsTrigger value="clients">Клиенты</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Секция Заказы */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Новые заказы</CardTitle>
                <CardDescription>Заказы, требующие обработки</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setActiveTab('orders')}
                tabIndex={0}
                aria-label="Перейти ко всем заказам"
              >
                Все заказы
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер заказа</TableHead>
                    <TableHead>Дата заказа</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          tabIndex={0}
                          aria-label={`Перейти к заказу ${order.id}`}
                        >
                          {order.id}
                        </Button>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          tabIndex={0}
                          aria-label={`Перейти к клиенту ${order.client}`}
                        >
                          {order.client}
                        </Button>
                      </TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            order.isNew
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Секция VIN-запросы */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Новые VIN-запросы</CardTitle>
                <CardDescription>
                  VIN-запросы, требующие обработки
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setActiveTab('vin-requests')}
                tabIndex={0}
                aria-label="Перейти ко всем VIN-запросам"
              >
                Все VIN-запросы
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер запроса</TableHead>
                    <TableHead>Дата запроса</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Запрос</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVinRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          tabIndex={0}
                          aria-label={`Перейти к запросу ${request.id}`}
                        >
                          {request.id}
                        </Button>
                      </TableCell>
                      <TableCell>{request.date}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          tabIndex={0}
                          aria-label={`Перейти к клиенту ${request.client}`}
                        >
                          {request.client}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            request.isNew
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {request.request}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Секция Клиенты */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Клиенты, требующие внимания</CardTitle>
                <CardDescription>
                  Клиенты с проблемами авторизации или сменой типа
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setActiveTab('clients')}
                tabIndex={0}
                aria-label="Перейти ко всем клиентам"
              >
                Все клиенты
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Номер клиента</TableHead>
                    <TableHead>Имя</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.id}</TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium"
                          tabIndex={0}
                          aria-label={`Перейти к клиенту ${client.name}`}
                        >
                          {client.name}
                        </Button>
                      </TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${
                            client.status === 'Сбой авторизации'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Все заказы</CardTitle>
              <CardDescription>Полный список заказов в системе</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Здесь будет расширенный список всех заказов с дополнительными
                фильтрами и функциями.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vin-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Все VIN-запросы</CardTitle>
              <CardDescription>
                Полный список VIN-запросов в системе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Здесь будет расширенный список всех VIN-запросов с
                дополнительными фильтрами и функциями.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Все клиенты</CardTitle>
              <CardDescription>
                Полный список клиентов в системе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Здесь будет расширенный список всех клиентов с дополнительными
                фильтрами и функциями.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
