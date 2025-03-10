import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientGeneralSettings } from '@/components/clients/ClientGeneralSettings';
import { ClientDeliveryAddresses } from '@/components/clients/ClientDeliveryAddresses';
import { ClientGarage } from '@/components/clients/ClientGarage';
import { ClientContacts } from '@/components/clients/ClientContacts';
import { ClientContracts } from '@/components/clients/ClientContracts';
import { ClientLegalEntities } from '@/components/clients/ClientLegalEntities';
import { ClientRequisites } from '@/components/clients/ClientRequisites';
import { ClientOrderHistory } from '@/components/clients/ClientOrderHistory';

export default async function ClientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Карточка клиента</h1>
        <p className="text-muted-foreground">ID: {id}</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Общие настройки</TabsTrigger>
          <TabsTrigger value="addresses">Адреса доставки</TabsTrigger>
          <TabsTrigger value="garage">Гараж</TabsTrigger>
          <TabsTrigger value="contacts">Контакты</TabsTrigger>
          <TabsTrigger value="contracts">Договоры</TabsTrigger>
          <TabsTrigger value="legal-entities">Юрлицо</TabsTrigger>
          <TabsTrigger value="requisites">Реквизиты</TabsTrigger>
          <TabsTrigger value="order-history">История заказов</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <ClientGeneralSettings />
        </TabsContent>

        <TabsContent value="addresses">
          <ClientDeliveryAddresses />
        </TabsContent>

        <TabsContent value="garage">
          <ClientGarage />
        </TabsContent>

        <TabsContent value="contacts">
          <ClientContacts />
        </TabsContent>

        <TabsContent value="contracts">
          <ClientContracts />
        </TabsContent>

        <TabsContent value="legal-entities">
          <ClientLegalEntities />
        </TabsContent>

        <TabsContent value="requisites">
          <ClientRequisites />
        </TabsContent>

        <TabsContent value="order-history">
          <ClientOrderHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
