'use client';

import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Image from 'next/image';

// Типы для категорий
type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  hidden: boolean;
  includeSubcategoryProducts: boolean;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  imageUrl?: string;
};

// Пример данных категорий
const mockCategories: Category[] = [
  {
    id: 'all',
    name: 'Все товары',
    slug: 'all',
    parentId: null,
    hidden: false,
    includeSubcategoryProducts: true,
  },
  {
    id: 'cat1',
    name: 'Название категории',
    slug: 'category-1',
    parentId: null,
    hidden: false,
    includeSubcategoryProducts: true,
  },
  {
    id: 'cat2',
    name: 'Название категории 2',
    slug: 'category-2',
    parentId: null,
    hidden: false,
    includeSubcategoryProducts: false,
  },
  {
    id: 'subcat1',
    name: 'Подкатегория 1',
    slug: 'subcategory-1',
    parentId: 'cat1',
    hidden: false,
    includeSubcategoryProducts: true,
  },
];

type CategoryFormProps = {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string | null;
  parentId?: string | null;
};

export default function CategoryForm({
  isOpen,
  onClose,
  categoryId = null,
  parentId = null,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    slug: '',
    parentId: parentId,
    hidden: false,
    includeSubcategoryProducts: true,
    description: '',
    seoTitle: '',
    seoDescription: '',
    imageUrl: '',
  });

  const [isSlugEditing, setIsSlugEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Загрузка данных категории при редактировании
  useEffect(() => {
    if (categoryId) {
      const category = mockCategories.find((c) => c.id === categoryId);
      if (category) {
        setFormData({
          name: category.name,
          slug: category.slug,
          parentId: category.parentId,
          hidden: category.hidden,
          includeSubcategoryProducts: category.includeSubcategoryProducts,
          description: category.description || '',
          seoTitle: category.seoTitle || '',
          seoDescription: category.seoDescription || '',
          imageUrl: category.imageUrl || '',
        });

        if (category.imageUrl) {
          setPreviewUrl(category.imageUrl);
        }
      }
    } else {
      // Сброс формы при создании новой категории
      setFormData({
        name: '',
        slug: '',
        parentId: parentId,
        hidden: false,
        includeSubcategoryProducts: true,
        description: '',
        seoTitle: '',
        seoDescription: '',
        imageUrl: '',
      });
      setPreviewUrl(null);
    }
  }, [categoryId, parentId]);

  // Генерация slug из названия
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  // Обработчик изменения названия
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !isSlugEditing ? generateSlug(name) : prev.slug,
    }));
  };

  // Обработчик изменения slug
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      slug: e.target.value,
    }));
  };

  // Обработчик сохранения категории
  const handleSave = () => {
    console.log('Сохранение категории', {
      ...formData,
      id: categoryId || 'new-category',
    });
    // Здесь будет логика сохранения категории
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {categoryId ? 'Редактирование категории' : 'Добавление категории'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Введите название категории"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="slug">Адрес (Slug)</Label>
                {!isSlugEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSlugEditing(true)}
                  >
                    Редактировать
                  </Button>
                ) : null}
              </div>
              {isSlugEditing ? (
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="category-slug"
                />
              ) : (
                <div className="p-2 border rounded-md bg-gray-50 text-gray-700">
                  {formData.slug || 'Будет создан автоматически'}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="parent">Расположение</Label>
              <Select
                value={formData.parentId || ''}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    parentId: value === '' ? null : value,
                  }))
                }
              >
                <SelectTrigger id="parent">
                  <SelectValue placeholder="Выберите родительскую категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Корневая категория</SelectItem>
                  {mockCategories
                    .filter((c) => c.id !== 'all' && c.id !== categoryId)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hidden">Скрыть</Label>
              <Switch
                id="hidden"
                checked={formData.hidden}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, hidden: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="includeSubcategoryProducts">
                Содержит все товары из подкатегорий
              </Label>
              <Switch
                id="includeSubcategoryProducts"
                checked={formData.includeSubcategoryProducts}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    includeSubcategoryProducts: checked,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Введите описание категории"
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="seoTitle">Title (SEO)</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))
                }
                placeholder="Заголовок страницы для SEO"
              />
            </div>

            <div>
              <Label htmlFor="seoDescription">Мета-тег Description (SEO)</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seoDescription: e.target.value,
                  }))
                }
                placeholder="Описание страницы для SEO"
                rows={3}
              />
            </div>

            <div>
              <Label>Изображение</Label>
              {previewUrl ? (
                <div className="mt-2 relative">
                  <Image
                    src={previewUrl}
                    alt="Превью категории"
                    width={400}
                    height={160}
                    className="w-full h-40 object-cover rounded-md"
                  />
                </div>
              ) : (
                <div className="mt-2">
                  <Label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Нажмите для загрузки или перетащите файл
                      </p>
                    </div>
                  </Label>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
