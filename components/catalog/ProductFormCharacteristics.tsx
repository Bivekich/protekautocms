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
import { ProductCharacteristic } from './ProductForm';

type ProductFormCharacteristicsProps = {
  characteristics: ProductCharacteristic[];
  onAdd: (characteristic: ProductCharacteristic) => void;
  onEdit: (characteristic: ProductCharacteristic) => void;
  onRemove: (characteristicId: string) => void;
};

export default function ProductFormCharacteristics({
  characteristics,
  onAdd,
  onEdit,
  onRemove,
}: ProductFormCharacteristicsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<ProductCharacteristic>({
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
  const handleEditCharacteristic = (characteristic: ProductCharacteristic) => {
    setEditingCharId(characteristic.id);
    setFormData({ ...characteristic });
    setSearchQuery(characteristic.name);
    setShowDialog(true);
  };

  // Обработчик выбора предопределенной характеристики
  const handleSelectPredefined = (name: string) => {
    setFormData((prev: ProductCharacteristic) => ({ ...prev, name }));
    setSearchQuery(name);
  };

  // Обработчик сохранения характеристики
  const handleSaveCharacteristic = () => {
    if (editingCharId) {
      onEdit(formData);
    } else {
      onAdd(formData);
    }
    setShowDialog(false);
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
                      aria-label="Редактировать характеристику"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(characteristic.id)}
                      className="h-8 w-8 p-0 text-red-600"
                      aria-label="Удалить характеристику"
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
        <div className="text-center p-8 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">У товара пока нет характеристик</p>
          <p className="text-sm text-gray-400 mb-4">
            Характеристики помогают покупателям узнать больше о товаре и
            улучшают поиск
          </p>
          <Button onClick={handleAddCharacteristic} variant="outline" size="sm">
            <Plus size={16} className="mr-2" />
            Создать первую характеристику
          </Button>
        </div>
      )}

      {characteristics.length > 0 && (
        <Button onClick={handleAddCharacteristic} className="w-full">
          <Plus size={16} className="mr-2" />
          Добавить характеристику
        </Button>
      )}

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
              <Label htmlFor="char-name">Название характеристики</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="char-name"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setFormData((prev: ProductCharacteristic) => ({
                      ...prev,
                      name: e.target.value,
                    }));
                  }}
                  placeholder="Введите или выберите название"
                  className="pl-8"
                />
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Введите название новой характеристики или выберите из
                существующих вариантов
              </p>

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
                onChange={(e) =>
                  setFormData((prev: ProductCharacteristic) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                placeholder="Введите значение характеристики"
              />
              <p className="text-xs text-gray-500 mt-1">
                Укажите значение для данной характеристики, например: &ldquo;100
                г&rdquo;, &ldquo;Красный&rdquo;, &ldquo;Стекло&rdquo;
              </p>
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
              disabled={!formData.name.trim() || !formData.value.trim()}
            >
              {editingCharId
                ? 'Сохранить изменения'
                : 'Добавить характеристику'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
