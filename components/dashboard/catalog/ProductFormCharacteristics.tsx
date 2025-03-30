'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="space-y-2">
      {characteristics.length > 0 ? (
        <div className="space-y-1">
          {characteristics.map((characteristic) => (
            <div
              key={characteristic.id}
              className="flex items-center justify-between py-1.5 px-3 rounded hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {characteristic.name}
                </span>
                <span className="text-xs text-gray-600">
                  {characteristic.value}
                </span>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditCharacteristic(characteristic)}
                  className="h-6 w-6 p-0"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange(
                      characteristics.filter((c) => c.id !== characteristic.id)
                    )
                  }
                  className="h-6 w-6 p-0 text-red-600"
                >
                  <Trash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-2 text-sm">
            У товара пока нет характеристик
          </p>
        </div>
      )}

      <Button onClick={handleAddCharacteristic} className="w-full h-8 text-xs">
        <Plus size={14} className="mr-1" />
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
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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
