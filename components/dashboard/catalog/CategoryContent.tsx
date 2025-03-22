'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Folder, Plus, Loader2 } from 'lucide-react';
import ProductsList from './ProductsList';
import { Category, Product } from '@/types/catalog';
import { categoriesApi } from '@/lib/catalog-api';
import ProductForm from './ProductForm';
import CategoryForm from './CategoryForm';
import { toast } from 'sonner';

type CategoryContentProps = {
  categoryId: string | null;
};

export default function CategoryContent({ categoryId }: CategoryContentProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Загрузка данных категории и подкатегорий
  useEffect(() => {
    const loadCategoryData = async () => {
      if (!categoryId) return;

      try {
        setIsLoading(true);

        // Загружаем данные категории
        if (categoryId !== 'all') {
          const categoryData = await categoriesApi.getById(categoryId);
          setCategory(categoryData);
        } else {
          setCategory({
            id: 'all',
            name: 'Все товары',
            slug: 'all',
            parentId: null,
            level: 0,
            hidden: false,
            includeSubcategoryProducts: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
          });
        }

        // Загружаем подкатегории
        const subcategoriesData = await categoriesApi.getSubcategories(
          categoryId
        );
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Ошибка при загрузке данных категории:', error);
        toast.error('Не удалось загрузить данные категории');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId]);

  // Обработчик добавления товара
  const handleAddProduct = () => {
    setEditingProductId(null);
    setIsProductFormOpen(true);
  };

  // Обработчик редактирования товара
  const handleEditProduct = (productId: string) => {
    window.location.href = `/dashboard/catalog/products/${productId}`;
  };

  // Обработчик добавления подкатегории
  const handleAddSubcategory = () => {
    setIsCategoryFormOpen(true);
  };

  // Обработчик закрытия формы товара
  const handleProductFormClose = () => {
    setIsProductFormOpen(false);
    setEditingProductId(null);
  };

  // Обработчик закрытия формы категории
  const handleCategoryFormClose = () => {
    setIsCategoryFormOpen(false);
  };

  // Обработчик сохранения категории
  const handleCategorySave = async (newCategory: Category) => {
    // Добавляем новую подкатегорию в список
    setSubcategories((prev) => [...prev, newCategory]);
    toast.success('Подкатегория успешно создана');
  };

  // Обработчик клика по подкатегории
  const handleSubcategoryClick = (subcategoryId: string) => {
    // Здесь можно добавить навигацию на страницу подкатегории
    console.log('Переход к подкатегории', subcategoryId);
  };

  // Обработчик сохранения товара
  const handleProductSave = (product: Product) => {
    // Информируем пользователя об успешном действии
    toast.success(
      editingProductId
        ? `Товар "${product.name}" успешно обновлен`
        : `Товар "${product.name}" успешно создан`
    );

    // Закрываем форму
    setIsProductFormOpen(false);
    setEditingProductId(null);
  };

  if (!categoryId) {
    return (
      <div className="p-8 text-center text-gray-500">Выберите категорию</div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const hasSubcategories = subcategories.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок и действия */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {category ? category.name : 'Все товары'}
        </h2>
        <div className="flex gap-2">
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить товар
          </Button>
          {categoryId !== 'all' && (
            <Button variant="outline" onClick={handleAddSubcategory}>
              <Folder className="h-4 w-4 mr-2" />
              Добавить подкатегорию
            </Button>
          )}
        </div>
      </div>

      {/* Подкатегории */}
      {hasSubcategories && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">
            Подкатегории
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subcategories.map((subcat) => (
              <div
                key={subcat.id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSubcategoryClick(subcat.id)}
              >
                <div className="font-medium">{subcat.name}</div>
                {subcat.hidden && (
                  <div className="text-xs text-gray-400 mt-1">Скрыта</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список товаров */}
      <div className="flex-1 overflow-y-auto">
        <ProductsList
          categoryId={categoryId as string}
          onEditProduct={handleEditProduct}
          onAddProduct={handleAddProduct}
        />
      </div>

      {/* Если нет товаров и подкатегорий, показываем сообщение */}
      {!hasSubcategories && categoryId !== 'all' && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 mb-4">
            В этой категории пока нет подкатегорий и товаров
          </p>
          <div className="flex gap-4">
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
            <Button variant="outline" onClick={handleAddSubcategory}>
              <Folder className="h-4 w-4 mr-2" />
              Добавить подкатегорию
            </Button>
          </div>
        </div>
      )}

      {/* Форма добавления/редактирования товара */}
      <ProductForm
        isOpen={isProductFormOpen}
        onClose={handleProductFormClose}
        productId={editingProductId}
        initialCategoryId={categoryId as string}
        onSave={handleProductSave}
      />

      {/* Форма добавления подкатегории */}
      <CategoryForm
        isOpen={isCategoryFormOpen}
        onClose={handleCategoryFormClose}
        parentId={categoryId}
        onSave={handleCategorySave}
      />
    </div>
  );
}
