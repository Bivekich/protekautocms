'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { useSession } from 'next-auth/react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PagesList } from './components/pages-list';
import { useContentGraphQL, Page } from '@/hooks/useContentGraphQL';
import { Loader2 } from 'lucide-react';

export default function ContentPage() {
  const { data: session, status } = useSession();
  const { getPages, loading, error } = useContentGraphQL();
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const pagesData = await getPages(true); // включаем скрытые страницы
        setPages(pagesData);
      } catch (err) {
        console.error('Ошибка при загрузке страниц:', err);
      }
    };

    if (session) {
      fetchPages();
    }
  }, [session, getPages]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect('/auth/login');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

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
