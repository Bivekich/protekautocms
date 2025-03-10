import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { PageForm } from '../components/page-form';

export const metadata: Metadata = {
  title: 'Добавление страницы | ProtekCMS',
  description: 'Добавление новой страницы сайта',
};

export default async function NewPagePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Добавление страницы</h1>
        <p className="text-muted-foreground">Создайте новую страницу сайта</p>
      </div>

      <PageForm />
    </div>
  );
}
