import React from 'react';
import { vi } from 'vitest';

// Мок для CatalogPage
export const CatalogPageMock = vi.fn(() => (
  <div data-testid="catalog-page-mock">CatalogPage Mock</div>
));

// Мок для CatalogSidebar
export const CatalogSidebarMock = vi.fn(({ selectedCategory, onCategorySelect }: any) => (
  <div 
    data-testid="catalog-sidebar-mock" 
    data-selected-category={selectedCategory}
    onClick={() => onCategorySelect && onCategorySelect('1')}
  >
    CatalogSidebar Mock
    <div>Все товары</div>
  </div>
));

// Мок для CategoryContent
export const CategoryContentMock = vi.fn(({ categoryId, onCategorySelect }: any) => (
  <div 
    data-testid="category-content-mock" 
    data-category-id={categoryId}
    onClick={() => onCategorySelect && onCategorySelect('1')}
  >
    CategoryContent Mock
    <button>Добавить товар</button>
    <button>Добавить подкатегорию</button>
    <form>
      <input placeholder="Поиск" />
    </form>
    <button>Сохранить</button>
    <label>Название<input /></label>
  </div>
));

// Мок для ProductsList
export const ProductsListMock = vi.fn(({ categoryId, onCategorySelect }: any) => (
  <div 
    data-testid="products-list-mock" 
    data-category-id={categoryId}
  >
    ProductsList Mock
    <table>
      <thead>
        <tr>
          <th>Название</th>
          <th>Артикул</th>
          <th>Цена</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Товар 1</td>
          <td>SKU001</td>
          <td>100</td>
        </tr>
        <tr>
          <td>Товар 2</td>
          <td>SKU002</td>
          <td>200</td>
        </tr>
      </tbody>
    </table>
    <button title="Редактировать товар">Edit</button>
    <button title="Удалить товар">Delete</button>
    <input type="checkbox" role="switch" />
    <button>Фильтр</button>
    <label>Наличие<select></select></label>
    <button>Применить</button>
  </div>
));

// Мок для ImportExport
export const ImportExportMock = vi.fn(() => (
  <div data-testid="import-export-mock">
    ImportExport Mock
    <div>Импорт товаров</div>
    <div>Экспорт товаров</div>
    <button>Выбрать файл</button>
    <input data-testid="import-file-input" type="file" />
    <button>Импортировать</button>
    <button>Экспортировать товары</button>
  </div>
));

// Мок для CategoryTreeView
export const CategoryTreeViewMock = vi.fn(() => (
  <div data-testid="category-tree-view-mock">CategoryTreeView Mock</div>
));

// Мокаем все компоненты каталога
vi.mock('../../../../components/catalog/CatalogPage', () => ({
  default: CatalogPageMock,
}));

vi.mock('../../../../components/catalog/CatalogSidebar', () => ({
  default: CatalogSidebarMock,
}));

vi.mock('../../../../components/catalog/CategoryContent', () => ({
  default: CategoryContentMock,
}));

vi.mock('../../../../components/catalog/ProductsList', () => ({
  default: ProductsListMock,
}));

vi.mock('../../../../components/catalog/ImportExport', () => ({
  default: ImportExportMock,
}));

vi.mock('../../../../components/catalog/CategoryTreeView', () => ({
  default: CategoryTreeViewMock,
}));

// Мокаем UI компоненты
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  TabsList: ({ children, ...props }: any) => <div role="tablist" {...props}>{children}</div>,
  TabsTrigger: ({ children, value, ...props }: any) => (
    <button role="tab" data-value={value} data-state={props['data-state'] || 'inactive'} {...props}>{children}</button>
  ),
  TabsContent: ({ children, value, ...props }: any) => (
    <div role="tabpanel" data-value={value} data-state={props['data-state'] || 'inactive'} {...props}>{children}</div>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
})); 