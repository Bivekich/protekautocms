'use client';

import { useState, useEffect, useCallback } from 'react';
import { Edit, Trash2, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Search, Plus, Filter } from 'lucide-react';
import { Product } from '@/types/catalog';
import { productsApi } from '@/lib/catalog-api';
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

type ProductsListProps = {
  categoryId: string;
  searchQuery?: string;
  onEditProduct?: (productId: string) => void;
  onAddProduct?: () => void;
};

export default function ProductsList({
  categoryId,
  searchQuery = '',
  onEditProduct,
  onAddProduct,
}: ProductsListProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [allSelected, setAllSelected] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Состояния для фильтров
  const [stockFilter, setStockFilter] = useState<
    'all' | 'instock' | 'outofstock'
  >('all');
  const [visibilityFilter, setVisibilityFilter] = useState<
    'all' | 'visible' | 'hidden'
  >('all');
  const [sortOrder, setSortOrder] = useState<
    'default' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'
  >('default');

  // Применение фильтров и сортировки
  const applyFiltersAndSort = useCallback(
    (productsToFilter = products) => {
      // Фильтрация
      let filtered = [...productsToFilter];

      // Фильтр по наличию
      if (stockFilter !== 'all') {
        filtered = filtered.filter((product) => {
          if (stockFilter === 'instock') {
            return product.stock > 0;
          } else {
            return product.stock === 0;
          }
        });
      }

      // Фильтр по видимости
      if (visibilityFilter !== 'all') {
        filtered = filtered.filter((product) => {
          if (visibilityFilter === 'visible') {
            return product.isVisible;
          } else {
            return !product.isVisible;
          }
        });
      }

      // Сортировка
      if (sortOrder !== 'default') {
        filtered.sort((a, b) => {
          switch (sortOrder) {
            case 'name_asc':
              return a.name.localeCompare(b.name);
            case 'name_desc':
              return b.name.localeCompare(a.name);
            case 'price_asc':
              return a.retailPrice - b.retailPrice;
            case 'price_desc':
              return b.retailPrice - a.retailPrice;
            default:
              return 0;
          }
        });
      }

      setFilteredProducts(filtered);
    },
    [products, stockFilter, visibilityFilter, sortOrder]
  );

  // Загрузка товаров
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        let data: Product[];

        if (localSearchQuery.trim()) {
          data = await productsApi.search(localSearchQuery, categoryId);
        } else {
          data = await productsApi.getByCategory(categoryId);
        }

        // Более детальное логирование товаров и их изображений
        console.log('==================== ДАННЫЕ ТОВАРОВ ====================');
        console.log(
          'Получены данные товаров от API:',
          JSON.stringify(data, null, 2)
        );

        if (data.length > 0) {
          data.forEach((product, index) => {
            console.log(`Товар #${index + 1} ${product.id} - ${product.name}:`);
            console.log('- mainImage:', product.mainImage);
            console.log('- imageUrls:', product.imageUrls);
            console.log('- images:', product.images);
          });
        } else {
          console.log('Нет товаров в данной категории');
        }
        console.log('=======================================================');

        setProducts(data);
        applyFiltersAndSort(data); // Применяем фильтры и сортировку к новым данным
      } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        toast.error('Не удалось загрузить товары');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [categoryId, localSearchQuery, applyFiltersAndSort]);

  // Применяем фильтры при их изменении
  useEffect(() => {
    applyFiltersAndSort();
  }, [stockFilter, visibilityFilter, sortOrder, applyFiltersAndSort]);

  // Обработчик применения фильтров
  const handleApplyFilters = () => {
    applyFiltersAndSort();
  };

  // Обновление локального поиска при изменении внешнего searchQuery
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
    visible: boolean
  ) => {
    try {
      await productsApi.toggleVisibility(productId, visible);

      // Обновляем состояние товара в списке
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === productId ? { ...p, isVisible: visible } : p
        )
      );

      toast.success(`Товар ${visible ? 'показан' : 'скрыт'}`);
    } catch (error) {
      console.error('Ошибка при изменении видимости товара:', error);
      toast.error('Не удалось изменить видимость товара');
    }
  };

  // Обработчик редактирования товара
  const handleEditProduct = (productId: string) => {
    if (onEditProduct) {
      onEditProduct(productId);
    }
  };

  // Обработчик удаления товара
  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  // Подтверждение удаления товара
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await productsApi.delete(productToDelete);
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productToDelete)
      );
      toast.success('Товар успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      toast.error('Не удалось удалить товар');
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Обработчик массового удаления товаров
  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) {
      toast.error('Не выбрано ни одного товара');
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  // Подтверждение массового удаления товаров
  const confirmBulkDelete = async () => {
    try {
      await productsApi.bulkDelete(Array.from(selectedProducts));
      setProducts((prevProducts) =>
        prevProducts.filter((p) => !selectedProducts.has(p.id))
      );
      setSelectedProducts(new Set());
      setAllSelected(false);
      toast.success('Выбранные товары успешно удалены');
    } catch (error) {
      console.error('Ошибка при удалении товаров:', error);
      toast.error('Не удалось удалить выбранные товары');
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  // Обработчик добавления товара
  const handleAddProduct = () => {
    if (onAddProduct) {
      onAddProduct();
    }
  };

  // Обработчик переключения фильтров
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Инициализируем filteredProducts при первом рендере
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск товаров..."
            className="pl-8"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {selectedProducts.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Удалить выбранные ({selectedProducts.size})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={toggleFilters}>
            <Filter size={16} className="mr-2" />
            Фильтры
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddProduct}>
            <Plus size={16} className="mr-2" />
            Добавить товар
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <div className="text-sm font-medium mb-2">Фильтры</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Наличие
              </label>
              <Select
                value={stockFilter}
                onValueChange={(value: 'all' | 'instock' | 'outofstock') =>
                  setStockFilter(value)
                }
              >
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
                onValueChange={(value: 'all' | 'visible' | 'hidden') =>
                  setVisibilityFilter(value)
                }
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
            <div>
              <label className="text-sm text-gray-500 mb-1 block">
                Сортировка
              </label>
              <Select
                value={sortOrder}
                onValueChange={(
                  value:
                    | 'default'
                    | 'name_asc'
                    | 'name_desc'
                    | 'price_asc'
                    | 'price_desc'
                ) => setSortOrder(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="По умолчанию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">По умолчанию</SelectItem>
                  <SelectItem value="name_asc">По названию (А-Я)</SelectItem>
                  <SelectItem value="name_desc">По названию (Я-А)</SelectItem>
                  <SelectItem value="price_asc">По цене (возр.)</SelectItem>
                  <SelectItem value="price_desc">По цене (убыв.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button size="sm" onClick={handleApplyFilters} className="w-auto">
              Применить фильтры
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={() => handleSelectProduct(product.id)}
                        aria-label={`Выбрать товар ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      {(() => {
                        console.log('Отображение изображения для товара:', {
                          id: product.id,
                          name: product.name,
                          mainImage: product.mainImage,
                          imageUrls: product.imageUrls,
                          images: product.images,
                        });

                        // Получаем URL изображения из разных источников
                        let imageUrl = null;

                        // Приоритет 1: основное изображение (mainImage)
                        if (product.mainImage) {
                          imageUrl = product.mainImage;
                        }
                        // Приоритет 2: первое из массива imageUrls
                        else if (
                          product.imageUrls &&
                          product.imageUrls.length > 0
                        ) {
                          imageUrl = product.imageUrls[0];
                        }
                        // Приоритет 3: первое из массива images
                        else if (product.images && product.images.length > 0) {
                          imageUrl = product.images[0].url;
                        }

                        // Форматируем URL, если необходимо
                        if (imageUrl && imageUrl.startsWith('/uploads')) {
                          imageUrl = window.location.origin + imageUrl;
                        }

                        console.log('Итоговый URL изображения:', imageUrl);

                        return (
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded overflow-hidden">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.name || 'Фото товара'}
                                width={40}
                                height={40}
                                style={{
                                  objectFit: 'cover',
                                  width: '100%',
                                  height: '100%',
                                }}
                                onError={(e) => {
                                  console.error(
                                    'Ошибка загрузки изображения:',
                                    imageUrl
                                  );
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      <span
                        className={
                          product.stock === 0
                            ? 'text-red-500'
                            : 'text-green-600'
                        }
                      >
                        {product.stock} {product.unit}
                      </span>
                    </TableCell>
                    <TableCell>{product.wholesalePrice} ₽</TableCell>
                    <TableCell>{product.retailPrice} ₽</TableCell>
                    <TableCell>
                      <Switch
                        checked={product.isVisible}
                        onCheckedChange={(checked) =>
                          handleToggleVisibility(product.id, checked)
                        }
                        aria-label={`Переключить видимость товара ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(product.id)}
                          aria-label={`Редактировать товар ${product.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                          aria-label={`Удалить товар ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    {isLoading
                      ? 'Загрузка товаров...'
                      : localSearchQuery ||
                        stockFilter !== 'all' ||
                        visibilityFilter !== 'all'
                      ? 'Товары не найдены. Попробуйте изменить параметры фильтрации или поиска.'
                      : 'В этой категории пока нет товаров.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Диалог подтверждения удаления товара */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление товара</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот товар? Это действие нельзя
              отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Диалог подтверждения массового удаления товаров */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удаление товаров</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить выбранные товары (
              {selectedProducts.size} шт.)? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить все
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
