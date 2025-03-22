'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Save,
  InfoIcon,
  SettingsIcon,
  TagIcon,
  ListFilter,
  LinkIcon,
} from 'lucide-react';
import ProductFormBasicInfo from '../../../../../components/catalog/ProductFormBasicInfo';
import ProductFormSettings from '../../../../../components/catalog/ProductFormSettings';
import ProductFormOptions from '../../../../../components/catalog/ProductFormOptions';
import ProductFormCharacteristics from '../../../../../components/catalog/ProductFormCharacteristics';
import ProductFormRelated from '../../../../../components/catalog/ProductFormRelated';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ProductOption,
  ProductCharacteristic,
  RelatedProduct,
  ProductFormData,
} from '../../../../../components/catalog/ProductForm';

// Тип для товара (то же самое, что в ProductForm.tsx)
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

export default function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Загрузка категорий при монтировании компонента
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

  // Пустой товар с выбранной категорией
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
    categories: categoryId ? [categoryId] : [],
    unit: 'шт',
    imageUrls: [],
    videoUrl: '',
    options: [],
    characteristics: [],
    relatedProducts: [],
    complementaryProducts: [],
  });

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

    // Для отладки
    console.log('Обновлены данные товара:', productData);
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
    try {
      // Проверка обязательных полей
      if (!product.name || !product.sku) {
        toast.error('Название и артикул товара обязательны');
        return;
      }

      // Валидация числовых значений
      if (
        isNaN(Number(product.wholesalePrice)) ||
        Number(product.wholesalePrice) < 0
      ) {
        toast.error('Оптовая цена должна быть положительным числом');
        return;
      }

      if (
        isNaN(Number(product.retailPrice)) ||
        Number(product.retailPrice) < 0
      ) {
        toast.error('Розничная цена должна быть положительным числом');
        return;
      }

      if (isNaN(Number(product.stock)) || Number(product.stock) < 0) {
        toast.error('Количество товара должно быть положительным числом');
        return;
      }

      setIsLoading(true);

      // Подготовка данных для отправки
      const productData = {
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        // Принудительное преобразование всех числовых значений
        wholesalePrice: Number(product.wholesalePrice),
        retailPrice: Number(product.retailPrice),
        stock: Number(product.stock),
        categoryId:
          product.categories.length > 0 ? product.categories[0] : undefined,
        isVisible: product.visible,
        // Обработка изображений - сохраняем относительные пути
        images: product.imageUrls
          .filter((url) => url && typeof url === 'string')
          .map((url) => ({
            url: url,
            alt: product.name,
          })),
        characteristics: product.characteristics.map(({ name, value }) => ({
          name,
          value,
        })),
      };

      // Расширенное логирование для отладки
      console.log('Отправляемые данные товара:', productData);
      console.log('Типы данных полей:');
      console.log(
        '- wholesalePrice:',
        typeof productData.wholesalePrice,
        productData.wholesalePrice
      );
      console.log(
        '- retailPrice:',
        typeof productData.retailPrice,
        productData.retailPrice
      );
      console.log('- stock:', typeof productData.stock, productData.stock);

      // Создаем новый объект с гарантированно правильными типами данных
      const finalProductData = {
        name: productData.name,
        sku: productData.sku,
        description: productData.description,
        // Строго числовые поля - убеждаемся, что они будут переданы как числа
        wholesalePrice: +productData.wholesalePrice || 0,
        retailPrice: +productData.retailPrice || 0,
        stock: Math.floor(+productData.stock) || 0, // Убеждаемся, что stock - целое число
        categoryId: productData.categoryId,
        isVisible: productData.isVisible,
        images: productData.images,
        characteristics: productData.characteristics,
      };

      console.log('Финальные данные для отправки:', finalProductData);

      // Отправка запроса на сервер
      const response = await fetch('/api/catalog/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalProductData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Улучшенная обработка ошибок валидации
        if (errorData.details && Array.isArray(errorData.details)) {
          // Если есть детали ошибок, показываем первую из них
          const firstError = errorData.details[0];
          const errorMessage = firstError.message || 'Ошибка валидации';
          const fieldName = firstError.path?.join('.') || '';

          if (fieldName) {
            toast.error(`${errorMessage} (поле: ${fieldName})`);
            console.error(`Ошибка валидации в поле ${fieldName}:`, firstError);
          } else {
            toast.error(errorMessage);
          }

          // Отображаем все ошибки валидации в консоли
          console.error('Все ошибки валидации:', errorData.details);
        } else {
          // Если нет деталей, показываем общую ошибку
          toast.error(errorData.error || 'Ошибка при сохранении товара');
        }

        // Дополнительно выводим полную информацию об ошибке в консоль для отладки
        console.error('Детали ошибки валидации:', errorData);
        throw new Error(errorData.error || 'Ошибка при сохранении товара');
      }

      await response.json();
      toast.success('Товар успешно сохранен');

      // Возврат к списку товаров
      router.push('/dashboard/catalog');
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

  // Обработчик отмены и возврата к списку
  const handleCancel = () => {
    router.back();
  };

  // Функция для получения состояния продукта
  const getProductStatusBadge = () => {
    if (!product.visible) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          Черновик
        </Badge>
      );
    }
    if (product.stock <= 0) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Нет в наличии
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-green-100 text-green-800">
        Активен
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Шапка страницы */}
      <div className="flex justify-between items-center pb-6 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Добавление товара</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
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
                  initialCategoryId={categoryId}
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
