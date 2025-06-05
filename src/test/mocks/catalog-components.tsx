import React from 'react';
import { vi } from 'vitest';

// Мок для CatalogPage
export const CatalogPageMock = ({ ...props }: any) => (
  <div data-testid="catalog-page-mock" {...props}>
    <div data-testid="catalog-sidebar-mock" data-selected-category="all">Catalog Sidebar Mock</div>
    <div data-testid="category-content-mock" data-category-id="all">Category Content Mock</div>
    <div role="tablist">
      <button role="tab" data-state="active">Каталог</button>
      <button role="tab" data-state="inactive">Импорт/Экспорт</button>
    </div>
  </div>
);

// Мок для CatalogSidebar
export const CatalogSidebarMock = ({ selectedCategory, onCategorySelect, ...props }: any) => (
  <div 
    data-testid="catalog-sidebar-mock" 
    data-selected-category={selectedCategory}
    onClick={() => onCategorySelect && onCategorySelect('1')}
    {...props}
  >
    <div>Все товары</div>
    <div>Категория 1</div>
    <button>Добавить категорию</button>
  </div>
);

// Мок для CategoryContent
export const CategoryContentMock = ({ categoryId, onCategorySelect, ...props }: any) => (
  <div 
    data-testid="category-content-mock" 
    data-category-id={categoryId}
    onClick={() => onCategorySelect && onCategorySelect('1')}
    {...props}
  >
    <button>Добавить товар</button>
    <button>Добавить подкатегорию</button>
    <form>
      <input placeholder="Поиск" />
      <button type="submit">Поиск</button>
    </form>
    <div data-testid="products-list-mock">
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
        </tbody>
      </table>
    </div>
    <dialog>
      <h2>Создать подкатегорию</h2>
      <form>
        <label>Название<input /></label>
        <button>Сохранить</button>
      </form>
    </dialog>
  </div>
);

// Мок для ProductsList
export const ProductsListMock = ({ categoryId, ...props }: any) => (
  <div 
    data-testid="products-list-mock" 
    data-category-id={categoryId}
    {...props}
  >
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
    <dialog>
      <h2>Вы уверены, что хотите удалить товар?</h2>
      <button>Да</button>
      <button>Отмена</button>
    </dialog>
  </div>
);

// Мок для ImportExport
export const ImportExportMock = ({ ...props }: any) => (
  <div data-testid="import-export-mock" {...props}>
    <div>Импорт товаров</div>
    <div>Экспорт товаров</div>
    <button>Выбрать файл</button>
    <input data-testid="import-file-input" type="file" />
    <button>Импортировать</button>
    <button>Экспортировать товары</button>
  </div>
);

// Мокаем компоненты каталога
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