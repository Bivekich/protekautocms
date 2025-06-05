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

  // Обработка клика по карточке
  const handleCardClick = (item: Media) => {
    setSelectedMedia(item);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск по имени файла..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="media-search-input"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSearch} data-testid="media-search-button">
            <Search className="h-4 w-4 mr-2" />
            Поиск
          </Button>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="media-upload-button">
                <Upload className="h-4 w-4 mr-2" />
                Загрузить
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Загрузка файла</DialogTitle>
                <DialogDescription>
                  Загрузите файл для использования в контенте.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="file-upload">Выберите файл</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    data-testid="media-file-input"
                  />
                </div>

                {previewUrl && (
                  <div className="grid gap-2">
                    <Label>Предпросмотр</Label>
                    <div className="border rounded-md p-2 flex justify-center">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="object-contain max-h-[200px]"
                        data-testid="media-preview-image"
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="alt-text">Альтернативный текст</Label>
                  <Input
                    id="alt-text"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Описательный текст для изображения"
                    data-testid="media-alt-input"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Дополнительная информация о файле"
                    data-testid="media-description-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  data-testid="media-upload-submit"
                >
                  {uploading ? 'Загрузка...' : 'Загрузить файл'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Загрузка медиа-файлов...</p>
          </div>
        </div>
      ) : media.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center" data-testid="media-empty-state">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Image
              src="/images/empty-media.svg"
              alt="Нет файлов"
              width={64}
              height={64}
              className="opacity-50"
            />
          </div>
          <h3 className="text-lg font-medium">Нет файлов</h3>
          <p className="text-sm text-muted-foreground max-w-md mt-2">
            В вашей галерее пока нет файлов. Нажмите кнопку "Загрузить" чтобы добавить новый файл.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" data-testid="media-gallery-grid">
          {media.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleCardClick(item)}
              data-testid={`media-card-${item.id}`}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative bg-muted">
                  {item.type === 'image' ? (
                    <Image
                      src={getFullUrl(item.url)}
                      alt={item.alt || item.name}
                      fill
                      className="object-cover"
                    />
                  ) : item.type === 'video' ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="p-2 rounded-full bg-black/20">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5 text-white"
                          >
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-16 h-16 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium uppercase text-muted-foreground">
                          {item.mimeType.split('/')[1]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(item.size)} • {formatDate(item.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Пагинация */}
      {!loading && media.length > 0 && (
        <Pagination
          className="flex justify-center my-6"
          currentPage={currentPage}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
          data-testid="media-pagination"
        />
      )}

      {/* Диалог с информацией о файле */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle>Информация о файле</DialogTitle>
                <DialogDescription>
                  Просмотр и управление файлом
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                  {selectedMedia.type === 'image' ? (
                    <Image
                      src={getFullUrl(selectedMedia.url)}
                      alt={selectedMedia.alt || selectedMedia.name}
                      fill
                      className="object-contain"
                      data-testid="media-details-image"
                    />
                  ) : selectedMedia.type === 'video' ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="p-2 rounded-full bg-black/20">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-5 h-5 text-white"
                          >
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-16 h-16 bg-muted-foreground/20 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium uppercase text-muted-foreground">
                          {selectedMedia.mimeType.split('/')[1]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <div className="text-sm font-medium">Название файла</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedMedia.name}
                  </div>
                </div>

                {selectedMedia.alt && (
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Альтернативный текст</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedMedia.alt}
                    </div>
                  </div>
                )}

                {selectedMedia.description && (
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Описание</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedMedia.description}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <div className="text-sm font-medium">Тип файла</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedMedia.mimeType}
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="text-sm font-medium">Размер файла</div>
                  <div className="text-sm text-muted-foreground">
                    {formatFileSize(selectedMedia.size)}
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="text-sm font-medium">URL файла</div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={getFullUrl(selectedMedia.url)}
                      readOnly
                      className="text-sm text-muted-foreground"
                      data-testid="media-details-url"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyUrlToClipboard(selectedMedia.url)}
                      data-testid="media-copy-url-button"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => window.open(getFullUrl(selectedMedia.url), '_blank')}
                      data-testid="media-open-url-button"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="text-sm font-medium">Дата загрузки</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(selectedMedia.createdAt)}
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-between">
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" data-testid="media-delete-button">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Подтверждение</AlertDialogTitle>
                      <AlertDialogDescription>
                        Вы уверены, что хотите удалить этот файл? Это действие нельзя отменить.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        data-testid="media-confirm-delete-button"
                      >
                        Да, удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  onClick={() => copyUrlToClipboard(selectedMedia.url)}
                  data-testid="media-details-copy-button"
                >
                  <Copy className="h-4 w-4 mr-2" />
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
