'use client';

import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { useClientsGraphQL } from '@/hooks/useClientsGraphQL';

interface Profile {
  id: string;
  name: string;
}

interface Discount {
  id: string;
  name: string;
  type: 'Промокод' | 'Скидка';
  code?: string;
  minOrderAmount: number;
  discountPercent?: number;
  fixedDiscount?: number;
  isActive: boolean;
  profiles: Profile[];
  createdAt: string;
  updatedAt: string;
}

interface EditingDiscount
  extends Omit<Discount, 'profiles' | 'createdAt' | 'updatedAt'> {
  profileIds: string[];
}

export function ClientDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingDiscount, setEditingDiscount] =
    useState<EditingDiscount | null>(null);

  // Используем GraphQL хук
  const {
    loading: isLoading,
    getClientProfiles,
    getDiscountsList,
    createDiscount,
    updateDiscount,
    deleteDiscount,
  } = useClientsGraphQL();

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchDiscounts();
    fetchProfiles();
  }, []);

  // Загрузка скидок через GraphQL
  const fetchDiscounts = async () => {
    try {
      const result = await getDiscountsList();
      setDiscounts(result || []);
    } catch (error) {
      console.error('Ошибка при загрузке скидок:', error);
      toast.error('Не удалось загрузить скидки');
    }
  };

  // Загрузка профилей клиентов через GraphQL
  const fetchProfiles = async () => {
    try {
      const result = await getClientProfiles();
      setProfiles(result.profiles || []);
    } catch (error) {
      console.error('Ошибка при загрузке профилей:', error);
      toast.error('Не удалось загрузить профили клиентов');
    }
  };

  const handleEditDiscount = (id: string) => {
    const discount = discounts.find((d) => d.id === id);
    if (discount) {
      setEditingDiscount({
        ...discount,
        profileIds: discount.profiles.map((profile) => profile.id),
      });
    }
  };

  const handleSaveDiscount = async () => {
    if (!editingDiscount) return;

    try {
      const discountData = {
        name: editingDiscount.name,
        type: editingDiscount.type,
        code: editingDiscount.code,
        profileIds: editingDiscount.profileIds,
        minOrderAmount: editingDiscount.minOrderAmount,
        discountPercent: editingDiscount.discountPercent,
        fixedDiscount: editingDiscount.fixedDiscount,
        isActive: editingDiscount.isActive,
      };

      if (editingDiscount.id) {
        await updateDiscount(editingDiscount.id, discountData);
        toast.success('Скидка успешно обновлена');
      } else {
        await createDiscount(discountData);
        toast.success('Скидка успешно создана');
      }

      setEditingDiscount(null);
      fetchDiscounts();
    } catch (error) {
      console.error('Ошибка при сохранении скидки:', error);
      toast.error((error as Error).message || 'Не удалось сохранить скидку');
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту скидку?')) {
      return;
    }

    try {
      await deleteDiscount(id);
      toast.success('Скидка успешно удалена');
      fetchDiscounts();
    } catch (error) {
      console.error('Ошибка при удалении скидки:', error);
      toast.error((error as Error).message || 'Не удалось удалить скидку');
    }
  };

  const handleAddDiscount = () => {
    setEditingDiscount({
      id: '',
      name: '',
      type: 'Скидка',
      minOrderAmount: 0,
      isActive: true,
      profileIds: [],
    });
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

        {isLoading ? (
          <div className="text-center py-8">Загрузка данных...</div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-8">Скидки не найдены</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Код для скидки</TableHead>
                  <TableHead>Профили</TableHead>
                  <TableHead>Сумма заказа от</TableHead>
                  <TableHead>Скидка %</TableHead>
                  <TableHead>Фикс скидка</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => handleEditDiscount(discount.id)}
                      >
                        {discount.name}
                      </Button>
                    </TableCell>
                    <TableCell>{discount.type}</TableCell>
                    <TableCell>{discount.code || '-'}</TableCell>
                    <TableCell>
                      {discount.profiles.map((p) => p.name).join(', ') || '-'}
                    </TableCell>
                    <TableCell>{discount.minOrderAmount} ₽</TableCell>
                    <TableCell>
                      {discount.discountPercent
                        ? `${discount.discountPercent}%`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {discount.fixedDiscount
                        ? `${discount.fixedDiscount} ₽`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDiscount(discount.id)}
                        >
                          Редактировать
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteDiscount(discount.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {editingDiscount && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-medium mb-4">
              {editingDiscount.id ? 'Редактирование' : 'Добавление'} скидки
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Название
                </label>
                <Input
                  value={editingDiscount.name}
                  onChange={(e) =>
                    setEditingDiscount({
                      ...editingDiscount,
                      name: e.target.value,
                    })
                  }
                  placeholder="Название скидки"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Тип</label>
                <Select
                  value={editingDiscount.type}
                  onValueChange={(value: 'Промокод' | 'Скидка') =>
                    setEditingDiscount({
                      ...editingDiscount,
                      type: value,
                      code: value === 'Скидка' ? '' : editingDiscount.code,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Промокод">Промокод</SelectItem>
                    <SelectItem value="Скидка">Скидка</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editingDiscount.type === 'Промокод' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Код промокода
                </label>
                <Input
                  value={editingDiscount.code || ''}
                  onChange={(e) =>
                    setEditingDiscount({
                      ...editingDiscount,
                      code: e.target.value,
                    })
                  }
                  placeholder="Код для скидки (например, SALE2024)"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Профили клиентов
                </label>
                <Select
                  value={editingDiscount.profileIds[0] || ''}
                  onValueChange={(value) =>
                    setEditingDiscount({
                      ...editingDiscount,
                      profileIds: [value],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите профиль" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Минимальная сумма
                </label>
                <Input
                  type="number"
                  value={editingDiscount.minOrderAmount || 0}
                  onChange={(e) =>
                    setEditingDiscount({
                      ...editingDiscount,
                      minOrderAmount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Минимальная сумма заказа"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Процент скидки (%)
                </label>
                <Input
                  type="number"
                  value={editingDiscount.discountPercent || ''}
                  onChange={(e) => {
                    const value = e.target.value
                      ? parseFloat(e.target.value)
                      : undefined;
                    setEditingDiscount({
                      ...editingDiscount,
                      discountPercent: value,
                      fixedDiscount: value
                        ? undefined
                        : editingDiscount.fixedDiscount,
                    });
                  }}
                  placeholder="Процент скидки (например, 10)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Фиксированная скидка (₽)
                </label>
                <Input
                  type="number"
                  value={editingDiscount.fixedDiscount || ''}
                  onChange={(e) => {
                    const value = e.target.value
                      ? parseFloat(e.target.value)
                      : undefined;
                    setEditingDiscount({
                      ...editingDiscount,
                      fixedDiscount: value,
                      discountPercent: value
                        ? undefined
                        : editingDiscount.discountPercent,
                    });
                  }}
                  placeholder="Фиксированная сумма скидки"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingDiscount(null)}
              >
                Отмена
              </Button>
              <Button onClick={handleSaveDiscount}>
                {editingDiscount.id ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
