'use client';

import { useState, useCallback } from 'react';

export interface Page {
  id: string;
  slug: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: PageSection[];
}

export interface PageSection {
  id: string;
  pageId: string;
  type: string;
  order: number;
  content: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageInput {
  slug: string;
  title: string;
  description?: string;
  isActive: boolean;
}

export interface UpdatePageInput {
  slug?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreatePageSectionInput {
  pageId: string;
  type: string;
  order: number;
  content: Record<string, unknown>;
  isActive: boolean;
}

export interface UpdatePageSectionInput {
  type?: string;
  order?: number;
  content?: Record<string, unknown>;
  isActive?: boolean;
}

// GraphQL запросы
const GET_PAGES_QUERY = `
  query GetPages($includeHidden: Boolean) {
    pagesList(includeHidden: $includeHidden) {
      pages {
        id
        slug
        title
        description
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

const GET_PAGE_QUERY = `
  query GetPage($id: ID, $slug: String) {
    page(id: $id, slug: $slug) {
      id
      slug
      title
      description
      isActive
      createdAt
      updatedAt
      sections {
        id
        pageId
        type
        order
        content
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

const CREATE_PAGE_MUTATION = `
  mutation CreatePage($input: CreatePageInput!) {
    createPage(input: $input) {
      id
      slug
      title
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_PAGE_MUTATION = `
  mutation UpdatePage($id: ID!, $input: UpdatePageInput!) {
    updatePage(id: $id, input: $input) {
      id
      slug
      title
      description
      isActive
      createdAt
      updatedAt
    }
  }
`;

const DELETE_PAGE_MUTATION = `
  mutation DeletePage($id: ID!) {
    deletePage(id: $id)
  }
`;

const CREATE_PAGE_SECTION_MUTATION = `
  mutation CreatePageSection($input: CreatePageSectionInput!) {
    createPageSection(input: $input) {
      id
      pageId
      type
      order
      content
      isActive
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_PAGE_SECTION_MUTATION = `
  mutation UpdatePageSection($id: ID!, $input: UpdatePageSectionInput!) {
    updatePageSection(id: $id, input: $input) {
      id
      pageId
      type
      order
      content
      isActive
      createdAt
      updatedAt
    }
  }
`;

const DELETE_PAGE_SECTION_MUTATION = `
  mutation DeletePageSection($id: ID!) {
    deletePageSection(id: $id)
  }
`;

// Функция для выполнения GraphQL запросов
const executeGraphQLQuery = async <T>(query: string, variables: Record<string, unknown> = {}): Promise<T> => {
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

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  return result.data as T;
};

export const useContentGraphQL = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение списка страниц
  const getPages = useCallback(async (includeHidden = false): Promise<Page[]> => {
    setLoading(true);
    setError(null);

    try {
      const data = await executeGraphQLQuery<{ pagesList: { pages: Page[] } }>(GET_PAGES_QUERY, { includeHidden });
      return data.pagesList.pages;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при получении страниц';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Получение страницы по ID или slug
  const getPage = useCallback(async (id?: string, slug?: string): Promise<Page | null> => {
    if (!id && !slug) {
      throw new Error('Необходимо указать id или slug');
    }

    setLoading(true);
    setError(null);

    try {
      const data = await executeGraphQLQuery<{ page: Page | null }>(GET_PAGE_QUERY, { id, slug });
      return data.page;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при получении страницы';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание страницы
  const createPage = useCallback(async (input: CreatePageInput): Promise<Page> => {
    setLoading(true);
    setError(null);

    try {
      const data = await executeGraphQLQuery<{ createPage: Page }>(CREATE_PAGE_MUTATION, { input });
      return data.createPage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при создании страницы';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление страницы
  const updatePage = useCallback(async (id: string, input: UpdatePageInput): Promise<Page> => {
    setLoading(true);
    setError(null);

    try {
      const data = await executeGraphQLQuery<{ updatePage: Page }>(UPDATE_PAGE_MUTATION, { id, input });
      return data.updatePage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении страницы';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление страницы
  const deletePage = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const data = await executeGraphQLQuery<{ deletePage: boolean }>(DELETE_PAGE_MUTATION, { id });
      return data.deletePage;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при удалении страницы';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание секции страницы
  const createPageSection = useCallback(async (input: CreatePageSectionInput): Promise<PageSection> => {
    setLoading(true);
    setError(null);

    try {
      const data = await executeGraphQLQuery<{ createPageSection: PageSection }>(CREATE_PAGE_SECTION_MUTATION, { input });
      return data.createPageSection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при создании секции страницы';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление секции страницы
  const updatePageSection = useCallback(async (id: string, input: UpdatePageSectionInput): Promise<PageSection> => {
    setLoading(true);
    setError(null);

    try {
      const data = await executeGraphQLQuery<{ updatePageSection: PageSection }>(UPDATE_PAGE_SECTION_MUTATION, { id, input });
      return data.updatePageSection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении секции страницы';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление секции страницы
  const deletePageSection = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const data = await executeGraphQLQuery<{ deletePageSection: boolean }>(DELETE_PAGE_SECTION_MUTATION, { id });
      return data.deletePageSection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при удалении секции страницы';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPages,
    getPage,
    createPage,
    updatePage,
    deletePage,
    createPageSection,
    updatePageSection,
    deletePageSection,
  };
}; 