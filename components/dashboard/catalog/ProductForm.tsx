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
import { Loader2 } from 'lucide-react';
import ProductFormBasicInfo from './ProductFormBasicInfo';
import ProductFormSettings from './ProductFormSettings';
import ProductFormOptions from './ProductFormOptions';
import ProductFormCharacteristics from './ProductFormCharacteristics';
import ProductFormRelated from './ProductFormRelated';
import {
  Product as ProductType,
  ProductFormData as ProductFormDataType,
  ProductCharacteristic as ProductCharacteristicType,
} from '@/types/catalog';
import { productsApi } from '@/lib/catalog-api';
import { toast } from 'sonner';

type ProductFormProps = {
  isOpen: boolean;
  onClose: () => void;
  productId?: string | null;
  initialCategoryId?: string | null;
  onSave?: (product: ProductType) => void;
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
  characteristics: ProductCharacteristicType[];
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

// Экспортируем тип ProductCharacteristic для использования в других компонентах
export type ProductCharacteristic = {
  id: string;
  name: string;
  value: string;
};

// Экспортируем тип ProductOption для использования в других компонентах
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

// Экспортируем тип RelatedProduct для использования в других компонентах
export type RelatedProduct = {
  id: string;
  name: string;
  image?: string;
  sku: string;
};

export default function ProductForm({
  isOpen,
  onClose,
  productId = null,
  initialCategoryId = null,
  onSave,
}: ProductFormProps) {
  const [activeTab, setActiveTab] = useState('basic-info');
  const [product, setProduct] = useState<ProductFormDataType>({
    name: '',
    sku: '',
    slug: '',
    description: '',
    price: 0,
    compareAtPrice: 0,
    cost: 0,
    stock: 0,
    visible: true,
    applyDiscounts: true,
    categoryIds: initialCategoryId ? [initialCategoryId] : [],
    unit: 'шт',
    images: [],
    video: '',
    options: [],
    characteristics: [],
    relatedProducts: [],
    complementaryProducts: [],
    seoTitle: '',
    seoDescription: '',
    wholesalePrice: 0,
    retailPrice: 0,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Загрузка данных товара при редактировании
  useEffect(() => {
    const loadProduct = async () => {
      if (productId) {
        try {
          setIsLoading(true);
          const data = await productsApi.getById(productId);
          if (data) {
            setProduct({
              name: data.name,
              sku: data.sku,
              slug: data.slug,
              description: data.description || '',
              wholesalePrice: data.wholesalePrice,
              retailPrice: data.retailPrice,
              stock: data.stock,
              visible: data.isVisible,
              applyDiscounts: true,
              categoryIds: data.categoryId ? [data.categoryId] : [],
              unit: 'шт',
              images: [],
              video: '',
              options: [],
              characteristics: [],
              relatedProducts: [],
              complementaryProducts: [],
              seoTitle: data.name,
              seoDescription: data.description || '',
              price: data.retailPrice,
              compareAtPrice: data.retailPrice,
              cost: data.wholesalePrice,
              weight: 0,
              dimensions: {
                length: 0,
                width: 0,
                height: 0,
              },
            });
          }
        } catch (error) {
          console.error('Ошибка при загрузке товара:', error);
          toast.error('Не удалось загрузить данные товара');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Сброс формы при создании нового товара
        setProduct({
          name: '',
          sku: '',
          slug: '',
          description: '',
          price: 0,
          compareAtPrice: 0,
          cost: 0,
          stock: 0,
          visible: true,
          applyDiscounts: true,
          categoryIds: initialCategoryId ? [initialCategoryId] : [],
          unit: 'шт',
          images: [],
          video: '',
          options: [],
          characteristics: [],
          relatedProducts: [],
          complementaryProducts: [],
          seoTitle: '',
          seoDescription: '',
          wholesalePrice: 0,
          retailPrice: 0,
          weight: 0,
          dimensions: {
            length: 0,
            width: 0,
            height: 0,
          },
        });
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadProduct();
    }
  }, [productId, initialCategoryId, isOpen]);

  // Обработчик изменения основной информации о товаре
  const handleBasicInfoChange = (data: Partial<ProductFormDataType>) => {
    setProduct((prev) => ({ ...prev, ...data }));
  };

  // Обработчик изменения настроек товара
  const handleSettingsChange = (data: Partial<ProductFormDataType>) => {
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
      setIsSaving(true);

      // Валидация формы
      if (!product.name.trim()) {
        toast.error('Название товара обязательно');
        return;
      }

      if (!product.sku.trim()) {
        toast.error('Артикул товара обязателен');
        return;
      }

      // Преобразуем данные товара в формат API
      const apiData = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        wholesalePrice: product.wholesalePrice,
        retailPrice: product.retailPrice,
        stock: product.stock,
        isVisible: product.visible,
        categoryId: product.categoryIds[0] || null,
        // Преобразуем изображения в формат, который ожидает API
        images: product.images.map((url) => ({
          url,
          alt: product.name,
        })),
        characteristics: product.characteristics.map((c) => ({
          name: c.name,
          value: c.value,
        })),
      };

      console.log('Отправка данных товара на сервер:', apiData);

      let savedProduct: ProductType;

      if (productId) {
        // Обновление существующего товара
        const response = await fetch(`/api/catalog/products/${productId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка при обновлении товара');
        }

        savedProduct = await response.json();
      } else {
        // Создание нового товара
        const response = await fetch('/api/catalog/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка при создании товара');
        }

        savedProduct = await response.json();
      }

      // Вызываем колбэк onSave, если он предоставлен
      if (onSave) {
        onSave(savedProduct);
      }

      toast.success(productId ? 'Товар обновлен' : 'Товар создан');
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении товара:', error);
      toast.error(
        error instanceof Error ? error.message : 'Не удалось сохранить товар'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {productId ? 'Редактирование товара' : 'Добавление товара'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            <p className="mt-2 text-gray-500">Загрузка данных товара...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="basic-info">Основная информация</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
              <TabsTrigger value="options">Опции товара</TabsTrigger>
              <TabsTrigger value="characteristics">Характеристики</TabsTrigger>
              <TabsTrigger value="related">Связанные товары</TabsTrigger>
            </TabsList>

            <TabsContent value="basic-info">
              <ProductFormBasicInfo
                data={product}
                onChange={handleBasicInfoChange}
              />
            </TabsContent>

            <TabsContent value="settings">
              <ProductFormSettings
                data={product}
                categories={[]}
                onChange={handleSettingsChange}
              />
            </TabsContent>

            <TabsContent value="options">
              <ProductFormOptions
                options={product.options}
                onAdd={handleAddOption}
                onEdit={handleEditOption}
                onRemove={handleRemoveOption}
              />
            </TabsContent>

            <TabsContent value="characteristics">
              <ProductFormCharacteristics
                characteristics={product.characteristics}
                onChange={(characteristics) =>
                  setProduct((prev) => ({ ...prev, characteristics }))
                }
              />
            </TabsContent>

            <TabsContent value="related">
              <ProductFormRelated
                relatedProducts={product.relatedProducts}
                complementaryProducts={product.complementaryProducts}
                onAdd={handleAddRelatedProduct}
                onRemove={handleRemoveRelatedProduct}
              />
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
