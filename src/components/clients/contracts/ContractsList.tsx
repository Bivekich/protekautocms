import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { PencilIcon, TrashIcon, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ContractData {
  id: string;
  number: string;
  date: string;
  type: string | null;
  relation: string | null;
  balance: number;
  isActive: boolean;
  isDefault: boolean;
}

interface ContractsListProps {
  clientId: string;
  initialContracts: ContractData[];
}

export function ContractsList({
  clientId,
  initialContracts,
}: ContractsListProps) {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<ContractData[]>(
    initialContracts || []
  );
  const [loading, setLoading] = useState(false);

  // Обновление списка договоров
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clients/${clientId}/contract`);
      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }
      const data = await response.json();
      setContracts(data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список договоров',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные при монтировании
  useEffect(() => {
    fetchContracts();
  }, [clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Функция для добавления нового договора
  const handleAddContract = () => {
    // Здесь будет открытие модального окна или формы
    toast({
      title: 'Функция в разработке',
      description: 'Добавление договора будет доступно в ближайшее время',
    });
  };

  // Функция для редактирования договора
  const handleEditContract = (contractId: string) => {
    // Здесь будет открытие модального окна или формы
    console.log('Редактирование договора:', contractId); // Используем contractId, чтобы избежать предупреждения линтера
    toast({
      title: 'Функция в разработке',
      description: 'Редактирование договора будет доступно в ближайшее время',
    });
  };

  // Функция для удаления договора
  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот договор?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/clients/${clientId}/contract/${contractId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete contract');
      }

      setContracts(contracts.filter((contract) => contract.id !== contractId));
      toast({
        title: 'Успех',
        description: 'Договор удален',
      });
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить договор',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy');
    } catch {
      // Игнорируем ошибку и возвращаем исходную строку
      return dateString;
    }
  };

  // Преобразование типа договора для отображения
  const getContractTypeDisplay = (type: string | null) => {
    if (!type) return '-';

    switch (type) {
      case 'SERVICE':
        return 'Сервисный';
      case 'SALES':
        return 'Продажи';
      case 'SUPPLY':
        return 'Поставка';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Договоры клиента</h3>
        <Button onClick={handleAddContract}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить договор
        </Button>
      </div>

      {contracts.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Баланс</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.number}</TableCell>
                  <TableCell>{formatDate(contract.date)}</TableCell>
                  <TableCell>{getContractTypeDisplay(contract.type)}</TableCell>
                  <TableCell>{contract.balance} ₽</TableCell>
                  <TableCell>
                    {contract.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Активен
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Архив
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditContract(contract.id)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteContract(contract.id)}
                        disabled={loading}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md bg-muted/30">
          <p className="mb-4 text-muted-foreground">У клиента нет договоров</p>
          <Button onClick={handleAddContract}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить договор
          </Button>
        </div>
      )}
    </div>
  );
}
