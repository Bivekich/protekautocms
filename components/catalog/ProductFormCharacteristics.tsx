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
                  aria-label="Редактировать характеристику"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(characteristic.id)}
                  className="h-6 w-6 p-0 text-red-600"
                  aria-label="Удалить характеристику"
                >
                  <Trash size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-md border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2 text-sm">
            У товара пока нет характеристик
          </p>
          <Button
            onClick={handleAddCharacteristic}
            variant="outline"
            size="sm"
            className="text-xs py-1 h-auto"
          >
            <Plus size={12} className="mr-1" />
            Создать первую характеристику
          </Button>
        </div>
      )}

      {characteristics.length > 0 && (
        <Button
          onClick={handleAddCharacteristic}
          className="w-full h-8 text-xs mt-1"
        >
          <Plus size={14} className="mr-1" />
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
