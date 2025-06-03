'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Upload, Search, Trash2, Copy, ExternalLink } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';

// GraphQL запросы
const GET_MEDIA_QUERY = `
  query GetMedia($page: Int, $limit: Int, $type: String, $search: String) {
    media(page: $page, limit: $limit, type: $type, search: $search) {
      media {
        id
        name
        url
        type
        size
        mimeType
        alt
        description
        userId
        createdAt
        updatedAt
        user {
          id
          name
          email
          role
        }
      }
      pagination {
        total
        page
        limit
        pages
      }
    }
  }
`;

const DELETE_MEDIA_MUTATION = `
  mutation DeleteMedia($id: ID!) {
    deleteMedia(id: $id)
  }
`;

// Типы данных
interface Media {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  mimeType: string;
  alt: string | null;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Функция для выполнения GraphQL запросов
const executeGraphQL = async (query: string, variables?: Record<string, unknown>) => {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error('Network error');
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL error');
  }

  return result.data;
};

export const MediaGallery = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Загрузка медиа-файлов
  const fetchMedia = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const data = await executeGraphQL(GET_MEDIA_QUERY, {
        page,
        limit: 20,
        search: search || undefined,
      });
      
      setMedia(data.media.media);
      setPagination(data.media.pagination);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Ошибка при загрузке медиа-файлов');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при монтировании компонента
  useEffect(() => {
    fetchMedia();
  }, []);

  // Обработка изменения страницы
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchMedia(page, searchQuery);
  };

  // Обработка поиска
  const handleSearch = () => {
    setCurrentPage(1);
    fetchMedia(1, searchQuery);
  };

  // Обработка выбора файла
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Создаем URL для предпросмотра
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Устанавливаем имя файла как альтернативный текст по умолчанию
      const fileName = file.name.split('.')[0];
      setAlt(fileName);
    }
  };

  // Обработка загрузки файла
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Выберите файл для загрузки');
      return;
    }

    try {
      setUploading(true);
      
      // Создаем FormData для отправки файла через REST API
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (alt) formData.append('alt', alt);
      if (description) formData.append('description', description);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при загрузке файла');
      }

      // Успешная загрузка
      toast.success('Файл успешно загружен');
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setAlt('');
      setDescription('');
      fetchMedia(currentPage, searchQuery);
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при загрузке файла');
    } finally {
      setUploading(false);
    }
  };

  // Обработка удаления файла
  const handleDelete = async () => {
    if (!selectedMedia) {
      return;
    }

    try {
      const data = await executeGraphQL(DELETE_MEDIA_MUTATION, {
        id: selectedMedia.id,
      });

      if (data.deleteMedia) {
        toast.success('Файл успешно удален');
        setDetailsDialogOpen(false);
        setDeleteDialogOpen(false);
        setSelectedMedia(null);
        fetchMedia(currentPage, searchQuery);
      }
    } catch (error) {
      console.error('Ошибка при удалении файла:', error);
      toast.error('Ошибка при удалении файла');
    }
  };

  // Получение полного URL файла
  const getFullUrl = (url: string) => {
    // Проверяем, является ли URL относительным
    if (url.startsWith('/')) {
      // Получаем базовый URL сайта
      const baseUrl = window.location.origin;
      return `${baseUrl}${url}`;
    }
    return url;
  };

  // Копирование URL файла в буфер обмена
  const copyUrlToClipboard = (url: string) => {
    const fullUrl = getFullUrl(url);
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        toast.success('URL скопирован в буфер обмена');
      })
      .catch((error) => {
        console.error('Error copying URL:', error);
        toast.error('Ошибка при копировании URL');
      });
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Верхняя панель с поиском и кнопкой загрузки */}
      <div className="flex justify-between items-center">
        <div className="relative w-64 flex gap-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени файла"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button onClick={handleSearch} variant="outline">
            Найти
          </Button>
        </div>

        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Загрузить файл
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Загрузка файла</DialogTitle>
              <DialogDescription>
                Загрузите изображение для использования в контенте
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="file">Файл</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              {previewUrl && (
                <div className="mt-4">
                  <Label>Предпросмотр</Label>
                  <div className="mt-1 border rounded-md overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={400}
                      height={200}
                      className="max-h-[200px] object-contain mx-auto"
                    />
                  </div>
                </div>
              )}

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="alt">Альтернативный текст</Label>
                <Input
                  id="alt"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Описание изображения для SEO"
                />
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Дополнительная информация о файле"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
                disabled={uploading}
              >
                Отмена
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Загрузка...' : 'Загрузить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Галерея изображений */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading ? (
          // Заглушки при загрузке
          Array.from({ length: 10 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : media.length === 0 ? (
          // Сообщение, если нет файлов
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              Нет загруженных файлов. Нажмите &quot;Загрузить файл&quot;, чтобы
              добавить новый.
            </p>
          </div>
        ) : (
          // Список файлов
          media.map((item: Media) => (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedMedia(item);
                setDetailsDialogOpen(true);
              }}
            >
              <div className="aspect-square relative">
                <Image
                  src={item.url}
                  alt={item.alt || item.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-3">
                <div className="truncate font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(item.size)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Пагинация */}
      {!loading && pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Диалог с деталями файла */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>Информация о файле</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.alt || selectedMedia.name}
                    width={500}
                    height={500}
                    className="w-full h-auto object-contain border rounded-md"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Имя файла</h3>
                    <p className="text-sm">{selectedMedia.name}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Относительный URL</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        value={selectedMedia.url}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyUrlToClipboard(selectedMedia.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Полный URL</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        value={getFullUrl(selectedMedia.url)}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyUrlToClipboard(selectedMedia.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Альтернативный текст</h3>
                    <p className="text-sm">{selectedMedia.alt || '-'}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Описание</h3>
                    <p className="text-sm">
                      {selectedMedia.description || '-'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <h3 className="font-medium">Размер</h3>
                      <p className="text-sm">
                        {formatFileSize(selectedMedia.size)}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium">Тип</h3>
                      <p className="text-sm">{selectedMedia.mimeType}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium">Дата загрузки</h3>
                    <p className="text-sm">
                      {formatDate(selectedMedia.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удаление файла</AlertDialogTitle>
                      <AlertDialogDescription>
                        Вы уверены, что хотите удалить этот файл? Это действие
                        нельзя отменить.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  onClick={() => window.open(selectedMedia.url, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Открыть
                </Button>

                <Button
                  variant="outline"
                  onClick={() => copyUrlToClipboard(selectedMedia.url)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Копировать URL
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
