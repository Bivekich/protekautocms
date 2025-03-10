'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Search,
  X,
  Filter,
  Download,
  User,
  Shield,
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
import { Input } from '@/components/ui/input';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Тип для записи аудита
interface AuditLog {
  id: string;
  action: string;
  details: string;
  userId: string;
  targetId?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  targetUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

// Тип для метаданных пагинации
interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    limit: 50,
    offset: 0,
  });
  const [uniqueUsers, setUniqueUsers] = useState<
    Array<{
      id: string;
      name: string;
      role: string;
    }>
  >([]);

  // Эффект для дебаунса поискового запроса
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Загрузка данных аудита
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true);

        // Формирование URL с параметрами
        const params = new URLSearchParams();
        if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
        if (actionFilter) params.append('action', actionFilter);
        if (userFilter) params.append('userId', userFilter);
        params.append('limit', pagination.limit.toString());
        params.append('offset', pagination.offset.toString());

        const response = await fetch(`/api/audit?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных аудита');
        }

        const { data, meta } = await response.json();
        setAuditLogs(data);
        setPagination(meta);

        // Извлечение уникальных пользователей для фильтра
        const users = new Map();
        data.forEach((log: AuditLog) => {
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
  }, [
    debouncedSearchQuery,
    actionFilter,
    userFilter,
    pagination.limit,
    pagination.offset,
  ]);

  // Открытие диалога с деталями
  const openDetailsDialog = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  // Экспорт логов в CSV
  const exportToCSV = () => {
    try {
      const headers = ['Дата', 'Пользователь', 'Действие', 'Детали', 'Цель'];
      const csvContent = auditLogs.map((log) => [
        format(new Date(log.createdAt), 'dd.MM.yyyy HH:mm:ss'),
        log.user.name,
        log.action,
        log.details,
        log.targetUser?.name || '-',
      ]);

      const csvString = [
        headers.join(','),
        ...csvContent.map((row) => row.join(',')),
      ].join('\n');

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `audit_log_${format(new Date(), 'yyyy-MM-dd')}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Экспорт выполнен успешно');
    } catch (error) {
      console.error('Ошибка при экспорте данных:', error);
      toast.error('Ошибка при экспорте данных');
    }
  };

  // Обработчики пагинации
  const handlePrevPage = () => {
    if (pagination.offset - pagination.limit >= 0) {
      setPagination({
        ...pagination,
        offset: pagination.offset - pagination.limit,
      });
    }
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit,
      });
    }
  };

  // Вычисление текущей страницы и общего количества страниц
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Аудит</h1>
        <p className="text-muted-foreground">
          История действий пользователей в системе
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Журнал действий</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск..."
                className="w-[200px] pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Фильтры
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Фильтры</h4>
                    <p className="text-sm text-muted-foreground">
                      Настройте фильтры для журнала аудита
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label htmlFor="action" className="text-sm">
                        Действие
                      </label>
                      <Select
                        value={actionFilter || 'all'}
                        onValueChange={(value) =>
                          setActionFilter(value === 'all' ? null : value)
                        }
                      >
                        <SelectTrigger id="action" className="col-span-2">
                          <SelectValue placeholder="Все действия" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все действия</SelectItem>
                          <SelectItem value="LOGIN">Вход</SelectItem>
                          <SelectItem value="CREATE">Создание</SelectItem>
                          <SelectItem value="UPDATE">Обновление</SelectItem>
                          <SelectItem value="DELETE">Удаление</SelectItem>
                          <SelectItem value="CREATE_PAGE">
                            Создание страницы
                          </SelectItem>
                          <SelectItem value="UPDATE_PAGE">
                            Обновление страницы
                          </SelectItem>
                          <SelectItem value="DELETE_PAGE">
                            Удаление страницы
                          </SelectItem>
                          <SelectItem value="CREATE_PAGE_SECTION">
                            Создание секции
                          </SelectItem>
                          <SelectItem value="UPDATE_PAGE_SECTION">
                            Обновление секции
                          </SelectItem>
                          <SelectItem value="DELETE_PAGE_SECTION">
                            Удаление секции
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label htmlFor="user" className="text-sm">
                        Пользователь
                      </label>
                      <Select
                        value={userFilter || 'all'}
                        onValueChange={(value) =>
                          setUserFilter(value === 'all' ? null : value)
                        }
                      >
                        <SelectTrigger id="user" className="col-span-2">
                          <SelectValue placeholder="Все пользователи" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все пользователи</SelectItem>
                          {uniqueUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActionFilter(null);
                      setUserFilter(null);
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" />
              Экспорт
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && auditLogs.length === 0 ? (
            <div className="flex justify-center py-6">
              <p className="text-muted-foreground">Загрузка данных...</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата и время</TableHead>
                    <TableHead>Действие</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Детали</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground"
                      >
                        Записи не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.createdAt), 'dd.MM.yyyy HH:mm', {
                            locale: ru,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span>
                              {log.action === 'LOGIN' && 'Вход'}
                              {log.action === 'CREATE' && 'Создание'}
                              {log.action === 'UPDATE' && 'Обновление'}
                              {log.action === 'DELETE' && 'Удаление'}
                              {log.action === 'CREATE_PAGE' &&
                                'Создание страницы'}
                              {log.action === 'UPDATE_PAGE' &&
                                'Обновление страницы'}
                              {log.action === 'DELETE_PAGE' &&
                                'Удаление страницы'}
                              {log.action === 'CREATE_PAGE_SECTION' &&
                                'Создание секции'}
                              {log.action === 'UPDATE_PAGE_SECTION' &&
                                'Обновление секции'}
                              {log.action === 'DELETE_PAGE_SECTION' &&
                                'Удаление секции'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.user.role === 'ADMIN' ? (
                              <Shield className="h-4 w-4 text-blue-500" />
                            ) : (
                              <User className="h-4 w-4 text-gray-500" />
                            )}
                            {log.user.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {log.details}
                          {log.targetUser && ` (${log.targetUser.name})`}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog
                            open={isDetailsOpen && selectedLog?.id === log.id}
                            onOpenChange={setIsDetailsOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDetailsDialog(log)}
                              >
                                Подробнее
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Детали действия</DialogTitle>
                                <DialogDescription>
                                  Подробная информация о действии в системе
                                </DialogDescription>
                              </DialogHeader>
                              {selectedLog && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="text-sm font-medium">
                                      Дата:
                                    </span>
                                    <span className="col-span-3">
                                      {format(
                                        new Date(selectedLog.createdAt),
                                        'dd.MM.yyyy HH:mm:ss',
                                        { locale: ru }
                                      )}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="text-sm font-medium">
                                      Действие:
                                    </span>
                                    <div className="col-span-3 flex items-center gap-2">
                                      {getActionIcon(selectedLog.action)}
                                      <span>
                                        {selectedLog.action === 'LOGIN' &&
                                          'Вход'}
                                        {selectedLog.action === 'CREATE' &&
                                          'Создание'}
                                        {selectedLog.action === 'UPDATE' &&
                                          'Обновление'}
                                        {selectedLog.action === 'DELETE' &&
                                          'Удаление'}
                                        {selectedLog.action === 'CREATE_PAGE' &&
                                          'Создание страницы'}
                                        {selectedLog.action === 'UPDATE_PAGE' &&
                                          'Обновление страницы'}
                                        {selectedLog.action === 'DELETE_PAGE' &&
                                          'Удаление страницы'}
                                        {selectedLog.action ===
                                          'CREATE_PAGE_SECTION' &&
                                          'Создание секции'}
                                        {selectedLog.action ===
                                          'UPDATE_PAGE_SECTION' &&
                                          'Обновление секции'}
                                        {selectedLog.action ===
                                          'DELETE_PAGE_SECTION' &&
                                          'Удаление секции'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="text-sm font-medium">
                                      Пользователь:
                                    </span>
                                    <div className="col-span-3 flex items-center gap-2">
                                      {selectedLog.user.role === 'ADMIN' ? (
                                        <Shield className="h-4 w-4 text-blue-500" />
                                      ) : (
                                        <User className="h-4 w-4 text-gray-500" />
                                      )}
                                      {selectedLog.user.name}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="text-sm font-medium">
                                      Детали:
                                    </span>
                                    <span className="col-span-3">
                                      {selectedLog.details}
                                    </span>
                                  </div>
                                  {selectedLog.targetUser && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="text-sm font-medium">
                                        Цель:
                                      </span>
                                      <span className="col-span-3">
                                        {selectedLog.targetUser.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Пагинация */}
              {auditLogs.length > 0 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Показано {pagination.offset + 1}-
                    {Math.min(
                      pagination.offset + pagination.limit,
                      pagination.total
                    )}{' '}
                    из {pagination.total} записей
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={pagination.offset === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Предыдущая страница</span>
                    </Button>
                    <div className="text-sm">
                      Страница {currentPage} из {totalPages || 1}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={
                        pagination.offset + pagination.limit >= pagination.total
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Следующая страница</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
