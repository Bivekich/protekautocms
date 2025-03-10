'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Profile {
  id: string;
  code: string;
  name: string;
  comment?: string;
  baseMarkup: string;
  priceMarkup?: string;
  orderDiscount?: string;
  supplierMarkups: number;
  excludedFromSearch: {
    brands: number;
    productGroups: number;
  };
  paymentTypes: number;
}

export function ClientProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: '1',
      code: '3235252',
      name: 'Розничный',
      comment: 'Для розничных клиентов',
      baseMarkup: '15 %',
      priceMarkup: '',
      orderDiscount: '10000 ₽ - 5%',
      supplierMarkups: 5,
      excludedFromSearch: {
        brands: 2,
        productGroups: 5,
      },
      paymentTypes: 4,
    },
    {
      id: '2',
      code: '3235253',
      name: 'Оптовый',
      comment: 'Для оптовых клиентов',
      baseMarkup: '10 %',
      priceMarkup: '',
      orderDiscount: '50000 ₽ - 10%',
      supplierMarkups: 3,
      excludedFromSearch: {
        brands: 0,
        productGroups: 2,
      },
      paymentTypes: 3,
    },
    {
      id: '3',
      code: '3235254',
      name: 'VIP',
      comment: 'Для VIP клиентов',
      baseMarkup: '5 %',
      priceMarkup: '',
      orderDiscount: '5000 ₽ - 15%',
      supplierMarkups: 7,
      excludedFromSearch: {
        brands: 0,
        productGroups: 0,
      },
      paymentTypes: 5,
    },
  ]);

  const [isAddProfileDialogOpen, setIsAddProfileDialogOpen] = useState(false);
  const [newProfile, setNewProfile] = useState<Partial<Profile>>({
    code: '',
    name: '',
    comment: '',
    baseMarkup: '',
    priceMarkup: '',
    orderDiscount: '',
    supplierMarkups: 0,
    excludedFromSearch: {
      brands: 0,
      productGroups: 0,
    },
    paymentTypes: 0,
  });

  const handleAddProfile = () => {
    setIsAddProfileDialogOpen(true);
  };

  const handleSaveNewProfile = () => {
    if (newProfile.name && newProfile.baseMarkup) {
      const profileToAdd: Profile = {
        id: Date.now().toString(),
        code: newProfile.code || Date.now().toString().slice(-7),
        name: newProfile.name || '',
        comment: newProfile.comment,
        baseMarkup: newProfile.baseMarkup || '0 %',
        priceMarkup: newProfile.priceMarkup,
        orderDiscount: newProfile.orderDiscount,
        supplierMarkups: newProfile.supplierMarkups || 0,
        excludedFromSearch: newProfile.excludedFromSearch || {
          brands: 0,
          productGroups: 0,
        },
        paymentTypes: newProfile.paymentTypes || 0,
      };

      setProfiles([...profiles, profileToAdd]);
      setNewProfile({
        code: '',
        name: '',
        comment: '',
        baseMarkup: '',
        priceMarkup: '',
        orderDiscount: '',
        supplierMarkups: 0,
        excludedFromSearch: {
          brands: 0,
          productGroups: 0,
        },
        paymentTypes: 0,
      });
      setIsAddProfileDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профили клиентов</CardTitle>
        <CardDescription>
          Управление профилями и наценками для разных групп клиентов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button onClick={handleAddProfile}>Добавить профиль</Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Наименование</TableHead>
                <TableHead>Комментарий</TableHead>
                <TableHead>Наценка базовая</TableHead>
                <TableHead>Наценка от стоимости товара</TableHead>
                <TableHead>Скидка от суммы заказа</TableHead>
                <TableHead>Наценки от поставщиков</TableHead>
                <TableHead colSpan={2}>Исключенные из поиска</TableHead>
                <TableHead>Типы платежей</TableHead>
                <TableHead>Управление</TableHead>
              </TableRow>
              <TableRow>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
                <TableHead>Бренды</TableHead>
                <TableHead>Группа товаров</TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.code}</TableCell>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>{profile.comment || ''}</TableCell>
                  <TableCell>{profile.baseMarkup}</TableCell>
                  <TableCell>{profile.priceMarkup || ''}</TableCell>
                  <TableCell>{profile.orderDiscount || ''}</TableCell>
                  <TableCell>
                    <Button variant="link" size="sm">
                      {profile.supplierMarkups} шт.
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" size="sm">
                      {profile.excludedFromSearch.brands} шт.
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" size="sm">
                      {profile.excludedFromSearch.productGroups} шт.
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" size="sm">
                      {profile.paymentTypes} шт.
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Редактировать
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog
          open={isAddProfileDialogOpen}
          onOpenChange={setIsAddProfileDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Добавить профиль</DialogTitle>
              <DialogDescription>
                Заполните информацию о профиле клиента
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-code">Код профиля</Label>
                  <Input
                    id="profile-code"
                    value={newProfile.code || ''}
                    onChange={(e) =>
                      setNewProfile({ ...newProfile, code: e.target.value })
                    }
                    placeholder="Код профиля (генерируется автоматически)"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-name">Наименование профиля</Label>
                  <Input
                    id="profile-name"
                    value={newProfile.name || ''}
                    onChange={(e) =>
                      setNewProfile({ ...newProfile, name: e.target.value })
                    }
                    placeholder="Наименование профиля"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="profile-comment">Комментарий</Label>
                <Textarea
                  id="profile-comment"
                  value={newProfile.comment || ''}
                  onChange={(e) =>
                    setNewProfile({ ...newProfile, comment: e.target.value })
                  }
                  placeholder="Комментарий к профилю"
                />
              </div>
              <div>
                <Label htmlFor="profile-markup">Наценка %</Label>
                <Input
                  id="profile-markup"
                  value={newProfile.baseMarkup || ''}
                  onChange={(e) =>
                    setNewProfile({ ...newProfile, baseMarkup: e.target.value })
                  }
                  placeholder="Например: 15 %"
                />
              </div>
              <div>
                <Label htmlFor="profile-order-discount">
                  Скидка от суммы заказа
                </Label>
                <Input
                  id="profile-order-discount"
                  value={newProfile.orderDiscount || ''}
                  onChange={(e) =>
                    setNewProfile({
                      ...newProfile,
                      orderDiscount: e.target.value,
                    })
                  }
                  placeholder="Например: 10000 ₽ - 5%"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddProfileDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleSaveNewProfile}>Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
