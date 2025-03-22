'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Связанные товары</CardTitle>
        </CardHeader>
        <CardContent>
          {relatedProducts.length > 0 ? (
            <div className="space-y-2">
              {relatedProducts.map((productId) => (
                <div
                  key={productId}
                  className="flex items-center justify-between border rounded-md p-2"
                >
                  <div className="flex items-center">
                    {mockProducts.find((p) => p.id === productId)?.image && (
                      <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden mr-3">
                        <Image
                          src={
                            mockProducts.find((p) => p.id === productId)
                              ?.image || ''
                          }
                          alt={
                            mockProducts.find((p) => p.id === productId)
                              ?.name || 'Изображение продукта'
                          }
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {mockProducts.find((p) => p.id === productId)?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {mockProducts.find((p) => p.id === productId)?.sku}
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
              ))}
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
              {complementaryProducts.map((productId) => (
                <div
                  key={productId}
                  className="flex items-center justify-between border rounded-md p-2"
                >
                  <div className="flex items-center">
                    {mockProducts.find((p) => p.id === productId)?.image && (
                      <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden mr-3">
                        <Image
                          src={
                            mockProducts.find((p) => p.id === productId)
                              ?.image || ''
                          }
                          alt={
                            mockProducts.find((p) => p.id === productId)
                              ?.name || 'Изображение продукта'
                          }
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {mockProducts.find((p) => p.id === productId)?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {mockProducts.find((p) => p.id === productId)?.sku}
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
              ))}
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

          <div className="space-y-4 py-4">
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
                className="max-h-80 overflow-y-auto mt-4"
              >
                {filteredProducts.length > 0 ? (
                  <div className="space-y-2">
                    {filteredProducts.map((product) => {
                      const isAdded = isProductAdded(product.id, dialogType);

                      return (
                        <div
                          key={product.id}
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
                          <div className="flex items-center">
                            <Checkbox
                              id={`product-${product.id}`}
                              checked={isAdded}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleAddProduct(product);
                                } else {
                                  onRemove(product.id, dialogType);
                                }
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Товары не найдены</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="category1"
                className="max-h-80 overflow-y-auto mt-4"
              >
                <div className="text-center py-8">
                  <p className="text-gray-500">Товары категории 1</p>
                </div>
              </TabsContent>

              <TabsContent
                value="category2"
                className="max-h-80 overflow-y-auto mt-4"
              >
                <div className="text-center py-8">
                  <p className="text-gray-500">Товары категории 2</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setShowDialog(false)}>
              Готово
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
