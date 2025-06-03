import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'Документация GraphQL | ProtekCMS',
  description: 'Документация GraphQL для фронтенд-разработчиков',
};

const GraphQLDocsClient = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Документация GraphQL</h1>
        <p className="text-muted-foreground">
          Документация GraphQL для интеграции с фронтенд-частью сайта
        </p>
      </div>

      <Tabs defaultValue="basics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basics">Основы</TabsTrigger>
          <TabsTrigger value="queries">Запросы</TabsTrigger>
          <TabsTrigger value="mutations">Мутации</TabsTrigger>
          <TabsTrigger value="example">Живой пример</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Основы GraphQL</CardTitle>
              <CardDescription>
                Базовая информация о GraphQL API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Конечная точка API</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-mono text-sm">
                    POST /api/graphql
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Заголовки запроса</h3>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {`Content-Type: application/json
Authorization: Bearer YOUR_TOKEN (для защищенных запросов)`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Структура запроса</h3>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {`{
  "query": "...", // Строка с GraphQL запросом
  "variables": {}, // Опционально: переменные для запроса
  "operationName": "..." // Опционально: имя операции
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Пример использования</h3>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {`// Пример запроса данных страницы контактов
async function fetchPageData(slug) {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: \`
        query GetPage($slug: String!) {
          page(slug: $slug) {
            id
            slug
            title
            description
            sections {
              id
              type
              order
              content
            }
          }
        }
      \`,
      variables: {
        slug: slug
      }
    })
  });
  
  const { data } = await response.json();
  return data.page;
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Playground</h3>
                <p>
                  Вы можете исследовать и тестировать GraphQL API через интерактивный playground, доступный по адресу:
                </p>
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-mono text-sm">
                    /api/graphql/playground
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GraphQL Запросы</CardTitle>
              <CardDescription>
                Доступные запросы для получения данных
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="page">
                  <AccordionTrigger>Получение страницы</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Получение данных страницы по её slug.
                      </p>
                      <h4 className="font-semibold">Запрос:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`query GetPage($slug: String!) {
  page(slug: $slug) {
    id
    slug
    title
    description
    isActive
    createdAt
    updatedAt
    sections {
      id
      type
      order
      content
      isActive
    }
  }
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Параметры:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "slug": "contacts" // Пример: contacts, wholesale-clients, shipping, about
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Пример использования:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: \`query GetPage($slug: String!) {
      page(slug: $slug) {
        id slug title description sections { id type content }
      }
    }\`,
    variables: { slug: "contacts" }
  })
});

const { data } = await response.json();
console.log(data.page);`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="products">
                  <AccordionTrigger>Получение списка товаров</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Получение списка товаров с пагинацией и фильтрацией.
                      </p>
                      <h4 className="font-semibold">Запрос:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`query GetProducts(
  $page: Int
  $limit: Int
  $categoryId: ID
  $search: String
  $includeSubcategories: Boolean
) {
  products(
    page: $page
    limit: $limit
    categoryId: $categoryId
    search: $search
    includeSubcategories: $includeSubcategories
  ) {
    items {
      id
      name
      slug
      sku
      description
      retailPrice
      wholesalePrice
      stock
      mainImage
      imageUrls
      category {
        id
        name
        slug
      }
    }
    pagination {
      total
      page
      limit
      pages
    }
  }
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Параметры:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "page": 1,                 // Номер страницы (опционально)
  "limit": 20,               // Количество товаров на странице (опционально)
  "categoryId": "cat123",    // ID категории для фильтрации (опционально)
  "search": "чайник",        // Поисковый запрос (опционально)
  "includeSubcategories": true // Включать товары из подкатегорий (опционально)
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Пример использования:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: \`query GetProducts($page: Int, $categoryId: ID) {
      products(page: $page, categoryId: $categoryId) {
        items { id name retailPrice mainImage }
        pagination { total page limit }
      }
    }\`,
    variables: { 
      page: 1,
      categoryId: "cat123"
    }
  })
});

const { data } = await response.json();
console.log(data.products.items);
console.log(data.products.pagination);`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="product">
                  <AccordionTrigger>Получение товара</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Получение подробной информации о товаре по ID или slug.
                      </p>
                      <h4 className="font-semibold">Запрос по ID:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`query GetProduct($id: ID!) {
  product(id: $id) {
    id
    name
    slug
    sku
    description
    retailPrice
    wholesalePrice
    stock
    mainImage
    imageUrls
    category {
      id
      name
      slug
    }
    related {
      id
      name
      slug
      mainImage
      retailPrice
    }
    complementary {
      id
      name
      slug
      mainImage
      retailPrice
    }
  }
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Запрос по slug:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`query GetProductBySlug($slug: String!) {
  productBySlug(slug: $slug) {
    id
    name
    slug
    sku
    description
    retailPrice
    wholesalePrice
    stock
    mainImage
    imageUrls
    category {
      id
      name
      slug
    }
    related {
      id
      name
      slug
      mainImage
      retailPrice
    }
    complementary {
      id
      name
      slug
      mainImage
      retailPrice
    }
  }
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Параметры:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`// Для запроса по ID
{
  "id": "prod123"
}

// Для запроса по slug
{
  "slug": "krasnyj-chajnik"
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Пример использования:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`// Запрос по ID
const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: \`query GetProduct($id: ID!) {
      product(id: $id) {
        id name description retailPrice mainImage
      }
    }\`,
    variables: { id: "prod123" }
  })
});

const { data } = await response.json();
console.log(data.product);`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="categories">
                  <AccordionTrigger>Получение категорий</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Получение списка категорий товаров.
                      </p>
                      <h4 className="font-semibold">Запрос:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`query GetCategories {
  categories {
    id
    name
    slug
    parentId
    children {
      id
      name
      slug
    }
  }
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Пример использования:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: \`query GetCategories {
      categories {
        id name slug children { id name slug }
      }
    }\`
  })
});

const { data } = await response.json();
console.log(data.categories);`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mutations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GraphQL Мутации</CardTitle>
              <CardDescription>
                Мутации для изменения данных (требуется авторизация)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-md mb-4">
                <p className="text-amber-800 text-sm">
                  <strong>Примечание:</strong> Все мутации требуют авторизации. Необходимо передавать токен JWT в заголовке Authorization.
                </p>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="create-order">
                  <AccordionTrigger>Создание заказа</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Создание нового заказа на основе данных корзины.
                      </p>
                      <h4 className="font-semibold">Мутация:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    id
    number
    status
    totalAmount
    items {
      id
      productId
      productName
      quantity
      price
      total
    }
    customerInfo {
      fullName
      email
      phone
      address
    }
    createdAt
  }
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Входные данные:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "input": {
    "items": [
      {
        "productId": "prod123",
        "quantity": 2
      },
      {
        "productId": "prod456",
        "quantity": 1
      }
    ],
    "customerInfo": {
      "fullName": "Иван Иванов",
      "email": "ivan@example.com",
      "phone": "+7 (999) 123-45-67",
      "address": "г. Москва, ул. Примерная, д. 1, кв. 123"
    },
    "paymentMethod": "CARD", // Доступные методы: CARD, CASH, BANK_TRANSFER
    "deliveryMethod": "COURIER" // Доступные методы: COURIER, PICKUP, POST
  }
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Пример использования:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    query: \`mutation CreateOrder($input: CreateOrderInput!) {
      createOrder(input: $input) {
        id number status totalAmount
      }
    }\`,
    variables: {
      input: {
        items: [
          { productId: "prod123", quantity: 2 }
        ],
        customerInfo: {
          fullName: "Иван Иванов",
          email: "ivan@example.com",
          phone: "+7 (999) 123-45-67",
          address: "г. Москва, ул. Примерная, д. 1, кв. 123"
        },
        paymentMethod: "CARD",
        deliveryMethod: "COURIER"
      }
    }
  })
});

const { data } = await response.json();
console.log(data.createOrder);`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="update-profile">
                  <AccordionTrigger>Обновление профиля пользователя</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Обновление информации в профиле пользователя.
                      </p>
                      <h4 className="font-semibold">Мутация:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`mutation UpdateUserProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    fullName
    email
    phone
    address
    company
    updatedAt
  }
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Входные данные:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "input": {
    "fullName": "Иван Иванов",
    "phone": "+7 (999) 123-45-67",
    "address": "г. Москва, ул. Примерная, д. 1, кв. 123",
    "company": "ООО \"Компания\""
  }
}`}
                        </pre>
                      </div>
                      <h4 className="font-semibold mt-2">Пример использования:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    query: \`mutation UpdateUserProfile($input: UpdateProfileInput!) {
      updateProfile(input: $input) {
        id fullName phone address
      }
    }\`,
    variables: {
      input: {
        fullName: "Иван Иванов",
        phone: "+7 (999) 123-45-67",
        address: "г. Москва, ул. Примерная, д. 1, кв. 123"
      }
    }
  })
});

const { data } = await response.json();
console.log(data.updateProfile);`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="example">
          <Card>
            <CardHeader>
              <CardTitle>GraphQL Playground</CardTitle>
              <CardDescription>
                Интерактивный GraphQL редактор для тестирования API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="mb-2">
                  Ниже представлен интерактивный GraphQL Playground, где вы можете выполнять запросы к API:
                </p>
                <div className="w-full h-[600px] rounded-md overflow-hidden border">
                  <iframe
                    src="/api/graphql"
                    className="w-full h-full"
                    title="GraphQL Playground"
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md mt-4">
                <h3 className="text-lg font-semibold mb-2">Пример запроса страницы</h3>
                <p className="mb-2">Попробуйте выполнить следующий запрос в playground:</p>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto">
                  {`query GetPage($slug: String!) {
  page(slug: $slug) {
    id
    title
    description
    sections {
      id
      type
      order
      content
    }
  }
}

# Переменные
{
  "slug": "contacts"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default async function GraphQLDocsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <GraphQLDocsClient />;
} 