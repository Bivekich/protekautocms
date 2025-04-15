import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

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

interface EditAutoFormProps {
  clientId: string;
  auto: AutoData;
  onSuccess: (auto: AutoData) => void;
  onCancel: () => void;
}

export function EditAutoForm({
  clientId,
  auto,
  onSuccess,
  onCancel,
}: EditAutoFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: auto.name,
    vinOrFrame: auto.vinOrFrame,
    codeType: auto.codeType,
    make: auto.make || '',
    model: auto.model || '',
    modification: auto.modification || '',
    year: auto.year?.toString() || '',
    licensePlate: auto.licensePlate || '',
    mileage: auto.mileage?.toString() || '',
    comment: auto.comment || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/clients/${clientId}/auto/${auto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update auto');
      }

      const data = await response.json();
      toast({
        title: 'Успех',
        description: 'Данные автомобиля обновлены',
      });
      onSuccess(data.auto);
    } catch (error) {
      console.error('Error updating auto:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные автомобиля',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название автомобиля *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Например, Личный авто"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codeType">Тип кода</Label>
                <Select
                  value={formData.codeType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, codeType: value }))
                  }
                >
                  <SelectTrigger id="codeType">
                    <SelectValue placeholder="Выберите тип кода" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIN">VIN</SelectItem>
                    <SelectItem value="Frame">Frame</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vinOrFrame">{formData.codeType} *</Label>
                <Input
                  id="vinOrFrame"
                  name="vinOrFrame"
                  value={formData.vinOrFrame}
                  onChange={handleChange}
                  placeholder="Введите VIN или Frame номер"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="make">Марка</Label>
                <Input
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="Например, Toyota"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Модель</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Например, Camry"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modification">Модификация</Label>
                <Input
                  id="modification"
                  name="modification"
                  value={formData.modification}
                  onChange={handleChange}
                  placeholder="Например, 3.5 V6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Год выпуска</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="Например, 2020"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">Гос. номер</Label>
                <Input
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  placeholder="Например, A123BC39"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage">Пробег (км)</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  placeholder="Например, 50000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий</Label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Дополнительная информация об автомобиле"
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить изменения
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
