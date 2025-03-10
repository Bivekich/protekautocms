import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PagesList } from './components/pages-list';

export const metadata: Metadata = {
  title: 'Управление контентом | ProtekCMS',
  description: 'Управление контентом сайта',
};

export default async function ContentPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Получаем список всех страниц из базы данных
  const pages = await db.page.findMany({
    orderBy: {
      title: 'asc',
    },
  });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Управление контентом</h1>
        <p className="text-muted-foreground">
          Выберите страницу сайта для редактирования контента
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Страницы сайта</CardTitle>
          <CardDescription>
            Список страниц сайта, доступных для редактирования
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PagesList pages={pages} />
        </CardContent>
      </Card>
    </div>
  );
}
