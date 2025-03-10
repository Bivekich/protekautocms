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
import { Card, CardContent } from '@/components/ui/card';

interface Order {
  id: string;
  number: string;
  invoice?: string;
  date: string;
  itemsCount: number;
  totalAmount: string;
  deliveryAmount: string;
  status: string;
  export?: string;
  comment?: string;
}

interface ClientOrderHistoryProps {
  orders?: Order[];
}

export function ClientOrderHistory({
  orders: initialOrders,
}: ClientOrderHistoryProps) {
  const [orders] = useState<Order[]>(
    initialOrders || [
      {
        id: '1',
        number: '455667',
        invoice: 'Файл',
        date: '23.02.2025',
        itemsCount: 7,
        totalAmount: '124 678 ₽',
        deliveryAmount: '1356 ₽',
        status: 'Получен',
        export: 'Файл',
        comment: 'Нужно срочно',
      },
      {
        id: '2',
        number: '455668',
        date: '24.02.2025',
        itemsCount: 3,
        totalAmount: '45 000 ₽',
        deliveryAmount: '500 ₽',
        status: 'В работе',
      },
    ]
  );

  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтрация заказов
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.comment &&
        order.comment.toLowerCase().includes(searchTerm.toLowerCase()));

    // Для простоты демонстрации, фильтрация по периоду не реализована полностью
    return matchesStatus && matchesSearch;
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">История заказов</h3>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="Получен">Получен</SelectItem>
                  <SelectItem value="В работе">В работе</SelectItem>
                  <SelectItem value="Ожидает поставки">
                    Ожидает поставки
                  </SelectItem>
                  <SelectItem value="В резерве">В резерве</SelectItem>
                  <SelectItem value="Пришло на склад">
                    Пришло на склад
                  </SelectItem>
                  <SelectItem value="Выдано">Выдано</SelectItem>
                  <SelectItem value="Приостановлено">Приостановлено</SelectItem>
                  <SelectItem value="Отказ">Отказ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-64">
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все время</SelectItem>
                  <SelectItem value="today">Сегодня</SelectItem>
                  <SelectItem value="yesterday">Вчера</SelectItem>
                  <SelectItem value="week">За последние 7 дней</SelectItem>
                  <SelectItem value="month">За последние 30 дней</SelectItem>
                  <SelectItem value="half-year">
                    За последние 6 месяцев
                  </SelectItem>
                  <SelectItem value="year">За последние 12 месяцев</SelectItem>
                  <SelectItem value="custom">Выбрать дни</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Поиск по номеру заказа или составу"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>№ Заказа</TableHead>
                  <TableHead>Счет</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Позиций</TableHead>
                  <TableHead>Сумма ₽</TableHead>
                  <TableHead>Доставка ₽</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Экспорт</TableHead>
                  <TableHead>Комментарий клиента</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.number}</TableCell>
                    <TableCell>
                      {order.invoice && (
                        <Button variant="link" size="sm">
                          {order.invoice}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.itemsCount}</TableCell>
                    <TableCell>{order.totalAmount}</TableCell>
                    <TableCell>{order.deliveryAmount}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      {order.export && (
                        <Button variant="link" size="sm">
                          {order.export}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{order.comment || ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
