'use client';

import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';

interface Profile {
  id: string;
  code: string;
  name: string;
  comment?: string;
  baseMarkup: string;
  priceMarkup?: string;
  orderDiscount?: string;
}

export function ClientProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddProfileDialogOpen, setIsAddProfileDialogOpen] = useState(false);
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [newProfile, setNewProfile] = useState<Partial<Profile>>({
    code: '',
    name: '',
    comment: '',
    baseMarkup: '',
    priceMarkup: '',
    orderDiscount: '',
  });

  // Загрузка профилей при монтировании компонента
  useEffect(() => {
    fetchProfiles();
  }, []);

  // Функция для загрузки профилей с сервера
  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/client-profiles');

      if (!response.ok) {
        throw new Error('Ошибка при загрузке профилей');
      }

      const data = await response.json();
      setProfiles(data.profiles);
    } catch (error) {
      console.error('Ошибка при загрузке профилей:', error);
      toast.error('Не удалось загрузить профили клиентов');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для открытия диалога добавления профиля
  const handleAddProfile = () => {
    setNewProfile({
      code: '',
      name: '',
      comment: '',
      baseMarkup: '',
      priceMarkup: '',
      orderDiscount: '',
    });
    setIsAddProfileDialogOpen(true);
  };

  // Функция для открытия диалога редактирования профиля
  const handleEditProfile = (profile: Profile) => {
    setCurrentProfile(profile);
    setIsEditProfileDialogOpen(true);
  };

  // Функция для сохранения нового профиля
  const handleSaveNewProfile = async () => {
    if (!newProfile.name || !newProfile.baseMarkup) {
      toast.error('Название и базовая наценка обязательны');
      return;
    }

    try {
      const response = await fetch('/api/client-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfile),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при создании профиля');
      }

      toast.success('Профиль успешно создан');
      setIsAddProfileDialogOpen(false);
      fetchProfiles();
    } catch (error) {
      console.error('Ошибка при создании профиля:', error);
      toast.error((error as Error).message || 'Не удалось создать профиль');
    }
  };

  // Функция для обновления существующего профиля
  const handleUpdateProfile = async () => {
    if (!currentProfile || !currentProfile.name || !currentProfile.baseMarkup) {
      toast.error('Название и базовая наценка обязательны');
      return;
    }

    try {
      const response = await fetch(
        `/api/client-profiles/${currentProfile.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentProfile),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при обновлении профиля');
      }

      toast.success('Профиль успешно обновлен');
      setIsEditProfileDialogOpen(false);
      fetchProfiles();
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      toast.error((error as Error).message || 'Не удалось обновить профиль');
    }
  };

  // Функция для удаления профиля
  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот профиль?')) {
      return;
    }

    try {
      const response = await fetch(`/api/client-profiles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка при удалении профиля');
      }

      toast.success('Профиль успешно удален');
      fetchProfiles();
    } catch (error) {
      console.error('Ошибка при удалении профиля:', error);
      toast.error((error as Error).message || 'Не удалось удалить профиль');
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

        {isLoading ? (
          <div className="text-center py-8">Загрузка профилей...</div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-8">Профили не найдены</div>
        ) : (
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
                  <TableHead>Управление</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>{profile.code}</TableCell>
                    <TableCell>{profile.name}</TableCell>
                    <TableCell>{profile.comment || '-'}</TableCell>
                    <TableCell>{profile.baseMarkup}</TableCell>
                    <TableCell>{profile.priceMarkup || '-'}</TableCell>
                    <TableCell>{profile.orderDiscount || '-'}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProfile(profile)}
                      >
                        Редактировать
                      </Button>
                      {profile.name !== 'Розничный' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProfile(profile.id)}
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
        )}

        {/* Диалог добавления профиля */}
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
                <Label htmlFor="profile-price-markup">
                  Наценка от стоимости товара
                </Label>
                <Input
                  id="profile-price-markup"
                  value={newProfile.priceMarkup || ''}
                  onChange={(e) =>
                    setNewProfile({
                      ...newProfile,
                      priceMarkup: e.target.value,
                    })
                  }
                  placeholder="Наценка в зависимости от стоимости товара"
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

        {/* Диалог редактирования профиля */}
        <Dialog
          open={isEditProfileDialogOpen}
          onOpenChange={setIsEditProfileDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Редактировать профиль</DialogTitle>
              <DialogDescription>
                Измените информацию о профиле клиента
              </DialogDescription>
            </DialogHeader>
            {currentProfile && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-profile-code">Код профиля</Label>
                    <Input
                      id="edit-profile-code"
                      value={currentProfile.code || ''}
                      onChange={(e) =>
                        setCurrentProfile({
                          ...currentProfile,
                          code: e.target.value,
                        })
                      }
                      placeholder="Код профиля"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-profile-name">
                      Наименование профиля
                    </Label>
                    <Input
                      id="edit-profile-name"
                      value={currentProfile.name || ''}
                      onChange={(e) =>
                        setCurrentProfile({
                          ...currentProfile,
                          name: e.target.value,
                        })
                      }
                      placeholder="Наименование профиля"
                      disabled={currentProfile.name === 'Розничный'}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-profile-comment">Комментарий</Label>
                  <Textarea
                    id="edit-profile-comment"
                    value={currentProfile.comment || ''}
                    onChange={(e) =>
                      setCurrentProfile({
                        ...currentProfile,
                        comment: e.target.value,
                      })
                    }
                    placeholder="Комментарий к профилю"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-profile-markup">Наценка %</Label>
                  <Input
                    id="edit-profile-markup"
                    value={currentProfile.baseMarkup || ''}
                    onChange={(e) =>
                      setCurrentProfile({
                        ...currentProfile,
                        baseMarkup: e.target.value,
                      })
                    }
                    placeholder="Например: 15 %"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-profile-price-markup">
                    Наценка от стоимости товара
                  </Label>
                  <Input
                    id="edit-profile-price-markup"
                    value={currentProfile.priceMarkup || ''}
                    onChange={(e) =>
                      setCurrentProfile({
                        ...currentProfile,
                        priceMarkup: e.target.value,
                      })
                    }
                    placeholder="Наценка в зависимости от стоимости товара"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-profile-order-discount">
                    Скидка от суммы заказа
                  </Label>
                  <Input
                    id="edit-profile-order-discount"
                    value={currentProfile.orderDiscount || ''}
                    onChange={(e) =>
                      setCurrentProfile({
                        ...currentProfile,
                        orderDiscount: e.target.value,
                      })
                    }
                    placeholder="Например: 10000 ₽ - 5%"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditProfileDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleUpdateProfile}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
