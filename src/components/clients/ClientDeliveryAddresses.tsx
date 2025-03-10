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

interface DeliveryAddress {
  id: string;
  name: string;
  address: string;
  deliveryType: string;
  comment?: string;
}

interface ClientDeliveryAddressesProps {
  addresses?: DeliveryAddress[];
}

export function ClientDeliveryAddresses({
  addresses: initialAddresses,
}: ClientDeliveryAddressesProps) {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(
    initialAddresses || [
      {
        id: '1',
        name: 'Дом',
        address:
          'Калининградская область, Калининград, улица Понартская, 5, кв./офис 1, Подъезд 1, этаж 1',
        deliveryType: 'Курьер',
        comment: 'Код от домофона 456',
      },
      {
        id: '2',
        name: 'Офис',
        address:
          'Калининградская область, Калининград, улица Понартская, 5, кв./офис 1, Подъезд 1, этаж 1',
        deliveryType: 'Почта России (Почтовое отделение)',
      },
    ]
  );

  const [newAddress, setNewAddress] = useState<Partial<DeliveryAddress>>({
    name: '',
    address: '',
    deliveryType: '',
    comment: '',
  });

  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const handleAddAddress = () => {
    setIsAddingAddress(true);
  };

  const handleSaveNewAddress = () => {
    if (newAddress.name && newAddress.address && newAddress.deliveryType) {
      const addressToAdd: DeliveryAddress = {
        id: Date.now().toString(),
        name: newAddress.name,
        address: newAddress.address,
        deliveryType: newAddress.deliveryType,
        comment: newAddress.comment,
      };

      setAddresses([...addresses, addressToAdd]);
      setNewAddress({
        name: '',
        address: '',
        deliveryType: '',
        comment: '',
      });
      setIsAddingAddress(false);
    }
  };

  const handleCancelAddAddress = () => {
    setNewAddress({
      name: '',
      address: '',
      deliveryType: '',
      comment: '',
    });
    setIsAddingAddress(false);
  };

  const handleEditAddress = (id: string) => {
    console.log('Редактирование адреса с ID:', id);
    // Здесь будет логика редактирования адреса
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Адреса доставки</h3>
            <Button onClick={handleAddAddress}>Добавить адрес доставки</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Адрес</TableHead>
                  <TableHead>Вид доставки</TableHead>
                  <TableHead>Комментарий</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell>{address.name}</TableCell>
                    <TableCell>{address.address}</TableCell>
                    <TableCell>{address.deliveryType}</TableCell>
                    <TableCell>{address.comment || ''}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAddress(address.id)}
                      >
                        Редактировать
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {isAddingAddress && (
                  <TableRow>
                    <TableCell>
                      <Input
                        value={newAddress.name || ''}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, name: e.target.value })
                        }
                        placeholder="Название"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newAddress.address || ''}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            address: e.target.value,
                          })
                        }
                        placeholder="Адрес"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={newAddress.deliveryType}
                        onValueChange={(value) =>
                          setNewAddress({ ...newAddress, deliveryType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Вид доставки" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Курьер">Курьер</SelectItem>
                          <SelectItem value="Почта России (Почтовое отделение)">
                            Почта России
                          </SelectItem>
                          <SelectItem value="СДЭК">СДЭК</SelectItem>
                          <SelectItem value="Самовывоз">Самовывоз</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newAddress.comment || ''}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            comment: e.target.value,
                          })
                        }
                        placeholder="Комментарий"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveNewAddress}
                        >
                          Сохранить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelAddAddress}
                        >
                          Отмена
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
