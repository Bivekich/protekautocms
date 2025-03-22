'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ProductFormBasicInfo from './ProductFormBasicInfo';
import ProductFormSettings from './ProductFormSettings';
import ProductFormOptions from './ProductFormOptions';
import ProductFormCharacteristics from './ProductFormCharacteristics';
import ProductFormRelated from './ProductFormRelated';
import { toast } from 'sonner';

// Тип для товара
type Product = {
  id: string;
  name: string;
  sku: string;
  description: string;
  wholesalePrice: number;
  retailPrice: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  stock: number;
  visible: boolean;
  applyDiscounts: boolean;
  categories: string[];
  unit: string;
  imageUrls: string[];
  videoUrl?: string;
  options: ProductOption[];
  characteristics: ProductCharacteristic[];
  relatedProducts: string[];
  complementaryProducts: string[];
};

// Тип для опции товара
export type ProductOption = {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  values: {
    id: string;
    value: string;
    price: number;
  }[];
};

// Тип для вариации товара (будет использоваться в будущем)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ProductVariation = {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  values: {
    id: string;
    value: string;
    price: number;
  }[];
};

// Экспортируем тип ProductCharacteristic для использования в других компонентах
export type ProductCharacteristic = {
  id: string;
  name: string;
  value: string;
};

// Экспортируем тип для связанного товара
export type RelatedProduct = {
  id: string;
  name: string;
  image?: string;
  sku: string;
};

// Пример пустого товара
const emptyProduct: Product = {
  id: '',
  name: '',
  sku: '',
  description: '',
  wholesalePrice: 0,
  retailPrice: 0,
  weight: 0,
  dimensions: {
    length: 0,
    width: 0,
    height: 0,
  },
  stock: 0,
  visible: true,
  applyDiscounts: true,
  categories: [],
  unit: 'шт',
  imageUrls: [],
  videoUrl: '',
  options: [],
  characteristics: [],
  relatedProducts: [],
  complementaryProducts: [],
};

type ProductFormProps = {
  isOpen: boolean;
  onClose: () => void;
  productId?: string | null;
  initialCategoryId?: string | null;
};

// Экспортируем тип ProductFormData для использования в других компонентах
export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice: number;
  cost: number;
  visible: boolean;
  applyDiscounts: boolean;
  categoryIds: string[];
  unit: string;
  stock: number;
  characteristics: ProductCharacteristic[];
  images: string[];
  relatedProducts: string[];
  seoTitle: string;
  seoDescription: string;
  video?: string;
  wholesalePrice: number;
  retailPrice: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
};

