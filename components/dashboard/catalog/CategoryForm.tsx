'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
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
import { Category, CategoryFormData } from '@/types/catalog';
import { categoriesApi } from '@/lib/catalog-api';
import { toast } from 'sonner';
import Image from 'next/image';

type CategoryFormProps = {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string | null;
  parentId?: string | null;
  onSave?: (category: Category) => void;
};

export default function CategoryForm({
  isOpen,
  onClose,
  categoryId = null,
  parentId = null,
  onSave,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Загрузка данных категории при редактировании
  useEffect(() => {
    const loadCategory = async () => {
      if (categoryId) {
        try {
          setIsLoading(true);
          const category = await categoriesApi.getById(categoryId);
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
        } catch (error) {
          console.error('Ошибка при загрузке категории:', error);
          toast.error('Не удалось загрузить данные категории');
        } finally {
          setIsLoading(false);
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
        setIsLoading(false);
      }
    };

    // Загрузка всех категорий для выбора родительской
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Ошибка при загрузке списка категорий:', error);
      }
    };

    if (isOpen) {
      loadCategory();
      loadCategories();
    }
  }, [categoryId, parentId, isOpen]);

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

  // Обработчик загрузки изображения
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Создание превью изображения
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        // Обновляем imageUrl в formData
        setFormData((prev) => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Обработчик удаления изображения
  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
    }));
  };

  // Обработчик сохранения категории
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Валидация формы
      if (!formData.name.trim()) {
        toast.error('Название категории обязательно');
        return;
      }

      if (!formData.slug || !formData.slug.trim()) {
        toast.error('URL категории обязателен');
        return;
      }

      let savedCategory: Category;

      if (categoryId) {
        // Обновление существующей категории
        savedCategory = await categoriesApi.update(categoryId, formData);
      } else {
        // Создание новой категории
        savedCategory = await categoriesApi.create({
          ...formData,
          slug: formData.slug || '',
          parentId: formData.parentId ?? null,
        });
      }

      // Вызываем колбэк onSave, если он предоставлен
      if (onSave) {
        onSave(savedCategory);
      }

      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении категории:', error);
      toast.error('Не удалось сохранить категорию');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {categoryId ? 'Редактирование категории' : 'Добавление категории'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
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
                  <Label htmlFor="parent">Родительская категория</Label>
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
                      <SelectItem value="">Нет (корневая категория)</SelectItem>
                      {categories
                        .filter((c) => c.id !== 'all' && c.id !== categoryId)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hidden"
                    checked={formData.hidden}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, hidden: checked }))
                    }
                  />
                  <Label htmlFor="hidden">Скрыть категорию</Label>
                </div>

                <div className="flex items-center space-x-2">
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
                  <Label htmlFor="includeSubcategoryProducts">
                    Включать товары из подкатегорий
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
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
                    placeholder="Описание категории"
                    className="h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="seoTitle">SEO заголовок</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        seoTitle: e.target.value,
                      }))
                    }
                    placeholder="SEO заголовок"
                  />
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO описание</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        seoDescription: e.target.value,
                      }))
                    }
                    placeholder="SEO описание"
                    className="h-24"
                  />
                </div>
              </div>
            </div>

            <div className="py-4">
              <Label className="block mb-2">Изображение категории</Label>
              {previewUrl ? (
                <div className="relative w-40 h-40 mb-4">
                  <Image
                    src={previewUrl}
                    alt="Превью"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                    aria-label="Удалить изображение"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <Label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Загрузить изображение
                    </span>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
