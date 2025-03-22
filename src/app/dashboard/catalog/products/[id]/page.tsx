'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  InfoIcon,
  SettingsIcon,
  TagIcon,
  ListFilter,
  LinkIcon,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Импортируем компоненты форм с правильными относительными путями
import ProductFormBasicInfo from '../../../../../../components/catalog/ProductFormBasicInfo';
import ProductFormSettings from '../../../../../../components/catalog/ProductFormSettings';
import ProductFormOptions from '../../../../../../components/catalog/ProductFormOptions';
import ProductFormCharacteristics from '../../../../../../components/catalog/ProductFormCharacteristics';
import ProductFormRelated from '../../../../../../components/catalog/ProductFormRelated';
import {
  ProductOption,
  ProductCharacteristic,
  RelatedProduct,
  ProductFormData,
} from '../../../../../../components/catalog/ProductForm';

// Тип для товара (то же самое, что в add-product)
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

// Преобразование Product в ProductFormData
const productToFormData = (product: Product): ProductFormData => {
  return {
    id: product.id,
    name: product.name,
    slug: product.sku,
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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [product, setProduct] = useState<Product>({
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
  });
  const [categories, setCategories] = useState([]);

  const productId =
    typeof params.id === 'string'
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : null;

  // Загрузка данных товара при монтировании компонента
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      setIsLoading(true);
      try {
        // Загружаем товар
        const response = await fetch(`/api/catalog/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct({
            id: data.id,
            name: data.name,
            sku: data.sku,
            description: data.description || '',
            wholesalePrice: data.wholesalePrice,
            retailPrice: data.retailPrice,
            weight: data.weight || 0,
            dimensions: data.dimensions || {
              length: 0,
              width: 0,
              height: 0,
            },
            stock: data.stock,
            visible: data.isVisible,
            applyDiscounts: data.applyDiscounts || true,
            categories: data.categoryId ? [data.categoryId] : [],
            unit: data.unit || 'шт',
            imageUrls: data.imageUrls || [],
            videoUrl: data.videoUrl || '',
            options: data.options || [],
            characteristics: data.characteristics || [],
            relatedProducts: data.relatedProducts || [],
            complementaryProducts: data.complementaryProducts || [],
          });
        } else {
          toast.error('Не удалось загрузить данные товара');
        }

        // Загружаем категории
        const categoriesResponse = await fetch('/api/catalog/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        toast.error('Произошла ошибка при загрузке данных');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Обработчик изменения основной информации
  const handleBasicInfoChange = (data: Partial<ProductFormData>) => {
    // Преобразуем данные из формы обратно в формат Product
    const productData: Partial<Product> = {};

    // Обрабатываем специфические поля
    if ('images' in data) {
      productData.imageUrls = data.images;
    }
    if ('video' in data) {
      productData.videoUrl = data.video;
    }

    // Обрабатываем другие поля, которые совпадают по имени
    if ('name' in data) productData.name = data.name;
    if ('sku' in data) productData.sku = data.sku;
    if ('description' in data) productData.description = data.description;
    if ('wholesalePrice' in data)
      productData.wholesalePrice = data.wholesalePrice;
    if ('retailPrice' in data) productData.retailPrice = data.retailPrice;
    if ('weight' in data) productData.weight = data.weight;
    if ('dimensions' in data) productData.dimensions = data.dimensions;

    // Обновляем состояние
    setProduct((prev) => ({ ...prev, ...productData }));
  };

  // Обработчик изменения настроек
  const handleSettingsChange = (data: Partial<ProductFormData>) => {
    // Преобразуем данные из формы обратно в формат Product
    const productData: Partial<Product> = {};

    // Обрабатываем специфические поля
    if ('visible' in data) productData.visible = data.visible;
    if ('applyDiscounts' in data)
      productData.applyDiscounts = data.applyDiscounts;
    if ('categoryIds' in data) productData.categories = data.categoryIds;
    if ('unit' in data) productData.unit = data.unit;
    if ('stock' in data) productData.stock = data.stock;

    // Обновляем состояние
    setProduct((prev) => ({ ...prev, ...productData }));
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
    if (!product.name.trim()) {
      toast.error('Название товара обязательно');
      return;
    }

    if (!product.sku.trim()) {
      toast.error('Артикул товара обязателен');
      return;
    }

    setIsSaving(true);
    try {
      // Формируем данные для отправки
      const apiData = {
        name: product.name,
        sku: product.sku,
        description: product.description,
        wholesalePrice: product.wholesalePrice,
        retailPrice: product.retailPrice,
        stock: product.stock,
        isVisible: product.visible,
        categoryId: product.categories[0] || null,
        // Остальные поля
      };

      // Отправляем запрос на обновление товара
      const response = await fetch(`/api/catalog/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        toast.success('Товар успешно обновлен');
        router.push('/dashboard/catalog');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении товара');
      }
    } catch (error) {
      console.error('Ошибка при сохранении товара:', error);
      toast.error('Произошла ошибка при сохранении товара');
    } finally {
      setIsSaving(false);
    }
  };

  // Обработчик отмены
  const handleCancel = () => {
    router.push('/dashboard/catalog');
  };

  // Получение статуса товара (для отображения бейджа)
  const getProductStatusBadge = () => {
    if (!product.visible) {
      return <Badge variant="secondary">Скрыт</Badge>;
    }
    if (product.stock === 0) {
      return <Badge variant="destructive">Нет в наличии</Badge>;
    }
    return <Badge variant="default">Активен</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Шапка страницы */}
      <div className="flex justify-between items-center pb-6 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Редактирование товара</h1>
          {getProductStatusBadge()}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Сохранить
          </Button>
        </div>
      </div>

      {/* Основной контент в виде двух колонок */}
      <div className="flex-1 overflow-hidden py-6 flex gap-6">
        {/* Левая колонка (2/3) - основная информация */}
        <div className="w-2/3 overflow-y-auto pr-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <InfoIcon className="h-5 w-5 text-muted-foreground" />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductFormBasicInfo
                data={productToFormData(product)}
                onChange={handleBasicInfoChange}
              />
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListFilter className="h-5 w-5 text-muted-foreground" />
                  Характеристики
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductFormCharacteristics
                  characteristics={product.characteristics}
                  onAdd={handleAddCharacteristic}
                  onEdit={handleEditCharacteristic}
                  onRemove={handleRemoveCharacteristic}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Правая колонка (1/3) - настройки и статус */}
        <div className="w-1/3 overflow-y-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-muted-foreground" />
                Настройки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Статус
                  </span>
                  {getProductStatusBadge()}
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Артикул
                  </span>
                  <span className="font-medium">
                    {product.sku || 'Не указан'}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Цена
                  </span>
                  <span className="font-medium">
                    {product.retailPrice?.toFixed(2) || '0.00'} ₽
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    Остаток
                  </span>
                  <span className="font-medium">
                    {product.stock || '0'} {product.unit}
                  </span>
                </div>

                <Separator />

                <ProductFormSettings
                  data={productToFormData(product)}
                  categories={categories}
                  onChange={handleSettingsChange}
                />
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TagIcon className="h-5 w-5 text-muted-foreground" />
                  Опции товара
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductFormOptions
                  options={product.options}
                  onAdd={handleAddOption}
                  onEdit={handleEditOption}
                  onRemove={handleRemoveOption}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Нижний блок - связанные товары */}
      <div className="mt-6 pb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
              Связанные товары
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductFormRelated
              relatedProducts={product.relatedProducts}
              complementaryProducts={product.complementaryProducts}
              onAdd={handleAddRelatedProduct}
              onRemove={handleRemoveRelatedProduct}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
