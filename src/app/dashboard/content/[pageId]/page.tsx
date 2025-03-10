import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageForm } from '../components/page-form';
import { PageSections } from '../components/page-sections';

export const metadata: Metadata = {
  title: 'Редактирование страницы | ProtekCMS',
  description: 'Редактирование страницы сайта',
};

export default async function PagePage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Получаем параметры маршрута асинхронно
  const { pageId } = await params;

  const page = await db.page.findUnique({
    where: {
      id: pageId,
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
    redirect('/dashboard/content');
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Редактирование страницы</h1>
        <p className="text-muted-foreground">
          Редактирование страницы &quot;{page.title}&quot;
        </p>
      </div>

      <div className="space-y-8">
        <PageForm initialData={page} />
        <PageSections pageId={page.id} sections={page.sections} />
      </div>
    </div>
  );
}
