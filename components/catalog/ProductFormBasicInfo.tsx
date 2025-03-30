'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePlus, X, Upload, Image as ImageIcon } from 'lucide-react';
import { ProductFormData } from './ProductForm';
import Image from 'next/image';

type ProductFormBasicInfoProps = {
  data: ProductFormData;
  onChange: (data: Partial<ProductFormData>) => void;
};

export default function ProductFormBasicInfo({
  data,
  onChange,
}: ProductFormBasicInfoProps) {
  const [dragActive, setDragActive] = useState(false);

  // Обработчик изменения полей
  const handleChange = (
    field: keyof ProductFormData,
    value: string | number | string[]
  ) => {
    onChange({ [field]: value });
  };

  // Обработчик добавления изображений
  const handleAddImages = async (files: FileList | null) => {
    if (!files) return;

    try {
      const uploadedImages = [];

      // Загружаем каждый файл на сервер
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt', data.name || 'Изображение товара');

        console.log('Отправка файла на сервер:', file.name);

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Ошибка загрузки: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Ответ от сервера:', result);

        if (result.url) {
          // Используем URL как есть, без дополнительных преобразований
          uploadedImages.push(result.url);
          console.log('URL изображения:', result.url);
        }
      }

      console.log('Загруженные изображения:', uploadedImages);
      console.log('Существующие изображения:', data.images);

      // Обновляем список изображений
      const newImages = [...data.images, ...uploadedImages];
      console.log('Новый список изображений:', newImages);

      handleChange('images', newImages);
    } catch (error) {
      console.error('Ошибка при загрузке изображений:', error);
      alert(
        'Не удалось загрузить изображения. Пожалуйста, попробуйте ещё раз.'
      );
    }
  };

  // Обработчик удаления изображения
  const handleRemoveImage = (index: number) => {
    const newImages = [...data.images];
    newImages.splice(index, 1);
    handleChange('images', newImages);
  };

  // Обработчики перетаскивания файлов
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddImages(e.dataTransfer.files);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Изображения товара */}
        <div>
          <Label className="mb-2 block">Изображения</Label>
          <div
            className={`border-2 border-dashed rounded-md p-6 transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            {data.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded-md overflow-hidden group"
                  >
                    <Image
                      src={image}
                      alt={`Изображение товара ${index + 1}`}
                      className="w-full h-full object-cover"
                      width={200}
                      height={200}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Удалить изображение"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md aspect-square cursor-pointer hover:bg-gray-50">
                  <ImagePlus size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Добавить ещё</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAddImages(e.target.files)}
                  />
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <ImageIcon size={48} className="text-gray-300 mb-4" />
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Перетащите изображения сюда или нажмите для выбора файлов
                </p>
                <div className="flex items-center justify-center">
                  <input
                    id="upload-image-input"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAddImages(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById('upload-image-input')?.click()
                    }
                  >
                    <Upload size={16} className="mr-2" />
                    Загрузить изображения
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Видео */}
        <div>
          <Label htmlFor="video">Видео (ссылка)</Label>
          <Input
            id="video"
            value={data.video || ''}
            onChange={(e) => handleChange('video', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        {/* Наименование */}
        <div>
          <Label htmlFor="name">Наименование</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>

        {/* Артикул */}
        <div>
          <Label htmlFor="sku">Артикул</Label>
          <Input
            id="sku"
            value={data.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            required
          />
        </div>

        {/* Описание */}
        <div>
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={6}
          />
        </div>

        {/* Цены */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="wholesalePrice">Цена опт</Label>
            <Input
              id="wholesalePrice"
              type="text"
              value={data.wholesalePrice}
              onChange={(e) => {
                // Проверяем введённое значение
                const inputValue = e.target.value;

                // Если поле пустое, устанавливаем 0
                if (inputValue === '') {
                  handleChange('wholesalePrice', 0);
                  return;
                }

                // Если ввели число, преобразуем к числу
                if (/^\d*\.?\d*$/.test(inputValue)) {
                  handleChange('wholesalePrice', parseFloat(inputValue) || 0);
                }
              }}
              required
            />
          </div>
          <div>
            <Label htmlFor="retailPrice">Цена на сайте</Label>
            <Input
              id="retailPrice"
              type="text"
              value={data.retailPrice}
              onChange={(e) => {
                // Проверяем введённое значение
                const inputValue = e.target.value;

                // Если поле пустое, устанавливаем 0
                if (inputValue === '') {
                  handleChange('retailPrice', 0);
                  return;
                }

                // Если ввели число, преобразуем к числу
                if (/^\d*\.?\d*$/.test(inputValue)) {
                  handleChange('retailPrice', parseFloat(inputValue) || 0);
                }
              }}
              required
            />
          </div>
        </div>

        {/* Вес */}
        <div>
          <Label htmlFor="weight">Вес (кг)</Label>
          <Input
            id="weight"
            type="text"
            value={data.weight}
            onChange={(e) => {
              // Проверяем введённое значение
              const inputValue = e.target.value;

              // Если поле пустое, устанавливаем 0
              if (inputValue === '') {
                handleChange('weight', 0);
                return;
              }

              // Если ввели число, преобразуем к числу
              if (/^\d*\.?\d*$/.test(inputValue)) {
                handleChange('weight', parseFloat(inputValue) || 0);
              }
            }}
          />
        </div>

        {/* Габариты */}
        <div>
          <Label className="mb-2 block">Габариты (см)</Label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Длина"
                type="text"
                value={data.dimensions.length}
                onChange={(e) => {
                  // Проверяем введённое значение
                  const inputValue = e.target.value;

                  // Если ввели число, преобразуем к числу
                  if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                    onChange({
                      dimensions: {
                        ...data.dimensions,
                        length:
                          inputValue === '' ? 0 : parseFloat(inputValue) || 0,
                      },
                    });
                  }
                }}
              />
            </div>
            <div>
              <Input
                placeholder="Ширина"
                type="text"
                value={data.dimensions.width}
                onChange={(e) => {
                  // Проверяем введённое значение
                  const inputValue = e.target.value;

                  // Если ввели число, преобразуем к числу
                  if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                    onChange({
                      dimensions: {
                        ...data.dimensions,
                        width:
                          inputValue === '' ? 0 : parseFloat(inputValue) || 0,
                      },
                    });
                  }
                }}
              />
            </div>
            <div>
              <Input
                placeholder="Высота"
                type="text"
                value={data.dimensions.height}
                onChange={(e) => {
                  // Проверяем введённое значение
                  const inputValue = e.target.value;

                  // Если ввели число, преобразуем к числу
                  if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
                    onChange({
                      dimensions: {
                        ...data.dimensions,
                        height:
                          inputValue === '' ? 0 : parseFloat(inputValue) || 0,
                      },
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
