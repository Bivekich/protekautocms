# Тестирование модуля каталога товаров

## Выявленные проблемы

При тестировании компонентов каталога были выявлены следующие проблемы:

1. **Проблема с разрешением импортов**: Vitest не может разрешить алиасы путей (например, `@/components/ui/tabs`) при запуске тестов.
2. **Сложная структура компонентов**: Компоненты каталога имеют много зависимостей и вложенных компонентов.

## Стратегия тестирования

Для тестирования модуля каталога рекомендуется следующая стратегия:

### 1. Тестирование хуков и бизнес-логики

Тестировать хуки отдельно от компонентов. Пример:

```typescript
// Пример тестирования хука useCatalogGraphQL
import { describe, it, expect } from 'vitest';
import useCatalogGraphQLMock from '../../helpers/mocks/useCatalogGraphQLMock';

const hookMock = useCatalogGraphQLMock();

describe('useCatalogGraphQL', () => {
  it('получает список категорий', async () => {
    const result = await hookMock.getCategories();
    expect(result.categories).toHaveLength(2);
  });
});
```

### 2. Мокирование UI-компонентов

Для решения проблемы с импортами UI-компонентов, создать моки для всех UI-компонентов:

```typescript
// Пример мокирования UI-компонентов
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => React.createElement('button', props, children)
}));
```

### 3. Мокирование компонентов каталога

Для тестирования интеграции между компонентами, создать моки для компонентов каталога:

```typescript
// Пример мокирования компонента каталога
export const CatalogSidebarMock = ({ selectedCategory, onCategorySelect }) => (
  <div 
    data-testid="catalog-sidebar-mock" 
    data-selected-category={selectedCategory}
    onClick={() => onCategorySelect('1')}
  >
    Mock Sidebar
  </div>
);

vi.mock('../../../../components/catalog/CatalogSidebar', () => ({
  default: CatalogSidebarMock
}));
```

### 4. Тестирование API

Создать тесты для API-запросов, которые используются в каталоге:

```typescript
// Пример тестирования API
test('API - получение списка категорий', async () => {
  // Мокаем fetch
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockGraphQLResponses.categories)
  });
  
  // Тестируем API-запрос
  const response = await fetch('/api/graphql', {
    method: 'POST',
    body: JSON.stringify({ query: 'query { categoriesList { categories { id name } } }' })
  });
  
  const data = await response.json();
  expect(data).toEqual(mockGraphQLResponses.categories);
});
```

### 5. E2E тестирование

Использовать E2E тесты для проверки полной функциональности каталога:

```typescript
// Пример E2E теста (использовать фреймворк Playwright или Cypress)
test('пользователь может создать новую категорию', async () => {
  // Открываем страницу каталога
  await page.goto('/dashboard/catalog');
  
  // Кликаем на кнопку "Добавить категорию"
  await page.click('button:has-text("Добавить категорию")');
  
  // Заполняем форму
  await page.fill('input[name="name"]', 'Новая категория');
  
  // Сохраняем категорию
  await page.click('button:has-text("Сохранить")');
  
  // Проверяем, что категория добавлена
  await expect(page.locator('text=Новая категория')).toBeVisible();
});
```

## Тестовые данные

Использовать централизованные тестовые данные для всех тестов:

```typescript
// src/test/helpers/test-data/catalog-data.ts
export const mockCategories = [
  { id: 'cat1', name: 'Категория 1', slug: 'category-1', level: 0 },
  { 
    id: 'cat2', 
    name: 'Категория 2', 
    slug: 'category-2', 
    level: 0,
    subcategories: [
      { id: 'subcat1', name: 'Подкатегория 1', slug: 'subcategory-1', level: 1 }
    ]
  }
];

export const mockProducts = [
  // ...товары
];

export const mockGraphQLResponses = {
  // ...ответы GraphQL
};
```

## Организация тестов

Рекомендуется следующая структура для тестов каталога:

```
src/
  test/
    helpers/
      mocks/
        useCatalogGraphQLMock.ts     # Мок для хука useCatalogGraphQL
        ui-components.ts             # Моки для UI компонентов
        catalog-components.tsx       # Моки для компонентов каталога
      test-data/
        catalog-data.ts              # Тестовые данные для каталога
    dashboard/
      catalog/
        hooks.test.ts                # Тесты для хуков каталога
        api.test.ts                  # Тесты для API каталога
        integration.test.ts          # Интеграционные тесты
        setup.ts                     # Настройка тестового окружения
```

