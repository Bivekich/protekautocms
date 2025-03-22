'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  order?: number;
  slug?: string;
  isVisible?: boolean;
  imageUrl?: string | null;
};

export type CategoryWithChildren = Category & {
  children: CategoryWithChildren[];
};

type CategoryTreeViewProps = {
  categories: Category[];
  selectedCategoryIds: string[];
  onSelectCategory: (categoryId: string, checked: boolean) => void;
  multiSelect?: boolean;
  initialExpandedCategoryId?: string;
};

export default function CategoryTreeView({
  categories,
  selectedCategoryIds,
  onSelectCategory,
  multiSelect = false,
  initialExpandedCategoryId,
}: CategoryTreeViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    initialExpandedCategoryId ? [initialExpandedCategoryId] : []
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Функция для автоматического открытия всех категорий
  const expandAllCategories = useCallback(() => {
    const allCategoryIds = categories.map((category) => category.id);
    setExpandedCategories(allCategoryIds);
  }, [categories]);

  // При загрузке компонента расширяем все категории
  useEffect(() => {
    expandAllCategories();
  }, [expandAllCategories]);

  // Строим древовидную структуру из плоского списка категорий
  const buildCategoryTree = (
    categories: Category[]
  ): CategoryWithChildren[] => {
    const categoriesMap: { [key: string]: CategoryWithChildren } = {};

    // Сначала создаем словарь категорий с пустыми списками детей
    categories.forEach((category) => {
      categoriesMap[category.id] = { ...category, children: [] };
    });

    // Затем добавляем категории к их родителям
    const rootCategories: CategoryWithChildren[] = [];

    categories.forEach((category) => {
      if (category.parentId && categoriesMap[category.parentId]) {
        categoriesMap[category.parentId].children.push(
          categoriesMap[category.id]
        );
      } else {
        rootCategories.push(categoriesMap[category.id]);
      }
    });

    // Сортировка категорий по порядку
    const sortCategories = (
      categories: CategoryWithChildren[]
    ): CategoryWithChildren[] => {
      return categories
        .sort((a, b) => {
          // Сначала сортируем по order, если он есть
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          // Затем по имени
          return a.name.localeCompare(b.name);
        })
        .map((category) => ({
          ...category,
          children: sortCategories(category.children),
        }));
    };

    return sortCategories(rootCategories);
  };

  // Фильтрация категорий по поисковому запросу
  const filterCategories = (
    categories: CategoryWithChildren[],
    query: string
  ): CategoryWithChildren[] => {
    if (!query) return categories;

    return categories
      .map((category) => {
        const matchesQuery = category.name
          .toLowerCase()
          .includes(query.toLowerCase());
        const filteredChildren = filterCategories(category.children, query);

        if (matchesQuery || filteredChildren.length > 0) {
          return {
            ...category,
            children: filteredChildren,
          };
        }

        return null;
      })
      .filter(
        (category): category is CategoryWithChildren => category !== null
      );
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Рендер категории и её подкатегорий
  const renderCategoryItem = (category: CategoryWithChildren, depth = 0) => {
    const isExpanded = expandedCategories.includes(category.id);
    const hasChildren = category.children.length > 0;

    return (
      <div key={category.id} className="select-none">
        <div
          className={`flex items-center py-1 px-2 rounded-md hover:bg-gray-100
                    ${
                      selectedCategoryIds.includes(category.id)
                        ? 'bg-gray-100'
                        : ''
                    }`}
          style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
          onClick={(e) => {
            // Предотвращаем срабатывание клика на родительском элементе
            e.stopPropagation();
            // Только разворачиваем/сворачиваем категорию по клику
            if (hasChildren) {
              toggleExpand(category.id);
            }
          }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 mr-1"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6"></div>
          )}

          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-yellow-500 mr-2" />
          ) : (
            <Folder className="h-4 w-4 text-gray-400 mr-2" />
          )}

          <div className="flex items-center flex-1">
            <Checkbox
              id={`category-${category.id}`}
              checked={selectedCategoryIds.includes(category.id)}
              onCheckedChange={(checked) => {
                if (!multiSelect) {
                  // В режиме единственного выбора снимаем выделение со всех остальных
                  selectedCategoryIds.forEach((id) => {
                    if (id !== category.id) {
                      onSelectCategory(id, false);
                    }
                  });
                }
                onSelectCategory(category.id, !!checked);
              }}
              className="mr-2"
              onClick={(e) => e.stopPropagation()}
            />
            <Label
              htmlFor={`category-${category.id}`}
              className="cursor-pointer flex-1"
              onClick={(e) => {
                // Предотвращаем всплытие, чтобы не срабатывал обработчик щелчка на строке
                e.stopPropagation();
              }}
            >
              {category.name}
            </Label>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-2">
            {category.children.map((child) =>
              renderCategoryItem(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Древовидная структура категорий
  const categoryTree = buildCategoryTree(categories);

  // Фильтрованное дерево категорий
  const filteredCategoryTree = filterCategories(categoryTree, searchQuery);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          placeholder="Поиск категорий..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="max-h-80 overflow-y-auto border rounded-md p-2">
        {filteredCategoryTree.length > 0 ? (
          filteredCategoryTree.map((category) => renderCategoryItem(category))
        ) : (
          <div className="text-center py-3 text-gray-500">
            {searchQuery
              ? 'Нет категорий, соответствующих поиску'
              : 'Нет доступных категорий'}
          </div>
        )}
      </div>
    </div>
  );
}
