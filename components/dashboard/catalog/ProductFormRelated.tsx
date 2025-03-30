'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, X } from 'lucide-react';
import { RelatedProduct } from './ProductForm';
import Image from 'next/image';

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
  const [searchQuery, setSearchQuery] = useState('');

  // Моковые данные для поиска товаров
  const mockProducts: RelatedProduct[] = [
    { id: 'prod1', name: 'Товар 1', sku: 'SKU-001', image: '/placeholder.jpg' },
    { id: 'prod2', name: 'Товар 2', sku: 'SKU-002' },
    { id: 'prod3', name: 'Товар 3', sku: 'SKU-003', image: '/placeholder.jpg' },
    { id: 'prod4', name: 'Товар 4', sku: 'SKU-004' },
    { id: 'prod5', name: 'Товар 5', sku: 'SKU-005', image: '/placeholder.jpg' },
  ];

  // Фильтрация товаров по поисковому запросу
  const filteredProducts = searchQuery
    ? mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mockProducts;

  // Открытие диалога для добавления связанных товаров
  const handleOpenDialog = (type: 'related' | 'complementary') => {
    setDialogType(type);
    setSearchQuery('');
    setShowDialog(true);
  };

  // Обработчик добавления связанного товара
  const handleAddProduct = (product: RelatedProduct) => {
    onAdd(product, dialogType);
  };

  // Проверка, добавлен ли товар уже в список
  const isProductAdded = (
    productId: string,
    type: 'related' | 'complementary'
  ) => {
    return type === 'related'
      ? relatedProducts.some((p) => p === productId)
      : complementaryProducts.some((p) => p === productId);
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
            {relatedProducts.map((productId) => (
              <div
                key={productId}
                className="flex items-center justify-between py-1 px-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {mockProducts.find((p) => p.id === productId)?.image && (
                    <div className="w-6 h-6 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          mockProducts.find((p) => p.id === productId)?.image ||
                          ''
                        }
                        alt={
                          mockProducts.find((p) => p.id === productId)?.name ||
                          'Изображение продукта'
                        }
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <div className="text-xs font-medium truncate">
                      {mockProducts.find((p) => p.id === productId)?.name}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {mockProducts.find((p) => p.id === productId)?.sku}
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
            ))}
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
            {complementaryProducts.map((productId) => (
              <div
                key={productId}
                className="flex items-center justify-between py-1 px-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {mockProducts.find((p) => p.id === productId)?.image && (
                    <div className="w-6 h-6 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          mockProducts.find((p) => p.id === productId)?.image ||
                          ''
                        }
                        alt={
                          mockProducts.find((p) => p.id === productId)?.name ||
                          'Изображение продукта'
                        }
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <div className="text-xs font-medium truncate">
                      {mockProducts.find((p) => p.id === productId)?.name}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {mockProducts.find((p) => p.id === productId)?.sku}
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
            ))}
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

          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Поиск товаров по названию или артикулу..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">
                  Все товары
                </TabsTrigger>
                <TabsTrigger value="category1" className="flex-1">
                  Категория 1
                </TabsTrigger>
                <TabsTrigger value="category2" className="flex-1">
                  Категория 2
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="all"
                className="max-h-80 overflow-y-auto mt-2"
              >
                {filteredProducts.length > 0 ? (
                  <div className="grid gap-1">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
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

                        <div className="flex-shrink-0">
                          {isProductAdded(product.id, dialogType) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemove(product.id, dialogType)}
                              className="h-5 w-5 p-0 text-red-600"
                            >
                              <X size={12} />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddProduct(product)}
                              className="h-6 px-2 text-xs"
                            >
                              Добавить
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-xs text-gray-500">
                    Товары не найдены
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="category1"
                className="max-h-80 overflow-y-auto mt-2"
              >
                <div className="text-center py-3 text-xs text-gray-500">
                  Нет товаров в категории
                </div>
              </TabsContent>

              <TabsContent
                value="category2"
                className="max-h-80 overflow-y-auto mt-2"
              >
                <div className="text-center py-3 text-xs text-gray-500">
                  Нет товаров в категории
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowDialog(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
