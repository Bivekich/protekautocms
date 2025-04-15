'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Edit,
  Trash2,
  Loader2,
  Filter,
  MoreHorizontal,
  FolderInput,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
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
import Image from 'next/image';
import { ProductWithDetails } from '@/types/catalog';
import { useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CategoryTreeView from './CategoryTreeView';
import { CategoryWithChildren } from './CategoryTreeView';

type ProductsListProps = {
  categoryId: string;
  searchQuery?: string;
  onCategorySelect?: (categoryId: string) => void;
  includeSubcategories?: boolean;
};

export default function ProductsList({
  categoryId,
  searchQuery = '',
  onCategorySelect,
  includeSubcategories = false,
}: ProductsListProps) {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [allSelected, setAllSelected] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pageSize] = useState(10);

  // Инициализируем состояния фильтров из URL-параметров
  const [stockFilter, setStockFilter] = useState<string>(
    searchParams.get('stock') || 'all'
  );
  const [visibilityFilter, setVisibilityFilter] = useState<string>(
    searchParams.get('visibility') || 'all'
  );
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);

  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  // Функция загрузки товаров
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Формирование URL с параметрами
      const url = new URL('/api/catalog/products', window.location.origin);

      // Для категории "Все товары" не передаем параметр categoryId
      if (categoryId && categoryId !== 'all') {
        url.searchParams.append('categoryId', categoryId);

        // Если передан параметр включения подкатегорий
        if (includeSubcategories) {
          url.searchParams.append('includeSubcategories', 'true');
        }
      }

      if (localSearchQuery) {
        url.searchParams.append('search', localSearchQuery);
      }

      // Добавляем параметры фильтров в запрос
      if (stockFilter !== 'all') {
        url.searchParams.append('stock', stockFilter);
      }
      if (visibilityFilter !== 'all') {
        url.searchParams.append('visibility', visibilityFilter);
      }

      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', pageSize.toString());

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Ошибка при загрузке товаров');
      }

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);

      // Сбрасываем выделение
      setSelectedProducts(new Set());
      setAllSelected(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      console.error('Ошибка при загрузке товаров:', err);
      toast.error('Не удалось загрузить товары');
    } finally {
      setIsLoading(false);
      setIsApplyingFilters(false);
    }
  }, [
    categoryId,
    localSearchQuery,
    currentPage,
    pageSize,
    stockFilter,
    visibilityFilter,
    includeSubcategories,
  ]);

  // Загрузка товаров при изменении categoryId или страницы
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Добавляем слушатель события для обновления списка
  useEffect(() => {
    const handleRefreshProducts = () => {
      fetchProducts();
    };

    // Добавляем слушатель события
    document.addEventListener('refresh-products', handleRefreshProducts);

    // Удаляем слушатель при размонтировании компонента
    return () => {
      document.removeEventListener('refresh-products', handleRefreshProducts);
    };
  }, [fetchProducts]);

  // Обновление локального поиска при изменении внешнего
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Обработчик выбора всех товаров
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
    setAllSelected(!allSelected);
  };

  // Обработчик выбора отдельного товара
  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
    setAllSelected(newSelected.size === products.length && products.length > 0);
  };

  // Обработчик изменения видимости товара
  const handleToggleVisibility = async (
    productId: string,
    isVisible: boolean
  ) => {
    try {
      const response = await fetch(`/api/catalog/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isVisible: !isVisible,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при изменении видимости товара');
      }

      // Обновляем состояние товаров
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId
            ? { ...product, isVisible: !isVisible }
            : product
        )
      );

      toast.success(`Товар ${!isVisible ? 'показан' : 'скрыт'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  // Обработчик редактирования товара
  const handleEditProduct = (productId: string) => {
    // Перенаправление на страницу редактирования товара
    window.location.href = `/dashboard/catalog/products/${productId}`;
  };

  // Обработчик открытия диалога удаления товара
  const openDeleteDialog = (productId: string) => {
    setDeleteProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  // Обработчик удаления товара
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/catalog/products/${deleteProductId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении товара');
      }

      // Обновляем список товаров
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== deleteProductId)
      );

      // Если товар был выбран, удаляем его из выбранных
      if (selectedProducts.has(deleteProductId)) {
        const newSelected = new Set(selectedProducts);
        newSelected.delete(deleteProductId);
        setSelectedProducts(newSelected);
        setAllSelected(
          newSelected.size === products.length - 1 && products.length > 1
        );
      }

      toast.success('Товар удален');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при удалении товара'
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteProductId(null);
    }
  };

  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Обработчик применения фильтров
  const applyFilters = () => {
    setIsApplyingFilters(true);
    setCurrentPage(1); // Сбрасываем на первую страницу при применении фильтров

    // Обновляем URL-параметры
    updateUrlParams();

    fetchProducts();
  };

  // Функция сброса фильтров
  const resetFilters = () => {
    setStockFilter('all');
    setVisibilityFilter('all');
    setCurrentPage(1);

    // Обновляем URL-параметры
    updateUrlParams(true);

    // Если есть хотя бы один активный фильтр, применяем сброс
    if (stockFilter !== 'all' || visibilityFilter !== 'all') {
      setIsApplyingFilters(true);
      fetchProducts();
    }
  };

  // Функция обновления URL-параметров
  const updateUrlParams = (reset = false) => {
    const params = new URLSearchParams();

    // Сохраняем существующий параметр categoryId
    if (categoryId && categoryId !== 'all') {
      params.set('category', categoryId);
    }

    // Сохраняем параметры фильтров, если они не сбрасываются
    if (!reset) {
      if (stockFilter !== 'all') {
        params.set('stock', stockFilter);
      }
      if (visibilityFilter !== 'all') {
        params.set('visibility', visibilityFilter);
      }
    }

    // Обновляем URL без перезагрузки страницы
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  // Проверка, есть ли активные фильтры
  const hasActiveFilters = stockFilter !== 'all' || visibilityFilter !== 'all';

  // Обработчик массового удаления
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    setIsDeleting(true);
    try {
      const response = await fetch('/api/catalog/products/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении товаров');
      }

      // Обновляем список товаров
      setProducts((prevProducts) =>
        prevProducts.filter((product) => !selectedProducts.has(product.id))
      );

      setSelectedProducts(new Set());
      setAllSelected(false);
      toast.success('Выбранные товары удалены');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при удалении товаров'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Обработчик массового изменения видимости
  const handleBulkVisibility = async (isVisible: boolean) => {
    if (selectedProducts.size === 0) return;

    try {
      const response = await fetch('/api/catalog/products/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          data: { isVisible },
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении товаров');
      }

      // Обновляем состояние товаров
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          selectedProducts.has(product.id) ? { ...product, isVisible } : product
        )
      );

      toast.success(`Выбранные товары ${isVisible ? 'показаны' : 'скрыты'}`);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при обновлении товаров'
      );
    }
  };

  // Обработчик массового изменения категории
  const handleBulkChangeCategory = async (newCategoryId: string) => {
    if (selectedProducts.size === 0) return;

    try {
      const response = await fetch('/api/catalog/products/bulk-update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productIds: Array.from(selectedProducts),
          data: { categoryId: newCategoryId },
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении категории товаров');
      }

      // Обновляем список товаров
      await fetchProducts();
      setSelectedProducts(new Set());
      setAllSelected(false);

      toast.success('Категория выбранных товаров изменена');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при обновлении категории'
      );
    }
  };

  // Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/catalog/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };

    fetchCategories();
  }, []);

  // Обработчик открытия диалога массового удаления
  const openBulkDeleteDialog = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchProducts}>Повторить</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {selectedProducts.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Выбрано: {selectedProducts.size}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Действия <MoreHorizontal className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkVisibility(true)}>
                    Показать на сайте
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkVisibility(false)}>
                    Скрыть с сайта
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsCategoryDialogOpen(true)}
                  >
                    <FolderInput className="h-4 w-4 mr-2" />
                    Переместить в категорию
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openBulkDeleteDialog}>
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {hasActiveFilters && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                Активные фильтры:
              </span>
              {stockFilter !== 'all' && (
                <span className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1 mr-2">
                  {stockFilter === 'instock' ? 'В наличии' : 'Нет в наличии'}
                </span>
              )}
              {visibilityFilter !== 'all' && (
                <span className="bg-gray-100 text-gray-700 text-xs rounded-full px-3 py-1 mr-2">
                  {visibilityFilter === 'visible' ? 'Видимые' : 'Скрытые'}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs h-7"
              >
                Сбросить
              </Button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                Фильтры{' '}
                {hasActiveFilters && (
                  <span className="ml-1 rounded-full bg-blue-100 text-blue-600 w-5 h-5 flex items-center justify-center text-xs">
                    !
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Наличие
                  </label>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="instock">В наличии</SelectItem>
                      <SelectItem value="outofstock">Нет в наличии</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">
                    Видимость
                  </label>
                  <Select
                    value={visibilityFilter}
                    onValueChange={setVisibilityFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="visible">Видимые</SelectItem>
                      <SelectItem value="hidden">Скрытые</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Сбросить
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyFilters}
                    disabled={isApplyingFilters}
                  >
                    {isApplyingFilters ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Применить
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading && products.length > 0 && (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      <div className="bg-white rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Выбрать все товары"
                />
              </TableHead>
              <TableHead className="w-16">Фото</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Артикул</TableHead>
              <TableHead>Остаток</TableHead>
              <TableHead>Цена опт</TableHead>
              <TableHead>Цена на сайте</TableHead>
              <TableHead>Показывать на сайте</TableHead>
              <TableHead className="w-24">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                      aria-label={`Выбрать товар ${product.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    {product.images && product.images.length > 0 ? (
                      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        Нет
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.name}
                    {/* Отображаем информацию о категории, если товар не из текущей просматриваемой категории */}
                    {product.category && product.category.id !== categoryId && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        {product.category?.parent && (
                          <>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (
                                  onCategorySelect &&
                                  product.category?.parent?.id
                                ) {
                                  onCategorySelect(product.category.parent.id);
                                } else if (product.category?.parent?.id) {
                                  window.location.href = `?category=${product.category.parent.id}`;
                                }
                              }}
                              className="text-blue-500 hover:underline"
                            >
                              {product.category.parent.name}
                            </button>
                            <span className="mx-1">→</span>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onCategorySelect && product.category?.id) {
                              onCategorySelect(product.category.id);
                            } else if (product.category?.id) {
                              // Fallback для случаев, когда onCategorySelect не передан
                              window.location.href = `?category=${product.category.id}`;
                            }
                          }}
                          className="text-blue-500 hover:underline"
                        >
                          {product.category.name}
                        </button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <span
                      className={
                        product.stock === 0
                          ? 'text-red-500'
                          : product.stock < 5
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>{product.wholesalePrice} ₽</TableCell>
                  <TableCell>{product.retailPrice} ₽</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.isVisible}
                      onCheckedChange={() =>
                        handleToggleVisibility(product.id, product.isVisible)
                      }
                      aria-label={
                        product.isVisible ? 'Скрыть товар' : 'Показать товар'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product.id)}
                        aria-label="Редактировать товар"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(product.id)}
                        aria-label="Удалить товар"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  {error ? (
                    <div>
                      <p className="text-red-500 mb-2">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchProducts}
                      >
                        Повторить
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Товары не найдены. Попробуйте изменить параметры поиска
                      или{' '}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => {
                          // Перенаправление на страницу создания товара
                          window.location.href = `/dashboard/catalog/products/new?category=${categoryId}`;
                        }}
                      >
                        добавьте новый товар
                      </Button>
                      .
                    </p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              Первая
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Назад
            </Button>
            <div className="flex items-center px-3 text-sm">
              {currentPage} из {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Вперед
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Последняя
            </Button>
          </div>
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот товар? Это действие нельзя
              отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог выбора категории */}
      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выберите категорию</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <CategoryTreeView
              categories={categories}
              selectedCategoryIds={[]}
              onSelectCategory={(categoryId: string, checked: boolean) => {
                if (checked) {
                  handleBulkChangeCategory(categoryId);
                  setIsCategoryDialogOpen(false);
                }
              }}
              multiSelect={false}
              initialExpandedCategoryId={
                categoryId !== 'all' ? categoryId : undefined
              }
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения массового удаления */}
      <AlertDialog
        open={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление товаров</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить выбранные товары (
              {selectedProducts.size} шт.)? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Удалить'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
