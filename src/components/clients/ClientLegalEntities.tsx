'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LegalEntity {
  id: string;
  shortName: string;
  inn: string;
  responsiblePhone: string;
  responsiblePosition: string;
  responsibleName: string;
  vatPercent: string;
  fullName?: string;
  form?: string;
  legalAddress?: string;
  actualAddress?: string;
  taxSystem?: string;
  accountant?: string;
  signer?: string;
  kpp?: string;
  ogrn?: string;
}

interface ClientLegalEntitiesProps {
  legalEntities?: LegalEntity[];
}

export function ClientLegalEntities({
  legalEntities: initialLegalEntities,
}: ClientLegalEntitiesProps) {
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>(
    initialLegalEntities || [
      {
        id: '1',
        shortName: 'ООО «Рога и копыта»',
        inn: '34242564',
        responsiblePhone: '79097975665',
        responsiblePosition: 'Генеральный директор',
        responsibleName: 'Иванов Иван Иванович',
        vatPercent: '21',
        fullName: 'Общество с ограниченной ответственностью «Рога и копыта»',
        form: 'ООО',
        legalAddress: 'г. Москва, ул. Примерная, д. 1',
        actualAddress: 'г. Москва, ул. Примерная, д. 1',
        taxSystem: 'ОСН',
        accountant: 'Петрова П.П.',
        signer: 'Иванов И.И.',
        kpp: '770101001',
        ogrn: '1234567890123',
      },
      {
        id: '2',
        shortName: 'ООО «Копыта и рога»',
        inn: '34242564',
        responsiblePhone: '79097975665',
        responsiblePosition: 'Уборщик',
        responsibleName: 'Петров Петр Петрович',
        vatPercent: '18',
      },
    ]
  );

  const [isAddLegalEntityDialogOpen, setIsAddLegalEntityDialogOpen] =
    useState(false);
  const [newLegalEntity, setNewLegalEntity] = useState<Partial<LegalEntity>>({
    shortName: '',
    inn: '',
    responsiblePhone: '',
    responsiblePosition: '',
    responsibleName: '',
    vatPercent: '',
    fullName: '',
    form: '',
    legalAddress: '',
    actualAddress: '',
    taxSystem: '',
    accountant: '',
    signer: '',
    kpp: '',
    ogrn: '',
  });

  const [selectedLegalEntity, setSelectedLegalEntity] =
    useState<LegalEntity | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const handleAddLegalEntity = () => {
    setIsAddLegalEntityDialogOpen(true);
  };

  const handleSaveNewLegalEntity = () => {
    if (newLegalEntity.shortName && newLegalEntity.inn) {
      const legalEntityToAdd: LegalEntity = {
        id: Date.now().toString(),
        shortName: newLegalEntity.shortName || '',
        inn: newLegalEntity.inn || '',
        responsiblePhone: newLegalEntity.responsiblePhone || '',
        responsiblePosition: newLegalEntity.responsiblePosition || '',
        responsibleName: newLegalEntity.responsibleName || '',
        vatPercent: newLegalEntity.vatPercent || '',
        fullName: newLegalEntity.fullName,
        form: newLegalEntity.form,
        legalAddress: newLegalEntity.legalAddress,
        actualAddress: newLegalEntity.actualAddress,
        taxSystem: newLegalEntity.taxSystem,
        accountant: newLegalEntity.accountant,
        signer: newLegalEntity.signer,
        kpp: newLegalEntity.kpp,
        ogrn: newLegalEntity.ogrn,
      };

      setLegalEntities([...legalEntities, legalEntityToAdd]);
      setNewLegalEntity({
        shortName: '',
        inn: '',
        responsiblePhone: '',
        responsiblePosition: '',
        responsibleName: '',
        vatPercent: '',
        fullName: '',
        form: '',
        legalAddress: '',
        actualAddress: '',
        taxSystem: '',
        accountant: '',
        signer: '',
        kpp: '',
        ogrn: '',
      });
      setIsAddLegalEntityDialogOpen(false);
    }
  };

  const handleViewDetails = (id: string) => {
    const legalEntity = legalEntities.find((entity) => entity.id === id);
    if (legalEntity) {
      setSelectedLegalEntity(legalEntity);
      setIsDetailsDialogOpen(true);
    }
  };

  const handleEditLegalEntity = (id: string) => {
    console.log('Редактирование юрлица с ID:', id);
    // Здесь будет логика редактирования юрлица
  };

  const handleDeleteLegalEntity = (id: string) => {
    setLegalEntities(legalEntities.filter((entity) => entity.id !== id));
  };

  const handleShortNameChange = (shortName: string) => {
    setNewLegalEntity({ ...newLegalEntity, shortName });

    // Имитация автоматического заполнения данных по названию
    if (shortName.includes('Рога')) {
      setNewLegalEntity({
        ...newLegalEntity,
        shortName,
        fullName: 'Общество с ограниченной ответственностью «Рога и копыта»',
        form: 'ООО',
        inn: '34242564',
        kpp: '770101001',
        ogrn: '1234567890123',
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Юридические лица</h3>
            <Button onClick={handleAddLegalEntity}>Добавить юрлицо</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Короткое наименование</TableHead>
                  <TableHead>ИНН</TableHead>
                  <TableHead>Телефон ответственного</TableHead>
                  <TableHead>Должность ответственного</TableHead>
                  <TableHead>ФИО ответственного</TableHead>
                  <TableHead>НДС в процентах</TableHead>
                  <TableHead>Редактировать</TableHead>
                  <TableHead>Удалить</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {legalEntities.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => handleViewDetails(entity.id)}
                      >
                        {entity.shortName}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => handleViewDetails(entity.id)}
                      >
                        {entity.inn}
                      </Button>
                    </TableCell>
                    <TableCell>{entity.responsiblePhone}</TableCell>
                    <TableCell>{entity.responsiblePosition}</TableCell>
                    <TableCell>{entity.responsibleName}</TableCell>
                    <TableCell>{entity.vatPercent}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLegalEntity(entity.id)}
                      >
                        Редактировать
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteLegalEntity(entity.id)}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Dialog
            open={isAddLegalEntityDialogOpen}
            onOpenChange={setIsAddLegalEntityDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Добавить юридическое лицо</DialogTitle>
                <DialogDescription>
                  Заполните информацию о юридическом лице
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="short-name">Короткое наименование</Label>
                  <Input
                    id="short-name"
                    value={newLegalEntity.shortName || ''}
                    onChange={(e) => handleShortNameChange(e.target.value)}
                    placeholder="Например: ООО «Рога и копыта»"
                  />
                </div>
                <div>
                  <Label htmlFor="full-name">Полное наименование</Label>
                  <Input
                    id="full-name"
                    value={newLegalEntity.fullName || ''}
                    onChange={(e) =>
                      setNewLegalEntity({
                        ...newLegalEntity,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="Полное наименование юрлица"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="form">Форма</Label>
                    <Select
                      value={newLegalEntity.form}
                      onValueChange={(value) =>
                        setNewLegalEntity({ ...newLegalEntity, form: value })
                      }
                    >
                      <SelectTrigger id="form">
                        <SelectValue placeholder="Выберите форму" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ООО">ООО</SelectItem>
                        <SelectItem value="ИП">ИП</SelectItem>
                        <SelectItem value="АО">АО</SelectItem>
                        <SelectItem value="ПАО">ПАО</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tax-system">Система налогообложения</Label>
                    <Select
                      value={newLegalEntity.taxSystem}
                      onValueChange={(value) =>
                        setNewLegalEntity({
                          ...newLegalEntity,
                          taxSystem: value,
                        })
                      }
                    >
                      <SelectTrigger id="tax-system">
                        <SelectValue placeholder="Выберите систему" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ОСН">ОСН</SelectItem>
                        <SelectItem value="УСН">УСН</SelectItem>
                        <SelectItem value="ЕНВД">ЕНВД</SelectItem>
                        <SelectItem value="ПСН">ПСН</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="legal-address">Юридический адрес</Label>
                  <Input
                    id="legal-address"
                    value={newLegalEntity.legalAddress || ''}
                    onChange={(e) =>
                      setNewLegalEntity({
                        ...newLegalEntity,
                        legalAddress: e.target.value,
                      })
                    }
                    placeholder="Юридический адрес"
                  />
                </div>
                <div>
                  <Label htmlFor="actual-address">Фактический адрес</Label>
                  <Input
                    id="actual-address"
                    value={newLegalEntity.actualAddress || ''}
                    onChange={(e) =>
                      setNewLegalEntity({
                        ...newLegalEntity,
                        actualAddress: e.target.value,
                      })
                    }
                    placeholder="Фактический адрес"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsible-name">ФИО ответственного</Label>
                    <Input
                      id="responsible-name"
                      value={newLegalEntity.responsibleName || ''}
                      onChange={(e) =>
                        setNewLegalEntity({
                          ...newLegalEntity,
                          responsibleName: e.target.value,
                        })
                      }
                      placeholder="ФИО ответственного"
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsible-position">
                      Должность ответственного
                    </Label>
                    <Input
                      id="responsible-position"
                      value={newLegalEntity.responsiblePosition || ''}
                      onChange={(e) =>
                        setNewLegalEntity({
                          ...newLegalEntity,
                          responsiblePosition: e.target.value,
                        })
                      }
                      placeholder="Должность ответственного"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="responsible-phone">
                      Телефон ответственного
                    </Label>
                    <Input
                      id="responsible-phone"
                      value={newLegalEntity.responsiblePhone || ''}
                      onChange={(e) =>
                        setNewLegalEntity({
                          ...newLegalEntity,
                          responsiblePhone: e.target.value,
                        })
                      }
                      placeholder="Телефон ответственного"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountant">Бухгалтер</Label>
                    <Input
                      id="accountant"
                      value={newLegalEntity.accountant || ''}
                      onChange={(e) =>
                        setNewLegalEntity({
                          ...newLegalEntity,
                          accountant: e.target.value,
                        })
                      }
                      placeholder="ФИО бухгалтера"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="signer">Подписант</Label>
                  <Input
                    id="signer"
                    value={newLegalEntity.signer || ''}
                    onChange={(e) =>
                      setNewLegalEntity({
                        ...newLegalEntity,
                        signer: e.target.value,
                      })
                    }
                    placeholder="ФИО подписанта"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="kpp">КПП</Label>
                    <Input
                      id="kpp"
                      value={newLegalEntity.kpp || ''}
                      onChange={(e) =>
                        setNewLegalEntity({
                          ...newLegalEntity,
                          kpp: e.target.value,
                        })
                      }
                      placeholder="КПП"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ogrn">ОГРН</Label>
                    <Input
                      id="ogrn"
                      value={newLegalEntity.ogrn || ''}
                      onChange={(e) =>
                        setNewLegalEntity({
                          ...newLegalEntity,
                          ogrn: e.target.value,
                        })
                      }
                      placeholder="ОГРН"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inn">ИНН</Label>
                    <Input
                      id="inn"
                      value={newLegalEntity.inn || ''}
                      onChange={(e) =>
                        setNewLegalEntity({
                          ...newLegalEntity,
                          inn: e.target.value,
                        })
                      }
                      placeholder="ИНН"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="vat-percent">НДС в процентах</Label>
                  <Input
                    id="vat-percent"
                    type="number"
                    value={newLegalEntity.vatPercent || ''}
                    onChange={(e) =>
                      setNewLegalEntity({
                        ...newLegalEntity,
                        vatPercent: e.target.value,
                      })
                    }
                    placeholder="Процент НДС"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddLegalEntityDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button onClick={handleSaveNewLegalEntity}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {selectedLegalEntity && (
            <Dialog
              open={isDetailsDialogOpen}
              onOpenChange={setIsDetailsDialogOpen}
            >
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Информация о юридическом лице</DialogTitle>
                  <DialogDescription>
                    Подробная информация о {selectedLegalEntity.shortName}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Короткое наименование</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.shortName}
                      </div>
                    </div>
                    <div>
                      <Label>Полное наименование</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.fullName || 'Не указано'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Форма</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.form || 'Не указано'}
                      </div>
                    </div>
                    <div>
                      <Label>Система налогообложения</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.taxSystem || 'Не указано'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Юридический адрес</Label>
                    <div className="mt-1 font-medium">
                      {selectedLegalEntity.legalAddress || 'Не указано'}
                    </div>
                  </div>
                  <div>
                    <Label>Фактический адрес</Label>
                    <div className="mt-1 font-medium">
                      {selectedLegalEntity.actualAddress || 'Не указано'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ФИО ответственного</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.responsibleName}
                      </div>
                    </div>
                    <div>
                      <Label>Должность ответственного</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.responsiblePosition}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Телефон ответственного</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.responsiblePhone}
                      </div>
                    </div>
                    <div>
                      <Label>Бухгалтер</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.accountant || 'Не указано'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Подписант</Label>
                    <div className="mt-1 font-medium">
                      {selectedLegalEntity.signer || 'Не указано'}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>КПП</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.kpp || 'Не указано'}
                      </div>
                    </div>
                    <div>
                      <Label>ОГРН</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.ogrn || 'Не указано'}
                      </div>
                    </div>
                    <div>
                      <Label>ИНН</Label>
                      <div className="mt-1 font-medium">
                        {selectedLegalEntity.inn}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>НДС в процентах</Label>
                    <div className="mt-1 font-medium">
                      {selectedLegalEntity.vatPercent}%
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setIsDetailsDialogOpen(false)}>
                    Закрыть
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
