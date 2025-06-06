import { useState, useCallback } from 'react';

interface Client {
  id: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isVerified: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';
  profileType: string;
  profileId?: string;
  profile?: ClientProfile;
  registrationDate: string;
  lastLoginDate?: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

interface ClientProfile {
  id: string;
  name: string;
  code: string;
  comment?: string;
  baseMarkup: string;
  priceMarkup?: string;
  orderDiscount?: string;
  clients: Client[];
}

interface ClientsResult {
  clients: Client[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface ClientProfilesResult {
  profiles: ClientProfile[];
}

interface CreateClientInput {
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileType?: string;
  profileId?: string;
}

interface UpdateClientInput {
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';
  profileType?: string;
  profileId?: string;
}

interface CreateClientProfileInput {
  name: string;
  code?: string;
  comment?: string;
  baseMarkup: string;
  priceMarkup?: string;
  orderDiscount?: string;
}

interface UpdateClientProfileInput {
  name?: string;
  code?: string;
  comment?: string;
  baseMarkup?: string;
  priceMarkup?: string;
  orderDiscount?: string;
}

interface Discount {
  id: string;
  name: string;
  type: string;
  code?: string;
  minOrderAmount: number;
  discountPercent?: number;
  fixedDiscount?: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  profiles: {
    id: string;
    name: string;
  }[];
}

// GraphQL запросы
const CLIENTS_LIST_QUERY = `
  query ClientsList($page: Int, $limit: Int, $search: String, $profileType: String, $status: ClientStatus, $isVerified: Boolean) {
    clientsList(page: $page, limit: $limit, search: $search, profileType: $profileType, status: $status, isVerified: $isVerified) {
      clients {
        id
        phone
        email
        firstName
        lastName
        isVerified
        status
        profileType
        profileId
        registrationDate
        lastLoginDate
        createdAt
        updatedAt
        fullName
        profile {
          id
          name
          code
          baseMarkup
        }
      }
      pagination {
        total
        page
        limit
        pages
      }
    }
  }
`;

const CLIENT_QUERY = `
  query Client($id: ID!) {
    client(id: $id) {
      id
      phone
      email
      firstName
      lastName
      isVerified
      status
      profileType
      profileId
      registrationDate
      lastLoginDate
      createdAt
      updatedAt
      fullName
      profile {
        id
        name
        code
        comment
        baseMarkup
        priceMarkup
        orderDiscount
      }
    }
  }
`;

const CLIENT_PROFILES_LIST_QUERY = `
  query ClientProfilesList {
    clientProfilesList {
      profiles {
        id
        name
        code
        comment
        baseMarkup
        priceMarkup
        orderDiscount
      }
    }
  }
`;

const CREATE_CLIENT_MUTATION = `
  mutation CreateClient($input: CreateClientInput!) {
    createClient(input: $input) {
      id
      phone
      email
      firstName
      lastName
      isVerified
      status
      profileType
      profileId
      registrationDate
      lastLoginDate
      createdAt
      updatedAt
      fullName
      profile {
        id
        name
        code
        baseMarkup
      }
    }
  }
`;

const UPDATE_CLIENT_MUTATION = `
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id
      phone
      email
      firstName
      lastName
      isVerified
      status
      profileType
      profileId
      registrationDate
      lastLoginDate
      createdAt
      updatedAt
      fullName
      profile {
        id
        name
        code
        baseMarkup
      }
    }
  }
`;

const DELETE_CLIENT_MUTATION = `
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id)
  }
`;

const CREATE_CLIENT_PROFILE_MUTATION = `
  mutation CreateClientProfile($input: CreateClientProfileInput!) {
    createClientProfile(input: $input) {
      id
      name
      code
      comment
      baseMarkup
      priceMarkup
      orderDiscount
    }
  }
`;

const UPDATE_CLIENT_PROFILE_MUTATION = `
  mutation UpdateClientProfile($id: ID!, $input: UpdateClientProfileInput!) {
    updateClientProfile(id: $id, input: $input) {
      id
      name
      code
      comment
      baseMarkup
      priceMarkup
      orderDiscount
    }
  }
`;

const DELETE_CLIENT_PROFILE_MUTATION = `
  mutation DeleteClientProfile($id: ID!) {
    deleteClientProfile(id: $id)
  }
`;

const DISCOUNTS_LIST_QUERY = `
  query DiscountsList {
    discountsList {
      id
      name
      type
      code
      minOrderAmount
      discountPercent
      fixedDiscount
      isActive
      startDate
      endDate
      createdAt
      updatedAt
      profiles {
        id
        name
      }
    }
  }
`;

const CREATE_DISCOUNT_MUTATION = `
  mutation CreateDiscount($input: CreateDiscountInput!) {
    createDiscount(input: $input) {
      id
      name
      type
      code
      minOrderAmount
      discountPercent
      fixedDiscount
      isActive
      startDate
      endDate
      createdAt
      updatedAt
      profiles {
        id
        name
      }
    }
  }
`;

const UPDATE_DISCOUNT_MUTATION = `
  mutation UpdateDiscount($id: ID!, $input: UpdateDiscountInput!) {
    updateDiscount(id: $id, input: $input) {
      id
      name
      type
      code
      minOrderAmount
      discountPercent
      fixedDiscount
      isActive
      startDate
      endDate
      createdAt
      updatedAt
      profiles {
        id
        name
      }
    }
  }
`;

const DELETE_DISCOUNT_MUTATION = `
  mutation DeleteDiscount($id: ID!) {
    deleteDiscount(id: $id)
  }
`;

// Функция для выполнения GraphQL запросов
const executeGraphQLQuery = async <T>(query: string, variables?: Record<string, unknown>): Promise<T> => {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL Error');
  }

  return result.data;
};

export const useClientsGraphQL = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = useCallback(async <T>(requestFn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await requestFn();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение списка клиентов
  const getClientsList = useCallback(
    (params: {
      page?: number;
      limit?: number;
      search?: string;
      profileType?: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';
      isVerified?: boolean;
    } = {}) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ clientsList: ClientsResult }>(
          CLIENTS_LIST_QUERY,
          params
        );
        return data.clientsList;
      });
    },
    [handleRequest]
  );

  // Получение клиента по ID
  const getClient = useCallback(
    (id: string) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ client: Client }>(CLIENT_QUERY, { id });
        return data.client;
      });
    },
    [handleRequest]
  );

  // Получение списка профилей клиентов
  const getClientProfiles = useCallback(() => {
    return handleRequest(async () => {
      const data = await executeGraphQLQuery<{ clientProfilesList: ClientProfilesResult }>(
        CLIENT_PROFILES_LIST_QUERY
      );
      return data.clientProfilesList;
    });
  }, [handleRequest]);

  // Создание клиента
  const createClient = useCallback(
    (input: CreateClientInput) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ createClient: Client }>(
          CREATE_CLIENT_MUTATION,
          { input }
        );
        return data.createClient;
      });
    },
    [handleRequest]
  );

  // Обновление клиента
  const updateClient = useCallback(
    (id: string, input: UpdateClientInput) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ updateClient: Client }>(
          UPDATE_CLIENT_MUTATION,
          { id, input }
        );
        return data.updateClient;
      });
    },
    [handleRequest]
  );

  // Удаление клиента
  const deleteClient = useCallback(
    (id: string) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ deleteClient: boolean }>(
          DELETE_CLIENT_MUTATION,
          { id }
        );
        return data.deleteClient;
      });
    },
    [handleRequest]
  );

  // Создание профиля клиента
  const createClientProfile = useCallback(
    (input: CreateClientProfileInput) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ createClientProfile: ClientProfile }>(
          CREATE_CLIENT_PROFILE_MUTATION,
          { input }
        );
        return data.createClientProfile;
      });
    },
    [handleRequest]
  );

  // Обновление профиля клиента
  const updateClientProfile = useCallback(
    (id: string, input: UpdateClientProfileInput) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ updateClientProfile: ClientProfile }>(
          UPDATE_CLIENT_PROFILE_MUTATION,
          { id, input }
        );
        return data.updateClientProfile;
      });
    },
    [handleRequest]
  );

  // Удаление профиля клиента
  const deleteClientProfile = useCallback(
    (id: string) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ deleteClientProfile: boolean }>(
          DELETE_CLIENT_PROFILE_MUTATION,
          { id }
        );
        return data.deleteClientProfile;
      });
    },
    [handleRequest]
  );

  // Получение списка скидок
  const getDiscountsList = useCallback(() => {
    return handleRequest(async () => {
      const data = await executeGraphQLQuery<{ discountsList: Discount[] }>(
        DISCOUNTS_LIST_QUERY
      );
      return data.discountsList;
    });
  }, [handleRequest]);

  // Создание скидки
  const createDiscount = useCallback(
    (input: {
      name: string;
      type: string;
      code?: string;
      minOrderAmount: number;
      discountPercent?: number;
      fixedDiscount?: number;
      isActive?: boolean;
      startDate?: string;
      endDate?: string;
      profileIds?: string[];
    }) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ createDiscount: Discount }>(
          CREATE_DISCOUNT_MUTATION,
          { input }
        );
        return data.createDiscount;
      });
    },
    [handleRequest]
  );

  // Обновление скидки
  const updateDiscount = useCallback(
    (id: string, input: {
      name?: string;
      type?: string;
      code?: string;
      minOrderAmount?: number;
      discountPercent?: number;
      fixedDiscount?: number;
      isActive?: boolean;
      startDate?: string;
      endDate?: string;
      profileIds?: string[];
    }) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ updateDiscount: Discount }>(
          UPDATE_DISCOUNT_MUTATION,
          { id, input }
        );
        return data.updateDiscount;
      });
    },
    [handleRequest]
  );

  // Удаление скидки
  const deleteDiscount = useCallback(
    (id: string) => {
      return handleRequest(async () => {
        const data = await executeGraphQLQuery<{ deleteDiscount: boolean }>(
          DELETE_DISCOUNT_MUTATION,
          { id }
        );
        return data.deleteDiscount;
      });
    },
    [handleRequest]
  );

  return {
    loading,
    error,
    getClientsList,
    getClient,
    getClientProfiles,
    createClient,
    updateClient,
    deleteClient,
    createClientProfile,
    updateClientProfile,
    deleteClientProfile,
    getDiscountsList,
    createDiscount,
    updateDiscount,
    deleteDiscount,
  };
}; 