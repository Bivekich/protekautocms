'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Folder } from 'lucide-react';
import ProductsList from './ProductsList';

type CategoryViewProps = {
  categoryId: string;
};

// Тип для подкатегории
type Subcategory = {
  id: string;
  name: string;
  slug: string;
};

export default function CategoryView({ categoryId }: CategoryViewProps) {
  // Пример данных подкатегорий
  const [subcategories] = useState<Subcategory[]>([
    { id: 'subcat1', name: 'Подкатегория 1', slug: 'subcategory-1' },
    { id: 'subcat2', name: 'Подкатегория 2', slug: 'subcategory-2' },
    { id: 'subcat3', name: 'Подкатегория 3', slug: 'subcategory-3' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [hasProducts] = useState(true);

  const handleAddProduct = () => {
    console.log('Добавление товара в категорию', categoryId);
  };

  const handleAddSubcategory = () => {
    console.log('Добавление подкатегории в категорию', categoryId);
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    console.log('Переход в подкатегорию', subcategoryId);
  };

  // Фильтрация подкатегорий по поисковому запросу
  const filteredSubcategories = subcategories.filter((subcategory) =>
    subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddProduct}>
            <Plus size={16} className="mr-2" />
            Добавить товар
          </Button>
          <Button variant="outline" onClick={handleAddSubcategory}>
            <Plus size={16} className="mr-2" />
            Добавить подкатегорию
          </Button>
        </div>
      </div>

      {filteredSubcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">Подкатегории</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubcategories.map((subcategory) => (
              <div
                key={subcategory.id}
                className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSubcategoryClick(subcategory.id)}
              >
                <div className="flex items-center">
                  <Folder size={20} className="mr-2 text-blue-500" />
                  <span className="font-medium">{subcategory.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasProducts ? (
        <div>
          <h2 className="text-lg font-medium mb-4">Товары в категории</h2>
          <ProductsList categoryId={categoryId} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            В этой категории пока нет товаров
          </p>
          <div className="flex gap-2">
            <Button onClick={handleAddProduct}>
              <Plus size={16} className="mr-2" />
              Добавить товар
            </Button>
            <Button variant="outline" onClick={handleAddSubcategory}>
              <Plus size={16} className="mr-2" />
              Добавить подкатегорию
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
