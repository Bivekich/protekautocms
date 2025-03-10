'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface Car {
  id: string;
  name: string;
  model: string;
  vin: string;
  comment?: string;
}

interface ClientGarageProps {
  cars?: Car[];
}

export function ClientGarage({ cars: initialCars }: ClientGarageProps) {
  const [cars, setCars] = useState<Car[]>(
    initialCars || [
      {
        id: '1',
        name: 'Личное авто',
        model: '2020 LEXUS RX (_L2_) 300 AWD (AGL25_)',
        vin: 'JTJBAMCA002119623',
        comment: 'Рабочая',
      },
    ]
  );

  const [isAddCarDialogOpen, setIsAddCarDialogOpen] = useState(false);
  const [newCar, setNewCar] = useState<Partial<Car>>({
    name: '',
    model: '',
    vin: '',
    comment: '',
  });
  const [codeType, setCodeType] = useState<'VIN' | 'Frame'>('VIN');

  const handleAddCar = () => {
    setIsAddCarDialogOpen(true);
  };

  const handleSaveNewCar = () => {
    if (newCar.name && newCar.model && newCar.vin) {
      const carToAdd: Car = {
        id: Date.now().toString(),
        name: newCar.name,
        model: newCar.model,
        vin: newCar.vin,
        comment: newCar.comment,
      };

      setCars([...cars, carToAdd]);
      setNewCar({
        name: '',
        model: '',
        vin: '',
        comment: '',
      });
      setIsAddCarDialogOpen(false);
    }
  };

  const handleEditCar = (id: string) => {
    console.log('Редактирование автомобиля с ID:', id);
    // Здесь будет логика редактирования автомобиля
  };

  const handleDeleteCar = (id: string) => {
    setCars(cars.filter((car) => car.id !== id));
  };

  const handleVinChange = (vin: string) => {
    setNewCar({ ...newCar, vin });

    // Имитация автоматического заполнения данных по VIN
    if (vin.length > 10) {
      setNewCar({
        ...newCar,
        vin,
        model: '2022 LEXUS RX (_L2_) 350 AWD (AGL25_)',
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Гараж</h3>
            <Button onClick={handleAddCar}>Добавить авто</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Модель</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Комментарий</TableHead>
                  <TableHead>Редактировать</TableHead>
                  <TableHead>Удалить</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>{car.name}</TableCell>
                    <TableCell>{car.model}</TableCell>
                    <TableCell>{car.vin}</TableCell>
                    <TableCell>{car.comment || ''}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCar(car.id)}
                      >
                        Редактировать
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteCar(car.id)}
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
            open={isAddCarDialogOpen}
            onOpenChange={setIsAddCarDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Добавить автомобиль</DialogTitle>
                <DialogDescription>
                  Заполните информацию об автомобиле
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="car-name">Название</Label>
                  <Input
                    id="car-name"
                    value={newCar.name || ''}
                    onChange={(e) =>
                      setNewCar({ ...newCar, name: e.target.value })
                    }
                    placeholder="Например: Личное авто"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label>VIN/Frame</Label>
                  <div className="flex space-x-2">
                    <Select
                      value={codeType}
                      onValueChange={(value: 'VIN' | 'Frame') =>
                        setCodeType(value)
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Тип кода" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIN">VIN</SelectItem>
                        <SelectItem value="Frame">Frame</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={newCar.vin || ''}
                      onChange={(e) => handleVinChange(e.target.value)}
                      placeholder={`Введите ${codeType}`}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="car-model">Модель</Label>
                  <Input
                    id="car-model"
                    value={newCar.model || ''}
                    onChange={(e) =>
                      setNewCar({ ...newCar, model: e.target.value })
                    }
                    placeholder="Модель автомобиля"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="car-brand">Марка</Label>
                    <Input id="car-brand" placeholder="Марка автомобиля" />
                  </div>
                  <div>
                    <Label htmlFor="car-modification">Модификация</Label>
                    <Input id="car-modification" placeholder="Модификация" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="car-year">Год</Label>
                    <Input id="car-year" placeholder="Год выпуска" />
                  </div>
                  <div>
                    <Label htmlFor="car-plate">Гос. номер</Label>
                    <Input id="car-plate" placeholder="Гос. номер" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="car-mileage">Пробег</Label>
                  <Input
                    id="car-mileage"
                    placeholder="Пробег в км"
                    type="number"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="car-comment">Комментарий</Label>
                  <Textarea
                    id="car-comment"
                    value={newCar.comment || ''}
                    onChange={(e) =>
                      setNewCar({ ...newCar, comment: e.target.value })
                    }
                    placeholder="Комментарий"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddCarDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button onClick={handleSaveNewCar}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
