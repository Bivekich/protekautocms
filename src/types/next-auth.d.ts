import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      avatarUrl?: string | null;
      requiresTwoFactor?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
    avatarUrl?: string | null;
    requiresTwoFactor?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    avatarUrl?: string | null;
    requiresTwoFactor?: boolean;
  }
}
