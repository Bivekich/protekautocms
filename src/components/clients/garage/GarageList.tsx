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
import { PencilIcon, TrashIcon } from 'lucide-react';
import { CreateAutoForm } from './CreateAutoForm';
import { EditAutoForm } from './EditAutoForm';

interface AutoData {
  id: string;
  name: string;
  vinOrFrame: string;
  codeType: string;
  make: string | null;
  model: string | null;
  modification: string | null;
  year: number | null;
  licensePlate: string | null;
  mileage: number | null;
  comment: string | null;
}

interface GarageListProps {
  clientId: string;
  initialAutos: AutoData[];
}

export function GarageList({ clientId, initialAutos }: GarageListProps) {
  const { toast } = useToast();
  const [autos, setAutos] = useState<AutoData[]>(initialAutos || []);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingAuto, setEditingAuto] = useState<AutoData | null>(null);
  const [loading, setLoading] = useState(false);

  // Функция для удаления автомобиля
  const handleDeleteAuto = async (autoId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/clients/${clientId}/auto/${autoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete auto');
      }

      setAutos(autos.filter((auto) => auto.id !== autoId));
      toast({
        title: 'Успех',
        description: 'Автомобиль удален',
      });
    } catch (error) {
      console.error('Error deleting auto:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить автомобиль',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Обработчик добавления нового автомобиля
  const handleAutoAdded = (newAuto: AutoData) => {
    setAutos([newAuto, ...autos]);
    setIsAddFormOpen(false);
  };

  // Обработчик обновления автомобиля
  const handleAutoUpdated = (updatedAuto: AutoData) => {
    setAutos(
      autos.map((auto) => (auto.id === updatedAuto.id ? updatedAuto : auto))
    );
    setEditingAuto(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Список автомобилей клиента</h3>
        <Button onClick={() => setIsAddFormOpen(true)}>
          Добавить автомобиль
        </Button>
      </div>

      {isAddFormOpen && (
        <CreateAutoForm
          clientId={clientId}
          onSuccess={handleAutoAdded}
          onCancel={() => setIsAddFormOpen(false)}
        />
      )}

      {editingAuto && (
        <EditAutoForm
          clientId={clientId}
          auto={editingAuto}
          onSuccess={handleAutoUpdated}
          onCancel={() => setEditingAuto(null)}
        />
      )}

      {autos.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>VIN/Frame</TableHead>
                <TableHead>Марка</TableHead>
                <TableHead>Модель</TableHead>
                <TableHead>Год</TableHead>
                <TableHead>Гос. номер</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {autos.map((auto) => (
                <TableRow key={auto.id}>
                  <TableCell>{auto.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        {auto.codeType}:
                      </span>
                      <span>{auto.vinOrFrame}</span>
                    </div>
                  </TableCell>
                  <TableCell>{auto.make || '-'}</TableCell>
                  <TableCell>{auto.model || '-'}</TableCell>
                  <TableCell>{auto.year || '-'}</TableCell>
                  <TableCell>{auto.licensePlate || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingAuto(auto)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteAuto(auto.id)}
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
          <p className="mb-4 text-muted-foreground">
            У клиента нет автомобилей
          </p>
          {!isAddFormOpen && (
            <Button onClick={() => setIsAddFormOpen(true)}>
              Добавить автомобиль
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
