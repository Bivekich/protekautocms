'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import { ProductFormData } from './ProductForm';
import CategoryTreeView, { Category } from './CategoryTreeView';
import ProductHistoryDialog from './ProductHistoryDialog';

type ProductFormSettingsProps = {
  data: ProductFormData;
  categories: Category[];
  onChange: (data: Partial<ProductFormData>) => void;
  initialCategoryId?: string | null;
};

export default function ProductFormSettings({
  data,
  categories,
  onChange,
  initialCategoryId,
}: ProductFormSettingsProps) {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  // Обработчик изменения полей
  const handleChange = (
    field: keyof ProductFormData,
    value: boolean | number | string | string[]
  ) => {
    onChange({ [field]: value });
  };

  // Обработчик изменения категорий
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategoryIds = checked
      ? [...data.categoryIds, categoryId]
      : data.categoryIds.filter((id: string) => id !== categoryId);

    handleChange('categoryIds', newCategoryIds);
  };

  // Получение имени категории по ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Неизвестная категория';
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Видимость товара */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки отображения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="visible" className="font-medium">
                Показывать на сайте
              </Label>
              <p className="text-sm text-gray-500">
                Если выключено, товар не будет отображаться на сайте
              </p>
            </div>
            <Switch
              id="visible"
              checked={data.visible}
              onCheckedChange={(checked) => handleChange('visible', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="applyDiscounts" className="font-medium">
                Применять скидки
              </Label>
              <p className="text-sm text-gray-500">
                Если выключено, товар не будет участвовать в акциях и скидках
              </p>
            </div>
            <Switch
              id="applyDiscounts"
              checked={data.applyDiscounts}
              onCheckedChange={(checked) =>
                handleChange('applyDiscounts', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Категория */}
      <Card>
        <CardHeader>
          <CardTitle>Категория</CardTitle>
        </CardHeader>
        <CardContent>
          {data.categoryIds.length > 0 ? (
            <div className="space-y-2">
              {data.categoryIds.map((categoryId: string) => (
                <div
                  key={categoryId}
                  className="flex items-center justify-between"
                >
                  <span>{getCategoryName(categoryId)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCategoryChange(categoryId, false)}
                    className="h-8 px-2 text-red-600"
                  >
                    Удалить
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setShowCategoryDialog(true)}
              >
                Изменить категории
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCategoryDialog(true)}
            >
              Выбрать категории
            </Button>
          )}

          <Dialog
            open={showCategoryDialog}
            onOpenChange={setShowCategoryDialog}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Выбор категории товара</DialogTitle>
              </DialogHeader>

              <CategoryTreeView
                categories={categories}
                selectedCategoryIds={data.categoryIds}
                onSelectCategory={handleCategoryChange}
                multiSelect={false}
                initialExpandedCategoryId={
                  initialCategoryId || data.categoryIds[0] || undefined
                }
              />

              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowCategoryDialog(false)}>
                  Готово
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Единицы измерения и остаток */}
      <Card>
        <CardHeader>
          <CardTitle>Единицы измерения и остаток</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="unit">Единицы измерения</Label>
            <Select
              value={data.unit}
              onValueChange={(value) => handleChange('unit', value)}
            >
              <SelectTrigger id="unit">
                <SelectValue placeholder="Выберите единицу измерения" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="шт">Штука</SelectItem>
                <SelectItem value="кг">Килограмм</SelectItem>
                <SelectItem value="л">Литр</SelectItem>
                <SelectItem value="м">Метр</SelectItem>
                <SelectItem value="м2">Квадратный метр</SelectItem>
                <SelectItem value="м3">Кубический метр</SelectItem>
                <SelectItem value="компл">Комплект</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="stock">Остаток</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={data.stock}
              onChange={(e) => {
                // Парсим значение как целое число с проверкой на NaN
                const rawValue =
                  e.target.value === '' ? 0 : parseInt(e.target.value);
                const value = isNaN(rawValue) ? 0 : Math.floor(rawValue);
                handleChange('stock', value);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info size={16} className="mr-2" />
            Информация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Дата создания:</span>
              <span>{formatDate(new Date())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Последнее изменение:</span>
              <span>{formatDate(new Date())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Создал:</span>
              <span>Администратор</span>
            </div>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600"
              onClick={() => setShowHistoryDialog(true)}
            >
              Показать историю изменений
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Диалог истории изменений */}
      {data.id && (
        <ProductHistoryDialog
          open={showHistoryDialog}
          onOpenChange={setShowHistoryDialog}
          productId={data.id}
        />
      )}
    </div>
  );
}
