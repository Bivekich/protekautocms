'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';

interface Contact {
  id: string;
  phone: string;
  email: string;
  comment?: string;
}

interface ClientContactsProps {
  contacts?: Contact[];
}

export function ClientContacts({
  contacts: initialContacts,
}: ClientContactsProps) {
  const [contacts, setContacts] = useState<Contact[]>(
    initialContacts || [
      {
        id: '1',
        phone: '+7 (909) 797-56-65',
        email: 'manager@example.com',
        comment: 'Менеджер компании',
      },
    ]
  );

  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    phone: '',
    email: '',
    comment: '',
  });

  const handleAddContact = () => {
    setIsAddingContact(true);
  };

  const handleSaveNewContact = () => {
    if (newContact.phone || newContact.email) {
      const contactToAdd: Contact = {
        id: Date.now().toString(),
        phone: newContact.phone || '',
        email: newContact.email || '',
        comment: newContact.comment,
      };

      setContacts([...contacts, contactToAdd]);
      setNewContact({
        phone: '',
        email: '',
        comment: '',
      });
      setIsAddingContact(false);
    }
  };

  const handleCancelAddContact = () => {
    setNewContact({
      phone: '',
      email: '',
      comment: '',
    });
    setIsAddingContact(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Контакты</h3>
            <Button onClick={handleAddContact}>
              Добавить контактные данные
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Номер телефона</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Комментарий</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.comment || ''}</TableCell>
                  </TableRow>
                ))}

                {isAddingContact && (
                  <TableRow>
                    <TableCell>
                      <Input
                        value={newContact.phone || ''}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Номер телефона"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newContact.email || ''}
                        onChange={(e) =>
                          setNewContact({
                            ...newContact,
                            email: e.target.value,
                          })
                        }
                        placeholder="E-mail"
                        type="email"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Input
                          value={newContact.comment || ''}
                          onChange={(e) =>
                            setNewContact({
                              ...newContact,
                              comment: e.target.value,
                            })
                          }
                          placeholder="Комментарий"
                          className="flex-1"
                        />
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveNewContact}
                        >
                          Сохранить
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelAddContact}
                        >
                          Отмена
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
