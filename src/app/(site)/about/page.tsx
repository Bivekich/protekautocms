import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import { db } from '@/lib/db';
import { PageSection } from '@prisma/client';

export const metadata: Metadata = {
  title: 'О компании | ProtekCMS',
  description: 'Информация о компании Протек',
};

// Типы для контента секций
interface WelcomeContent {
  title: string;
  description: string;
  imageUrl?: string;
  [key: string]: unknown; // Для совместимости с JsonObject
}

interface OfferingsContent {
  title: string;
  items: Array<{
    title: string;
    description: string;
    imageUrl?: string;
  }>;
  [key: string]: unknown; // Для совместимости с JsonObject
}

interface AboutCompanyContent {
  title: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  [key: string]: unknown; // Для совместимости с JsonObject
}

// Расширяем тип PageSection для типизации контента
interface WelcomeSection extends Omit<PageSection, 'content'> {
  content: WelcomeContent;
}

interface OfferingsSection extends Omit<PageSection, 'content'> {
  content: OfferingsContent;
}

interface AboutCompanySection extends Omit<PageSection, 'content'> {
  content: AboutCompanyContent;
}

async function getAboutPageData() {
  try {
    const page = await db.page.findUnique({
      where: {
        slug: 'about',
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

export default async function AboutPage() {
  const pageData = await getAboutPageData();

  if (!pageData) {
    notFound();
  }

  // Получаем секции страницы и приводим их к нужному типу
  const welcomeSection = pageData.sections.find(
    (section: PageSection) => section.type === 'welcome' && section.isActive
  ) as WelcomeSection | undefined;

  const offeringsSection = pageData.sections.find(
    (section: PageSection) => section.type === 'offerings' && section.isActive
  ) as OfferingsSection | undefined;

  const aboutCompanySection = pageData.sections.find(
    (section: PageSection) =>
      section.type === 'about_company' && section.isActive
  ) as AboutCompanySection | undefined;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">{pageData.title}</h1>

      {pageData.description && (
        <p className="text-lg text-muted-foreground mb-12">
          {pageData.description}
        </p>
      )}

      {/* Welcome Section */}
      {welcomeSection && (
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                {welcomeSection.content.title}
              </h2>
              <p className="text-lg">{welcomeSection.content.description}</p>
            </div>
            {welcomeSection.content.imageUrl && (
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={welcomeSection.content.imageUrl}
                  alt="Протек автозапчасти"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offerings Section */}
      {offeringsSection && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {offeringsSection.content.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {offeringsSection.content.items.map((item, index) => (
              <div
                key={index}
                className="bg-card rounded-lg shadow-sm p-6 border"
              >
                {item.imageUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About Company Section */}
      {aboutCompanySection && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            {aboutCompanySection.content.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aboutCompanySection.content.features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-lg shadow-sm p-6 border"
              >
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
