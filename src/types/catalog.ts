// Типы для категорий
export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  parent?: Category | null;
  children: Category[];
  hidden?: boolean;
  includeSubcategoryProducts?: boolean;
  level?: number;
  order?: number;
  isVisible?: boolean;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
};

export type CategoryWithSubcategories = Category & {
  subcategories: CategoryWithSubcategories[];
};

// Типы для товаров
export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string | null;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  isVisible: boolean;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  imageUrls?: string[];
  mainImage?: string | null;
  images?: ProductImage[];
  unit?: string;
};

export type ProductWithDetails = Product & {
  category?: Category | null;
  images: ProductImage[];
  characteristics: ProductCharacteristic[];
};

// Типы для изображений товаров
export type ProductImage = {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Типы для характеристик товаров
export type ProductCharacteristic = {
  id: string;
  name: string;
  value: string;
  productId?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

// Типы для создания и обновления категорий
export type CreateCategoryInput = {
  name: string;
  description?: string;
  parentId?: string | null;
  isVisible?: boolean;
  imageUrl?: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput> & {
  id: string;
};

// Типы для создания и обновления товаров
export type CreateProductInput = {
  name: string;
  sku: string;
  description?: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  isVisible?: boolean;
  categoryId?: string | null;
  images?: {
    url: string;
    alt?: string;
    order?: number;
  }[];
  characteristics?: {
    name: string;
    value: string;
  }[];
};

export type UpdateProductInput = Partial<Omit<CreateProductInput, 'sku'>> & {
  id: string;
};

// Типы для импорта/экспорта
export type ImportExportFormat = 'csv' | 'json' | 'excel';

export type ImportProductData = {
  name: string;
  sku: string;
  description?: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  categoryName?: string;
  isVisible?: boolean;
  characteristics?: Record<string, string>;
};

export type ExportOptions = {
  includeImages: boolean;
  includeCategories: boolean;
  includeOptions: boolean;
  includeCharacteristics: boolean;
};

// Тип для результата импорта
export type ImportResult = {
  success: boolean;
  totalItems: number;
  importedItems: number;
  errors: string[];
};

// Тип для формы категории
export type CategoryFormData = {
  name: string;
  description?: string;
  parentId?: string | null;
  isVisible?: boolean;
  slug?: string;
  hidden?: boolean;
  includeSubcategoryProducts?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  imageUrl?: string;
};

// Тип для формы товара
export type ProductFormData = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice: number;
  cost: number;
  visible: boolean;
  applyDiscounts: boolean;
  categoryIds: string[];
  unit: string;
  stock: number;
  characteristics: ProductCharacteristic[];
  images: string[];
  relatedProducts: string[];
  complementaryProducts: string[];
  seoTitle: string;
  seoDescription: string;
  video?: string;
  wholesalePrice: number;
  retailPrice: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  options: ProductOption[];
};

// Тип для опции товара
export type ProductOption = {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  values: {
    id: string;
    value: string;
    price: number;
  }[];
};
