'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Box,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Category, CategoryWithChildren } from './CategoryTreeView';
import { RelatedProduct } from './ProductForm';

export type ProductWithCategory = RelatedProduct & {
  categoryId: string;
};

type ProductTreeViewProps = {
  categories: Category[];
  products: ProductWithCategory[];
  selectedProductIds: string[];
  onSelectProduct: (productId: string, checked: boolean) => void;
  multiSelect?: boolean;
};

export default function ProductTreeView({
  categories,
  products,
  selectedProductIds,
  onSelectProduct,
  multiSelect = false,
}: ProductTreeViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(() => {
    return categories
      .filter((category) => category.parentId === null || !category.parentId)
      .map((category) => category.id);
  });
  const [searchQuery, setSearchQuery] = useState('');

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

  // Фильтрация категорий и товаров по поисковому запросу
  const filterBySearchQuery = (query: string) => {
    if (!query) return { categoryTree, productsInCategory };

    // Фильтрация товаров
    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase())
    );

    // Получаем ID категорий, в которых есть отфильтрованные товары
    const categoriesWithFilteredProducts = new Set<string>();

    filteredProducts.forEach((product) => {
      categoriesWithFilteredProducts.add(product.categoryId);

      // Добавляем родительские категории для найденных товаров
      let currentCategoryId = product.categoryId;
      let parentCategory = categories.find(
        (c) => c.id === currentCategoryId
      )?.parentId;

      while (parentCategory) {
        categoriesWithFilteredProducts.add(parentCategory);
        const nextParent = categories.find((c) => c.id === parentCategory);
        currentCategoryId = parentCategory;
        parentCategory = nextParent?.parentId || null;
      }
    });

    // Фильтрованное дерево категорий (содержащих найденные товары)
    const filterCategoryTree = (
      categories: CategoryWithChildren[]
    ): CategoryWithChildren[] => {
      return categories
        .map((category) => {
          const categoryMatches = category.name
            .toLowerCase()
            .includes(query.toLowerCase());
          const hasMatchingProducts = categoriesWithFilteredProducts.has(
            category.id
          );
          const filteredChildren = filterCategoryTree(category.children);

          if (
            categoryMatches ||
            hasMatchingProducts ||
            filteredChildren.length > 0
          ) {
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

    // Создаем новый объект с отфильтрованными товарами по категориям
    const filteredProductsInCategory: Record<string, ProductWithCategory[]> =
      {};

    Object.keys(productsInCategory).forEach((categoryId) => {
      if (categoriesWithFilteredProducts.has(categoryId)) {
        filteredProductsInCategory[categoryId] = productsInCategory[
          categoryId
        ].filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.sku.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        filteredProductsInCategory[categoryId] = [];
      }
    });

    return {
      categoryTree: filterCategoryTree(categoryTree),
      productsInCategory: filteredProductsInCategory,
    };
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Расширенная функция для открытия всех категорий
  const expandAllCategories = useCallback(() => {
    const allCategoryIds = categories.map((category) => category.id);
    setExpandedCategories(allCategoryIds);
  }, [categories]);

  // При загрузке компонента расширяем все категории
  useEffect(() => {
    expandAllCategories();
  }, [expandAllCategories]);

  // Группировка товаров по категориям
  const productsInCategory: Record<string, ProductWithCategory[]> = {};

  // Убедимся, что все категории инициализированы в объекте productsInCategory
  categories.forEach((category) => {
    if (!productsInCategory[category.id]) {
      productsInCategory[category.id] = [];
    }
  });

  // Затем добавляем товары в соответствующие категории
  products.forEach((product) => {
    if (!productsInCategory[product.categoryId]) {
      productsInCategory[product.categoryId] = [];
    }
    productsInCategory[product.categoryId].push(product);
  });

  // Сортировка товаров в каждой категории по имени
  Object.keys(productsInCategory).forEach((categoryId) => {
    productsInCategory[categoryId].sort((a, b) => a.name.localeCompare(b.name));
  });

  // Древовидная структура категорий
  const categoryTree = buildCategoryTree(categories);

  // Применяем фильтрацию по поисковому запросу
  const {
    categoryTree: filteredCategoryTree,
    productsInCategory: filteredProductsInCategory,
  } = filterBySearchQuery(searchQuery);

  // Рендер товара
  const renderProduct = (product: ProductWithCategory) => {
    return (
      <div
        key={product.id}
        className="flex items-center py-1 px-2 rounded-md hover:bg-gray-100"
        onClick={(e) => {
          // Предотвращаем всплытие события
          e.stopPropagation();
        }}
      >
        <div className="w-6"></div>

        <div className="flex items-center flex-1">
          <Checkbox
            id={`product-${product.id}`}
            checked={selectedProductIds.includes(product.id)}
            onCheckedChange={(checked) => {
              if (!multiSelect) {
                // В режиме единственного выбора снимаем выделение со всех остальных
                selectedProductIds.forEach((id) => {
                  if (id !== product.id) {
                    onSelectProduct(id, false);
                  }
                });
              }
              onSelectProduct(product.id, !!checked);
            }}
            className="mr-2"
            onClick={(e) => e.stopPropagation()}
          />

          <div className="flex items-center flex-1">
            {product.image ? (
              <div className="h-6 w-6 rounded overflow-hidden mr-2 bg-gray-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
            ) : (
              <Box className="h-4 w-4 text-gray-400 mr-2" />
            )}

            <Label
              htmlFor={`product-${product.id}`}
              className="cursor-pointer flex-1"
            >
              <div className="flex flex-col">
                <span>{product.name}</span>
                <span className="text-xs text-gray-500">{product.sku}</span>
              </div>
            </Label>
          </div>
        </div>
      </div>
    );
  };

  // Рендер категории и её товаров
  const renderCategoryWithProducts = (
    category: CategoryWithChildren,
    depth = 0
  ) => {
    const isExpanded = expandedCategories.includes(category.id);
    const hasChildren = category.children.length > 0;
    const hasProducts = filteredProductsInCategory[category.id]?.length > 0;

    // Показываем категорию, даже если у неё нет товаров, чтобы отображать структуру каталога
    return (
      <div key={category.id} className="select-none">
        <div
          className="flex items-center py-1 px-2 rounded-md hover:bg-gray-100 cursor-pointer"
          style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(category.id);
          }}
        >
          {hasChildren || hasProducts ? (
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

          <span className="font-medium">{category.name}</span>
          {hasProducts && (
            <span className="ml-2 text-xs text-gray-500">
              ({filteredProductsInCategory[category.id]?.length})
            </span>
          )}
        </div>

        {isExpanded && (
          <div className="ml-2">
            {/* Отображаем товары в этой категории */}
            {hasProducts &&
              filteredProductsInCategory[category.id].map((product) =>
                renderProduct(product)
              )}

            {/* Отображаем подкатегории */}
            {category.children.map((child) =>
              renderCategoryWithProducts(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          placeholder="Поиск товаров по названию или артикулу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="max-h-80 overflow-y-auto border rounded-md p-2">
        {filteredCategoryTree.length > 0 ? (
          filteredCategoryTree.map((category) =>
            renderCategoryWithProducts(category)
          )
        ) : (
          <div className="text-center py-3 text-gray-500">
            {searchQuery
              ? 'Нет товаров, соответствующих поиску'
              : 'Нет доступных товаров'}
          </div>
        )}
      </div>
    </div>
  );
}
