'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Download, FileText, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';

// Тип для категории
type Category = {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
};

export default function ImportExport() {
  const [activeTab, setActiveTab] = useState<string>('import');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [exportOptions, setExportOptions] = useState({
    includeImages: true,
    includeCategories: true,
    includeOptions: true,
    includeCharacteristics: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/catalog/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error('Ошибка при загрузке категорий');
        }
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };

    fetchCategories();
  }, []);

  // Обработчик выбора файла для импорта
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportStatus('idle');
    }
  };

  // Обработчик импорта товаров
  const handleImport = () => {
    if (!importFile) return;

    setImportStatus('loading');

    // Имитация процесса импорта
    setTimeout(() => {
      // В реальном приложении здесь будет логика импорта
      setImportStatus('success');
    }, 2000);
  };

  // Обработчик экспорта товаров
  const handleExport = async () => {
    try {
      // Показываем сообщение о начале экспорта
      toast.loading('Подготовка файла для экспорта...');

      // Формируем данные для запроса
      const exportData = {
        format: exportFormat,
        includeImages: exportOptions.includeImages,
        includeCategories: exportOptions.includeCategories,
        includeOptions: exportOptions.includeOptions,
        includeCharacteristics: exportOptions.includeCharacteristics,
        categoryId:
          selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
      };

      // Отправляем запрос на сервер для экспорта
      const response = await fetch('/api/catalog/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при экспорте товаров');
      }

      // Получаем blob из ответа
      const blob = await response.blob();

      // Создаем URL для скачивания
      const url = window.URL.createObjectURL(blob);

      // Создаем временную ссылку и имитируем клик по ней
      const a = document.createElement('a');

      // Получаем имя файла из заголовка Content-Disposition или используем дефолтное
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'export.' + (exportFormat === 'csv' ? 'csv' : 'xlsx');

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Удаляем временную ссылку
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Показываем сообщение об успешном экспорте
      toast.success('Файл успешно экспортирован');
    } catch (error) {
      console.error('Ошибка при экспорте товаров:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при экспорте товаров'
      );
    }
  };

  // Функция для отображения имени категории с отступами в зависимости от уровня вложенности
  const getCategoryLabel = (category: Category) => {
    return `${'—'.repeat(category.level > 0 ? category.level : 0)} ${
      category.name
    }`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="import">Импорт товаров</TabsTrigger>
          <TabsTrigger value="export">Экспорт товаров</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Импорт товаров</h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Загрузите файл CSV или Excel с данными товаров для импорта. Файл
                должен содержать следующие колонки: Название, Артикул, Цена опт,
                Цена розница, Остаток.
              </p>

              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Важно</AlertTitle>
                <AlertDescription>
                  Перед импортом рекомендуется скачать шаблон файла и заполнить
                  его согласно инструкции.
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-4 mb-4">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Скачать шаблон CSV
                </Button>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Скачать шаблон Excel
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="import-file" className="block mb-2">
                Выберите файл для импорта
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button
                  onClick={handleImport}
                  disabled={!importFile || importStatus === 'loading'}
                >
                  {importStatus === 'loading' ? (
                    <>Импортирую...</>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Импортировать
                    </>
                  )}
                </Button>
              </div>
              {importFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Выбран файл: {importFile.name}
                </p>
              )}
            </div>

            {importStatus === 'success' && (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Импорт успешно завершен
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  Товары были успешно импортированы в каталог.
                </AlertDescription>
              </Alert>
            )}

            {importStatus === 'error' && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Ошибка импорта</AlertTitle>
                <AlertDescription className="text-red-700">
                  Произошла ошибка при импорте товаров. Пожалуйста, проверьте
                  формат файла и попробуйте снова.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Экспорт товаров</h2>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Выберите формат и настройки для экспорта товаров из каталога.
                Экспортированный файл будет содержать следующие поля: Название,
                Артикул, URL-адрес, Описание, Цена опт, Цена розница, Остаток,
                Видимость, Дата создания, Дата обновления.
              </p>
            </div>

            <div className="mb-6">
              <Label className="block mb-2">Формат файла</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="csv"
                    name="exportFormat"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                  />
                  <Label htmlFor="csv">CSV</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="excel"
                    name="exportFormat"
                    value="excel"
                    checked={exportFormat === 'excel'}
                    onChange={() => setExportFormat('excel')}
                  />
                  <Label htmlFor="excel">Excel</Label>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="category" className="block mb-2">
                Категория товаров
              </Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                data-export-category-select
              >
                <SelectTrigger className="w-full" data-value="category-trigger">
                  {selectedCategoryId
                    ? getCategoryLabel(
                        categories.find((c) => c.id === selectedCategoryId) || {
                          name: 'Категория не найдена',
                          level: 0,
                          id: '',
                          parentId: null,
                        }
                      )
                    : 'Все категории'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-value="all">
                    Все категории
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      data-value={category.id}
                    >
                      {getCategoryLabel(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6">
              <Label className="block mb-2">Настройки экспорта</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-images"
                    checked={exportOptions.includeImages}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        includeImages: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="include-images">Включить изображения</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-categories"
                    checked={exportOptions.includeCategories}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        includeCategories: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="include-categories">Включить категории</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-options"
                    checked={exportOptions.includeOptions}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        includeOptions: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="include-options">
                    Включить опции товаров
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-characteristics"
                    checked={exportOptions.includeCharacteristics}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        includeCharacteristics: e.target.checked,
                      })
                    }
                  />
                  <Label htmlFor="include-characteristics">
                    Включить характеристики
                  </Label>
                </div>
              </div>
            </div>

            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Экспортировать
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