export default function ProductForm({
  isOpen,
  onClose,
  productId = null,
  initialCategoryId = null,
}: ProductFormProps) {
  const [activeTab, setActiveTab] = useState('basic-info');
  const [product, setProduct] = useState<Product>(emptyProduct);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка данных товара при редактировании
  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      // Здесь будет запрос на получение данных товара
      // Имитация загрузки данных
      setTimeout(() => {
        // Пример данных товара
        setProduct({
          ...emptyProduct,
          id: productId,
          name: 'Название товара',
          sku: 'SKU-123',
          description: 'Описание товара',
          wholesalePrice: 230,
          retailPrice: 300,
          stock: 10,
          categories: initialCategoryId ? [initialCategoryId] : [],
        });
        setIsLoading(false);
      }, 500);
    } else {
      // Сброс формы при создании нового товара
      setProduct({
        ...emptyProduct,
        categories: initialCategoryId ? [initialCategoryId] : [],
      });
    }
  }, [productId, initialCategoryId]);

  // Обработчик изменения основной информации о товаре
  const handleBasicInfoChange = (data: Partial<Product>) => {
    setProduct((prev) => ({ ...prev, ...data }));
  };

  // Обработчик изменения настроек товара
  const handleSettingsChange = (data: Partial<Product>) => {
    setProduct((prev) => ({ ...prev, ...data }));
  };

  // Обработчики для опций товара
  const handleAddOption = (option: ProductOption) => {
    setProduct((prev) => ({
      ...prev,
      options: [...prev.options, option],
    }));
  };

  const handleEditOption = (option: ProductOption) => {
    setProduct((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === option.id ? option : o)),
    }));
  };

  const handleRemoveOption = (optionId: string) => {
    setProduct((prev) => ({
      ...prev,
      options: prev.options.filter((o) => o.id !== optionId),
    }));
  };

  // Обработчики для характеристик товара
  const handleAddCharacteristic = (characteristic: ProductCharacteristic) => {
    setProduct((prev) => ({
      ...prev,
      characteristics: [...prev.characteristics, characteristic],
    }));
  };

  const handleEditCharacteristic = (characteristic: ProductCharacteristic) => {
    setProduct((prev) => ({
      ...prev,
      characteristics: prev.characteristics.map((c) =>
        c.id === characteristic.id ? characteristic : c
      ),
    }));
  };

  const handleRemoveCharacteristic = (characteristicId: string) => {
    setProduct((prev) => ({
      ...prev,
      characteristics: prev.characteristics.filter(
        (c) => c.id !== characteristicId
      ),
    }));
  };

  // Обработчики для связанных товаров
  const handleAddRelatedProduct = (
    product: RelatedProduct,
    type: 'related' | 'complementary'
  ) => {
    if (type === 'related') {
      setProduct((prev) => ({
        ...prev,
        relatedProducts: [...prev.relatedProducts, product.id],
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        complementaryProducts: [...prev.complementaryProducts, product.id],
      }));
    }
  };

  const handleRemoveRelatedProduct = (
    productId: string,
    type: 'related' | 'complementary'
  ) => {
    if (type === 'related') {
      setProduct((prev) => ({
        ...prev,
        relatedProducts: prev.relatedProducts.filter((id) => id !== productId),
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        complementaryProducts: prev.complementaryProducts.filter(
          (id) => id !== productId
        ),
      }));
    }
  };

  // Обработчик сохранения товара
  const handleSave = async () => {
    try {
      console.log('Сохранение товара', product);

      // Проверка обязательных полей
      if (!product.name || !product.sku) {
        toast.error('Название и артикул товара обязательны');
        return;
      }

      setIsLoading(true);

      // Подготовка данных для отправки
      const productData = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        wholesalePrice: product.wholesalePrice,
        retailPrice: product.retailPrice,
        stock: product.stock,
        categoryId:
          product.categories.length > 0 ? product.categories[0] : undefined,
        isVisible: product.visible,
        images: product.imageUrls.map((url) => ({ url, alt: product.name })),
        characteristics: product.characteristics.map(({ name, value }) => ({
          name,
          value,
        })),
      };

      // Отправка запроса на сервер
      const response = await fetch('/api/catalog/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при сохранении товара');
      }

      const savedProduct = await response.json();
      console.log('Товар успешно сохранен:', savedProduct);

      toast.success('Товар успешно сохранен');
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении товара:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при сохранении товара'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Преобразование Product в ProductFormData
  const productToFormData = (product: Product): ProductFormData => {
    return {
      id: product.id,
      name: product.name,
      slug: product.sku, // Используем sku как slug
      sku: product.sku,
      description: product.description,
      price: product.retailPrice,
      compareAtPrice: product.retailPrice,
      cost: product.wholesalePrice,
      visible: product.visible,
      applyDiscounts: product.applyDiscounts,
      categoryIds: product.categories,
      unit: product.unit,
      stock: product.stock,
      characteristics: product.characteristics,
      images: product.imageUrls,
      relatedProducts: product.relatedProducts,
      seoTitle: product.name,
      seoDescription: product.description,
      video: product.videoUrl,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      weight: product.weight,
      dimensions: product.dimensions,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col overflow-hidden">
        <div className="p-6 pb-2 border-b">
          <DialogHeader className="px-0 pb-0">
            <DialogTitle>
              {productId ? 'Редактирование товара' : 'Добавление товара'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="h-full flex items-center justify-center py-8">
              <span>Загрузка данных товара...</span>
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <div className="px-6 py-2 border-b bg-white sticky top-0 z-10">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="basic-info">
                    Основная информация
                  </TabsTrigger>
                  <TabsTrigger value="settings">Настройки</TabsTrigger>
                  <TabsTrigger value="options">Опции товара</TabsTrigger>
                  <TabsTrigger value="characteristics">
                    Характеристики
                  </TabsTrigger>
                  <TabsTrigger value="related">Связанные товары</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <TabsContent value="basic-info" className="m-0 h-full">
                  <ProductFormBasicInfo
                    data={productToFormData(product)}
                    onChange={handleBasicInfoChange}
                  />
                </TabsContent>

                <TabsContent value="settings" className="m-0 h-full">
                  <ProductFormSettings
                    data={productToFormData(product)}
                    categories={[]}
                    onChange={handleSettingsChange}
                  />
                </TabsContent>

                <TabsContent value="options" className="m-0 h-full">
                  <ProductFormOptions
                    options={product.options}
                    onAdd={handleAddOption}
                    onEdit={handleEditOption}
                    onRemove={handleRemoveOption}
                  />
                </TabsContent>

                <TabsContent value="characteristics" className="m-0 h-full">
                  <ProductFormCharacteristics
                    characteristics={product.characteristics}
                    onAdd={handleAddCharacteristic}
                    onEdit={handleEditCharacteristic}
                    onRemove={handleRemoveCharacteristic}
                  />
                </TabsContent>

                <TabsContent value="related" className="m-0 h-full">
                  <ProductFormRelated
                    relatedProducts={product.relatedProducts}
                    complementaryProducts={product.complementaryProducts}
                    onAdd={handleAddRelatedProduct}
                    onRemove={handleRemoveRelatedProduct}
                  />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>

        <div className="p-4 border-t bg-white mt-auto">
          <DialogFooter className="px-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              Сохранить
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
