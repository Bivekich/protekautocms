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

interface LegalEntityData {
  id: string;
  shortName: string;
  fullName: string | null;
  inn: string;
  kpp: string | null;
  ogrn: string | null;
}

interface LegalEntitiesListProps {
  clientId: string;
  initialEntities: LegalEntityData[];
}

export function LegalEntitiesList({
  clientId,
  initialEntities,
}: LegalEntitiesListProps) {
  const { toast } = useToast();
  const [entities, setEntities] = useState<LegalEntityData[]>(
    initialEntities || []
  );
  const [loading, setLoading] = useState(false);

  // Обновление списка юр. лиц
  const fetchEntities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clients/${clientId}/legal-entity`);
      if (!response.ok) {
        throw new Error('Failed to fetch legal entities');
      }
      const data = await response.json();
      setEntities(data.legalEntities);
    } catch (error) {
      console.error('Error fetching legal entities:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список юр. лиц',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные при монтировании
  useEffect(() => {
    fetchEntities();
  }, [clientId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Функция для добавления нового юр. лица
  const handleAddEntity = () => {
    // Здесь будет открытие модального окна или формы
    toast({
      title: 'Функция в разработке',
      description: 'Добавление юр. лица будет доступно в ближайшее время',
    });
  };

  // Функция для редактирования юр. лица
  const handleEditEntity = (entity: LegalEntityData) => {
    // Здесь будет открытие модального окна или формы
    console.log('Редактирование юр. лица:', entity.id); // Используем entity, чтобы избежать предупреждения линтера
    toast({
      title: 'Функция в разработке',
      description: 'Редактирование юр. лица будет доступно в ближайшее время',
    });
  };

  // Функция для удаления юр. лица
  const handleDeleteEntity = async (entityId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это юридическое лицо?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/clients/${clientId}/legal-entity/${entityId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete legal entity');
      }

      setEntities(entities.filter((entity) => entity.id !== entityId));
      toast({
        title: 'Успех',
        description: 'Юридическое лицо удалено',
      });
    } catch (error) {
      console.error('Error deleting legal entity:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить юридическое лицо',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Юридические лица клиента</h3>
        <Button onClick={handleAddEntity}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить юр. лицо
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-300 p-4 rounded-md mb-4">
        <p className="text-amber-800 font-medium">
          Функционал юр. лиц в разработке
        </p>
        <p className="text-amber-700 text-sm mt-1">
          Интерфейс для работы с юридическими лицами находится в процессе
          разработки. API уже доступно, и вы можете добавлять юр. лица через
          личный кабинет клиента на сайте.
        </p>
      </div>

      {entities.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Наименование</TableHead>
                <TableHead>Полное наименование</TableHead>
                <TableHead>ИНН</TableHead>
                <TableHead>КПП</TableHead>
                <TableHead>ОГРН</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entities.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell>{entity.shortName}</TableCell>
                  <TableCell>{entity.fullName || '-'}</TableCell>
                  <TableCell>{entity.inn}</TableCell>
                  <TableCell>{entity.kpp || '-'}</TableCell>
                  <TableCell>{entity.ogrn || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditEntity(entity)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteEntity(entity.id)}
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
            У клиента нет юридических лиц
          </p>
          <Button onClick={handleAddEntity}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить юр. лицо
          </Button>
        </div>
      )}
    </div>
  );
}
