'use client';

import { Suspense } from 'react';
import CatalogPage from '../../../../components/catalog/CatalogPage';

export default function CatalogDashboardPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Каталог товаров</h1>
      </div>

      <Suspense fallback={<div>Загрузка...</div>}>
        <CatalogPage />
      </Suspense>
    </div>
  );
}
