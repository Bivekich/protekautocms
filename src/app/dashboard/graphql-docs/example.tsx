'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Типы данных для страницы и секций
type ContactsContent = {
  phone: string;
  address: string;
  workingHours: string;
  inn: string;
  ogrn: string;
  kpp: string;
};

type MapContent = {
  latitude: number;
  longitude: number;
  zoom: number;
};

type HeroContent = {
  title: string;
  subtitle: string[];
  imageUrl: string;
};

type BenefitsContent = {
  title: string;
  items: {
    title: string;
    description: string;
  }[];
};

type ServicesContent = {
  title: string;
  items: string[];
};

type ProcessContent = {
  title: string;
  steps: string[];
};

type SupportContent = {
  title: string;
  description: string[];
  contacts: {
    telegram: string;
    whatsapp: string;
  };
};

type PaymentContent = {
  title: string;
  subtitle: string;
  individuals: {
    title: string;
    imageUrl: string;
    methods: string[];
  };
  businesses: {
    title: string;
    imageUrl: string;
    methods: string[];
  };
  important: {
    title: string;
    points: string[];
  };
};

type DeliveryContent = {
  title: string;
  subtitle: string;
  moscow: {
    title: string;
    details: string[];
  };
  regions: {
    title: string;
    details: string[];
  };
  companies: Array<{
    name: string;
    imageUrl: string;
  }>;
};

// Добавляем типы для секций страницы "О компании"
type WelcomeContent = {
  title: string;
  description: string;
  imageUrl?: string;
};

type OfferingsContent = {
  title: string;
  items: Array<{
    title: string;
    description: string;
    imageUrl?: string;
  }>;
};

type AboutCompanyContent = {
  title: string;
  features: Array<{
    title: string;
    description: string;
  }>;
};

type Section = {
  id: string;
  pageId: string;
  type: string;
  order: number;
  content:
    | ContactsContent
    | MapContent
    | HeroContent
    | BenefitsContent
    | ServicesContent
    | ProcessContent
    | SupportContent
    | PaymentContent
    | DeliveryContent
    | WelcomeContent
    | OfferingsContent
    | AboutCompanyContent
    | Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type Page = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
};

// Доступные страницы для выбора
const availablePages = [
  { value: 'contacts', label: 'Контакты' },
  { value: 'wholesale-clients', label: 'Оптовым клиентам' },
  { value: 'shipping', label: 'Оплата и доставка' },
  { value: 'about', label: 'О компании' },
];

export const ApiExample = () => {
  const [selectedPage, setSelectedPage] = useState('contacts');
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jsonView, setJsonView] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // GraphQL запрос вместо REST API
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetPage($slug: String!) {
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
                    pageId
                    type
                    order
                    content
                    isActive
                    createdAt
                    updatedAt
                  }
                }
              }
            `,
            variables: {
              slug: selectedPage
            }
          })
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        
        // GraphQL возвращает данные в поле data.page
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        
        setPage(result.data.page);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Произошла ошибка при загрузке данных'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPage]);

  const handlePageChange = (value: string) => {
    setSelectedPage(value);
  };

  const toggleView = () => {
    setJsonView(!jsonView);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Живой пример</CardTitle>
          <CardDescription>
            Пример получения и отображения данных с помощью GraphQL
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <p>Загрузка данных...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Живой пример</CardTitle>
          <CardDescription>
            Пример получения и отображения данных с помощью GraphQL
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <p className="text-red-500">Ошибка: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Живой пример</CardTitle>
        <CardDescription>
          Пример получения и отображения данных с помощью GraphQL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select value={selectedPage} onValueChange={handlePageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите страницу" />
              </SelectTrigger>
              <SelectContent>
                {availablePages.map((page) => (
                  <SelectItem key={page.value} value={page.value}>
                    {page.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={toggleView}>
            {jsonView ? 'Показать визуализацию' : 'Показать JSON'}
          </Button>
        </div>

        {page && (
          <div>
            {jsonView ? (
              <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
                <pre className="text-xs">{JSON.stringify(page, null, 2)}</pre>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border p-4 rounded-md">
                  <h2 className="text-xl font-bold mb-2">{page.title}</h2>
                  {page.description && (
                    <p className="text-muted-foreground">{page.description}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Секции страницы:</h3>
                  {page.sections.map((section) => (
                    <div
                      key={section.id}
                      className="border p-4 rounded-md space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">
                          Тип: <span className="font-mono">{section.type}</span>
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          Порядок: {section.order}
                        </span>
                      </div>

                      {/* Визуализация для секции welcome */}
                      {section.type === 'welcome' && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <h5 className="font-semibold text-lg mb-2">
                            {(section.content as WelcomeContent).title}
                          </h5>
                          <p className="text-sm mb-2">
                            {(section.content as WelcomeContent).description}
                          </p>
                          {(section.content as WelcomeContent).imageUrl && (
                            <div className="text-xs text-blue-600">
                              [Изображение:{' '}
                              {(section.content as WelcomeContent).imageUrl}]
                            </div>
                          )}
                        </div>
                      )}

                      {/* Визуализация для секции offerings */}
                      {section.type === 'offerings' && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <h5 className="font-semibold text-lg mb-2">
                            {(section.content as OfferingsContent).title}
                          </h5>
                          <div className="space-y-2">
                            {(section.content as OfferingsContent).items.map(
                              (item, index) => (
                                <div
                                  key={index}
                                  className="p-2 bg-white rounded border"
                                >
                                  <h6 className="font-medium">{item.title}</h6>
                                  <p className="text-sm">{item.description}</p>
                                  {item.imageUrl && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      [Изображение: {item.imageUrl}]
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Визуализация для секции about_company */}
                      {section.type === 'about_company' && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <h5 className="font-semibold text-lg mb-2">
                            {(section.content as AboutCompanyContent).title}
                          </h5>
                          <div className="space-y-2">
                            {(section.content as AboutCompanyContent).features.map(
                              (feature, index) => (
                                <div
                                  key={index}
                                  className="p-2 bg-white rounded border"
                                >
                                  <h6 className="font-medium">
                                    {feature.title}
                                  </h6>
                                  <p className="text-sm">{feature.description}</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Общая визуализация контента */}
                      <div className="mt-2">
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => {
                            console.log(section.content);
                          }}
                        >
                          Показать содержимое в консоли
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <h3 className="text-lg font-semibold mb-2">
            Пример кода для получения данных
          </h3>
          <div className="bg-muted p-4 rounded-md">
            <pre className="font-mono text-xs whitespace-pre-wrap">
              {`// Пример получения данных страницы ${selectedPage} с помощью GraphQL
const response = await fetch('/api/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
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
            content
          }
        }
      }
    \`,
    variables: {
      slug: "${selectedPage}"
    }
  })
});

const { data } = await response.json();

// Использование данных
console.log(data.page.title);
console.log(data.page.sections);

// Пример получения конкретной секции
const section = data.page.sections.find(section => section.type === '${
                page?.sections[0]?.type || 'example'
              }');
if (section) {
  console.log(section.content);
}`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
