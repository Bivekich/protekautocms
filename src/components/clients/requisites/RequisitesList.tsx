import { useState } from 'react';
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

interface RequisiteData {
  id: string;
  name: string;
  bankName: string | null;
  bik: string | null;
  accountNumber: string;
  correspondentAccount: string | null;
  legalEntityId: string | null;
}

interface RequisitesListProps {
  clientId: string;
  initialRequisites: RequisiteData[];
  legalEntityId?: string;
}

export function RequisitesList({
  clientId,
  initialRequisites,
}: RequisitesListProps) {
  const { toast } = useToast();
  const [requisites, setRequisites] = useState<RequisiteData[]>(
    initialRequisites || []
  );
  const [loading, setLoading] = useState(false);

  // Удаляем автоматическую загрузку, используем только initialRequisites
  // Это предотвратит бесконечные перезапросы API

  // Функция для добавления новых реквизитов
  const handleAddRequisite = () => {
    // Здесь будет открытие модального окна или формы
    toast({
      title: 'Функция в разработке',
      description: 'Добавление реквизитов будет доступно в ближайшее время',
    });
  };

  // Функция для редактирования реквизитов
  const handleEditRequisite = (requisiteId: string) => {
    // Здесь будет открытие модального окна или формы
    console.log('Редактирование реквизита:', requisiteId); // Используем requisiteId, чтобы избежать предупреждения линтера
    toast({
      title: 'Функция в разработке',
      description: 'Редактирование реквизитов будет доступно в ближайшее время',
    });
  };

  // Функция для удаления реквизитов
  const handleDeleteRequisite = async (requisiteId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эти реквизиты?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/clients/${clientId}/requisite/${requisiteId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete requisite');
      }

      setRequisites(
        requisites.filter((requisite) => requisite.id !== requisiteId)
      );
      toast({
        title: 'Успех',
        description: 'Реквизиты удалены',
      });
    } catch (error) {
      console.error('Error deleting requisite:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить реквизиты',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Банковские реквизиты</h3>
        <Button onClick={handleAddRequisite}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить реквизиты
        </Button>
      </div>

      {requisites.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Банк</TableHead>
                <TableHead>БИК</TableHead>
                <TableHead>Номер счета</TableHead>
                <TableHead>Корр. счет</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisites.map((requisite) => (
                <TableRow key={requisite.id}>
                  <TableCell>{requisite.name}</TableCell>
                  <TableCell>{requisite.bankName || '-'}</TableCell>
                  <TableCell>{requisite.bik || '-'}</TableCell>
                  <TableCell>{requisite.accountNumber}</TableCell>
                  <TableCell>{requisite.correspondentAccount || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditRequisite(requisite.id)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteRequisite(requisite.id)}
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
          <p className="mb-4 text-muted-foreground">Нет доступных реквизитов</p>
          <Button onClick={handleAddRequisite}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить реквизиты
          </Button>
        </div>
      )}
    </div>
  );
}
