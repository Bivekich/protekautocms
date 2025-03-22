'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Связанные товары</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedProducts.length > 0 ? (
            <div className="space-y-2">
              {relatedProducts.map((productId) => {
                const product = getProductInfo(productId);

                return (
                  <div
                    key={productId}
                    className="flex items-center justify-between border rounded-md p-2"
                  >
                    <div className="flex items-center">
                      {product.image && (
                        <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden mr-3">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.sku}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(productId, 'related')}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Нет связанных товаров</p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => handleOpenDialog('related')}
          >
            <Plus size={16} className="mr-2" />
            Добавить связанные товары
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сопутствующие товары</CardTitle>
        </CardHeader>
        <CardContent>
          {complementaryProducts.length > 0 ? (
            <div className="space-y-2">
              {complementaryProducts.map((productId) => {
                const product = getProductInfo(productId);

                return (
                  <div
                    key={productId}
                    className="flex items-center justify-between border rounded-md p-2"
                  >
                    <div className="flex items-center">
                      {product.image && (
                        <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden mr-3">
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.sku}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(productId, 'complementary')}
                      className="h-8 w-8 p-0 text-red-600"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">Нет сопутствующих товаров</p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => handleOpenDialog('complementary')}
          >
            <Plus size={16} className="mr-2" />
            Добавить сопутствующие товары
          </Button>
        </CardContent>
      </Card>

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
