// vi.mock вызовы поднимаются в начало файла перед импортами
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard/media',
  useSearchParams: () => new URLSearchParams(),
}));

// Мокируем next/image
vi.mock('next/image', () => ({
  default: vi.fn(({ src, alt, fill, ...props }) => {
    // Убедимся, что URL корректный для тестов
    const safeSrc = src && typeof src === 'string' && !src.startsWith('/') && !src.startsWith('http') 
      ? `/${src}` 
      : src;
    // Преобразуем boolean атрибуты в строковые значения для правильного рендеринга
    const safeProps = { ...props };
    if (fill) {
      safeProps['data-fill'] = 'true'; // Вместо 'fill', который вызывает предупреждение
    }
    return <img src={safeSrc} alt={alt} {...safeProps} data-testid="next-image" />;
  }),
}));

// Мокируем запросы GraphQL
global.fetch = vi.fn();

// Импортируем все необходимые модули
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { MediaGallery } from '@/app/dashboard/media/components/media-gallery';

// Мокируем toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Моковые данные для тестов
const createMockMediaItems = (total = 30) => {
  const items = [];
  const types = ['image', 'video', 'document'];
  const mimeTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
  
  for (let i = 0; i < Math.min(total, 20); i++) {
    const type = types[i % 3];
    const mimeType = mimeTypes[i % 4];
    
    items.push({
      id: `media-${i + 1}`,
      name: `test-file-${i + 1}.${mimeType.split('/')[1]}`,
      url: `/uploads/test-file-${i + 1}.${mimeType.split('/')[1]}`,
      type,
      size: 1024 * (i + 1),
      mimeType,
      alt: i % 2 === 0 ? `Альтернативный текст ${i + 1}` : null,
      description: i % 3 === 0 ? `Описание файла ${i + 1}` : null,
      userId: 'user-1',
      createdAt: new Date(2023, 9, 15 + (i % 30), 12, 30, i).toISOString(),
      updatedAt: new Date(2023, 9, 15 + (i % 30), 12, 30, i).toISOString(),
      user: {
        id: 'user-1',
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        role: 'admin',
      },
    });
  }
  
  return {
    data: {
      media: {
        media: items,
        pagination: {
          total,
          page: 1,
          limit: 20,
          pages: Math.ceil(total / 20),
        },
      },
    },
  };
};

// Мокируем fetch для возврата данных
const setupMockFetch = (totalItems = 30) => {
  const mockData = createMockMediaItems(totalItems);
  global.fetch = vi.fn().mockImplementation((url, options) => {
    // Проверяем, является ли это GraphQL запросом
    if (url === '/api/graphql') {
      const body = JSON.parse(options?.body?.toString() || '{}');
      
      // Если это запрос на удаление
      if (body.query?.includes('DeleteMedia')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { deleteMedia: true } }),
        });
      }
      
      // Если это запрос на получение медиа
      if (body.query?.includes('GetMedia')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        });
      }
    }
    
    // Если это запрос на загрузку файла
    if (url === '/api/media/upload') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          id: 'new-media-id',
          url: '/uploads/new-file.jpg' 
        }),
      });
    }
    
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    });
  }) as unknown as typeof fetch;
};

// Мокируем fetch для пустых данных
const setupEmptyMockFetch = () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      data: {
        media: {
          media: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 20,
            pages: 0,
          },
        },
      },
    }),
  });
};

// Мокируем fetch для ошибки
const setupErrorMockFetch = () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
};

// Мокируем буфер обмена
beforeEach(() => {
  // Создаем мок для clipboard API, который не будет пытаться заменить свойство navigator.clipboard
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    configurable: true
  });
  
  // Мокируем URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => '/mocked-preview-url.jpg');
});

