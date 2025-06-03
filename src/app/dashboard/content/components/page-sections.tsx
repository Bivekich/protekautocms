'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { JsonValue } from '@prisma/client/runtime/library';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactsForm } from './section-forms/contacts-form';
import { MapForm } from './section-forms/map-form';
import { HeroForm } from './section-forms/hero-form';
import { BenefitsForm } from './section-forms/benefits-form';
import { ServicesForm } from './section-forms/services-form';
import { ProcessForm } from './section-forms/process-form';
import { SupportForm } from './section-forms/support-form';
import { PaymentForm } from './section-forms/payment-form';
import { DeliveryForm } from './section-forms/delivery-form';
import { WelcomeForm } from './section-forms/welcome-form';
import { OfferingsForm } from './section-forms/offerings-form';
import { AboutCompanyForm } from './section-forms/about-company-form';
import { useContentGraphQL, CreatePageSectionInput, PageSection } from '@/hooks/useContentGraphQL';

// Определяем интерфейс FlexiblePageSection, поддерживающий как string, так и Date для полей createdAt и updatedAt
interface FlexiblePageSection extends Omit<PageSection, 'createdAt' | 'updatedAt'> {
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Определяем типы для различных секций
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

// Добавляем типы для новых секций
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

type Section = FlexiblePageSection & {
  content:
    | HeroContent
    | BenefitsContent
    | ServicesContent
    | ProcessContent
    | SupportContent
    | ContactsContent
    | MapContent
    | PaymentContent
    | DeliveryContent
    | WelcomeContent
    | OfferingsContent
    | AboutCompanyContent
    | JsonValue;
};

interface PageSectionsProps {
  pageId: string;
  sections: Section[] | FlexiblePageSection[];
}

export const PageSections = ({ pageId, sections }: PageSectionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('contacts');
  const { createPageSection, deletePageSection } = useContentGraphQL();

  const contactsSection = sections.find(
    (section) => section.type === 'contacts'
  );
  const mapSection = sections.find((section) => section.type === 'map');
  const heroSection = sections.find((section) => section.type === 'hero');
  const benefitsSection = sections.find(
    (section) => section.type === 'benefits'
  );
  const servicesSection = sections.find(
    (section) => section.type === 'services'
  );
  const processSection = sections.find((section) => section.type === 'process');
  const supportSection = sections.find((section) => section.type === 'support');
  const paymentSection = sections.find((section) => section.type === 'payment');
  const deliverySection = sections.find(
    (section) => section.type === 'delivery'
  );
  const welcomeSection = sections.find((section) => section.type === 'welcome');
  const offeringsSection = sections.find(
    (section) => section.type === 'offerings'
  );
  const aboutCompanySection = sections.find(
    (section) => section.type === 'about_company'
  );

  // Определяем, какая страница редактируется
  const isWholesalePage = sections.some((section) =>
    ['hero', 'benefits', 'services', 'process', 'support'].includes(
      section.type
    )
  );

  // Определяем, является ли страница страницей "Оплата и доставка"
  const isPaymentDeliveryPage = sections.some((section) =>
    ['payment', 'delivery'].includes(section.type)
  );

  // Определяем, является ли страница страницей "О компании"
  const isAboutPage = sections.some((section) =>
    ['welcome', 'offerings', 'about_company'].includes(section.type)
  );

  const handleAddSection = async (type: string) => {
    try {
      setIsLoading(true);

      // Определяем порядок для новой секции
      const maxOrder =
        sections.length > 0
          ? Math.max(...sections.map((section) => section.order))
          : -1;

      // Создаем начальное содержимое в зависимости от типа секции
      let initialContent = {};

      if (type === 'contacts') {
        initialContent = {
          phone: '+7 (495) 260-20-60',
          address: 'Московская обл., г. Дмитров, ул. Чекистская 6, комната 4',
          workingHours: 'ПН-ПТ 9:00 – 18:00, Сб 10:00 – 16:00, ВС – Выходной',
          inn: '5007117840',
          ogrn: '1225000146282',
          kpp: '500701001',
        };
      } else if (type === 'map') {
        initialContent = {
          latitude: 56.344689,
          longitude: 37.52002,
          zoom: 15,
        };
      } else if (type === 'hero') {
        initialContent = {
          title: 'ОПТОВИКАМ',
          subtitle: [
            'Напрямую с 200+ оптовых складов',
            'Доставка по всей России',
            'Вычет НДС 20%',
            'Закрывающие документы',
            'Персональный менеджер',
          ],
          imageUrl: 'https://example.com/wholesale.jpg',
        };
      } else if (type === 'benefits') {
        initialContent = {
          title: 'Почему оптовые покупатели выбирают PROTEK',
          items: [
            {
              title: 'Широкий ассортимент',
              description:
                'Все запчасти можно заказать в одном месте, с Российских и зарубежных складов',
            },
            {
              title: 'Бесплатный подбор 24/7',
              description:
                'Наши эксперты круглосуточно подберут нужные запчасти по VIN',
            },
            {
              title: 'Минимальные цены и сроки',
              description:
                'Сравнивайте предложения сотен поставщиков и выбирайте лучшие',
            },
          ],
        };
      } else if (type === 'services') {
        initialContent = {
          title: 'Сервисы для удобной работы с нами',
          items: [
            'Онлайн-проценка по API',
            'Прайс листы нашего наличия',
            'Онлайн заказ',
          ],
        };
      } else if (type === 'process') {
        initialContent = {
          title: 'Как покупать по оптовой цене',
          steps: [
            'Зарегистрируйтесь как юридическое лицо',
            'Подберите запчасти в каталоге или воспользуйтесь помощью наших экспертов',
            'Добавьте адрес доставки и оформите заказ',
            'Скачайте счет на оплату или оплатите заказ картой',
            'Получите заказ и закрывающие документы',
          ],
        };
      } else if (type === 'support') {
        initialContent = {
          title: 'Поддержка оптовых покупателей',
          description: [
            'Для наших постоянных оптовых клиентов мы предлагаем отсрочку платежа, что позволит вам удобно планировать свои финансовые расходы.',
            'Также мы принимаем пред.заказы на наш склад, чтобы вы могли быть уверены в наличии необходимых запчастей для своих клиентов.',
            'Постоянным оптовым клиентам мы предоставляем индивидуальные скидки.',
          ],
          contacts: {
            telegram: 'https://t.me/protekwholesale',
            whatsapp: 'https://wa.me/79001234567',
          },
        };
      } else if (type === 'payment') {
        initialContent = {
          title: 'Оплата',
          subtitle: 'Выберите удобный способ оплаты',
          individuals: {
            title: 'Для физических лиц',
            imageUrl: 'https://example.com/individuals-payment.jpg',
            methods: [
              'Наличными',
              'Банковской картой',
              'Онлайн переводом',
            ],
          },
          businesses: {
            title: 'Для юридических лиц',
            imageUrl: 'https://example.com/businesses-payment.jpg',
            methods: [
              'Безналичный расчет',
              'Банковской картой',
              'Отсрочка платежа',
            ],
          },
          important: {
            title: 'Важно знать',
            points: [
              'Оплата должна быть произведена в течение 3 дней',
              'При оплате картой комиссия отсутствует',
              'Возможна отсрочка платежа для постоянных клиентов',
            ],
          },
        };
      } else if (type === 'delivery') {
        initialContent = {
          title: 'Доставка',
          subtitle: 'Быстрая и надежная доставка по всей России',
          moscow: {
            title: 'По Москве и МО',
            details: [
              'Доставка в день заказа при оформлении до 12:00',
              'Стоимость доставки от 300 рублей',
              'Бесплатная доставка при заказе от 5000 рублей',
            ],
          },
          regions: {
            title: 'По регионам России',
            details: [
              'Доставка транспортными компаниями',
              'Сроки доставки 1-7 дней в зависимости от региона',
              'Возможность доставки до терминала или до двери',
            ],
          },
          companies: [
            {
              name: 'СДЭК',
              imageUrl: 'https://example.com/cdek-logo.jpg',
            },
            {
              name: 'Boxberry',
              imageUrl: 'https://example.com/boxberry-logo.jpg',
            },
            {
              name: 'ПЭК',
              imageUrl: 'https://example.com/pek-logo.jpg',
            },
          ],
        };
      } else if (type === 'welcome') {
        initialContent = {
          title: 'Добро пожаловать!',
          description: 'Мы рады видеть вас на нашем сайте!',
          imageUrl: 'https://example.com/welcome.jpg',
        };
      } else if (type === 'offerings') {
        initialContent = {
          title: 'Наши предложения',
          items: [
            {
              title: 'Продукт 1',
              description: 'Описание продукта 1',
              imageUrl: 'https://example.com/product1.jpg',
            },
            {
              title: 'Продукт 2',
              description: 'Описание продукта 2',
              imageUrl: 'https://example.com/product2.jpg',
            },
            {
              title: 'Продукт 3',
              description: 'Описание продукта 3',
              imageUrl: 'https://example.com/product3.jpg',
            },
          ],
        };
      } else if (type === 'about_company') {
        initialContent = {
          title: 'О компании',
          features: [
            {
              title: 'Надежность',
              description:
                'Мы гарантируем надежность и качество наших продуктов',
            },
            {
              title: 'Инновации',
              description:
                'Мы постоянно совершенствуем наши технологии и продукты',
            },
            {
              title: 'Клиентоориентированность',
              description:
                'Мы всегда учитываем потребности и пожелания наших клиентов',
            },
          ],
        };
      }

      const input: CreatePageSectionInput = {
        pageId,
        type,
        order: maxOrder + 1,
        content: initialContent,
        isActive: true,
      };

      await createPageSection(input);

      toast.success(`Секция "${type}" добавлена`);
      router.refresh();
    } catch (error) {
      toast.error('Что-то пошло не так');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string, type: string) => {
    try {
      setIsLoading(true);

      await deletePageSection(sectionId);

      toast.success(`Секция "${type}" удалена`);
      router.refresh();
    } catch (error) {
      toast.error('Что-то пошло не так');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Если это страница "Оптовым клиентам", показываем соответствующие секции
  if (isWholesalePage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Секции страницы</CardTitle>
          <CardDescription>
            Управление секциями страницы &quot;Оптовым клиентам&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid grid-cols-5 w-auto">
                <TabsTrigger value="hero" disabled={!heroSection}>
                  Заголовок
                </TabsTrigger>
                <TabsTrigger value="benefits" disabled={!benefitsSection}>
                  Преимущества
                </TabsTrigger>
                <TabsTrigger value="services" disabled={!servicesSection}>
                  Сервисы
                </TabsTrigger>
                <TabsTrigger value="process" disabled={!processSection}>
                  Процесс
                </TabsTrigger>
                <TabsTrigger value="support" disabled={!supportSection}>
                  Поддержка
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                {!heroSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection('hero')}
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить заголовок
                  </Button>
                )}
                {!benefitsSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection('benefits')}
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить преимущества
                  </Button>
                )}
                {!servicesSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection('services')}
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить сервисы
                  </Button>
                )}
                {!processSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection('process')}
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить процесс
                  </Button>
                )}
                {!supportSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection('support')}
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить поддержку
                  </Button>
                )}
              </div>
            </div>

            {heroSection && (
              <TabsContent value="hero" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSection(heroSection.id, 'hero')}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить секцию
                  </Button>
                </div>
                <HeroForm
                  pageId={pageId}
                  section={{
                    id: heroSection.id,
                    content: heroSection.content as HeroContent,
                    isActive: heroSection.isActive,
                  }}
                />
              </TabsContent>
            )}

            {benefitsSection && (
              <TabsContent value="benefits" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteSection(benefitsSection.id, 'benefits')
                    }
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить секцию
                  </Button>
                </div>
                <BenefitsForm
                  pageId={pageId}
                  section={{
                    id: benefitsSection.id,
                    content: benefitsSection.content as BenefitsContent,
                    isActive: benefitsSection.isActive,
                  }}
                />
              </TabsContent>
            )}

            {servicesSection && (
              <TabsContent value="services" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteSection(servicesSection.id, 'services')
                    }
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить секцию
                  </Button>
                </div>
                <ServicesForm
                  pageId={pageId}
                  section={{
                    id: servicesSection.id,
                    content: servicesSection.content as ServicesContent,
                    isActive: servicesSection.isActive,
                  }}
                />
              </TabsContent>
            )}

            {processSection && (
              <TabsContent value="process" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteSection(processSection.id, 'process')
                    }
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить секцию
                  </Button>
                </div>
                <ProcessForm
                  pageId={pageId}
                  section={{
                    id: processSection.id,
                    content: processSection.content as ProcessContent,
                    isActive: processSection.isActive,
                  }}
                />
              </TabsContent>
            )}

            {supportSection && (
              <TabsContent value="support" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteSection(supportSection.id, 'support')
                    }
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить секцию
                  </Button>
                </div>
                <SupportForm
                  pageId={pageId}
                  section={{
                    id: supportSection.id,
                    content: supportSection.content as SupportContent,
                    isActive: supportSection.isActive,
                  }}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Если это страница "Оплата и доставка", показываем соответствующие секции
  if (isPaymentDeliveryPage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Секции страницы</CardTitle>
          <CardDescription>
            Управление секциями страницы &quot;Оплата и доставка&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="grid grid-cols-2 w-auto">
                <TabsTrigger value="payment" disabled={!paymentSection}>
                  Оплата
                </TabsTrigger>
                <TabsTrigger value="delivery" disabled={!deliverySection}>
                  Доставка
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                {!paymentSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection('payment')}
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить секцию оплаты
                  </Button>
                )}
                {!deliverySection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection('delivery')}
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить секцию доставки
                  </Button>
                )}
              </div>
            </div>

            {paymentSection && (
              <TabsContent value="payment" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteSection(paymentSection.id, 'payment')
                    }
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить секцию
                  </Button>
                </div>
                <PaymentForm pageId={pageId} initialData={paymentSection} />
              </TabsContent>
            )}

            {deliverySection && (
              <TabsContent value="delivery" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteSection(deliverySection.id, 'delivery')
                    }
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить секцию
                  </Button>
                </div>
                <DeliveryForm pageId={pageId} initialData={deliverySection} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Для страницы "О компании" показываем соответствующие секции
  if (isAboutPage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Секции страницы</CardTitle>
          <CardDescription>
            Управление секциями страницы &quot;О компании&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="welcome" disabled={!welcomeSection}>
                  Приветствие
                </TabsTrigger>
                <TabsTrigger value="offerings" disabled={!offeringsSection}>
                  Предложения
                </TabsTrigger>
                <TabsTrigger
                  value="about_company"
                  disabled={!aboutCompanySection}
                >
                  О компании
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                {!welcomeSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection('welcome')}
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить приветствие
                  </Button>
                )}
                {!offeringsSection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection('offerings')}
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить предложения
                  </Button>
                )}
                {!aboutCompanySection && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSection('about_company')}
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Добавить о компании
                  </Button>
                )}
              </div>
            </div>

            {welcomeSection && (
              <TabsContent value="welcome" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteSection(welcomeSection.id, 'welcome')
                    }
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить секцию
                  </Button>
                </div>
                <WelcomeForm
                  pageId={pageId}
                  sectionId={welcomeSection.id}
                  defaultValues={{
                    title: (welcomeSection.content as WelcomeContent).title,
                    description: (welcomeSection.content as WelcomeContent)
                      .description,
                    imageUrl: (welcomeSection.content as WelcomeContent)
                      .imageUrl,
                    isActive: welcomeSection.isActive,
                  }}
                />
              </TabsContent>
            )}

            {offeringsSection && (
              <TabsContent value="offerings" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteSection(offeringsSection.id, 'offerings')
                    }
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить секцию
                  </Button>
                </div>
                <OfferingsForm
                  pageId={pageId}
                  sectionId={offeringsSection.id}
                  defaultValues={{
                    title: (offeringsSection.content as OfferingsContent).title,
                    items: (offeringsSection.content as OfferingsContent).items,
                    isActive: offeringsSection.isActive,
                  }}
                />
              </TabsContent>
            )}

            {aboutCompanySection && (
              <TabsContent value="about_company" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      handleDeleteSection(
                        aboutCompanySection.id,
                        'about_company'
                      )
                    }
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить секцию
                  </Button>
                </div>
                <AboutCompanyForm
                  pageId={pageId}
                  sectionId={aboutCompanySection.id}
                  defaultValues={{
                    title: (aboutCompanySection.content as AboutCompanyContent)
                      .title,
                    features: (
                      aboutCompanySection.content as AboutCompanyContent
                    ).features,
                    isActive: aboutCompanySection.isActive,
                  }}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Для страницы контактов показываем стандартные секции
  return (
    <Card>
      <CardHeader>
        <CardTitle>Секции страницы</CardTitle>
        <CardDescription>Управление секциями страницы</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="contacts" disabled={!contactsSection}>
                Контакты
              </TabsTrigger>
              <TabsTrigger value="map" disabled={!mapSection}>
                Карта
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              {!contactsSection && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSection('contacts')}
                  disabled={isLoading}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить контакты
                </Button>
              )}
              {!mapSection && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddSection('map')}
                  disabled={isLoading}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить карту
                </Button>
              )}
            </div>
          </div>

          {contactsSection && (
            <TabsContent value="contacts" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    handleDeleteSection(contactsSection.id, 'contacts')
                  }
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить секцию
                </Button>
              </div>
              <ContactsForm
                pageId={pageId}
                section={{
                  id: contactsSection.id,
                  type: contactsSection.type,
                  content: contactsSection.content as ContactsContent,
                  isActive: contactsSection.isActive,
                }}
              />
            </TabsContent>
          )}

          {mapSection && (
            <TabsContent value="map" className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteSection(mapSection.id, 'map')}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить секцию
                </Button>
              </div>
              <MapForm
                pageId={pageId}
                section={{
                  id: mapSection.id,
                  type: mapSection.type,
                  content: mapSection.content as MapContent,
                  isActive: mapSection.isActive,
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};
