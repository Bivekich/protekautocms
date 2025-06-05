'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Loader2,
  Edit,
  Trash2,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useCatalogGraphQL, Category } from '@/hooks/useCatalogGraphQL';

export type CatalogSidebarProps = {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
};

export default function CatalogSidebar({
  selectedCategory,
  onCategorySelect,
}: CatalogSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Состояния для модальных окон
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  // Состояния для формы
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isVisible: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Используем GraphQL хук
  const { loading: isLoading, error, getCategories, deleteCategory } = useCatalogGraphQL();

  // Функция загрузки категорий
  const fetchCategories = useCallback(async () => {
    try {
      const result = await getCategories(true); // включаем скрытые категории
      
      // Отладка данных
      console.log('Received categories data:', JSON.stringify(result, null, 2));

      // Добавляем категорию "Все товары"
      const allCategories = [
        {
          id: 'all',
          name: 'Все товары',
          slug: 'all',
          level: 0,
          order: 0,
          parentId: null,
          isVisible: true,
          includeSubcategoryProducts: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subcategories: [],
          productsCount: 0,
        },
        ...result.categories,
      ];

      setCategories(allCategories);

      // Если категория не выбрана, выбираем "Все товары"
      if (!selectedCategory) {
        onCategorySelect('all');
      }
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err);
      toast.error('Ошибка при загрузке категорий');
    }
  }, [getCategories, selectedCategory, onCategorySelect]);

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Получение корневых категорий
  const rootCategories = categories;

  // Получение подкатегорий для заданной категории
  const getSubcategories = (category: Category) => {
    return category.subcategories || [];
  };

  // Переключение состояния развернутости категории
  const toggleCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Обработчик открытия диалога добавления категории
  const openAddCategoryDialog = (parentId: string | null = null) => {
    setParentId(parentId);
    setFormData({
      name: '',
      description: '',
      isVisible: true,
    });
    setIsAddDialogOpen(true);
  };

  // Обработчик открытия диалога редактирования категории
  const openEditCategoryDialog = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isVisible: category.isVisible ?? true,
    });
    setIsEditDialogOpen(true);
  };

  // Обработчик открытия диалога удаления категории
  const openDeleteCategoryDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Обработчик изменения полей формы
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик изменения переключателя видимости
  const handleVisibilityChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isVisible: checked }));
  };

  // Обработчик добавления категории
  const handleAddCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Название категории обязательно');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/catalog/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          parentId: parentId,
          isVisible: formData.isVisible,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании категории');
      }

      // Вместо добавления категории в список, полностью обновляем дерево категорий
      await fetchCategories();

      // Если добавлена подкатегория, разворачиваем родительскую
      if (parentId) {
        setExpandedCategories((prev) => new Set([...prev, parentId]));
      }

      toast.success('Категория успешно создана');

      setIsAddDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при создании категории'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Обработчик редактирования категории
  const handleEditCategory = async () => {
    if (!currentCategory) return;

    if (!formData.name.trim()) {
      toast.error('Название категории обязательно');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/catalog/categories/${currentCategory.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || null,
            isVisible: formData.isVisible,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении категории');
      }

      // Обновляем всё дерево категорий
      await fetchCategories();

      toast.success('Категория успешно обновлена');

      setIsEditDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при обновлении категории'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Обработчик удаления категории
  const handleDeleteCategory = async () => {
    if (!currentCategory) return;

    try {
      await deleteCategory(currentCategory.id);

      // Сохраняем ID удаленной категории
      const deletedCategoryId = currentCategory.id;

      // Обновляем всё дерево категорий
      await fetchCategories();

      // Если была выбрана удаленная категория, выбираем "Все товары"
      if (selectedCategory === deletedCategoryId) {
        onCategorySelect('all');
      }

      toast.success('Категория успешно удалена');

      setIsDeleteDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при удалении категории'
      );
    }
  };

  // Рекурсивный рендер категорий
  const renderCategory = (category: Category) => {
    const subcategories = getSubcategories(category);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory === category.id;
    const isAllCategory = category.id === 'all';

    // Определение класса отступа на основе уровня иерархии
    const indentLevel = Math.min(category.level ?? 0, 4); // Ограничиваем до 4-го уровня
    const indentClass = `pl-${indentLevel * 4 + 2}`;

    // Категория со всеми её подкатегориями в одном блоке
    return (
      <div key={category.id} className="category-item">
        <div
          className={`flex items-center py-2 ${indentClass} hover:bg-gray-100 cursor-pointer ${
            isSelected ? 'bg-gray-100 font-medium' : ''
          } ${!category.isVisible ? 'text-gray-400' : ''} ${
            isAllCategory ? 'font-medium text-blue-600' : ''
          } ${isAllCategory && isSelected ? 'bg-blue-50' : ''}`}
          onClick={() => onCategorySelect(category.id)}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onCategorySelect(category.id)}
          aria-label={`Категория ${category.name}`}
        >
          {hasSubcategories && (
            <button
              onClick={(e) => toggleCategory(category.id, e)}
              className="mr-1 p-1 rounded-md hover:bg-gray-200 flex-shrink-0"
              data-testid="expand-category-icon"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          {!hasSubcategories && <div className="w-6 flex-shrink-0" />}

          <div
            className={cn(
              'category-name flex-1 truncate',
              isSelected ? 'font-medium' : 'font-normal'
            )}
          >
            {category.name}
            {category.includeSubcategoryProducts && hasSubcategories && (
              <span
                className="ml-1 text-xs text-blue-500"
                title="Включает товары из подкатегорий"
              >
                (все)
              </span>
            )}
          </div>

          {category.id !== 'all' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="h-7 w-7 flex-shrink-0"
                  aria-label="Управление категорией"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => openAddCategoryDialog(category.id)}
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  <span>Создать подкатегорию</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openEditCategoryDialog(category)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => openDeleteCategoryDialog(category)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Подкатегории рендерятся только если категория развернута */}
        {hasSubcategories && isExpanded && (
          <div className="subcategories ml-4">
            {subcategories.map((subcat: Category) =>
              renderCategory(subcat)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 font-medium">Каталог</div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchCategories}
          >
            Повторить
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {rootCategories.map((category) => renderCategory(category))}
        </div>
      )}

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => openAddCategoryDialog(null)}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Добавить категорию
        </Button>
      </div>

      {/* Диалог добавления категории */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {parentId ? 'Добавить подкатегорию' : 'Добавить категорию'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Введите название категории"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Введите описание категории (необязательно)"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isVisible"
                checked={formData.isVisible}
                onCheckedChange={handleVisibilityChange}
              />
              <Label htmlFor="isVisible">Показывать на сайте</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddCategory} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования категории */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать категорию</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Название</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Введите название категории"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Введите описание категории (необязательно)"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isVisible"
                checked={formData.isVisible}
                onCheckedChange={handleVisibilityChange}
              />
              <Label htmlFor="edit-isVisible">Показывать на сайте</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleEditCategory} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить категорию &quot;
              {currentCategory?.name}
              &quot;? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-500 hover:bg-red-600"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
