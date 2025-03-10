import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Контакты | ProtekCMS',
  description: 'Контактная информация компании',
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

type Section = {
  id: string;
  type: string;
  content: ContactsContent | MapContent | Record<string, unknown>;
  isActive: boolean;
};

async function getContactsData() {
  try {
    // В реальном фронтенд-проекте здесь будет fetch запрос к API
    // const response = await fetch('https://api.example.com/api/public/pages/contacts');
    // const data = await response.json();

    // Для демонстрации используем прямой доступ к базе данных
    const page = await db.page.findUnique({
      where: {
        slug: 'contacts',
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
    console.error('Error fetching contacts data:', error);
    return null;
  }
}

export default async function ContactsPage() {
  const pageData = await getContactsData();

  if (!pageData) {
    notFound();
  }

  const contactsSection = pageData.sections.find(
    (section) => section.type === 'contacts'
  ) as (Section & { content: ContactsContent }) | undefined;
  const mapSection = pageData.sections.find(
    (section) => section.type === 'map'
  ) as (Section & { content: MapContent }) | undefined;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8">{pageData.title}</h1>

      {pageData.description && (
        <p className="text-lg text-muted-foreground mb-12">
          {pageData.description}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {contactsSection && (
          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-semibold mb-4">
              Контактная информация
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Телефон:</p>
                <p className="text-lg font-medium">
                  {contactsSection.content.phone}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Адрес:</p>
                <p className="text-lg">{contactsSection.content.address}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Часы работы:</p>
                <p className="text-lg">
                  {contactsSection.content.workingHours}
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Реквизиты:</p>
                <p className="text-sm">ИНН: {contactsSection.content.inn}</p>
                <p className="text-sm">ОГРН: {contactsSection.content.ogrn}</p>
                <p className="text-sm">КПП: {contactsSection.content.kpp}</p>
              </div>
            </div>
          </div>
        )}

        {mapSection && (
          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h2 className="text-2xl font-semibold mb-4">Мы на карте</h2>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Здесь будет отображаться карта с координатами:
                <br />
                Широта: {mapSection.content.latitude}
                <br />
                Долгота: {mapSection.content.longitude}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Для отображения карты необходимо интегрировать Яндекс.Карты или
              Google Maps
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