describe('MediaGallery - Основная функциональность', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отображает список медиа-файлов', async () => {
    setupMockFetch(30);
    
    render(<MediaGallery />);
    
    // Ждем пока компонент загрузится
    await waitFor(() => {
      // Проверяем наличие грида галереи
      const mediaGrid = screen.getByTestId('media-gallery-grid');
      expect(mediaGrid).toBeInTheDocument();
      
      // Убедимся, что есть хотя бы одна карточка медиа
      const mediaCards = screen.getAllByTestId(/^media-card-/);
      expect(mediaCards.length).toBeGreaterThan(0);
    });
  });
  
  it('отображает сообщение при отсутствии медиа-файлов', async () => {
    setupEmptyMockFetch();
    
    render(<MediaGallery />);
    
    // Ждем пока компонент загрузится
    await waitFor(() => {
      // Проверяем наличие контейнера с пустым состоянием
      const emptyState = screen.getByTestId('media-empty-state');
      expect(emptyState).toBeInTheDocument();
      
      // Проверяем заголовок сообщения
      const emptyTitle = within(emptyState).getByText('Нет файлов');
      expect(emptyTitle).toBeInTheDocument();
    });
  });
  
  it('обрабатывает ошибки при загрузке медиа-файлов', async () => {
    setupErrorMockFetch();
    
    render(<MediaGallery />);
    
    // Ждем пока компонент попытается загрузить данные и вызовет toast.error
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});

describe('MediaGallery - Поиск', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockFetch(30);
  });

  it('выполняет поиск при вводе запроса', async () => {
    const user = userEvent.setup();
    
    render(<MediaGallery />);
    
    // Ждем пока компонент загрузится
    await waitFor(() => {
      // Проверяем наличие кнопки поиска
      const searchButton = screen.getByTestId('media-search-button');
      expect(searchButton).toBeInTheDocument();
    });
    
    // Находим поле поиска и вводим запрос
    const searchInput = screen.getByTestId('media-search-input');
    await user.clear(searchInput);
    await user.type(searchInput, 'тестовый запрос');
    
    // Нажимаем кнопку поиска
    const searchButton = screen.getByTestId('media-search-button');
    await user.click(searchButton);
    
    // Проверяем, что был выполнен запрос с новыми параметрами
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Первый при загрузке, второй при поиске
    });
  });
});

describe('MediaGallery - Загрузка файлов', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockFetch(30);
  });

  it('открывает диалог загрузки файла', async () => {
    const user = userEvent.setup();
    
    render(<MediaGallery />);
    
    // Ждем пока компонент загрузится
    await waitFor(() => {
      // Проверяем наличие кнопки загрузки
      const uploadButton = screen.getByTestId('media-upload-button');
      expect(uploadButton).toBeInTheDocument();
    });
    
    // Находим кнопку загрузки и нажимаем ее
    const uploadButton = screen.getByTestId('media-upload-button');
    await user.click(uploadButton);
    
    // Проверяем, что диалог загрузки открылся
    await waitFor(() => {
      const dialogTitle = screen.getByText(/загрузка файла/i);
      expect(dialogTitle).toBeInTheDocument();
    });
  });

  it('загружает файл через диалог', async () => {
    // Создаем моки для компонента
    const mockFetchImpl = vi.fn().mockImplementation((url: string, options?: any) => {
      if (url === '/api/media/upload') {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers(),
          redirected: false,
          type: 'basic',
          url: '/api/media/upload',
          json: () => Promise.resolve({ id: 'new-media-id', url: '/uploads/new-file.jpg' }),
          text: () => Promise.resolve(''),
          blob: () => Promise.resolve(new Blob()),
          formData: () => Promise.resolve(new FormData()),
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
          bodyUsed: false,
          body: null,
          clone: () => ({} as Response)
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        redirected: false,
        type: 'basic',
        url: '/api/graphql',
        json: () => Promise.resolve(createMockMediaItems(30).data),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob()),
        formData: () => Promise.resolve(new FormData()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        bodyUsed: false,
        body: null,
        clone: () => ({} as Response)
      } as Response);
    });
    
    // Используем mock в этом тесте
    vi.spyOn(global, 'fetch').mockImplementation(mockFetchImpl);
    
    const user = userEvent.setup();
    
    render(<MediaGallery />);
    
    // Ждем пока компонент загрузится и найдем кнопку загрузки
    await waitFor(() => {
      const uploadButton = screen.getByTestId('media-upload-button');
      expect(uploadButton).toBeInTheDocument();
    });
    
    // Находим кнопку загрузки и нажимаем ее
    const uploadButton = screen.getByTestId('media-upload-button');
    await user.click(uploadButton);
    
    // Проверяем, что диалог загрузки открылся
    await waitFor(() => {
      const dialogTitle = screen.getByText(/загрузка файла/i);
      expect(dialogTitle).toBeInTheDocument();
    });
    
    // Создаем тестовый файл
    const file = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
    
    // Находим input для загрузки файла и загружаем файл
    const fileInput = screen.getByTestId('media-file-input');
    await user.upload(fileInput, file);
    
    // Заполняем поля alt и description
    const altInput = screen.getByTestId('media-alt-input');
    await user.type(altInput, 'Тестовый альтернативный текст');
    
    const descriptionInput = screen.getByTestId('media-description-input');
    await user.type(descriptionInput, 'Тестовое описание файла');
    
    // Нажимаем кнопку загрузки
    const submitButton = screen.getByTestId('media-upload-submit');
    await user.click(submitButton);
    
    // Проверяем, что был выполнен запрос на загрузку файла
    await waitFor(() => {
      expect(mockFetchImpl).toHaveBeenCalledWith('/api/media/upload', expect.any(Object));
      expect(toast.success).toHaveBeenCalled();
    });
  });
});

