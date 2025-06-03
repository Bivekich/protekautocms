import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function getCurrentUser(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  if (!token) return null;
  
  return {
    id: token.id as string,
    name: token.name as string,
    email: token.email as string,
    role: token.role as string,
  };
}

export async function isAdmin(request: NextRequest) {
  const user = await getCurrentUser(request);
  return user?.role === 'ADMIN';
}
