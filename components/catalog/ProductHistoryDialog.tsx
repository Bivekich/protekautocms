'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

// Тип для записи аудита
type AuditLog = {
  id: string;
  action: string;
  details: string;
  userId: string;
  targetId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
};

interface ProductHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
}

export default function ProductHistoryDialog({
  open,
  onOpenChange,
  productId,
}: ProductHistoryDialogProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение истории изменений при открытии диалога
  useEffect(() => {
    if (open && productId) {
      fetchHistory();
    }
  }, [open, productId]);

  // Функция для получения истории изменений
  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/audit/product/${productId}`);

      if (!response.ok) {
        throw new Error('Не удалось загрузить историю изменений');
      }

      const data = await response.json();
      setAuditLogs(data);
    } catch (err) {
      console.error('Ошибка при получении истории изменений:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
  };

  // Функция для получения текста действия
  const getActionText = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'Создание';
      case 'UPDATE':
        return 'Обновление';
      case 'DELETE':
        return 'Удаление';
      default:
        return action;
    }
  };

  // Функция для получения цвета бейджа в зависимости от действия
  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'default';
      case 'UPDATE':
        return 'secondary';
      case 'DELETE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>История изменений товара</DialogTitle>
          <DialogDescription>
            История всех изменений товара в системе
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              История изменений отсутствует
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Пользователь</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {getActionText(log.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.details}</TableCell>
                    <TableCell>{log.user.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
