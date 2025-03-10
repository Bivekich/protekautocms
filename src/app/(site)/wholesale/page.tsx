import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Оптовым клиентам | ProtekCMS',
  description: 'Информация для оптовых клиентов',
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

type Section = {
  id: string;
  type: string;
  content:
    | HeroContent
    | BenefitsContent
    | ServicesContent
    | ProcessContent
    | SupportContent
    | Record<string, unknown>;
  isActive: boolean;
};

async function getWholesaleData() {
  try {
    // В реальном фронтенд-проекте здесь будет fetch запрос к API
    // const response = await fetch('https://api.example.com/api/public/pages/wholesale-clients');
    // const data = await response.json();

    // Для демонстрации используем прямой доступ к базе данных
    const page = await db.page.findUnique({
      where: {
        slug: 'wholesale-clients',
        isActive: true,
      },
      include: {
        sections: {
          where: {
            isActive: true,
          },
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
    console.error('Error fetching wholesale data:', error);
    return null;
  }
}

export default async function WholesalePage() {
  const pageData = await getWholesaleData();

  if (!pageData) {
    notFound();
  }

  const heroSection = pageData.sections.find(
    (section) => section.type === 'hero'
  ) as (Section & { content: HeroContent }) | undefined;

  const benefitsSection = pageData.sections.find(
    (section) => section.type === 'benefits'
  ) as (Section & { content: BenefitsContent }) | undefined;

  const servicesSection = pageData.sections.find(
    (section) => section.type === 'services'
  ) as (Section & { content: ServicesContent }) | undefined;

  const processSection = pageData.sections.find(
    (section) => section.type === 'process'
  ) as (Section & { content: ProcessContent }) | undefined;

  const supportSection = pageData.sections.find(
    (section) => section.type === 'support'
  ) as (Section & { content: SupportContent }) | undefined;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">{pageData.title}</h1>

      {pageData.description && (
        <p className="text-lg text-muted-foreground mb-12">
          {pageData.description}
        </p>
      )}

      {/* Hero Section */}
      {heroSection && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">
            {heroSection.content.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {heroSection.content.subtitle.map((item, index) => (
                <p key={index} className="mb-4">
                  {item}
                </p>
              ))}
            </div>
            {heroSection.content.imageUrl && (
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={heroSection.content.imageUrl}
                  alt="Оптовым клиентам"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Benefits Section */}
      {benefitsSection && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">
            {benefitsSection.content.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefitsSection.content.items.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-lg shadow-sm p-6 border"
              >
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Section */}
      {servicesSection && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">
            {servicesSection.content.title}
          </h2>
          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <ul className="list-disc list-inside space-y-2">
              {servicesSection.content.items.map((item, index) => (
                <li key={index} className="text-lg">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Process Section */}
      {processSection && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">
            {processSection.content.title}
          </h2>
          <div className="space-y-4">
            {processSection.content.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {index + 1}
                </div>
                <div className="bg-card rounded-lg shadow-sm p-4 border flex-grow">
                  <p className="text-lg">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Section */}
      {supportSection && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">
            {supportSection.content.title}
          </h2>
          <div className="bg-card rounded-lg shadow-sm p-6 border">
            {supportSection.content.description.map((paragraph, index) => (
              <p key={index} className="mb-4 text-lg">
                {paragraph}
              </p>
            ))}

            <div className="mt-6 flex flex-wrap gap-4">
              {supportSection.content.contacts.telegram && (
                <a
                  href={supportSection.content.contacts.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  <span className="font-medium">Telegram</span>
                </a>
              )}

              {supportSection.content.contacts.whatsapp && (
                <a
                  href={supportSection.content.contacts.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                  <span className="font-medium">WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
