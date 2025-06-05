// Импортируем моки для UI компонентов
import '../../mocks/ui-components';

// Импортируем моки для компонентов каталога
import '../../mocks/catalog-components';

// Импортируем мок для useCatalogGraphQL
import '../../helpers/mocks/useCatalogGraphQLMock';

// Мокаем глобальные объекты
import { vi } from 'vitest';
import React from 'react';

// Мок для fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ success: true }),
});

// Мок для XMLHttpRequest
global.XMLHttpRequest = vi.fn(() => ({
  open: vi.fn(),
  send: vi.fn(),
  setRequestHeader: vi.fn(),
  readyState: 4,
  status: 200,
  response: JSON.stringify({ success: true, fileUrl: 'http://example.com/export.xlsx' }),
  onreadystatechange: null,
})) as any;

// Мок для URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');

// Мок для next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Мок для next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => React.createElement('img', props),
})); 