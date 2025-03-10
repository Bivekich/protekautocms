'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

// Типы для данных клиента
type ClientType = 'physical' | 'legal';

interface ClientGeneralSettingsProps {
  client?: {
    id: string;
    name: string;
    type: ClientType;
    email: string;
    phone: string;
    profileType: string;
    registrationStatus: string;
    registrationDate: string;
    manager?: string;
    legalType?: string;
    legalName?: string;
    inn?: string;
    kpp?: string;
    ogrn?: string;
    okpo?: string;
    legalAddress?: string;
    actualAddress?: string;
    checkingAccount?: string;
    bankName?: string;
    bik?: string;
    correspondentAccount?: string;
    balance?: string;
    comment?: string;
  };
}

export function ClientGeneralSettings({ client }: ClientGeneralSettingsProps) {
  const [clientData, setClientData] = useState(
    client || {
      id: '123456',
      name: 'Иванов Иван Иванович',
      type: 'physical' as ClientType,
      email: 'ivanov@example.com',
      phone: '+7 (900) 123-45-67',
      profileType: 'Розничный',
      registrationStatus: 'Подтвержден',
      registrationDate: '12.03.2024',
      manager: 'Петров П.П.',
      comment: 'Постоянный клиент',
    }
  );

  const [clientType, setClientType] = useState<ClientType>(
    clientData.type || 'physical'
  );

  const handleSave = () => {
    console.log('Сохранение данных клиента:', clientData);
    // Здесь будет логика сохранения данных
  };

  const handleDelete = () => {
    console.log('Удаление клиента:', clientData.id);
    // Здесь будет логика удаления клиента
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-id">Номер клиента</Label>
              <Input id="client-id" value={clientData.id} disabled />
            </div>
            <div>
              <Label htmlFor="client-name">Имя</Label>
              <Input
                id="client-name"
                value={clientData.name || ''}
                onChange={(e) =>
                  setClientData({ ...clientData, name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-type">Тип пользователя</Label>
              <Select
                value={clientType}
                onValueChange={(value: ClientType) => {
                  setClientType(value);
                  setClientData({ ...clientData, type: value });
                }}
              >
                <SelectTrigger id="client-type">
                  <SelectValue placeholder="Выберите тип пользователя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Физическое лицо</SelectItem>
                  <SelectItem value="legal">Юридическое лицо</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="client-email">E-mail</Label>
              <Input
                id="client-email"
                type="email"
                value={clientData.email || ''}
                onChange={(e) =>
                  setClientData({ ...clientData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-phone">Номер телефона</Label>
              <Input
                id="client-phone"
                value={clientData.phone || ''}
                onChange={(e) =>
                  setClientData({ ...clientData, phone: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="client-profile">Тип профиля</Label>
              <Select
                value={clientData.profileType}
                onValueChange={(value) =>
                  setClientData({ ...clientData, profileType: value })
                }
              >
                <SelectTrigger id="client-profile">
                  <SelectValue placeholder="Выберите тип профиля" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Розничный">Розничный</SelectItem>
                  <SelectItem value="Оптовый">Оптовый</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Уведомления</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch id="notifications-email" />
                <Label htmlFor="notifications-email">Email</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <Switch id="notifications-sms" />
                <Label htmlFor="notifications-sms">SMS</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="client-status">Статус регистрации</Label>
              <Select
                value={clientData.registrationStatus}
                onValueChange={(value) =>
                  setClientData({ ...clientData, registrationStatus: value })
                }
              >
                <SelectTrigger id="client-status">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Подтвержден">Подтвержден</SelectItem>
                  <SelectItem value="Не подтвержден">Не подтвержден</SelectItem>
                  <SelectItem value="Заблокирован">Заблокирован</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client-registration-date">Дата регистрации</Label>
              <Input
                id="client-registration-date"
                value={clientData.registrationDate}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="client-manager">Личный менеджер</Label>
              <Select
                value={clientData.manager}
                onValueChange={(value) =>
                  setClientData({ ...clientData, manager: value })
                }
              >
                <SelectTrigger id="client-manager">
                  <SelectValue placeholder="Выберите менеджера" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Петров П.П.">Петров П.П.</SelectItem>
                  <SelectItem value="Сидоров С.С.">Сидоров С.С.</SelectItem>
                  <SelectItem value="Иванов И.И.">Иванов И.И.</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {clientType === 'legal' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legal-type">Тип юрлица</Label>
                  <Input
                    id="legal-type"
                    value={clientData.legalType || ''}
                    onChange={(e) =>
                      setClientData({
                        ...clientData,
                        legalType: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="legal-name">Наименование юрлица</Label>
                  <Input
                    id="legal-name"
                    value={clientData.legalName || ''}
                    onChange={(e) =>
                      setClientData({
                        ...clientData,
                        legalName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inn">ИНН</Label>
                  <Input
                    id="inn"
                    value={clientData.inn || ''}
                    onChange={(e) =>
                      setClientData({ ...clientData, inn: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="kpp">КПП</Label>
                  <Input
                    id="kpp"
                    value={clientData.kpp || ''}
                    onChange={(e) =>
                      setClientData({ ...clientData, kpp: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ogrn">ОГРН</Label>
                  <Input
                    id="ogrn"
                    value={clientData.ogrn || ''}
                    onChange={(e) =>
                      setClientData({ ...clientData, ogrn: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="okpo">ОКПО</Label>
                  <Input
                    id="okpo"
                    value={clientData.okpo || ''}
                    onChange={(e) =>
                      setClientData({ ...clientData, okpo: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="legal-address">Юридический адрес</Label>
                  <Input
                    id="legal-address"
                    value={clientData.legalAddress || ''}
                    onChange={(e) =>
                      setClientData({
                        ...clientData,
                        legalAddress: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="actual-address">Фактический адрес</Label>
                  <Input
                    id="actual-address"
                    value={clientData.actualAddress || ''}
                    onChange={(e) =>
                      setClientData({
                        ...clientData,
                        actualAddress: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checking-account">Расчетный счет</Label>
                  <Input
                    id="checking-account"
                    value={clientData.checkingAccount || ''}
                    onChange={(e) =>
                      setClientData({
                        ...clientData,
                        checkingAccount: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bank-name">Название банка</Label>
                  <Input
                    id="bank-name"
                    value={clientData.bankName || ''}
                    onChange={(e) =>
                      setClientData({ ...clientData, bankName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bik">БИК</Label>
                  <Input
                    id="bik"
                    value={clientData.bik || ''}
                    onChange={(e) =>
                      setClientData({ ...clientData, bik: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="correspondent-account">Корр. счет</Label>
                  <Input
                    id="correspondent-account"
                    value={clientData.correspondentAccount || ''}
                    onChange={(e) =>
                      setClientData({
                        ...clientData,
                        correspondentAccount: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="balance">Сальдо</Label>
                  <Input
                    id="balance"
                    value={clientData.balance || ''}
                    onChange={(e) =>
                      setClientData({ ...clientData, balance: e.target.value })
                    }
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea
              id="comment"
              value={clientData.comment || ''}
              onChange={(e) =>
                setClientData({ ...clientData, comment: e.target.value })
              }
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="destructive" onClick={handleDelete}>
              Удалить пользователя
            </Button>
            <Button onClick={handleSave}>Сохранить изменения</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
