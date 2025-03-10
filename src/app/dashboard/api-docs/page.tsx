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
import { ApiExample } from './example';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'Документация API | ProtekCMS',
  description: 'Документация API для фронтенд-разработчиков',
};

const ApiDocsClient = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Документация API</h1>
        <p className="text-muted-foreground">
          Документация API для интеграции с фронтенд-частью сайта
        </p>
      </div>

      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Страницы</TabsTrigger>
          <TabsTrigger value="sections">Секции</TabsTrigger>
          <TabsTrigger value="example">Живой пример</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Получение данных страницы</CardTitle>
              <CardDescription>
                Получение данных страницы по её slug
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Запрос</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-mono text-sm">
                    GET /api/public/pages/:slug
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Параметры</h3>
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-mono text-sm">
                    slug - уникальный идентификатор страницы (например,
                    &quot;contacts&quot;, &quot;wholesale-clients&quot;,
                    &quot;shipping&quot;)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Ответ</h3>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {`{
  "id": "string",
  "slug": "string",
  "title": "string",
  "description": "string | null",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "sections": [
    {
      "id": "string",
      "pageId": "string",
      "type": "string",
      "order": 0,
      "content": { ... },
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Пример использования</h3>
                <div className="bg-muted p-4 rounded-md">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {`// Пример получения данных страницы контактов
const response = await fetch('/api/public/pages/contacts');
const data = await response.json();
console.log(data);`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <h3 className="text-lg font-semibold">Доступные страницы</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="contacts">
                    <AccordionTrigger>Контакты (contacts)</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p className="text-sm">
                          Страница с контактной информацией компании.
                        </p>
                        <h4 className="font-semibold">Секции:</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li className="text-sm">
                            <span className="font-mono">contacts</span> -
                            основная контактная информация
                          </li>
                          <li className="text-sm">
                            <span className="font-mono">map</span> - карта с
                            местоположением
                          </li>
                        </ul>
                        <h4 className="font-semibold mt-2">Пример запроса:</h4>
                        <div className="bg-muted p-2 rounded-md">
                          <p className="font-mono text-xs">
                            GET /api/public/pages/contacts
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="wholesale">
                    <AccordionTrigger>
                      Оптовым клиентам (wholesale-clients)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p className="text-sm">
                          Страница с информацией для оптовых клиентов.
                        </p>
                        <h4 className="font-semibold">Секции:</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li className="text-sm">
                            <span className="font-mono">hero</span> - заголовок
                            и основная информация
                          </li>
                          <li className="text-sm">
                            <span className="font-mono">benefits</span> -
                            преимущества работы с компанией
                          </li>
                          <li className="text-sm">
                            <span className="font-mono">services</span> -
                            сервисы для клиентов
                          </li>
                          <li className="text-sm">
                            <span className="font-mono">process</span> - процесс
                            работы
                          </li>
                          <li className="text-sm">
                            <span className="font-mono">support</span> -
                            информация о поддержке
                          </li>
                        </ul>
                        <h4 className="font-semibold mt-2">Пример запроса:</h4>
                        <div className="bg-muted p-2 rounded-md">
                          <p className="font-mono text-xs">
                            GET /api/public/pages/wholesale-clients
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payment-delivery">
                    <AccordionTrigger>
                      Оплата и доставка (shipping)
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p className="text-sm">
                          Страница с информацией об оплате и доставке.
                        </p>
                        <h4 className="font-semibold">Секции:</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li className="text-sm">
                            <span className="font-mono">payment</span> -
                            информация о способах оплаты
                          </li>
                          <li className="text-sm">
                            <span className="font-mono">delivery</span> -
                            информация о способах доставки
                          </li>
                        </ul>
                        <h4 className="font-semibold mt-2">Пример запроса:</h4>
                        <div className="bg-muted p-2 rounded-md">
                          <p className="font-mono text-xs">
                            GET /api/public/pages/shipping
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="about">
                    <AccordionTrigger>О компании (about)</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <p className="text-sm">
                          Страница с информацией о компании.
                        </p>
                        <h4 className="font-semibold">Секции:</h4>
                        <ul className="list-disc pl-6 space-y-1">
                          <li className="text-sm">
                            <span className="font-mono">welcome</span> -
                            приветственная секция
                          </li>
                          <li className="text-sm">
                            <span className="font-mono">offerings</span> -
                            предложения компании
                          </li>
                          <li className="text-sm">
                            <span className="font-mono">about_company</span> -
                            информация о компании
                          </li>
                        </ul>
                        <h4 className="font-semibold mt-2">Пример запроса:</h4>
                        <div className="bg-muted p-2 rounded-md">
                          <p className="font-mono text-xs">
                            GET /api/public/pages/about
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Типы секций</CardTitle>
              <CardDescription>
                Описание типов секций и их структуры
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="contacts">
                  <AccordionTrigger>Контакты (contacts)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с контактной информацией компании.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "phone": "string",
  "address": "string",
  "workingHours": "string",
  "inn": "string",
  "ogrn": "string",
  "kpp": "string"
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="map">
                  <AccordionTrigger>Карта (map)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">Секция с картой местоположения.</p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "latitude": number,
  "longitude": number,
  "zoom": number
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hero">
                  <AccordionTrigger>Заголовок (hero)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с заголовком и основной информацией.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "title": "string",
  "subtitle": string[],
  "imageUrl": "string"
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="benefits">
                  <AccordionTrigger>Преимущества (benefits)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с преимуществами работы с компанией.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "title": "string",
  "items": [
    {
      "title": "string",
      "description": "string"
    }
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="services">
                  <AccordionTrigger>Сервисы (services)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с сервисами для клиентов.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "title": "string",
  "items": string[]
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="process">
                  <AccordionTrigger>Процесс (process)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с описанием процесса работы.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "title": "string",
  "steps": string[]
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="support">
                  <AccordionTrigger>Поддержка (support)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с информацией о поддержке.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "title": "string",
  "description": string[],
  "contacts": {
    "telegram": "string",
    "whatsapp": "string"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="payment">
                  <AccordionTrigger>Оплата (payment)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с информацией о способах оплаты.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "title": "string",
  "subtitle": "string",
  "individuals": {
    "title": "string",
    "imageUrl": "string",
    "methods": string[]
  },
  "businesses": {
    "title": "string",
    "imageUrl": "string",
    "methods": string[]
  },
  "important": {
    "title": "string",
    "points": string[]
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="delivery">
                  <AccordionTrigger>Доставка (delivery)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с информацией о способах доставки.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "title": "string",
  "subtitle": "string",
  "moscow": {
    "title": "string",
    "details": string[]
  },
  "regions": {
    "title": "string",
    "details": string[]
  },
  "companies": [
    {
      "name": "string",
      "imageUrl": "string"
    }
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="welcome">
                  <AccordionTrigger>Приветствие (welcome)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с приветственной информацией.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "title": "string",
  "description": "string",
  "imageUrl": "string"
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="offerings">
                  <AccordionTrigger>Предложения (offerings)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с предложениями компании.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "title": "string",
  "items": [
    {
      "title": "string",
      "description": "string",
      "imageUrl": "string"
    }
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="about_company">
                  <AccordionTrigger>
                    О компании (about_company)
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        Секция с информацией о компании.
                      </p>
                      <h4 className="font-semibold">Структура:</h4>
                      <div className="bg-muted p-2 rounded-md">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {`{
  "title": "string",
  "features": [
    {
      "title": "string",
      "description": "string"
    }
  ]
}`}
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
          <ApiExample />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default async function ApiDocsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <ApiDocsClient />;
}
