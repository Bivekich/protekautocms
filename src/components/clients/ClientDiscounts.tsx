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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Discount {
  id: string;
  name: string;
  type: 'Промокод' | 'Скидка';
  code?: string;
  profiles: string[];
  minOrderAmount: string;
  discountPercent?: string;
  fixedDiscount?: string;
}

export function ClientDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([
    {
      id: '1',
      name: 'Новым пользователям',
      type: 'Промокод',
      code: 'NEWDSH',
      profiles: ['Розничный', 'Оптовый'],
      minOrderAmount: '5000 руб.',
      fixedDiscount: '500 руб.',
    },
    {
      id: '2',
      name: 'При покупке от 20 000 рублей',
      type: 'Скидка',
      profiles: ['Розничный', 'Оптовый', 'VIP'],
      minOrderAmount: '20 000 руб.',
      discountPercent: '5 %',
    },
  ]);

  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  const handleEditDiscount = (id: string) => {
    const discount = discounts.find((d) => d.id === id);
    if (discount) {
      setEditingDiscount({ ...discount });
    }
  };

  const handleSaveDiscount = (id: string, updatedFields: Partial<Discount>) => {
    setDiscounts(
      discounts.map((discount) =>
        discount.id === id ? { ...discount, ...updatedFields } : discount
      )
    );
    setEditingDiscount(null);
  };

  const handleDeleteDiscount = (id: string) => {
    setDiscounts(discounts.filter((discount) => discount.id !== id));
  };

  const handleAddDiscount = () => {
    const newDiscount: Discount = {
      id: Date.now().toString(),
      name: '',
      type: 'Скидка',
      profiles: [],
      minOrderAmount: '',
    };
    setDiscounts([...discounts, newDiscount]);
    setEditingDiscount(newDiscount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Скидки и промокоды на заказы</CardTitle>
        <CardDescription>
          Управление скидками и промокодами для клиентов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button onClick={handleAddDiscount}>Добавить скидку</Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>ТИП</TableHead>
                <TableHead>Код для скидки</TableHead>
                <TableHead>Профили</TableHead>
                <TableHead>Сумма заказа от</TableHead>
                <TableHead>Скидка %</TableHead>
                <TableHead>Фикс скидка</TableHead>
                <TableHead>Удалить</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell>
                    {editingDiscount?.id === discount.id ? (
                      <Input
                        value={editingDiscount.name}
                        onChange={(e) =>
                          setEditingDiscount({
                            ...editingDiscount,
                            name: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <Button
                        variant="link"
                        onClick={() => handleEditDiscount(discount.id)}
                      >
                        {discount.name}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingDiscount?.id === discount.id ? (
                      <Select
                        value={editingDiscount.type}
                        onValueChange={(value: 'Промокод' | 'Скидка') =>
                          setEditingDiscount({
                            ...editingDiscount,
                            type: value,
                          })
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Выберите тип" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Промокод">Промокод</SelectItem>
                          <SelectItem value="Скидка">Скидка</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      discount.type
                    )}
                  </TableCell>
                  <TableCell>
                    {editingDiscount?.id === discount.id ? (
                      <Input
                        value={editingDiscount.code || ''}
                        onChange={(e) =>
                          setEditingDiscount({
                            ...editingDiscount,
                            code: e.target.value,
                          })
                        }
                        disabled={editingDiscount.type !== 'Промокод'}
                      />
                    ) : (
                      discount.code || ''
                    )}
                  </TableCell>
                  <TableCell>
                    {editingDiscount?.id === discount.id ? (
                      <Select
                        value={editingDiscount.profiles[0]}
                        onValueChange={(value) =>
                          setEditingDiscount({
                            ...editingDiscount,
                            profiles: [value],
                          })
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Выберите профиль" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Розничный">Розничный</SelectItem>
                          <SelectItem value="Оптовый">Оптовый</SelectItem>
                          <SelectItem value="VIP">VIP</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      discount.profiles.join(', ')
                    )}
                  </TableCell>
                  <TableCell>
                    {editingDiscount?.id === discount.id ? (
                      <Input
                        value={editingDiscount.minOrderAmount}
                        onChange={(e) =>
                          setEditingDiscount({
                            ...editingDiscount,
                            minOrderAmount: e.target.value,
                          })
                        }
                      />
                    ) : (
                      discount.minOrderAmount
                    )}
                  </TableCell>
                  <TableCell>
                    {editingDiscount?.id === discount.id ? (
                      <Input
                        value={editingDiscount.discountPercent || ''}
                        onChange={(e) =>
                          setEditingDiscount({
                            ...editingDiscount,
                            discountPercent: e.target.value,
                            fixedDiscount: '',
                          })
                        }
                      />
                    ) : (
                      discount.discountPercent || ''
                    )}
                  </TableCell>
                  <TableCell>
                    {editingDiscount?.id === discount.id ? (
                      <Input
                        value={editingDiscount.fixedDiscount || ''}
                        onChange={(e) =>
                          setEditingDiscount({
                            ...editingDiscount,
                            fixedDiscount: e.target.value,
                            discountPercent: '',
                          })
                        }
                      />
                    ) : (
                      discount.fixedDiscount || ''
                    )}
                  </TableCell>
                  <TableCell>
                    {editingDiscount?.id === discount.id ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleSaveDiscount(discount.id, editingDiscount)
                          }
                        >
                          Сохранить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDiscount(null)}
                        >
                          Отмена
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDiscount(discount.id)}
                      >
                        Удалить
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
