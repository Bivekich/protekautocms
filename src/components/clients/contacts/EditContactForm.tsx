import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContactData {
  id: string;
  phone: string | null;
  email: string | null;
  comment: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface EditContactFormProps {
  clientId: string;
  contact: ContactData;
  onSuccess: (contact: ContactData) => void;
  onCancel: () => void;
}

export function EditContactForm({
  clientId,
  contact,
  onSuccess,
  onCancel,
}: EditContactFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: contact.phone || '',
    email: contact.email || '',
    comment: contact.comment || '',
  });

  // Обновляем форму при изменении данных контакта
  useEffect(() => {
    setFormData({
      phone: contact.phone || '',
      email: contact.email || '',
      comment: contact.comment || '',
    });
  }, [contact]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone && !formData.email) {
      toast({
        title: 'Ошибка',
        description: 'Укажите телефон или email',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/clients/${clientId}/contact/${contact.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update contact');
      }

      const data = await response.json();
      onSuccess(data.contact);

      toast({
        title: 'Успех',
        description: 'Контакт успешно обновлен',
      });
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить контакт',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Редактирование контакта</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Телефон
              </label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (___) ___-__-__"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@domain.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Комментарий
            </label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Дополнительная информация о контакте"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
