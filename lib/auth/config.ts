// filepath: lib/auth/config.ts

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { signInSchema } from '@/lib/validators/sign-in';
import { env } from '@/env';
import { checkRateLimit, resetRateLimit } from './rateLimit';
import { getUserByEmail, verifyPassword, updateUser } from '../db/users';

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const result = signInSchema.safeParse(credentials);
        if (!result.success) {
          return null;
        }

        const { email, password, role: requestedRole } = result.data;
        const normalizedEmail = email.toLowerCase();
        const rate = checkRateLimit(email);
        if (!rate.allowed) {
          throw new Error(`Too many attempts. Retry after ${rate.retryAfter ?? 60}s.`);
        }

        let user = null;
        try {
          user = await getUserByEmail(normalizedEmail);
        } catch (error) {
          console.error('[auth] Failed to fetch user during sign-in', error);
        }

        if (user) {
          console.log('[auth] credentials authorize -> db user', {
            id: user._id,
            email: user.email,
            role: user.role,
          });
          const valid = await verifyPassword(password, user.passwordHash);
          if (!valid) {
            return null;
          }

          if (requestedRole && requestedRole !== user.role) {
            throw new Error('ACCESS_RESTRICTED');
          }

          resetRateLimit(email);

          console.log('[auth] credentials authorize -> db user success', {
            id: user._id,
            email: user.email,
            role: user.role,
          });
          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted,
          };
        }

        const seedEmail = env.ADMIN_SEED_EMAIL?.toLowerCase();
        const seedPassword = env.ADMIN_SEED_PASSWORD;

        if (
          seedEmail &&
          seedPassword &&
          normalizedEmail === seedEmail &&
          password === seedPassword
        ) {
          console.log('[auth] credentials authorize -> seed user', {
            email: env.ADMIN_SEED_EMAIL,
          });
          if (requestedRole && requestedRole !== 'SUPERADMIN') {
            throw new Error('ACCESS_RESTRICTED');
          }

          resetRateLimit(email);

          console.log('[auth] credentials authorize -> seed user success', {
            email: env.ADMIN_SEED_EMAIL,
          });
          return {
            id: 'seed-superadmin',
            email: env.ADMIN_SEED_EMAIL,
            name: env.ADMIN_SEED_NAME ?? 'Super Admin',
            role: 'SUPERADMIN',
            onboardingCompleted: true,
          };
        }

        return null;
      },
  }),
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        return {
          id: profile.sub,
          email: profile.email ?? '',
          name: profile.name ?? profile.email ?? 'Utilisateur',
          role: 'TENANT' as const,
          onboardingCompleted: false,
        };
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30,
  },
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: 'OWNER' | 'TENANT' | 'SUPERADMIN' }).role;
        token.onboardingCompleted = (user as { onboardingCompleted?: boolean }).onboardingCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = (token.role ?? 'TENANT') as 'OWNER' | 'TENANT' | 'SUPERADMIN';
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) {
          return false;
        }

        try {
          const existing = await getUserByEmail(user.email);
          if (!existing) {
            await updateUser(user.id, { onboardingCompleted: false });
          }
        } catch (error) {
          console.error('[auth] Failed to sync Google user', error);
        }
      }
      return true;
    },
    async redirect({ url }) {
      return url;
    },
  },
};
