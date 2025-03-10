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

interface Requisite {
  id: string;
  legalEntityName: string;
  name: string;
  checkingAccount: string;
  bankName: string;
  bik: string;
  correspondentAccount: string;
}

interface ClientRequisitesProps {
  requisites?: Requisite[];
  legalEntities?: { id: string; name: string }[];
}

export function ClientRequisites({
  requisites: initialRequisites,
  legalEntities = [
    { id: '1', name: 'ООО «Рога и копыта»' },
    { id: '2', name: 'ООО «Копыта и рога»' },
  ],
}: ClientRequisitesProps) {
  const [requisites, setRequisites] = useState<Requisite[]>(
    initialRequisites || [
      {
        id: '1',
        legalEntityName: 'ООО «Рога и копыта»',
        name: 'Основной',
        checkingAccount: '322359458429',
        bankName: 'ПАО СБер',
        bik: '3443545',
        correspondentAccount: '332525235241',
      },
      {
        id: '2',
        legalEntityName: 'ООО «Рога и копыта»',
        name: 'Для переплат',
        checkingAccount: '522359458429',
        bankName: 'ПАО Альфа-Банк',
        bik: '4443545',
        correspondentAccount: '732525235241',
      },
    ]
  );

  const [isAddRequisiteDialogOpen, setIsAddRequisiteDialogOpen] =
    useState(false);
  const [newRequisite, setNewRequisite] = useState<Partial<Requisite>>({
    legalEntityName: '',
    name: '',
    checkingAccount: '',
    bankName: '',
    bik: '',
    correspondentAccount: '',
  });

  const handleAddRequisite = () => {
    setIsAddRequisiteDialogOpen(true);
  };

  const handleSaveNewRequisite = () => {
    if (
      newRequisite.legalEntityName &&
      newRequisite.name &&
      newRequisite.checkingAccount
    ) {
      const requisiteToAdd: Requisite = {
        id: Date.now().toString(),
        legalEntityName: newRequisite.legalEntityName || '',
        name: newRequisite.name || '',
        checkingAccount: newRequisite.checkingAccount || '',
        bankName: newRequisite.bankName || '',
        bik: newRequisite.bik || '',
        correspondentAccount: newRequisite.correspondentAccount || '',
      };

      setRequisites([...requisites, requisiteToAdd]);
      setNewRequisite({
        legalEntityName: '',
        name: '',
        checkingAccount: '',
        bankName: '',
        bik: '',
        correspondentAccount: '',
      });
      setIsAddRequisiteDialogOpen(false);
    }
  };

  const handleEditRequisite = (id: string) => {
    console.log('Редактирование реквизита с ID:', id);
    // Здесь будет логика редактирования реквизита
  };

  const handleDeleteRequisite = (id: string) => {
    setRequisites(requisites.filter((requisite) => requisite.id !== id));
  };

  const handleBikChange = (bik: string) => {
    setNewRequisite({ ...newRequisite, bik });

    // Имитация автоматического заполнения данных по БИК
    if (bik.length > 5) {
      if (bik === '3443545') {
        setNewRequisite({
          ...newRequisite,
          bik,
          bankName: 'ПАО СБер',
          correspondentAccount: '332525235241',
        });
      } else if (bik === '4443545') {
        setNewRequisite({
          ...newRequisite,
          bik,
          bankName: 'ПАО Альфа-Банк',
          correspondentAccount: '732525235241',
        });
      }
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Реквизиты</h3>
            <Button onClick={handleAddRequisite}>Добавить реквизиты</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Наименование ЮрЛица</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Расчетный счет</TableHead>
                  <TableHead>Наименование Банка</TableHead>
                  <TableHead>БИК</TableHead>
                  <TableHead>к/с</TableHead>
                  <TableHead>Редактировать</TableHead>
                  <TableHead>Удалить</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requisites.map((requisite) => (
                  <TableRow key={requisite.id}>
                    <TableCell>{requisite.legalEntityName}</TableCell>
                    <TableCell>{requisite.name}</TableCell>
                    <TableCell>{requisite.checkingAccount}</TableCell>
                    <TableCell>{requisite.bankName}</TableCell>
                    <TableCell>{requisite.bik}</TableCell>
                    <TableCell>{requisite.correspondentAccount}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRequisite(requisite.id)}
                      >
                        Редактировать
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRequisite(requisite.id)}
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
            open={isAddRequisiteDialogOpen}
            onOpenChange={setIsAddRequisiteDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Добавить реквизиты</DialogTitle>
                <DialogDescription>
                  Заполните информацию о реквизитах
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="legal-entity-name">Наименование ЮрЛица</Label>
                  <Select
                    value={newRequisite.legalEntityName}
                    onValueChange={(value) =>
                      setNewRequisite({
                        ...newRequisite,
                        legalEntityName: value,
                      })
                    }
                  >
                    <SelectTrigger id="legal-entity-name">
                      <SelectValue placeholder="Выберите юрлицо" />
                    </SelectTrigger>
                    <SelectContent>
                      {legalEntities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.name}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="requisite-name">Название</Label>
                  <Input
                    id="requisite-name"
                    value={newRequisite.name || ''}
                    onChange={(e) =>
                      setNewRequisite({ ...newRequisite, name: e.target.value })
                    }
                    placeholder="Например: Основной"
                  />
                </div>
                <div>
                  <Label htmlFor="checking-account">Расчетный счет</Label>
                  <Input
                    id="checking-account"
                    value={newRequisite.checkingAccount || ''}
                    onChange={(e) =>
                      setNewRequisite({
                        ...newRequisite,
                        checkingAccount: e.target.value,
                      })
                    }
                    placeholder="Расчетный счет"
                  />
                </div>
                <div>
                  <Label htmlFor="bik">БИК</Label>
                  <Input
                    id="bik"
                    value={newRequisite.bik || ''}
                    onChange={(e) => handleBikChange(e.target.value)}
                    placeholder="БИК"
                  />
                </div>
                <div>
                  <Label htmlFor="bank-name">Наименование Банка</Label>
                  <Input
                    id="bank-name"
                    value={newRequisite.bankName || ''}
                    onChange={(e) =>
                      setNewRequisite({
                        ...newRequisite,
                        bankName: e.target.value,
                      })
                    }
                    placeholder="Наименование Банка"
                    disabled={!!newRequisite.bik && newRequisite.bik.length > 5}
                  />
                </div>
                <div>
                  <Label htmlFor="correspondent-account">
                    Корреспондентский счет банка (к/с)
                  </Label>
                  <Input
                    id="correspondent-account"
                    value={newRequisite.correspondentAccount || ''}
                    onChange={(e) =>
                      setNewRequisite({
                        ...newRequisite,
                        correspondentAccount: e.target.value,
                      })
                    }
                    placeholder="Корреспондентский счет"
                    disabled={!!newRequisite.bik && newRequisite.bik.length > 5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddRequisiteDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button onClick={handleSaveNewRequisite}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
