import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { MediaGallery } from './components/media-gallery';

export const metadata: Metadata = {
  title: 'Галерея | ProtekCMS',
  description: 'Управление медиа-файлами',
};

export default async function MediaPage() {
  // Проверяем авторизацию
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Галерея</h1>
        <p className="text-muted-foreground">
          Управление медиа-файлами для использования в контенте
        </p>
      </div>

      <MediaGallery />
    </div>
  );
}
