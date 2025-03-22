import {
  Product,
  Category,
  ProductImage,
  ProductCharacteristic,
} from '@prisma/client';
import * as XLSX from 'xlsx';

// Тип для расширенного продукта с включенными связями
type ProductWithRelations = Product & {
  category?: Category | null;
  images?: ProductImage[];
  characteristics?: ProductCharacteristic[];
};

// Русские названия полей для экспорта
const russianColumnNames: Record<string, string> = {
  id: 'ID',
  name: 'Название',
  sku: 'Артикул',
  slug: 'URL-адрес',
  description: 'Описание',
  wholesalePrice: 'Цена опт',
  retailPrice: 'Цена розница',
  stock: 'Остаток',
  isVisible: 'Видимость',
  createdAt: 'Дата создания',
  updatedAt: 'Дата обновления',
  categoryId: 'ID категории',
  categoryName: 'Категория',
  imagesCount: 'Количество изображений',
  mainImage: 'Основное изображение',
  images: 'Все изображения',
  characteristicsCount: 'Количество характеристик',
  characteristics: 'Характеристики',
};

// Функция для форматирования данных продукта для экспорта
function formatProductForExport(
  product: ProductWithRelations,
  options: {
    includeCategories: boolean;
    includeImages: boolean;
    includeCharacteristics: boolean;
  }
) {
  const formattedProduct = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    slug: product.slug,
    description: product.description || '',
    wholesalePrice: product.wholesalePrice,
    retailPrice: product.retailPrice,
    stock: product.stock,
    isVisible: product.isVisible ? 'Да' : 'Нет',
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  // Добавляем категорию, если она включена в опции
  if (options.includeCategories && product.category) {
    Object.assign(formattedProduct, {
      categoryId: product.categoryId,
      categoryName: product.category.name,
    });
  }

  // Добавляем изображения, если они включены в опции
  if (options.includeImages && product.images && product.images.length > 0) {
    Object.assign(formattedProduct, {
      imagesCount: product.images.length,
      mainImage: product.images[0]?.url || '',
      images: product.images.map((img) => img.url).join(','),
    });
  }

  // Добавляем характеристики, если они включены в опции
  if (
    options.includeCharacteristics &&
    product.characteristics &&
    product.characteristics.length > 0
  ) {
    Object.assign(formattedProduct, {
      characteristicsCount: product.characteristics.length,
      characteristics: product.characteristics
        .map((char) => `${char.name}: ${char.value}`)
        .join('; '),
    });
  }

  return formattedProduct;
}

// Функция для генерации CSV строки из объекта
function objectToCSV(obj: Record<string, unknown>): string {
  const headers = Object.keys(obj);
  const values = headers.map((header) => {
    const value = obj[header];
    // Обрабатываем случаи, когда значение содержит запятую или кавычки
    if (
      typeof value === 'string' &&
      (value.includes(',') || value.includes('"'))
    ) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value !== null && value !== undefined ? value : '';
  });
  return values.join(',');
}

// Функция для генерации CSV файла из списка продуктов
export function generateCSV(
  products: ProductWithRelations[],
  options: {
    includeCategories: boolean;
    includeImages: boolean;
    includeCharacteristics: boolean;
  }
): string {
  if (products.length === 0) return '';

  const formattedProducts = products.map((product) =>
    formatProductForExport(product, options)
  );

  // Создаем заголовок CSV с русскими названиями (первая строка)
  const headers = Object.keys(formattedProducts[0]);
  const russianHeaders = headers.map(
    (header) => russianColumnNames[header] || header
  );
  const headerRow = russianHeaders.join(',');

  // Создаем строки данных
  const dataRows = formattedProducts.map(objectToCSV);

  // Объединяем все в одну строку
  return [headerRow, ...dataRows].join('\n');
}

// Функция для генерации Excel файла из списка продуктов
export function generateExcel(
  products: ProductWithRelations[],
  options: {
    includeCategories: boolean;
    includeImages: boolean;
    includeCharacteristics: boolean;
  }
): Buffer {
  if (products.length === 0) {
    // Создаем пустой Excel файл с заголовками
    const worksheet = XLSX.utils.json_to_sheet([]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары');
    return Buffer.from(
      XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    );
  }

  const formattedProducts = products.map((product) =>
    formatProductForExport(product, options)
  );

  // Создаем рабочий лист из данных
  const worksheet = XLSX.utils.json_to_sheet(formattedProducts);

  // Заменяем английские заголовки на русские
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    const cellValue = worksheet[cellAddress]?.v;
    if (
      cellValue &&
      typeof cellValue === 'string' &&
      russianColumnNames[cellValue]
    ) {
      worksheet[cellAddress].v = russianColumnNames[cellValue];
    }
  }

  // Создаем книгу и добавляем лист
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары');

  // Преобразуем книгу в буфер
  return Buffer.from(
    XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  );
}
