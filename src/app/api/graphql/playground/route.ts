import { redirect } from 'next/navigation';

// Перенаправляем на GraphQL эндпоинт, чтобы открыть GraphiQL UI
export function GET() {
  return redirect('/api/graphql');
} 