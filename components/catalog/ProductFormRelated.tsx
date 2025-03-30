'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, X } from 'lucide-react';
import { RelatedProduct } from './ProductForm';
import Image from 'next/image';
import ProductTreeView, { ProductWithCategory } from './ProductTreeView';
import { Category } from './CategoryTreeView';

// Расширяем интерфейс для отображения товаров
interface ProductDisplay extends RelatedProduct {
  image?: string;
}

type ProductFormRelatedProps = {
  relatedProducts: string[];
  complementaryProducts: string[];
  onAdd: (product: RelatedProduct, type: 'related' | 'complementary') => void;
  onRemove: (productId: string, type: 'related' | 'complementary') => void;
};

export default function ProductFormRelated({
  relatedProducts,
  complementaryProducts,
  onAdd,
  onRemove,
}: ProductFormRelatedProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'related' | 'complementary'>(
    'related'
  );

  // Состояние для хранения категорий и товаров
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка категорий и товаров при монтировании компонента
  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      setLoading(true);
      try {
        // Загружаем категории - изменяем запрос, чтобы получить все категории, включая неактивные
        const categoriesResponse = await fetch(
          '/api/catalog/categories?includeHidden=true'
        );
        const categoriesData = await categoriesResponse.json();

        // Загружаем товары
        const productsResponse = await fetch('/api/catalog/products?limit=500');
        const productsData = await productsResponse.json();

        // Преобразуем товары в формат ProductWithCategory
        const productsWithCategory = productsData.products.map(
          (product: {
            id: string;
            name: string;
            sku: string;
            mainImage?: string;
            categoryId?: string;
          }) => ({
            id: product.id,
            name: product.name,
            sku: product.sku,
            image: product.mainImage,
            categoryId: product.categoryId || 'uncategorized',
          })
        );

        // Убедимся, что категория "без категории" существует для товаров без категории
        if (
          productsWithCategory.some(
            (p: ProductWithCategory) => p.categoryId === 'uncategorized'
          )
        ) {
          const hasUncategorized = categoriesData.some(
            (c: Category) => c.id === 'uncategorized'
          );
          if (!hasUncategorized) {
            categoriesData.push({
              id: 'uncategorized',
              name: 'Без категории',
              parentId: null,
              level: 0,
            });
          }
        }

        // Обновляем состояние
        setCategories(categoriesData);
        setProducts(productsWithCategory);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, []);

  // Открытие диалога для добавления связанных товаров
  const handleOpenDialog = (type: 'related' | 'complementary') => {
    setDialogType(type);
    setShowDialog(true);
  };

  // Обработчик выбора товара
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (!checked) return;

    // Находим выбранный товар
    const selectedProduct = products.find((p) => p.id === productId);
    if (selectedProduct) {
      // Создаем новый объект без поля categoryId
      const productData: RelatedProduct = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        image: selectedProduct.image,
      };
      onAdd(productData, dialogType);
      setShowDialog(false);
    }
  };

  // Получаем информацию о товаре по его ID
  const getProductInfo = (productId: string): ProductDisplay => {
    return (
      products.find((p) => p.id === productId) || {
        id: productId,
        name: 'Товар не найден',
        sku: 'Неизвестный артикул',
      }
    );
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium">Связанные товары</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDialog('related')}
            className="h-6 px-2 text-xs"
          >
            <Plus size={12} className="mr-1" />
            Добавить
          </Button>
        </div>

        {relatedProducts.length > 0 ? (
          <div className="grid gap-1">
            {relatedProducts.map((productId) => {
              const product = getProductInfo(productId);
              return (
                <div
                  key={productId}
                  className="flex items-center justify-between py-1 px-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {product.image && (
                      <div className="w-6 h-6 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="text-xs font-medium truncate">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {product.sku}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(productId, 'related')}
                    className="h-5 w-5 p-0 text-red-600"
                  >
                    <X size={12} />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-1 bg-gray-50 text-[11px] text-gray-500 rounded">
            Нет связанных товаров
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium">Сопутствующие товары</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDialog('complementary')}
            className="h-6 px-2 text-xs"
          >
            <Plus size={12} className="mr-1" />
            Добавить
          </Button>
        </div>

        {complementaryProducts.length > 0 ? (
          <div className="grid gap-1">
            {complementaryProducts.map((productId) => {
              const product = getProductInfo(productId);
              return (
                <div
                  key={productId}
                  className="flex items-center justify-between py-1 px-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {product.image && (
                      <div className="w-6 h-6 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <div className="text-xs font-medium truncate">
                        {product.name}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {product.sku}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(productId, 'complementary')}
                    className="h-5 w-5 p-0 text-red-600"
                  >
                    <X size={12} />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-1 bg-gray-50 text-[11px] text-gray-500 rounded">
            Нет сопутствующих товаров
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'related'
                ? 'Добавление связанных товаров'
                : 'Добавление сопутствующих товаров'}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center">
              <p>Загрузка товаров...</p>
            </div>
          ) : (
            <ProductTreeView
              categories={categories}
              products={products}
              selectedProductIds={
                dialogType === 'related'
                  ? relatedProducts
                  : complementaryProducts
              }
              onSelectProduct={handleSelectProduct}
              multiSelect={false}
            />
          )}

          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
