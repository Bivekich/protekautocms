'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Plus, Search, Loader2 } from 'lucide-react';
import ProductsList from './ProductsList';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCatalogGraphQL, Category } from '@/hooks/useCatalogGraphQL';

// Типы для компонента
export interface CategoryContentProps {
  categoryId: string | null;
  onCategorySelect?: (categoryId: string) => void;
}

export default function CategoryContent({
  categoryId,
  onCategorySelect,
}: CategoryContentProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    description: '',
    isVisible: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Состояния для модальных окон
  const [isAddSubcategoryDialogOpen, setIsAddSubcategoryDialogOpen] =
    useState(false);

  // Используем GraphQL хук
  const { loading: isLoading, error, getCategories, getCategory } = useCatalogGraphQL();

  // Загрузка данных категории
  const fetchCategoryData = useCallback(async () => {
    try {
      if (categoryId === 'all') {
        // Если выбрана категория "Все товары", показываем все категории верхнего уровня
        const result = await getCategories(false);
        setCategory(null);
        setSubcategories(result.categories.filter((cat: Category) => !cat.parentId));
      } else if (categoryId) {
        // Если выбрана конкретная категория, загружаем её данные
        const categoryData = await getCategory(categoryId);
        setCategory(categoryData);
        setSubcategories(categoryData.subcategories || []);
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных категории:', err);
      toast.error('Ошибка при загрузке данных категории');
    }
  }, [categoryId, getCategories, getCategory]);

  // Загрузка данных категории при изменении categoryId
  useEffect(() => {
    fetchCategoryData();

    // Инициализируем поисковый запрос из URL, если он там есть
    const params = new URLSearchParams(window.location.search);
    const searchFromUrl = params.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    } else {
      setSearchQuery(''); // Сбрасываем поиск, если его нет в URL
    }
  }, [categoryId, fetchCategoryData]);

  // Обработчик открытия диалога добавления подкатегории
  const openAddSubcategoryDialog = () => {
    setSubcategoryFormData({
      name: '',
      description: '',
      isVisible: true,
    });
    setIsAddSubcategoryDialogOpen(true);
  };

  // Обработчик открытия страницы добавления товара
  const openAddProductPage = () => {
    // Перенаправляем на страницу добавления товара с указанием категории
    if (categoryId && categoryId !== 'all') {
      window.location.href = `/dashboard/catalog/add-product?categoryId=${categoryId}`;
    } else {
      window.location.href = '/dashboard/catalog/add-product';
    }
  };

  // Обработчик изменения полей формы подкатегории
  const handleSubcategoryFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSubcategoryFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик изменения переключателя видимости
  const handleVisibilityChange = (checked: boolean) => {
    setSubcategoryFormData((prev) => ({ ...prev, isVisible: checked }));
  };

  // Обработчик добавления подкатегории
  const handleAddSubcategory = async () => {
    if (!subcategoryFormData.name.trim()) {
      toast.error('Название подкатегории обязательно');
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
          name: subcategoryFormData.name,
          description: subcategoryFormData.description || undefined,
          parentId: categoryId,
          isVisible: subcategoryFormData.isVisible,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании подкатегории');
      }

      const newSubcategory = await response.json();

      // Обновляем список подкатегорий
      setSubcategories((prev) => [...prev, newSubcategory]);

      // Закрываем модальное окно и сбрасываем форму
      setIsAddSubcategoryDialogOpen(false);
      setSubcategoryFormData({
        name: '',
        description: '',
        isVisible: true,
      });

      toast.success('Подкатегория успешно создана');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при создании подкатегории'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Обработчик переключения опции включения товаров из подкатегорий
  const handleToggleIncludeSubcategoryProducts = async () => {
    if (!category || !categoryId) return;

    setIsUpdatingSettings(true);
    try {
      // Используем новый API-эндпоинт для переключения флага
      const response = await fetch(
        `/api/catalog/categories/${categoryId}/toggle-include-subcategories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при обновлении настроек категории');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Неизвестная ошибка');
      }

      // Обновляем локальное состояние категории
      setCategory((prev) =>
        prev
          ? {
              ...prev,
              includeSubcategoryProducts:
                data.category.includeSubcategoryProducts,
            }
          : null
      );

      toast.success(
        data.category.includeSubcategoryProducts
          ? 'Товары из подкатегорий будут отображаться в этой категории'
          : 'Товары из подкатегорий больше не отображаются в этой категории'
      );

      // Обновляем страницу без полной перезагрузки
      // Находим компонент списка товаров и обновляем его
      const productsList = document.querySelector(
        '[data-testid="products-list"]'
      );
      if (productsList) {
        // Если мы нашли компонент, то можем просто обновить его визуально
        productsList.classList.add('opacity-50');

        // Вместо перезагрузки страницы обновляем только список товаров
        setTimeout(() => {
          // Обновляем URL с сохранением параметров
          const currentParams = new URLSearchParams(window.location.search);
          const newUrl = `${
            window.location.pathname
          }?${currentParams.toString()}`;
          window.history.pushState({ path: newUrl }, '', newUrl);

          // Удаляем эффект затемнения
          productsList.classList.remove('opacity-50');

          // Заставляем компонент ProductsList перезагрузить данные
          // Для этого используем пользовательское событие
          const refreshEvent = new CustomEvent('refresh-products');
          document.dispatchEvent(refreshEvent);
        }, 500);
      } else {
        // Если компонент не найден (что маловероятно), делаем полную перезагрузку
        window.location.reload();
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при обновлении настроек'
      );
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Обработчик отправки формы поиска
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Обновляем URL-параметры
    updateSearchUrlParam();
  };

  // Функция обновления параметра поиска в URL
  const updateSearchUrlParam = () => {
    const params = new URLSearchParams(window.location.search);

    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }

    // Обновляем URL без перезагрузки страницы
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchCategoryData}>Повторить</Button>
      </div>
    );
  }

  // Проверяем, выбрана ли категория
  if (!categoryId) {
    return <div>Выберите категорию</div>;
  }

  // Обрабатываем категорию "Все товары"
  const isAllCategory = categoryId === 'all';
  const hasSubcategories = subcategories.length > 0;
  const hasProducts = true;

  return (
    <div className="h-full flex flex-col pt-0 pb-0">
      <div className="mb-1">
        {/* Хлебные крошки и заголовок категории */}
        <div className="flex justify-between items-center mb-1">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {isAllCategory ? 'Все товары' : category?.name}
                {category?.includeSubcategoryProducts &&
                  subcategories.length > 0 && (
                    <span className="ml-1 text-xs font-normal text-gray-500">
                      (Включая товары из подкатегорий)
                    </span>
                  )}
              </h2>

              {/* Поиск */}
              <div className="ml-auto mr-4 flex-1 max-w-md">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Поиск товаров..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                </form>
              </div>

              {/* Действия категории */}
              <div className="flex space-x-2">
                <Button variant="outline" onClick={openAddSubcategoryDialog}>
                  <Folder className="mr-2 h-4 w-4" />
                  Добавить подкатегорию
                </Button>
                <Button onClick={openAddProductPage}>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить товар
                </Button>
              </div>
            </div>
            {category?.description && !isAllCategory && (
              <p className="text-gray-500 mt-0">{category.description}</p>
            )}
            {!isAllCategory && subcategories.length > 0 && (
              <div className="mt-1 flex items-center">
                <Switch
                  id="includeSubcategoryProducts"
                  checked={!!category?.includeSubcategoryProducts}
                  onCheckedChange={handleToggleIncludeSubcategoryProducts}
                  disabled={isUpdatingSettings}
                />
                <Label htmlFor="includeSubcategoryProducts" className="ml-2">
                  Включать товары из подкатегорий
                </Label>
                {isUpdatingSettings && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Подкатегории */}
      {hasSubcategories && (
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Подкатегории
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {subcategories.map((subcat) => (
              <div
                key={subcat.id}
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (onCategorySelect) {
                    onCategorySelect(subcat.id);
                  } else {
                    window.location.href = `?category=${subcat.id}`;
                  }
                }}
              >
                <div className="font-medium">{subcat.name}</div>
                {!subcat.isVisible && (
                  <div className="text-xs text-gray-400 mt-1">Скрыта</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список товаров */}
      <div
        className="flex-1 overflow-y-auto min-h-0"
        data-testid="products-list"
      >
        <ProductsList
          categoryId={categoryId}
          searchQuery={searchQuery}
          onCategorySelect={onCategorySelect}
          includeSubcategories={
            isAllCategory ? true : !!category?.includeSubcategoryProducts
          }
        />
      </div>

      {/* Если нет подкатегорий и товаров, показываем сообщение */}
      {!hasSubcategories && !hasProducts && !isAllCategory && (
        <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            В этой категории пока нет подкатегорий и товаров
          </p>
          <div className="flex gap-4">
            <Button onClick={openAddProductPage}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить товар
            </Button>
            <Button variant="outline" onClick={openAddSubcategoryDialog}>
              <Folder className="h-4 w-4 mr-2" />
              Добавить подкатегорию
            </Button>
          </div>
        </div>
      )}

      {/* Диалог добавления подкатегории */}
      <Dialog
        open={isAddSubcategoryDialogOpen}
        onOpenChange={setIsAddSubcategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить подкатегорию</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                name="name"
                value={subcategoryFormData.name}
                onChange={handleSubcategoryFormChange}
                placeholder="Введите название подкатегории"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                value={subcategoryFormData.description}
                onChange={handleSubcategoryFormChange}
                placeholder="Введите описание подкатегории (необязательно)"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isVisible"
                checked={subcategoryFormData.isVisible}
                onCheckedChange={handleVisibilityChange}
              />
              <Label htmlFor="isVisible">Показывать на сайте</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddSubcategoryDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleAddSubcategory} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
