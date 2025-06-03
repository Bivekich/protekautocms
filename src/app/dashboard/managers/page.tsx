'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  X,
  Shield,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Схема валидации формы
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Имя должно содержать минимум 2 символа',
  }),
  email: z.string().email({
    message: 'Пожалуйста, введите корректный email',
  }),
  password: z
    .string()
    .min(6, {
      message: 'Пароль должен содержать минимум 6 символов',
    })
    .or(z.string().length(0)),
  role: z.enum(['ADMIN', 'MANAGER'], {
    required_error: 'Пожалуйста, выберите роль',
  }),
});

// Тип для менеджера
interface Manager {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER';
  avatarUrl?: string;
  requiresTwoFactor?: boolean;
}

// GraphQL запросы и мутации
const USERS_QUERY = `
  query Users {
    users {
      id
      name
      email
      role
      avatarUrl
      requiresTwoFactor
    }
  }
`;

const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
      avatarUrl
      requiresTwoFactor
    }
  }
`;

const UPDATE_USER_MUTATION = `
  mutation UpdateUserAdmin($id: ID!, $input: UpdateUserAdminInput!) {
    updateUserAdmin(id: $id, input: $input) {
      id
      name
      email
      role
      avatarUrl
      requiresTwoFactor
    }
  }
`;

const DELETE_USER_MUTATION = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
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

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentManager, setCurrentManager] = useState<Manager | null>(null);

  // Загрузка менеджеров через GraphQL
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setIsLoading(true);
        const data = await executeGraphQL(USERS_QUERY);
        setManagers(data.users || []);
      } catch (error) {
        console.error('Ошибка при загрузке менеджеров:', error);
        toast.error('Не удалось загрузить список менеджеров');
      } finally {
        setIsLoading(false);
      }
    };

    fetchManagers();
  }, []);

  // Инициализация формы
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'MANAGER',
    },
  });

  // Инициализация формы редактирования
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'MANAGER',
    },
  });

  // Обработчик отправки формы добавления
  const handleAddSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const data = await executeGraphQL(CREATE_USER_MUTATION, {
        input: values,
      });

      setManagers([...managers, data.createUser]);
      setIsAddDialogOpen(false);
      form.reset();
      toast.success('Менеджер успешно добавлен');
    } catch (error) {
      console.error('Ошибка при добавлении менеджера:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Ошибка при добавлении менеджера'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик отправки формы редактирования
  const handleEditSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentManager) return;

    try {
      setIsLoading(true);

      // Если пароль пустой, удаляем его из запроса
      const input: Partial<z.infer<typeof formSchema>> = { ...values };
      if (!input.password) {
        delete input.password;
      }

      const data = await executeGraphQL(UPDATE_USER_MUTATION, {
        id: currentManager.id,
        input,
      });

      setManagers(
        managers.map((manager) =>
          manager.id === currentManager.id ? data.updateUserAdmin : manager
        )
      );

      setIsEditDialogOpen(false);
      editForm.reset();
      toast.success('Данные менеджера обновлены');
    } catch (error) {
      console.error('Ошибка при обновлении менеджера:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Ошибка при обновлении менеджера'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик удаления менеджера
  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);

      await executeGraphQL(DELETE_USER_MUTATION, {
        id,
      });

      setManagers(managers.filter((manager) => manager.id !== id));
      toast.success('Менеджер успешно удален');
    } catch (error) {
      console.error('Ошибка при удалении менеджера:', error);
      
      let errorMessage = 'Ошибка при удалении менеджера';
      
      if (error instanceof Error) {
        if (error.message.includes('Нельзя удалить самого себя')) {
          errorMessage = 'Вы не можете удалить свою собственную учетную запись';
        } else if (error.message.includes('Недостаточно прав')) {
          errorMessage = 'У вас недостаточно прав для удаления пользователей';
        } else if (error.message.includes('Пользователь не найден')) {
          errorMessage = 'Пользователь не найден';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Открытие диалога редактирования
  const openEditDialog = (manager: Manager) => {
    setCurrentManager(manager);
    editForm.setValue('name', manager.name);
    editForm.setValue('email', manager.email);
    editForm.setValue('password', ''); // Пароль не отображаем
    editForm.setValue('role', manager.role);
    setIsEditDialogOpen(true);
  };

  // Фильтрация менеджеров по поисковому запросу
  const filteredManagers = (managers || []).filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Менеджеры</h1>
        <p className="text-muted-foreground">
          Управление пользователями системы
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Список менеджеров</CardTitle>
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Добавить
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Добавить менеджера</DialogTitle>
                  <DialogDescription>
                    Заполните форму для добавления нового менеджера
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleAddSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Имя</FormLabel>
                          <FormControl>
                            <Input placeholder="Иван Иванов" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="example@protek.ru" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Пароль</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Роль</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите роль" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ADMIN">
                                Администратор
                              </SelectItem>
                              <SelectItem value="MANAGER">Менеджер</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Добавление...' : 'Добавить'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && managers.length === 0 ? (
            <div className="flex justify-center py-6">
              <p className="text-muted-foreground">Загрузка менеджеров...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredManagers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      Менеджеры не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredManagers.map((manager) => (
                    <TableRow key={manager.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={manager.avatarUrl || ''}
                              alt={manager.name}
                            />
                            <AvatarFallback>
                              {manager.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {manager.name}
                        </div>
                      </TableCell>
                      <TableCell>{manager.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {manager.role === 'ADMIN' ? (
                            <Shield className="h-4 w-4 text-blue-500" />
                          ) : (
                            <User className="h-4 w-4 text-gray-500" />
                          )}
                          {manager.role === 'ADMIN'
                            ? 'Администратор'
                            : 'Менеджер'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {manager.requiresTwoFactor ? 'Да' : 'Нет'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={
                              isEditDialogOpen &&
                              currentManager?.id === manager.id
                            }
                            onOpenChange={setIsEditDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(manager)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>
                                  Редактировать менеджера
                                </DialogTitle>
                                <DialogDescription>
                                  Измените данные менеджера
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...editForm}>
                                <form
                                  onSubmit={editForm.handleSubmit(
                                    handleEditSubmit
                                  )}
                                  className="space-y-4"
                                >
                                  <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Имя</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="email"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="password"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          Новый пароль (оставьте пустым, чтобы
                                          не менять)
                                        </FormLabel>
                                        <FormControl>
                                          <Input
                                            type="password"
                                            placeholder="••••••••"
                                            {...field}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="role"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Роль</FormLabel>
                                        <Select
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Выберите роль" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="ADMIN">
                                              Администратор
                                            </SelectItem>
                                            <SelectItem value="MANAGER">
                                              Менеджер
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <DialogFooter>
                                    <Button type="submit" disabled={isLoading}>
                                      {isLoading
                                        ? 'Сохранение...'
                                        : 'Сохранить'}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Удалить менеджера?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Вы уверены, что хотите удалить менеджера{' '}
                                  {manager.name}? Это действие нельзя отменить.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(manager.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                  disabled={isLoading}
                                >
                                  {isLoading ? 'Удаление...' : 'Удалить'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
