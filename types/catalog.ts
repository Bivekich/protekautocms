// Типы для категорий
export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  children: Category[];
};
