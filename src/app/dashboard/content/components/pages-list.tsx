'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Page = {
  id: string;
  slug: string;
  title: string;
  isActive: boolean;
};

interface PagesListProps {
  pages: Page[];
}

export const PagesList = ({ pages }: PagesListProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Поиск страниц..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <Button asChild>
          <Link href="/dashboard/content/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить страницу
          </Link>
        </Button>
      </div>

      {filteredPages.length === 0 ? (
        <div className="flex h-[150px] w-full items-center justify-center rounded-md border border-dashed">
          <div className="flex flex-col items-center space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              {pages.length === 0
                ? 'Страницы еще не созданы'
                : 'Страницы не найдены'}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[100px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>{page.slug}</TableCell>
                  <TableCell>
                    <Badge variant={page.isActive ? 'default' : 'secondary'}>
                      {page.isActive ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link 
                      href={`/dashboard/content/${page.id}`}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Редактировать
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
