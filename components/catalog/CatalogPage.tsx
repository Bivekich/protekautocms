'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CatalogSidebar from './CatalogSidebar';
import CategoryContent from './CategoryContent';
import ImportExport from './ImportExport';

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    'all'
  );
  const [activeTab, setActiveTab] = useState<string>('catalog');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="flex h-full">
      {/* Левая боковая панель с навигацией по категориям */}
      <div className="w-64 border-r h-full overflow-y-auto">
        <CatalogSidebar
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          data-testid="catalog-sidebar"
          data-selected-category={selectedCategory}
        />
      </div>

      {/* Основная часть с содержимым */}
      <div className="flex-1 h-full overflow-y-auto px-0 pl-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center border-b pb-2">
            <TabsList>
              <TabsTrigger value="catalog" data-value="catalog">
                Каталог
              </TabsTrigger>
              <TabsTrigger value="import-export" data-value="import-export">
                Импорт/Экспорт
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="catalog">
            <CategoryContent
              categoryId={selectedCategory}
              onCategorySelect={handleCategorySelect}
              data-testid="category-content"
              data-category-id={selectedCategory}
            />
          </TabsContent>

          <TabsContent value="import-export">
            <ImportExport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
