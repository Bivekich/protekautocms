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
import { CreateContactForm } from './CreateContactForm';
import { EditContactForm } from './EditContactForm';

interface ContactData {
  id: string;
  phone: string | null;
  email: string | null;
  comment: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ContactsListProps {
  clientId: string;
  initialContacts: ContactData[];
}

export function ContactsList({ clientId, initialContacts }: ContactsListProps) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactData[]>(
    initialContacts || []
  );
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactData | null>(
    null
  );

  // Функция для добавления нового контакта
  const handleAddContact = () => {
    setIsCreating(true);
  };

  // Функция для редактирования контакта
  const handleEditContact = (contact: ContactData) => {
    setEditingContact(contact);
  };

  // Функция для удаления контакта
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот контакт?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/clients/${clientId}/contact/${contactId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      setContacts(contacts.filter((contact) => contact.id !== contactId));
      toast({
        title: 'Успех',
        description: 'Контакт удален',
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить контакт',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Обработчик успешного создания контакта
  const handleCreateSuccess = (newContact: ContactData) => {
    setContacts([...contacts, newContact]);
    setIsCreating(false);
  };

  // Обработчик успешного обновления контакта
  const handleUpdateSuccess = (updatedContact: ContactData) => {
    setContacts(
      contacts.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
    setEditingContact(null);
  };

  // Отмена создания или редактирования
  const handleCancel = () => {
    setIsCreating(false);
    setEditingContact(null);
  };

  return (
    <div className="space-y-6">
      {isCreating ? (
        <CreateContactForm
          clientId={clientId}
          onSuccess={handleCreateSuccess}
          onCancel={handleCancel}
        />
      ) : editingContact ? (
        <EditContactForm
          clientId={clientId}
          contact={editingContact}
          onSuccess={handleUpdateSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Контакты клиента</h3>
            <Button onClick={handleAddContact}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить контакт
            </Button>
          </div>

          {contacts.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Комментарий</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>{contact.phone || '-'}</TableCell>
                      <TableCell>{contact.email || '-'}</TableCell>
                      <TableCell>{contact.comment || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditContact(contact)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteContact(contact.id)}
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
                У клиента нет контактов
              </p>
              <Button onClick={handleAddContact}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Добавить контакт
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
