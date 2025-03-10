import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { db } from '@/lib/db';
import { PageSection } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Оплата и доставка | ProtekCMS',
  description: 'Информация об оплате и доставке',
};

// Типы для контента секций
interface PaymentContent {
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
  [key: string]: unknown; // Для совместимости с JsonObject
}

interface DeliveryContent {
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
  [key: string]: unknown; // Для совместимости с JsonObject
}

// Расширяем тип PageSection для типизации контента
interface PaymentSection extends Omit<PageSection, 'content'> {
  content: PaymentContent;
}

interface DeliverySection extends Omit<PageSection, 'content'> {
  content: DeliveryContent;
}

async function getPaymentDeliveryData() {
  try {
    const page = await db.page.findUnique({
      where: {
        slug: 'shipping',
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!page) {
      return null;
    }

    return page;
  } catch (error) {
    console.error('Ошибка при получении данных страницы:', error);
    return null;
  }
}

export default async function PaymentDeliveryPage() {
  const pageData = await getPaymentDeliveryData();

  if (!pageData) {
    notFound();
  }

  // Получаем секции страницы и приводим их к нужному типу
  const paymentSection = pageData.sections.find(
    (section) => section.type === 'payment' && section.isActive
  ) as PaymentSection | undefined;

  const deliverySection = pageData.sections.find(
    (section) => section.type === 'delivery' && section.isActive
  ) as DeliverySection | undefined;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">{pageData.title}</h1>

      {pageData.description && (
        <p className="text-lg text-muted-foreground mb-12">
          {pageData.description}
        </p>
      )}

      {/* Payment Section */}
      {paymentSection && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">
            {paymentSection.content.title}
          </h2>
          <p className="text-lg mb-8">{paymentSection.content.subtitle}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Для физических лиц */}
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h3 className="text-xl font-semibold mb-4">
                {paymentSection.content.individuals.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ul className="space-y-2">
                    {paymentSection.content.individuals.methods.map(
                      (method: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <span className="mr-2">•</span>
                          {method}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {paymentSection.content.individuals.imageUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src={paymentSection.content.individuals.imageUrl}
                      alt="Оплата для физических лиц"
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Для юридических лиц */}
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h3 className="text-xl font-semibold mb-4">
                {paymentSection.content.businesses.title}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ul className="space-y-2">
                    {paymentSection.content.businesses.methods.map(
                      (method: string, index: number) => (
                        <li key={index} className="flex items-center">
                          <span className="mr-2">•</span>
                          {method}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {paymentSection.content.businesses.imageUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <Image
                      src={paymentSection.content.businesses.imageUrl}
                      alt="Оплата для юридических лиц"
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Важная информация */}
          <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
            <h3 className="text-xl font-semibold mb-4 text-amber-800">
              {paymentSection.content.important.title}
            </h3>
            <ul className="space-y-2">
              {paymentSection.content.important.points.map(
                (point: string, index: number) => (
                  <li key={index} className="flex items-center text-amber-800">
                    <span className="mr-2">•</span>
                    {point}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Delivery Section */}
      {deliverySection && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">
            {deliverySection.content.title}
          </h2>
          <p className="text-lg mb-8">{deliverySection.content.subtitle}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Доставка по Москве */}
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h3 className="text-xl font-semibold mb-4">
                {deliverySection.content.moscow.title}
              </h3>
              <ul className="space-y-2">
                {deliverySection.content.moscow.details.map(
                  (detail: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">•</span>
                      {detail}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Доставка по регионам */}
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h3 className="text-xl font-semibold mb-4">
                {deliverySection.content.regions.title}
              </h3>
              <ul className="space-y-2">
                {deliverySection.content.regions.details.map(
                  (detail: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">•</span>
                      {detail}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Транспортные компании */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-6">
              Транспортные компании
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {deliverySection.content.companies.map(
                (company, index: number) => (
                  <div
                    key={index}
                    className="bg-card rounded-lg shadow-sm p-4 border text-center"
                  >
                    {company.imageUrl && (
                      <div className="mb-2 h-16 flex items-center justify-center">
                        <Image
                          src={company.imageUrl}
                          alt={company.name}
                          width={200}
                          height={64}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                    <p className="text-sm font-medium">{company.name}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
