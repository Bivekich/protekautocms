import { useState, useCallback } from 'react';

// Типы для каталога
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  level: number;
  order: number;
  isVisible: boolean;
  includeSubcategoryProducts: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  subcategories?: Category[];
  productsCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  isVisible: boolean;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  images?: ProductImage[];
  characteristics?: ProductCharacteristic[];
  options?: ProductOption[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
}

export interface ProductCharacteristic {
  id: string;
  name: string;
  value: string;
}

export interface ProductOption {
  id: string;
  name: string;
  type: string;
  values: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  value: string;
  price: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CategoriesResult {
  categories: Category[];
}

export interface ProductsResult {
  products: Product[];
  pagination: Pagination;
}

// GraphQL запросы
const GET_CATEGORIES_QUERY = `
  query GetCategories($includeHidden: Boolean) {
    categoriesList(includeHidden: $includeHidden) {
      categories {
        id
        name
        slug
        description
        parentId
        level
        order
        isVisible
        includeSubcategoryProducts
        imageUrl
        createdAt
        updatedAt
        subcategories {
          id
          name
          slug
          description
          parentId
          level
          order
          isVisible
          includeSubcategoryProducts
          imageUrl
          createdAt
          updatedAt
        }
        productsCount
      }
    }
  }
`;

const GET_CATEGORY_QUERY = `
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      slug
      description
      parentId
      level
      order
      isVisible
      includeSubcategoryProducts
      imageUrl
      createdAt
      updatedAt
      subcategories {
        id
        name
        slug
        description
        parentId
        level
        order
        isVisible
        includeSubcategoryProducts
        imageUrl
        createdAt
        updatedAt
      }
      productsCount
    }
  }
`;

const GET_PRODUCTS_QUERY = `
  query GetProducts(
    $page: Int
    $limit: Int
    $categoryId: ID
    $search: String
    $includeSubcategories: Boolean
    $stockFilter: String
    $visibilityFilter: String
  ) {
    productsList(
      page: $page
      limit: $limit
      categoryId: $categoryId
      search: $search
      includeSubcategories: $includeSubcategories
      stockFilter: $stockFilter
      visibilityFilter: $visibilityFilter
    ) {
      products {
        id
        name
        slug
        sku
        description
        wholesalePrice
        retailPrice
        stock
        isVisible
        categoryId
        createdAt
        updatedAt
        category {
          id
          name
          slug
          description
          parentId
          level
          order
          isVisible
          includeSubcategoryProducts
          imageUrl
          createdAt
          updatedAt
        }
        images {
          id
          url
          alt
          order
        }
        characteristics {
          id
          name
          value
        }
        options {
          id
          name
          type
          values {
            id
            value
            price
          }
        }
      }
      pagination {
        total
        page
        limit
        pages
      }
    }
  }
`;

const GET_PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    productItem(id: $id) {
      id
      name
      slug
      sku
      description
      wholesalePrice
      retailPrice
      stock
      isVisible
      categoryId
      createdAt
      updatedAt
      category {
        id
        name
        slug
        description
        parentId
        level
        order
        isVisible
        includeSubcategoryProducts
        imageUrl
        createdAt
        updatedAt
      }
      images {
        id
        url
        alt
        order
      }
      characteristics {
        id
        name
        value
      }
      options {
        id
        name
        type
        values {
          id
          value
          price
        }
      }
    }
  }
`;

// Мутации
const CREATE_CATEGORY_MUTATION = `
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
      description
      parentId
      level
      order
      isVisible
      includeSubcategoryProducts
      imageUrl
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CATEGORY_MUTATION = `
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      slug
      description
      parentId
      level
      order
      isVisible
      includeSubcategoryProducts
      imageUrl
      createdAt
      updatedAt
    }
  }
`;

const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      slug
      sku
      description
      wholesalePrice
      retailPrice
      stock
      isVisible
      categoryId
      createdAt
      updatedAt
      images {
        id
        url
        alt
        order
      }
      characteristics {
        id
        name
        value
      }
      options {
        id
        name
        type
        values {
          id
          value
          price
        }
      }
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = `
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      slug
      sku
      description
      wholesalePrice
      retailPrice
      stock
      isVisible
      categoryId
      createdAt
      updatedAt
      images {
        id
        url
        alt
        order
      }
      characteristics {
        id
        name
        value
      }
      options {
        id
        name
        type
        values {
          id
          value
          price
        }
      }
    }
  }
`;

const BULK_UPDATE_PRODUCTS_MUTATION = `
  mutation BulkUpdateProducts($input: BulkUpdateProductsInput!) {
    bulkUpdateProducts(input: $input)
  }
`;

