import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Преобразует строку в URL-совместимый слаг
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
    .replace(/[^\w\-]+/g, '') // Удаляем все не-слова
    .replace(/\-\-+/g, '-') // Заменяем множественные дефисы на один
    .replace(/^-+/, '') // Удаляем дефисы в начале
    .replace(/-+$/, ''); // Удаляем дефисы в конце
}