describe('MediaGallery - Действия с файлами', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockFetch(30);
  });

  it('открывает детали файла при клике', async () => {
    const user = userEvent.setup();
    
    render(<MediaGallery />);
    
    // Ждем пока компонент загрузится и убедимся, что есть карточки
    await waitFor(() => {
      // Проверяем наличие грида галереи
      const mediaGrid = screen.getByTestId('media-gallery-grid');
      expect(mediaGrid).toBeInTheDocument();
      
      // Убедимся, что есть хотя бы одна карточка медиа
      const mediaCards = screen.getAllByTestId(/^media-card-/);
      expect(mediaCards.length).toBeGreaterThan(0);
    });
    
    // Находим первую карточку файла и кликаем на нее
    const firstMediaCard = screen.getAllByTestId(/^media-card-/)[0];
    await user.click(firstMediaCard);
    
    // Проверяем, что открылся диалог с деталями файла
    await waitFor(() => {
      const detailsTitle = screen.getByText(/информация о файле/i);
      expect(detailsTitle).toBeInTheDocument();
    });
  });

  it('отображает информацию о файле и предоставляет URL', async () => {
    const user = userEvent.setup();
    
    render(<MediaGallery />);
    
    // Ждем пока компонент загрузится и найдем карточки
    await waitFor(() => {
      const mediaGrid = screen.getByTestId('media-gallery-grid');
      expect(mediaGrid).toBeInTheDocument();
      
      const mediaCards = screen.getAllByTestId(/^media-card-/);
      expect(mediaCards.length).toBeGreaterThan(0);
    });
    
    // Открываем детали первого файла
    const firstMediaCard = screen.getAllByTestId(/^media-card-/)[0];
    await user.click(firstMediaCard);
    
    // Проверяем, что открылся диалог с деталями
    await waitFor(() => {
      const detailsDialog = screen.getByText(/информация о файле/i);
      expect(detailsDialog).toBeInTheDocument();
      
      // Проверяем, что URL файла отображается
      const urlInput = screen.getByTestId('media-details-url');
      expect(urlInput).toBeInTheDocument();
      expect((urlInput as HTMLInputElement).value).toContain('uploads/');
    });
  });

  it('открывает диалог удаления файла', async () => {
    const user = userEvent.setup();
    
    render(<MediaGallery />);
    
    // Ждем пока компонент загрузится и убедимся, что есть карточки
    await waitFor(() => {
      // Проверяем наличие грида галереи
      const mediaGrid = screen.getByTestId('media-gallery-grid');
      expect(mediaGrid).toBeInTheDocument();
      
      // Убедимся, что есть хотя бы одна карточка медиа
      const mediaCards = screen.getAllByTestId(/^media-card-/);
      expect(mediaCards.length).toBeGreaterThan(0);
    });
    
    // Находим первую карточку файла и кликаем на нее
    const firstMediaCard = screen.getAllByTestId(/^media-card-/)[0];
    await user.click(firstMediaCard);
    
    // Ждем, пока откроется диалог с деталями
    await waitFor(() => {
      const detailsTitle = screen.getByText(/информация о файле/i);
      expect(detailsTitle).toBeInTheDocument();
    });
    
    // Находим кнопку удаления и нажимаем ее
    const deleteButton = screen.getByTestId('media-delete-button');
    await user.click(deleteButton);
    
    // Проверяем, что открылся диалог подтверждения удаления
    await waitFor(() => {
      const confirmTitle = screen.getByText(/подтверждение/i);
      expect(confirmTitle).toBeInTheDocument();
    });
  });

  it('удаляет файл', async () => {
    const user = userEvent.setup();
    
    render(<MediaGallery />);
    
    // Ждем пока компонент загрузится и убедимся, что есть карточки
    await waitFor(() => {
      // Проверяем наличие грида галереи
      const mediaGrid = screen.getByTestId('media-gallery-grid');
      expect(mediaGrid).toBeInTheDocument();
      
      // Убедимся, что есть хотя бы одна карточка медиа
      const mediaCards = screen.getAllByTestId(/^media-card-/);
      expect(mediaCards.length).toBeGreaterThan(0);
    });
    
    // Находим первую карточку файла и кликаем на нее
    const firstMediaCard = screen.getAllByTestId(/^media-card-/)[0];
    await user.click(firstMediaCard);
    
    // Ждем, пока откроется диалог с деталями
    await waitFor(() => {
      const detailsTitle = screen.getByText(/информация о файле/i);
      expect(detailsTitle).toBeInTheDocument();
    });
    
    // Находим кнопку удаления и нажимаем ее
    const deleteButton = screen.getByTestId('media-delete-button');
    await user.click(deleteButton);
    
    // Проверяем, что открылся диалог подтверждения удаления
    await waitFor(() => {
      const confirmTitle = screen.getByText(/подтверждение/i);
      expect(confirmTitle).toBeInTheDocument();
    });
    
    // Нажимаем кнопку подтверждения удаления
    const confirmButton = screen.getByTestId('media-confirm-delete-button');
    await user.click(confirmButton);
    
    // Проверяем, что был выполнен запрос на удаление файла
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/graphql', expect.any(Object));
      expect(toast.success).toHaveBeenCalled();
    });
  });
});

describe('MediaGallery - Пагинация', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockFetch(50); // Создаем 50 элементов для проверки пагинации
  });

  it('переключает страницы при нажатии на кнопки пагинации', async () => {
    const user = userEvent.setup();
    
    render(<MediaGallery />);
    
    // Ждем пока компонент загрузится
    await waitFor(() => {
      // Проверяем наличие грида галереи
      const mediaGrid = screen.getByTestId('media-gallery-grid');
      expect(mediaGrid).toBeInTheDocument();
      
      // Убедимся, что есть компонент пагинации
      const pagination = screen.getByTestId('media-pagination');
      expect(pagination).toBeInTheDocument();
    });
    
    // Находим кнопку следующей страницы и нажимаем ее
    const nextPageButton = screen.getByLabelText(/следующая страница/i);
    await user.click(nextPageButton);
    
    // Проверяем, что был выполнен запрос на получение данных для следующей страницы
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Первый при загрузке, второй при пагинации
    });
  });
}); 