const DELETE_CATEGORY_MUTATION = `
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

const DELETE_PRODUCT_MUTATION = `
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

const BULK_DELETE_PRODUCTS_MUTATION = `
  mutation BulkDeleteProducts($productIds: [ID!]!) {
    bulkDeleteProducts(productIds: $productIds)
  }
`;

// Функция для выполнения GraphQL запросов
async function graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL error');
  }

  return result.data;
}

// Хук для работы с каталогом
export const useCatalogGraphQL = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение категорий
  const getCategories = useCallback(async (includeHidden = false): Promise<CategoriesResult> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ categoriesList: CategoriesResult }>(
        GET_CATEGORIES_QUERY,
        { includeHidden }
      );
      return data.categoriesList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке категорий';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение категории по ID
  const getCategory = useCallback(async (id: string): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ category: Category }>(
        GET_CATEGORY_QUERY,
        { id }
      );
      return data.category;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке категории';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение товаров
  const getProducts = useCallback(async (params: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    includeSubcategories?: boolean;
    stockFilter?: string;
    visibilityFilter?: string;
  }): Promise<ProductsResult> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ productsList: ProductsResult }>(
        GET_PRODUCTS_QUERY,
        params
      );
      return data.productsList;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке товаров';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение товара по ID
  const getProduct = useCallback(async (id: string): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ productItem: Product }>(
        GET_PRODUCT_QUERY,
        { id }
      );
      return data.productItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке товара';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание категории
  const createCategory = useCallback(async (input: {
    name: string;
    description?: string;
    parentId?: string;
    isVisible?: boolean;
    includeSubcategoryProducts?: boolean;
    imageUrl?: string;
  }): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ createCategory: Category }>(
        CREATE_CATEGORY_MUTATION,
        { input }
      );
      return data.createCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при создании категории';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление категории
  const updateCategory = useCallback(async (id: string, input: {
    name?: string;
    description?: string;
    isVisible?: boolean;
    includeSubcategoryProducts?: boolean;
    imageUrl?: string;
  }): Promise<Category> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ updateCategory: Category }>(
        UPDATE_CATEGORY_MUTATION,
        { id, input }
      );
      return data.updateCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении категории';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание товара
  const createProduct = useCallback(async (input: {
    name: string;
    sku: string;
    description?: string;
    wholesalePrice: number;
    retailPrice: number;
    stock?: number;
    isVisible?: boolean;
    categoryId?: string;
    images?: ProductImage[];
    characteristics?: ProductCharacteristic[];
    options?: ProductOption[];
  }): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ createProduct: Product }>(
        CREATE_PRODUCT_MUTATION,
        { input }
      );
      return data.createProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при создании товара';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление товара
  const updateProduct = useCallback(async (id: string, input: {
    name?: string;
    sku?: string;
    description?: string;
    wholesalePrice?: number;
    retailPrice?: number;
    stock?: number;
    isVisible?: boolean;
    categoryId?: string;
    images?: ProductImage[];
    characteristics?: ProductCharacteristic[];
    options?: ProductOption[];
  }): Promise<Product> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ updateProduct: Product }>(
        UPDATE_PRODUCT_MUTATION,
        { id, input }
      );
      return data.updateProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении товара';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Массовое обновление товаров
  const bulkUpdateProducts = useCallback(async (input: {
    productIds: string[];
    data: {
      isVisible?: boolean;
      categoryId?: string;
      stock?: number;
      wholesalePrice?: number;
      retailPrice?: number;
    };
  }): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ bulkUpdateProducts: boolean }>(
        BULK_UPDATE_PRODUCTS_MUTATION,
        { input }
      );
      return data.bulkUpdateProducts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при массовом обновлении товаров';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление категории
  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ deleteCategory: boolean }>(
        DELETE_CATEGORY_MUTATION,
        { id }
      );
      return data.deleteCategory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при удалении категории';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление товара
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ deleteProduct: boolean }>(
        DELETE_PRODUCT_MUTATION,
        { id }
      );
      return data.deleteProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при удалении товара';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Массовое удаление товаров
  const bulkDeleteProducts = useCallback(async (productIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphqlFetch<{ bulkDeleteProducts: boolean }>(
        BULK_DELETE_PRODUCTS_MUTATION,
        { productIds }
      );
      return data.bulkDeleteProducts;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при массовом удалении товаров';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getCategories,
    getCategory,
    getProducts,
    getProduct,
    createCategory,
    updateCategory,
    createProduct,
    updateProduct,
    bulkUpdateProducts,
    deleteCategory,
    deleteProduct,
    bulkDeleteProducts,
  };
}; 