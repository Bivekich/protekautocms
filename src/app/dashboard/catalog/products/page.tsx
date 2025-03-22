'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// При тестировании мы создаем заглушку для ProductsList
// В реальном проекте здесь будет импорт реального компонента
const ProductsList = ({
  categoryId,
  onCategorySelect,
}: {
  categoryId: string;
  onCategorySelect: (id: string) => void;
}) => {
  return (
    <div className="border rounded p-4">
      <h2 className="text-lg font-semibold mb-4">Список товаров (заглушка)</h2>
      <p>Выбранная категория: {categoryId}</p>
      <div className="mt-4">
        <Button variant="outline" onClick={() => onCategorySelect('all')}>
          Выбрать категорию &ldquo;Все товары&rdquo;
        </Button>
      </div>
    </div>
  );
};

export default function ProductsPage() {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');

  // Обработчик выбора категории
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  // Обработчик добавления нового товара
  const handleAddProduct = () => {
    router.push('/dashboard/catalog/add-product');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Товары</h1>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить товар
        </Button>
      </div>

      <ProductsList
        categoryId={selectedCategoryId}
        onCategorySelect={handleCategorySelect}
      />
    </div>
  );
}
