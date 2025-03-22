'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  ChevronRight,
  ChevronDown,
  FolderPlus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Category } from '@/types/catalog';
import { categoriesApi } from '@/lib/catalog-api';
import CategoryForm from './CategoryForm';
import { toast } from 'sonner';

export type CatalogSidebarProps = {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
};

export default function CatalogSidebar({
  selectedCategory,
  onCategorySelect,
}: CatalogSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['cat1', 'subcat1'])
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);

  // Загрузка категорий
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        toast.error('Не удалось загрузить категории');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Получение корневых категорий
  const rootCategories = categories.filter((cat) => cat.parentId === null);

  // Получение подкатегорий для заданной категории
  const getSubcategories = (categoryId: string) => {
    return categories.filter((cat) => cat.parentId === categoryId);
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

  // Обработчик добавления категории
  const handleAddCategory = (parentId: string | null = null) => {
    setEditingCategoryId(null);
    setParentCategoryId(parentId);
    setIsCategoryFormOpen(true);
  };

  // Обработчик редактирования категории
  const handleEditCategory = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    setParentCategoryId(null);
    setIsCategoryFormOpen(true);
  };

  // Обработчик удаления категории
  const handleDeleteCategory = async (categoryId: string) => {
    if (
      window.confirm(
        'Вы уверены, что хотите удалить эту категорию? Это действие нельзя отменить.'
      )
    ) {
      try {
        await categoriesApi.delete(categoryId);
        setCategories(categories.filter((cat) => cat.id !== categoryId));
        toast.success('Категория успешно удалена');
      } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        toast.error('Не удалось удалить категорию');
      }
    }
  };

  // Обработчик закрытия формы категории
  const handleCategoryFormClose = () => {
    setIsCategoryFormOpen(false);
    setEditingCategoryId(null);
    setParentCategoryId(null);
  };

  // Обработчик сохранения категории
  const handleCategorySave = async (category: Category) => {
    try {
      // Обновляем список категорий
      setCategories((prevCategories) => {
        const index = prevCategories.findIndex((c) => c.id === category.id);
        if (index !== -1) {
          // Обновляем существующую категорию
          const updatedCategories = [...prevCategories];
          updatedCategories[index] = category;
          return updatedCategories;
        } else {
          // Добавляем новую категорию
          return [...prevCategories, category];
        }
      });

      // Если это подкатегория, разворачиваем родительскую категорию
      if (category.parentId) {
        setExpandedCategories((prev) => {
          const newExpanded = new Set(prev);
          newExpanded.add(category.parentId!);
          return newExpanded;
        });
      }

      toast.success(
        editingCategoryId ? 'Категория обновлена' : 'Категория создана'
      );
    } catch (error) {
      console.error('Ошибка при сохранении категории:', error);
      toast.error('Не удалось сохранить категорию');
    }
  };

  // Рекурсивный рендер категорий
  const renderCategory = (category: Category) => {
    const subcategories = getSubcategories(category.id);
    const hasSubcategories = subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory === category.id;
    const indentClass = `pl-${(category.level ?? 0) * 4}`;

    return (
      <div key={category.id}>
        <div
          className={`flex items-center py-2 px-2 ${indentClass} hover:bg-gray-100 cursor-pointer ${
            isSelected ? 'bg-gray-100 font-medium' : ''
          } ${category.hidden ? 'text-gray-400' : ''}`}
          onClick={() => onCategorySelect(category.id)}
        >
          {hasSubcategories && (
            <button
              onClick={(e) => toggleCategory(category.id, e)}
              className="mr-1 p-1 rounded-md hover:bg-gray-200"
              aria-label={
                isExpanded ? 'Свернуть категорию' : 'Развернуть категорию'
              }
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          {!hasSubcategories && <div className="w-6" />}

          <span className="flex-1 truncate">{category.name}</span>

          {category.id !== 'all' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleAddCategory(category.id)}
                >
                  <FolderPlus className="mr-2 h-4 w-4" />
                  <span>Создать подкатегорию</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleEditCategory(category.id)}
                >
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600"
                >
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {hasSubcategories && isExpanded && (
          <div>{subcategories.map((subcat) => renderCategory(subcat))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 font-medium">Каталог</div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
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
          onClick={() => handleAddCategory(null)}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Добавить категорию
        </Button>
      </div>

      {/* Форма добавления/редактирования категории */}
      <CategoryForm
        isOpen={isCategoryFormOpen}
        onClose={handleCategoryFormClose}
        categoryId={editingCategoryId}
        parentId={parentCategoryId}
        onSave={handleCategorySave}
      />
    </div>
  );
}
