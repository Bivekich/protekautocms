'use client';

import { useState } from 'react';
import {
  Upload,
  Download,
  FileText,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ImportExportFormat,
  ExportOptions,
  ImportResult,
} from '@/types/catalog';
import { importExportApi } from '@/lib/catalog-api';
import { toast } from 'sonner';

export default function ImportExport() {
  const [activeTab, setActiveTab] = useState<string>('import');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportFormat, setExportFormat] = useState<ImportExportFormat>('csv');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeImages: true,
    includeCategories: true,
    includeOptions: true,
    includeCharacteristics: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  // Обработчик выбора файла для импорта
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportStatus('idle');
      setImportResult(null);
    }
  };

  // Обработчик импорта товаров
  const handleImport = async () => {
    if (!importFile) {
      toast.error('Выберите файл для импорта');
      return;
    }

    try {
      setImportStatus('loading');

      // Выполняем импорт
      const result = await importExportApi.importData(importFile, exportFormat);
      setImportResult(result);

      if (result.success) {
        setImportStatus('success');
        toast.success('Импорт успешно завершен');
      } else {
        setImportStatus('error');
        toast.error('Импорт завершен с ошибками');
      }
    } catch (error) {
      console.error('Ошибка при импорте товаров:', error);
      setImportStatus('error');
      toast.error('Не удалось выполнить импорт');
    }
  };

  // Обработчик экспорта товаров
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Выполняем экспорт
      const dataUrl = await importExportApi.exportData(
        exportFormat,
        exportOptions
      );

      // В реальном приложении здесь будет скачивание файла
      toast.success(`Экспорт успешно завершен. Файл: ${dataUrl}`);

      // Имитация скачивания файла
      setTimeout(() => {
        toast('Файл скачивается...', {
          description: `Имя файла: ${dataUrl}`,
          action: {
            label: 'Скачать снова',
            onClick: () => handleExport(),
          },
        });
      }, 1000);
    } catch (error) {
      console.error('Ошибка при экспорте товаров:', error);
      toast.error('Не удалось выполнить экспорт');
    } finally {
      setIsExporting(false);
    }
  };

  // Обработчик скачивания шаблона
  const handleDownloadTemplate = (format: ImportExportFormat) => {
    // В реальном приложении здесь будет скачивание шаблона
    toast.success(`Шаблон ${format.toUpperCase()} скачивается...`);
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
                <Button
                  variant="outline"
                  onClick={() => handleDownloadTemplate('csv')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Скачать шаблон CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadTemplate('excel')}
                >
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
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Импортирую...
                    </>
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

            {importStatus === 'success' && importResult && (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Импорт успешно завершен
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  <div className="text-sm">
                    Успешно импортировано: {importResult.importedItems} из{' '}
                    {importResult.totalItems}
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-red-500 mb-1">
                        Ошибки ({importResult.errors.length}):
                      </div>
                      <ul className="list-disc pl-5 mt-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {importStatus === 'error' && importResult && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Ошибка импорта</AlertTitle>
                <AlertDescription className="text-red-700">
                  <div className="text-sm">
                    Успешно импортировано: {importResult.importedItems} из{' '}
                    {importResult.totalItems}
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-red-500 mb-1">
                        Ошибки ({importResult.errors.length}):
                      </div>
                      <ul className="list-disc pl-5 mt-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
              <Label className="block mb-2">Настройки экспорта</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-images"
                    checked={exportOptions.includeImages}
                    onCheckedChange={(checked) =>
                      setExportOptions({
                        ...exportOptions,
                        includeImages: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="include-images">Включить изображения</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-categories"
                    checked={exportOptions.includeCategories}
                    onCheckedChange={(checked) =>
                      setExportOptions({
                        ...exportOptions,
                        includeCategories: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="include-categories">Включить категории</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-options"
                    checked={exportOptions.includeOptions}
                    onCheckedChange={(checked) =>
                      setExportOptions({
                        ...exportOptions,
                        includeOptions: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="include-options">
                    Включить опции товаров
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-characteristics"
                    checked={exportOptions.includeCharacteristics}
                    onCheckedChange={(checked) =>
                      setExportOptions({
                        ...exportOptions,
                        includeCharacteristics: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="include-characteristics">
                    Включить характеристики
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Экспортирую...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Экспортировать
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Экспорт может занять некоторое время в зависимости от количества
                товаров.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
