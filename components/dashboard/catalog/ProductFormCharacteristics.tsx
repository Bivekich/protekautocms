'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash, Edit, Search } from 'lucide-react';
import { ProductCharacteristic } from '@/types/catalog';

export type Characteristic = ProductCharacteristic;

export type ProductFormCharacteristicsProps = {
  characteristics: Characteristic[];
  onChange: (characteristics: Characteristic[]) => void;
};

export default function ProductFormCharacteristics({
  characteristics,
  onChange,
}: ProductFormCharacteristicsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Characteristic>({
    id: '',
    name: '',
    value: '',
  });

  // Предопределенные характеристики для автозаполнения
  const predefinedCharacteristics = [
    'Материал',
    'Цвет',
    'Вес',
    'Размер',
    'Страна производства',
    'Гарантия',
    'Бренд',
    'Модель',
  ];

  // Фильтрация предопределенных характеристик по поисковому запросу
  const filteredCharacteristics = predefinedCharacteristics.filter((char) =>
    char.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Открытие диалога для добавления характеристики
  const handleAddCharacteristic = () => {
    setEditingCharId(null);
    setFormData({
      id: `char-${Date.now()}`,
      name: '',
      value: '',
    });
    setSearchQuery('');
    setShowDialog(true);
  };

  // Открытие диалога для редактирования характеристики
  const handleEditCharacteristic = (characteristic: Characteristic) => {
    setEditingCharId(characteristic.id);
    setFormData({ ...characteristic });
    setSearchQuery(characteristic.name);
    setShowDialog(true);
  };

  // Обработчик выбора предопределенной характеристики
  const handleSelectPredefined = (name: string) => {
    setFormData((prev: Characteristic) => ({ ...prev, name }));
    setSearchQuery(name);
  };

  // Обработчик сохранения характеристики
  const handleSaveCharacteristic = () => {
    if (editingCharId) {
      onChange(
        characteristics.map((char) =>
          char.id === editingCharId ? formData : char
        )
      );
    } else {
      onChange([...characteristics, formData]);
    }
    setShowDialog(false);
  };

  // В функциях, где используются параметры prev
  const handleNameChange = (value: string) => {
    setFormData((prev: Characteristic) => ({ ...prev, name: value }));
  };

  const handleValueChange = (value: string) => {
    setFormData((prev: Characteristic) => ({ ...prev, value: value }));
  };

  return (
    <div className="space-y-4">
      {characteristics.length > 0 ? (
        <div className="space-y-4">
          {characteristics.map((characteristic) => (
            <Card key={characteristic.id}>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">
                    {characteristic.name}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCharacteristic(characteristic)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onChange(
                          characteristics.filter(
                            (c) => c.id !== characteristic.id
                          )
                        )
                      }
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{characteristic.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4">У товара пока нет характеристик</p>
        </div>
      )}

      <Button onClick={handleAddCharacteristic} className="w-full">
        <Plus size={16} className="mr-2" />
        Добавить характеристику
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCharId
                ? 'Редактирование характеристики'
                : 'Добавление характеристики'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="char-name">
                Найти или создать характеристику
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="char-name"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleNameChange(e.target.value);
                  }}
                  placeholder="Введите название характеристики"
                  className="pl-8"
                />
              </div>

              {searchQuery && filteredCharacteristics.length > 0 && (
                <div className="mt-1 border rounded-md max-h-40 overflow-y-auto">
                  {filteredCharacteristics.map((char) => (
                    <div
                      key={char}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectPredefined(char)}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="char-value">Значение</Label>
              <Input
                id="char-value"
                value={formData.value}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder="Введите значение характеристики"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleSaveCharacteristic}
              disabled={!formData.name || !formData.value}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
