'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash, Edit, X } from 'lucide-react';
import { ProductOption } from './ProductForm';

type ProductFormOptionsProps = {
  options: ProductOption[];
  onAdd: (option: ProductOption) => void;
  onEdit: (option: ProductOption) => void;
  onRemove: (optionId: string) => void;
};

export default function ProductFormOptions({
  options,
  onAdd,
  onEdit,
  onRemove,
}: ProductFormOptionsProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductOption>({
    id: '',
    name: '',
    values: [],
    type: 'single',
  });

  // Открытие диалога для добавления опции
  const handleAddOption = () => {
    setEditingOptionId(null);
    setFormData({
      id: `opt-${Date.now()}`,
      name: '',
      values: [],
      type: 'single',
    });
    setShowDialog(true);
  };

  // Открытие диалога для редактирования опции
  const handleEditOption = (option: ProductOption) => {
    setEditingOptionId(option.id);
    setFormData({ ...option });
    setShowDialog(true);
  };

  // Обработчик изменения имени опции
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
  };

  // Обработчик изменения типа выбора
  const handleChoiceTypeChange = (type: 'single' | 'multiple') => {
    setFormData((prev) => ({ ...prev, type }));
  };

  // Обработчик добавления значения опции
  const handleAddValue = () => {
    setFormData((prev) => ({
      ...prev,
      values: [
        ...prev.values,
        { id: `val-${Date.now()}`, value: '', price: 0 },
      ],
    }));
  };

  // Обработчик изменения значения опции
  const handleValueChange = (
    index: number,
    field: 'value' | 'price',
    value: string | number
  ) => {
    setFormData((prev) => {
      const newValues = [...prev.values];
      newValues[index] = {
        ...newValues[index],
        [field]: value,
      };
      return { ...prev, values: newValues };
    });
  };

  // Обработчик удаления значения опции
  const handleRemoveValue = (index: number) => {
    setFormData((prev) => {
      const newValues = [...prev.values];
      newValues.splice(index, 1);
      return { ...prev, values: newValues };
    });
  };

  // Обработчик сохранения опции
  const handleSaveOption = () => {
    if (editingOptionId) {
      onEdit(formData);
    } else {
      onAdd(formData);
    }
    setShowDialog(false);
  };

  return (
    <div className="space-y-4">
      {options.length > 0 ? (
        <div className="space-y-4">
          {options.map((option) => (
            <Card key={option.id}>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{option.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditOption(option)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(option.id)}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 mb-2">
                  Тип выбора:{' '}
                  {option.type === 'multiple' ? 'Множественный' : 'Одиночный'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {option.values.map((value) => (
                    <div
                      key={value.id}
                      className="flex justify-between items-center border rounded-md p-2"
                    >
                      <span>{value.value}</span>
                      {value.price > 0 && (
                        <span className="text-sm text-gray-600">
                          +{value.price} ₽
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4">У товара пока нет опций</p>
        </div>
      )}

      <Button onClick={handleAddOption} className="w-full">
        <Plus size={16} className="mr-2" />
        Добавить опцию
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingOptionId ? 'Редактирование опции' : 'Добавление опции'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="option-name">Название опции</Label>
              <Input
                id="option-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Например: Цвет, Размер, Материал"
              />
            </div>

            <div>
              <Label className="mb-2 block">Режим использования</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) =>
                  handleChoiceTypeChange(value as 'single' | 'multiple')
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="choice-single" />
                  <Label htmlFor="choice-single">Одиночный выбор</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multiple" id="choice-multiple" />
                  <Label htmlFor="choice-multiple">Множественный выбор</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Значения опции</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddValue}
                >
                  <Plus size={14} className="mr-1" />
                  Добавить значение
                </Button>
              </div>

              {formData.values.length > 0 ? (
                <div className="space-y-2">
                  {formData.values.map((value, index) => (
                    <div key={value.id} className="flex items-center space-x-2">
                      <Input
                        value={value.value}
                        onChange={(e) =>
                          handleValueChange(index, 'value', e.target.value)
                        }
                        placeholder="Значение"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={value.price || ''}
                        onChange={(e) =>
                          handleValueChange(
                            index,
                            'price',
                            e.target.value ? parseFloat(e.target.value) : 0
                          )
                        }
                        placeholder="Цена"
                        className="w-24"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveValue(index)}
                        className="h-8 w-8 p-0 text-red-600"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">
                    Добавьте хотя бы одно значение для опции
                  </p>
                </div>
              )}
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
              onClick={handleSaveOption}
              disabled={!formData.name || formData.values.length === 0}
            >
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
