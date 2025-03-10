'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

interface Contract {
  id: string;
  number: string;
  date: string;
  name: string;
  ourCompany: string;
  clientCompany?: string;
  balance: string;
  currency: string;
  isActive: boolean;
  isDefault: boolean;
  type: string;
  relation: string;
}

interface ClientContractsProps {
  contracts?: Contract[];
}

export function ClientContracts({
  contracts: initialContracts,
}: ClientContractsProps) {
  const [contracts, setContracts] = useState<Contract[]>(
    initialContracts || [
      {
        id: '1',
        number: '№9 от 18.11.2024',
        date: '18.11.2024',
        name: 'Основной договор',
        ourCompany: 'ООО Протек',
        clientCompany: 'ООО Рога и копыта',
        balance: '-10 000',
        currency: 'RUB',
        isActive: true,
        isDefault: true,
        type: 'Поставка',
        relation: 'Клиент',
      },
    ]
  );

  const [isAddContractDialogOpen, setIsAddContractDialogOpen] = useState(false);
  const [newContract, setNewContract] = useState<Partial<Contract>>({
    number: '',
    date: new Date().toISOString().split('T')[0],
    name: '',
    ourCompany: '',
    clientCompany: '',
    balance: '0',
    currency: 'RUB',
    isActive: true,
    isDefault: false,
    type: '',
    relation: '',
  });

  const [isPaymentDelay, setIsPaymentDelay] = useState(false);
  const [creditLimit, setCreditLimit] = useState('');
  const [delayDays, setDelayDays] = useState('');

  const handleAddContract = () => {
    setIsAddContractDialogOpen(true);
  };

  const handleSaveNewContract = () => {
    if (newContract.number && newContract.name && newContract.ourCompany) {
      const contractToAdd: Contract = {
        id: Date.now().toString(),
        number: newContract.number || '',
        date: newContract.date || new Date().toISOString().split('T')[0],
        name: newContract.name || '',
        ourCompany: newContract.ourCompany || '',
        clientCompany: newContract.clientCompany,
        balance: newContract.balance || '0',
        currency: newContract.currency || 'RUB',
        isActive: newContract.isActive || false,
        isDefault: newContract.isDefault || false,
        type: newContract.type || '',
        relation: newContract.relation || '',
      };

      setContracts([...contracts, contractToAdd]);
      setNewContract({
        number: '',
        date: new Date().toISOString().split('T')[0],
        name: '',
        ourCompany: '',
        clientCompany: '',
        balance: '0',
        currency: 'RUB',
        isActive: true,
        isDefault: false,
        type: '',
        relation: '',
      });
      setIsAddContractDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Договоры</h3>
            <Button onClick={handleAddContract}>Добавить договор</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Договор</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Наше ЮЛ</TableHead>
                  <TableHead>ЮЛ клиента</TableHead>
                  <TableHead>Баланс</TableHead>
                  <TableHead>Валюта</TableHead>
                  <TableHead>Активен</TableHead>
                  <TableHead>По умолчанию</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Отношение</TableHead>
                  <TableHead>Редактировать</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.id}</TableCell>
                    <TableCell>{contract.number}</TableCell>
                    <TableCell>{contract.name}</TableCell>
                    <TableCell>{contract.ourCompany}</TableCell>
                    <TableCell>{contract.clientCompany || ''}</TableCell>
                    <TableCell>{contract.balance}</TableCell>
                    <TableCell>{contract.currency}</TableCell>
                    <TableCell>{contract.isActive ? 'Да' : 'Нет'}</TableCell>
                    <TableCell>{contract.isDefault ? 'Да' : 'Нет'}</TableCell>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell>{contract.relation}</TableCell>
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
            open={isAddContractDialogOpen}
            onOpenChange={setIsAddContractDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Добавить договор</DialogTitle>
                <DialogDescription>
                  Заполните информацию о договоре
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contract-number">Номер договора</Label>
                    <Input
                      id="contract-number"
                      value={newContract.number || ''}
                      onChange={(e) =>
                        setNewContract({
                          ...newContract,
                          number: e.target.value,
                        })
                      }
                      placeholder="Номер договора"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract-date">Дата заключения</Label>
                    <Input
                      id="contract-date"
                      type="date"
                      value={newContract.date || ''}
                      onChange={(e) =>
                        setNewContract({ ...newContract, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contract-name">Название</Label>
                  <Input
                    id="contract-name"
                    value={newContract.name || ''}
                    onChange={(e) =>
                      setNewContract({ ...newContract, name: e.target.value })
                    }
                    placeholder="Название договора"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="our-company">Наше ЮЛ</Label>
                    <Select
                      value={newContract.ourCompany}
                      onValueChange={(value) =>
                        setNewContract({ ...newContract, ourCompany: value })
                      }
                    >
                      <SelectTrigger id="our-company">
                        <SelectValue placeholder="Выберите юрлицо" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ООО Протек">ООО Протек</SelectItem>
                        <SelectItem value="ИП Иванов">ИП Иванов</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="our-requisites">Наши реквизиты</Label>
                    <Select>
                      <SelectTrigger id="our-requisites">
                        <SelectValue placeholder="Выберите реквизиты" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="req1">Основные реквизиты</SelectItem>
                        <SelectItem value="req2">
                          Дополнительные реквизиты
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-company">ЮЛ контрагента</Label>
                    <Select
                      value={newContract.clientCompany}
                      onValueChange={(value) =>
                        setNewContract({ ...newContract, clientCompany: value })
                      }
                    >
                      <SelectTrigger id="client-company">
                        <SelectValue placeholder="Выберите юрлицо клиента" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ООО Рога и копыта">
                          ООО Рога и копыта
                        </SelectItem>
                        <SelectItem value="ООО Копыта и рога">
                          ООО Копыта и рога
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="client-requisites">
                      Реквизиты контрагента
                    </Label>
                    <Select>
                      <SelectTrigger id="client-requisites">
                        <SelectValue placeholder="Выберите реквизиты" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="req1">Основные реквизиты</SelectItem>
                        <SelectItem value="req2">Для переплат</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="contract-active"
                      checked={newContract.isActive}
                      onCheckedChange={(checked) =>
                        setNewContract({ ...newContract, isActive: checked })
                      }
                    />
                    <Label htmlFor="contract-active">Активен</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="contract-default"
                      checked={newContract.isDefault}
                      onCheckedChange={(checked) =>
                        setNewContract({ ...newContract, isDefault: checked })
                      }
                    />
                    <Label htmlFor="contract-default">По умолчанию</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contract-type">Тип</Label>
                    <Select
                      value={newContract.type}
                      onValueChange={(value) =>
                        setNewContract({ ...newContract, type: value })
                      }
                    >
                      <SelectTrigger id="contract-type">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Поставка">Поставка</SelectItem>
                        <SelectItem value="Услуги">Услуги</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contract-relation">Отношение</Label>
                    <Select
                      value={newContract.relation}
                      onValueChange={(value) =>
                        setNewContract({ ...newContract, relation: value })
                      }
                    >
                      <SelectTrigger id="contract-relation">
                        <SelectValue placeholder="Выберите отношение" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Клиент">Клиент</SelectItem>
                        <SelectItem value="Поставщик">Поставщик</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contract-currency">Валюта</Label>
                    <Input
                      id="contract-currency"
                      value={newContract.currency || 'RUB'}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract-balance">Баланс</Label>
                    <Input
                      id="contract-balance"
                      value={newContract.balance || '0'}
                      onChange={(e) =>
                        setNewContract({
                          ...newContract,
                          balance: e.target.value,
                        })
                      }
                      placeholder="Баланс"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="payment-delay"
                    checked={isPaymentDelay}
                    onCheckedChange={setIsPaymentDelay}
                  />
                  <Label htmlFor="payment-delay">Отсрочка платежа</Label>
                </div>

                {isPaymentDelay && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="credit-limit">Лимит кредита</Label>
                      <Input
                        id="credit-limit"
                        type="number"
                        value={creditLimit}
                        onChange={(e) => setCreditLimit(e.target.value)}
                        placeholder="Лимит кредита"
                      />
                    </div>
                    <div>
                      <Label htmlFor="delay-days">Отсрочка в днях</Label>
                      <Input
                        id="delay-days"
                        type="number"
                        value={delayDays}
                        onChange={(e) => setDelayDays(e.target.value)}
                        placeholder="Количество дней"
                      />
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddContractDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button onClick={handleSaveNewContract}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
