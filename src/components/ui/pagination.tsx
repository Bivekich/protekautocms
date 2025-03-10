import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Функция для генерации массива страниц
  const generatePagesArray = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Если общее количество страниц меньше или равно maxPagesToShow, показываем все страницы
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Всегда показываем первую страницу
      pages.push(1);

      // Определяем диапазон страниц вокруг текущей
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Если текущая страница близка к началу
      if (currentPage <= 3) {
        endPage = 4;
      }

      // Если текущая страница близка к концу
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      // Добавляем многоточие перед диапазоном, если нужно
      if (startPage > 2) {
        pages.push('...');
      }

      // Добавляем страницы диапазона
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Добавляем многоточие после диапазона, если нужно
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Всегда показываем последнюю страницу
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePagesArray();

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2">
            ...
          </span>
        ) : (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className="min-w-[32px]"
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
