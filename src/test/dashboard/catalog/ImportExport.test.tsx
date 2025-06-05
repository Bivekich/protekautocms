import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImportExport from '../../../../components/catalog/ImportExport';

// Импортируем настройки для тестов
import './setup';

// Мок для toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('ImportExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<ImportExport />);
    
    // Проверяем, что компонент отображает основные элементы
    expect(screen.getByText(/импорт товаров/i)).toBeInTheDocument();
    expect(screen.getByText(/экспорт товаров/i)).toBeInTheDocument();
  });

  it('has import file input', () => {
    render(<ImportExport />);
    
    // Проверяем наличие поля выбора файла
    expect(screen.getByTestId('import-file-input')).toBeInTheDocument();
  });

  it('has import and export buttons', () => {
    render(<ImportExport />);
    
    expect(screen.getByText(/импортировать/i)).toBeInTheDocument();
    expect(screen.getByText(/экспортировать товары/i)).toBeInTheDocument();
  });
}); 