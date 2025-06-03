'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  X,
  Download,
  FileText,
  Trash2,
  Edit,
  Plus,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Тип для записи аудита
interface AuditLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  targetId?: string;
  productId?: string;
  targetType?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
}

// Тип для метаданных пагинации
interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

// GraphQL запрос для получения аудит логов
const AUDIT_LOGS_QUERY = `
  query AuditLogs($page: Int, $limit: Int, $targetType: String, $userId: String, $from: String, $to: String) {
    auditLogs(page: $page, limit: $limit, targetType: $targetType, userId: $userId, from: $from, to: $to) {
      data {
        id
        userId
        action
        targetType
        targetId
        details
        productId
        createdAt
        user {
          id
          name
          email
          role
          avatarUrl
        }
      }
      meta {
        total
        limit
        offset
      }
    }
  }
`;

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

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

// Функция для получения иконки действия
const getActionIcon = (action: string) => {
  switch (action) {
    case 'LOGIN':
      return <LogIn className="h-4 w-4 text-blue-500" />;
    case 'CREATE':
      return <Plus className="h-4 w-4 text-green-500" />;
    case 'UPDATE':
      return <Edit className="h-4 w-4 text-orange-500" />;
    case 'DELETE':
      return <Trash2 className="h-4 w-4 text-red-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    limit: 50,
    offset: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [uniqueUsers, setUniqueUsers] = useState<
    Array<{
      id: string;
      name: string;
      role: string;
    }>
  >([]);

  // Загрузка данных аудита через GraphQL
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true);

        const variables: Record<string, unknown> = {
          page: currentPage,
          limit: pagination.limit,
        };

        if (actionFilter) variables.targetType = actionFilter;
        if (userFilter) variables.userId = userFilter;

        const data = await executeGraphQL(AUDIT_LOGS_QUERY, variables);
        const auditResult = data.auditLogs;

        setAuditLogs(auditResult.data);
        setPagination(auditResult.meta);

        // Извлечение уникальных пользователей для фильтра
        const users = new Map();
        auditResult.data.forEach((log: AuditLog) => {
          if (!users.has(log.user.id)) {
            users.set(log.user.id, {
              id: log.user.id,
              name: log.user.name,
              role: log.user.role,
            });
          }
        });
        setUniqueUsers(Array.from(users.values()));
      } catch (error) {
        console.error('Ошибка при загрузке данных аудита:', error);
        toast.error('Не удалось загрузить данные аудита');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, [actionFilter, userFilter, currentPage, pagination.limit]);

  // Открытие диалога с деталями
  const openDetailsDialog = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  // Экспорт логов в CSV
  const exportToCSV = () => {
    const headers = ['Дата', 'Пользователь', 'Действие', 'Детали', 'Цель'];
    const csvContent = auditLogs.map((log) => [
      log.createdAt && !isNaN(Date.parse(log.createdAt)) ? 
        format(new Date(log.createdAt), 'dd.MM.yyyy HH:mm:ss') : 
        'Неизвестно',
      log.user.name,
      log.action,
      log.details || '-',
      log.targetType || '-',
    ]);

    const csvString = [headers, ...csvContent]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Отчет экспортирован');
  };

  // Навигация по страницам
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Журнал аудита</h1>
            <p className="text-muted-foreground">
              Отслеживание действий пользователей в системе
            </p>
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Экспорт
          </Button>
        </div>

        {/* Фильтры */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Select
                  value={actionFilter || 'all'}
                  onValueChange={(value) => {
                    setActionFilter(value === 'all' ? null : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Тип действия" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все действия</SelectItem>
                    <SelectItem value="LOGIN">Вход в систему</SelectItem>
                    <SelectItem value="CREATE">Создание</SelectItem>
                    <SelectItem value="UPDATE">Обновление</SelectItem>
                    <SelectItem value="DELETE">Удаление</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Select
                  value={userFilter || 'all'}
                  onValueChange={(value) => {
                    setUserFilter(value === 'all' ? null : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Пользователь" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все пользователи</SelectItem>
                    {uniqueUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(actionFilter || userFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActionFilter(null);
                    setUserFilter(null);
                    setCurrentPage(1);
                  }}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Очистить
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Таблица */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Записи аудита</CardTitle>
              <div className="text-sm text-muted-foreground">
                Найдено записей: {pagination.total}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Записи не найдены</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Время</TableHead>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Действие</TableHead>
                      <TableHead>Детали</TableHead>
                      <TableHead>Цель</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="text-sm">
                            {log.createdAt && !isNaN(Date.parse(log.createdAt)) ? 
                              format(new Date(log.createdAt), 'dd.MM.yyyy') : 
                              'Неизвестно'
                            }
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.createdAt && !isNaN(Date.parse(log.createdAt)) ? 
                              format(new Date(log.createdAt), 'HH:mm:ss') : 
                              'Неизвестно'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={log.user.avatarUrl}
                                alt={log.user.name}
                              />
                              <AvatarFallback>
                                {log.user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{log.user.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {log.user.role}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span className="font-medium">{log.action}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={log.details || ''}>
                            {log.details || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {log.targetType || '-'}
                          </div>
                          {log.targetId && (
                            <div className="text-xs text-muted-foreground">
                              ID: {log.targetId}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog
                            open={isDetailsOpen && selectedLog?.id === log.id}
                            onOpenChange={(open) => {
                              setIsDetailsOpen(open);
                              if (!open) setSelectedLog(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDetailsDialog(log)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Детали записи аудита</DialogTitle>
                                <DialogDescription>
                                  Подробная информация о действии пользователя
                                </DialogDescription>
                              </DialogHeader>
                              {selectedLog && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">
                                        Время
                                      </label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedLog.createdAt && !isNaN(Date.parse(selectedLog.createdAt)) ? 
                                          format(
                                            new Date(selectedLog.createdAt),
                                            'dd.MM.yyyy HH:mm:ss',
                                            { locale: ru }
                                          ) : 
                                          'Неизвестно'
                                        }
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">
                                        Действие
                                      </label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedLog.action}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Пользователь
                                    </label>
                                    <div className="flex items-center gap-3 mt-2">
                                      <Avatar className="h-10 w-10">
                                        <AvatarImage
                                          src={selectedLog.user.avatarUrl}
                                          alt={selectedLog.user.name}
                                        />
                                        <AvatarFallback>
                                          {selectedLog.user.name
                                            .charAt(0)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">
                                          {selectedLog.user.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedLog.user.email} (
                                          {selectedLog.user.role})
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  {selectedLog.details && (
                                    <div>
                                      <label className="text-sm font-medium">
                                        Детали
                                      </label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {selectedLog.details}
                                      </p>
                                    </div>
                                  )}
                                  {selectedLog.targetType && (
                                    <div>
                                      <label className="text-sm font-medium">
                                        Тип цели
                                      </label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedLog.targetType}
                                      </p>
                                    </div>
                                  )}
                                  {selectedLog.targetId && (
                                    <div>
                                      <label className="text-sm font-medium">
                                        ID цели
                                      </label>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedLog.targetId}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Пагинация */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Показано {pagination.offset + 1} -{' '}
                    {Math.min(
                      pagination.offset + pagination.limit,
                      pagination.total
                    )}{' '}
                    из {pagination.total} записей
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Назад
                    </Button>
                    <span className="text-sm">
                      Страница {currentPage} из {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage >= totalPages}
                    >
                      Вперед
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
