import { createYoga } from 'graphql-yoga';
import { schema } from '@/lib/graphql/schema';
import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

// Создаем Yoga сервер с нашей схемой
const yoga = createYoga({
  schema,
  // Включаем GraphQL playground
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Request, Response },
  graphiql: true, // Включаем GraphiQL UI
  context: async (requestContext) => {
    try {
      // Получаем запрос из контекста
      const request = requestContext.request as NextRequest;
      
      // Используем нашу функцию для получения пользователя
      const currentUser = await getUserFromRequest(request);
      
      return {
        currentUser,
        request,
      };
    } catch (error) {
      console.error('Ошибка получения пользователя в GraphQL:', error);
      return {
        currentUser: null,
        request: requestContext.request,
      };
    }
  },
  multipart: true, // Включаем поддержку мультипарт запросов для загрузки файлов
});

// Обрабатываем все запросы: GET для playground и POST для запросов
export async function GET(request: NextRequest) {
  return yoga.fetch(request);
}

export async function POST(request: NextRequest) {
  return yoga.fetch(request);
}

// export const runtime = 'edge'; // Включите это, если хотите запускать на Vercel Edge Runtime 