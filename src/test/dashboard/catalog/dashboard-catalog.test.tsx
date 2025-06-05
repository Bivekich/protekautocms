import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CatalogDashboardPage from '../../../app/dashboard/catalog/page';

// Импортируем настройки для тестов
import './setup';

// Мокаем Suspense
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual as any,
    Suspense: (props: any) => props.children,
  };
});

describe('CatalogDashboardPage', () => {
  it('renders correctly', () => {
    render(<CatalogDashboardPage />);
    
    // Проверяем, что заголовок страницы отображается
    expect(screen.getByText('Каталог товаров')).toBeInTheDocument();
    
    // Проверяем, что компонент CatalogPage отображается через моки
    expect(screen.getByTestId('catalog-page-mock')).toBeInTheDocument();
  });
}); 