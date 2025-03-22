'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Settings, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CategoryType = {
  id: string;
  name: string;
  slug: string;
  hidden: boolean;
  includeSubcategoryProducts: boolean;
  parentId: string | null;
  level: number;
};

type CategoryNavigationProps = {
  categories: CategoryType[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
  onAddCategory: (parentId: string | null) => void;
  onEditCategory: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => void;
};

export default function CategoryNavigation({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoryNavigationProps) {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const renderCategoryItem = (category: CategoryType) => {
    const isExpanded = expandedCategories[category.id];
    const isSelected = selectedCategory === category.id;
    const hasChildren = categories.some((c) => c.parentId === category.id);
    const indentClass = `pl-${category.level * 4}`;

    return (
      <div key={category.id}>
        <div
          className={`flex items-center py-2 px-2 ${indentClass} ${
            isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
          } cursor-pointer group`}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(category.id)}
              className="mr-1 text-gray-500 hover:text-gray-700"
              aria-label={
                isExpanded ? 'Свернуть категорию' : 'Развернуть категорию'
              }
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <div className="w-5 h-5 mr-1"></div>
          )}

          <div
            className={`flex-1 truncate ${
              category.hidden ? 'text-gray-400 italic' : ''
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            {category.name}
          </div>

          {category.id !== 'all' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-gray-700"
                  aria-label="Настройки категории"
                >
                  <Settings size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAddCategory(category.id)}>
                  <Plus size={16} className="mr-2" />
                  Создать подкатегорию
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEditCategory(category.id)}>
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteCategory(category.id)}
                  className="text-red-600"
                >
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isExpanded &&
          hasChildren &&
          categories
            .filter((c) => c.parentId === category.id)
            .map((childCategory) => renderCategoryItem(childCategory))}
      </div>
    );
  };

  // Получаем корневые категории (включая "Все товары")
  const rootCategories = categories.filter((c) => c.parentId === null);

  return (
    <div className="py-4">
      <div className="px-4 mb-4 font-semibold text-lg">Каталог</div>

      <div className="space-y-1">
        {rootCategories.map((category) => renderCategoryItem(category))}
      </div>

      <div className="px-4 mt-6">
        <button
          onClick={() => onAddCategory(null)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <Plus size={16} className="mr-2" />
          Добавить категорию
        </button>
      </div>
    </div>
  );
}
