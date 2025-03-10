'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Status {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  color: string;
}

export function ClientStatus() {
  const [statuses, setStatuses] = useState<Status[]>([
    {
      id: '1',
      name: 'Подтвержден',
      description: 'Клиент подтвердил регистрацию',
      isActive: true,
      color: '#4CAF50',
    },
    {
      id: '2',
      name: 'Не подтвержден',
      description: 'Клиент не подтвердил регистрацию',
      isActive: true,
      color: '#FFC107',
    },
    {
      id: '3',
      name: 'Заблокирован',
      description: 'Клиент заблокирован администратором',
      isActive: true,
      color: '#F44336',
    },
    {
      id: '4',
      name: 'VIP',
      description: 'VIP клиент',
      isActive: true,
      color: '#9C27B0',
    },
  ]);

  const [isAddStatusDialogOpen, setIsAddStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Partial<Status>>({
    name: '',
    description: '',
    isActive: true,
    color: '#000000',
  });

  const handleAddStatus = () => {
    setIsAddStatusDialogOpen(true);
  };

  const handleSaveNewStatus = () => {
    if (newStatus.name) {
      const statusToAdd: Status = {
        id: Date.now().toString(),
        name: newStatus.name,
        description: newStatus.description,
        isActive: newStatus.isActive || true,
        color: newStatus.color || '#000000',
      };

      setStatuses([...statuses, statusToAdd]);
      setNewStatus({
        name: '',
        description: '',
        isActive: true,
        color: '#000000',
      });
      setIsAddStatusDialogOpen(false);
    }
  };

  const handleToggleStatus = (id: string) => {
    setStatuses(
      statuses.map((status) =>
        status.id === id ? { ...status, isActive: !status.isActive } : status
      )
    );
  };

  const handleDeleteStatus = (id: string) => {
    setStatuses(statuses.filter((status) => status.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Статусы клиентов</CardTitle>
        <CardDescription>Управление статусами клиентов</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button onClick={handleAddStatus}>Добавить статус</Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Цвет</TableHead>
                <TableHead>Активен</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.map((status) => (
                <TableRow key={status.id}>
                  <TableCell>{status.name}</TableCell>
                  <TableCell>{status.description || ''}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: status.color }}
                      ></div>
                      <span>{status.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={status.isActive}
                      onCheckedChange={() => handleToggleStatus(status.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteStatus(status.id)}
                    >
                      Удалить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog
          open={isAddStatusDialogOpen}
          onOpenChange={setIsAddStatusDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Добавить статус</DialogTitle>
              <DialogDescription>
                Заполните информацию о статусе клиента
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="status-name">Название</Label>
                <Input
                  id="status-name"
                  value={newStatus.name || ''}
                  onChange={(e) =>
                    setNewStatus({ ...newStatus, name: e.target.value })
                  }
                  placeholder="Название статуса"
                />
              </div>
              <div>
                <Label htmlFor="status-description">Описание</Label>
                <Input
                  id="status-description"
                  value={newStatus.description || ''}
                  onChange={(e) =>
                    setNewStatus({ ...newStatus, description: e.target.value })
                  }
                  placeholder="Описание статуса"
                />
              </div>
              <div>
                <Label htmlFor="status-color">Цвет</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="status-color"
                    type="color"
                    value={newStatus.color || '#000000'}
                    onChange={(e) =>
                      setNewStatus({ ...newStatus, color: e.target.value })
                    }
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={newStatus.color || '#000000'}
                    onChange={(e) =>
                      setNewStatus({ ...newStatus, color: e.target.value })
                    }
                    placeholder="Цветовой код"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status-active"
                  checked={newStatus.isActive}
                  onCheckedChange={(checked) =>
                    setNewStatus({ ...newStatus, isActive: checked })
                  }
                />
                <Label htmlFor="status-active">Активен</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddStatusDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleSaveNewStatus}>Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
