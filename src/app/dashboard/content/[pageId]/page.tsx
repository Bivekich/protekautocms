'use client';

import { useEffect, useState } from 'react';
import { redirect, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { PageForm } from '../components/page-form';
import { PageSections } from '../components/page-sections';
import { useContentGraphQL, Page } from '@/hooks/useContentGraphQL';
import { Loader2 } from 'lucide-react';

// Отключаем ESLint для всего файла из-за проблем с типами
/* eslint-disable */

export default function PagePage() {
  const { data: session, status } = useSession();
  const { getPage, loading, error } = useContentGraphQL();
  const params = useParams();
  const pageId = params.pageId as string;
  const [page, setPage] = useState<Page | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  console.log('PagePage rendered:', { 
    pageId, 
    session: !!session, 
    status, 
    loading, 
    error, 
    page: !!page,
    pageLoading,
    sessionValue: session,
    pageIdValue: pageId,
    sessionType: typeof session,
    pageIdType: typeof pageId
  });

  useEffect(() => {
    console.log('useEffect triggered with:', { 
      session: !!session, 
      pageId, 
      sessionValue: session,
      pageIdValue: pageId,
      condition: !!(session && pageId)
    });
    
    const fetchPage = async () => {
      console.log('fetchPage started:', { pageId, session: !!session });
      try {
        const pageData = await getPage(pageId);
        console.log('fetchPage result:', { hasPageData: !!pageData, pageData });
        if (pageData) {
          setPage(pageData);
        } else {
          console.log('No page data returned');
        }
      } catch (err) {
        console.error('Ошибка при загрузке страницы:', err);
      } finally {
        setPageLoading(false);
      }
    };

    if (session && pageId) {
      console.log('Condition met, calling fetchPage...');
      fetchPage();
    } else {
      console.log('Condition NOT met:', { session: !!session, pageId, sessionExists: !!session, pageIdExists: !!pageId });
      setPageLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, pageId]); // getPage стабильна благодаря useCallback

  if (status === 'loading') {
    console.log('Session loading...');
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    console.log('No session, redirecting to login...');
    redirect('/auth/login');
  }

  if (loading || pageLoading) {
    console.log('GraphQL or page loading...');
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    console.log('GraphQL error:', error);
    return (
      <div className="container mx-auto py-6">
        <div className="text-red-500">Ошибка: {error}</div>
      </div>
    );
  }

  if (!page) {
    console.log('No page data, redirecting to content list...');
    redirect('/dashboard/content');
  }

  console.log('Rendering page form with:', page);

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
        <PageSections pageId={page.id} sections={page.sections ? [...page.sections] : []} />
      </div>
    </div>
  );
}