## Полезные команды

- Запуск всех тестов каталога:
  ```
  npm run test:catalog
  ```

- Запуск тестов для конкретного файла:
  ```
  npm run test src/test/dashboard/catalog/hooks.test.ts
  ```

- Запуск тестов в режиме отладки:
  ```
  npm run test:debug src/test/dashboard/catalog/hooks.test.ts
  ```

## Тесты каталога товаров

В этой директории содержатся тесты для компонентов и функциональности каталога товаров в административной панели.

## Структура тестов

- `CatalogPage.test.tsx` - тесты для основной страницы каталога
- `CatalogSidebar.test.tsx` - тесты для боковой панели с категориями
- `CategoryContent.test.tsx` - тесты для компонента содержимого категории
- `ProductsList.test.tsx` - тесты для списка товаров
- `ImportExport.test.tsx` - тесты для функциональности импорта/экспорта

## Запуск тестов

Для запуска всех тестов каталога выполните:

```bash
npm run test:catalog
```

Для запуска конкретного теста:

```bash
npm run test:catalog:page  # Запускает только тесты CatalogPage
# или
npm run test -- src/test/dashboard/catalog/CatalogPage.test.tsx
```

Для запуска тестов в режиме наблюдения (watch mode):

```bash
npm run test:watch -- src/test/dashboard/catalog
```

## Известные проблемы тестирования

1. **Проблемы с Next/Image**: Компонент Image из Next.js вызывает ошибки в тестах из-за недействительных URL. Для решения этой проблемы мы добавили мок Next/Image в файле `ProductsList.test.tsx`.

2. **Проблемы с URL в JSDOM**: Тесты могут выдавать ошибку `Invalid base URL` при использовании URL API. Мы добавили мок для `global.URL.createObjectURL`.

3. **Проблемы с API тестированием**: Некоторые тесты, взаимодействующие с API, отмечены как `skip` из-за проблем с моками API запросов.

4. **Предупреждения act()**: При выполнении тестов могут появляться предупреждения "An update to Component inside a test was not wrapped in act(...)". Это связано с асинхронными обновлениями в компонентах. Для решения следует использовать `act()` при выполнении действий, вызывающих обновление состояния, и `waitFor()` для ожидания завершения этих обновлений.

   ```javascript
   import { act } from '@testing-library/react';
   
   // Пример использования act()
   await act(async () => {
     fireEvent.click(button);
   });
   
   // Или с waitFor
   await waitFor(() => {
     expect(element).toBeInTheDocument();
   });
   ```

## Рекомендации по написанию тестов

1. **Добавление data-testid атрибутов**: При разработке компонентов следует добавлять атрибуты `data-testid` для ключевых элементов, что упрощает их поиск в тестах.

2. **Мокирование внешних зависимостей**: Всегда мокируйте внешние зависимости, такие как API запросы, Next.js компоненты и т.д.

3. **Избегайте сложных селекторов**: Вместо сложных CSS-селекторов используйте `getByTestId`, `getByRole` или `getByText`.

4. **Создание параметризованных тестов**: Для тестирования похожей функциональности с разными данными используйте параметризованные тесты.

5. **Оборачивание асинхронных действий**: Все действия, вызывающие обновление состояния компонентов (например, клики, ввод текста), должны быть обернуты в `act()` или использоваться вместе с `waitFor()` для корректного тестирования.

6. **Избегайте дублирования селекторов текста**: Если в компоненте есть повторяющиеся тексты, используйте более специфичные селекторы, например `getByRole` с дополнительными параметрами.

## Покрытие тестами

Тесты охватывают следующие аспекты каталога товаров:

### CatalogPage
- Рендеринг компонента со вкладками
- Переключение между вкладками
- Выбор категорий

### CatalogSidebar
- Отображение списка категорий
- Выделение выбранной категории
- Разворачивание/сворачивание категорий
- Отображение скрытых категорий

### CategoryContent
- Отображение подкатегорий
- Функциональность добавления товаров и подкатегорий
- Поиск товаров

### ProductsList
- Отображение списка товаров
- Выбор товаров и операции над выбранными товарами
- Фильтрация товаров
- Пагинация
- Переключение видимости товаров

### ImportExport
- Загрузка файла для импорта
- Экспорт товаров
- Обработка ошибок 