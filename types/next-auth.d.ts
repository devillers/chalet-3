import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  type AppRole = 'OWNER' | 'TENANT' | 'SUPERADMIN';

  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: AppRole;
      onboardingCompleted?: boolean;
      primaryPropertyId?: string;
      ownedPropertyIds?: string[];
      profile?: { firstName: string; lastName: string; phone?: string };
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: AppRole;
    onboardingCompleted?: boolean;
    primaryPropertyId?: string;
    ownedPropertyIds?: string[];
    profile?: { firstName: string; lastName: string; phone?: string };
  }
}

declare module 'next-auth/jwt' {
  type AppRole = 'OWNER' | 'TENANT' | 'SUPERADMIN';

  interface JWT {
    id: string;
    role: AppRole;
    onboardingCompleted?: boolean;
    primaryPropertyId?: string;
    ownedPropertyIds?: string[];
    profile?: { firstName: string; lastName: string; phone?: string };
  }
}
