// GraphQL запросы для каталога товаров

// Фрагмент для категории
export const CATEGORY_FRAGMENT = `
  fragment CategoryFragment on Category {
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
`;

// Фрагмент для товара
export const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
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
`;

// Запрос всех категорий
export const GET_CATEGORIES = `
  ${CATEGORY_FRAGMENT}
  query GetCategories($includeHidden: Boolean) {
    categories(includeHidden: $includeHidden) {
      categories {
        ...CategoryFragment
        subcategories {
          ...CategoryFragment
        }
        productsCount
      }
    }
  }
`;

// Запрос категории по ID
export const GET_CATEGORY = `
  ${CATEGORY_FRAGMENT}
  query GetCategory($id: ID!) {
    category(id: $id) {
      ...CategoryFragment
      subcategories {
        ...CategoryFragment
      }
      productsCount
    }
  }
`;

// Запрос товаров с пагинацией
export const GET_PRODUCTS = `
  ${PRODUCT_FRAGMENT}
  query GetProducts(
    $page: Int
    $limit: Int
    $categoryId: ID
    $search: String
    $includeSubcategories: Boolean
    $stockFilter: String
    $visibilityFilter: String
  ) {
    products(
      page: $page
      limit: $limit
      categoryId: $categoryId
      search: $search
      includeSubcategories: $includeSubcategories
      stockFilter: $stockFilter
      visibilityFilter: $visibilityFilter
    ) {
      products {
        ...ProductFragment
        category {
          ...CategoryFragment
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

// Запрос товара по ID
export const GET_PRODUCT = `
  ${PRODUCT_FRAGMENT}
  query GetProduct($id: ID!) {
    product(id: $id) {
      ...ProductFragment
      category {
        ...CategoryFragment
      }
    }
  }
`; 