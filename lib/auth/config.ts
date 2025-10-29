// lib/auth/config.ts
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/env';
import { checkRateLimit, resetRateLimit } from './rateLimit';
import { getUserByEmail, verifyPassword, updateUser } from '../db/users';
import { defaultLocale, getLocaleFromPathname } from '../i18n';

const IS_DEV = env.NODE_ENV !== 'production';

export const authOptions: NextAuthOptions = {
  // 👇 Cookies sûrs en prod, mais NON secure en dev (localhost http)
  cookies: {
    sessionToken: {
      name: IS_DEV ? 'next-auth.session-token' : '__Secure-next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: !IS_DEV,
      },
    },
    callbackUrl: {
      name: IS_DEV ? 'next-auth.callback-url' : '__Secure-next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: !IS_DEV,
      },
    },
    csrfToken: {
      name: IS_DEV ? 'next-auth.csrf-token' : '__Host-next-auth.csrf-token',
      options: {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        secure: !IS_DEV,
      },
    },
  },

  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim() || '';
        const password = credentials?.password || '';
        const requestedRole = (credentials?.role || '').toString().toUpperCase() as
          | 'OWNER' | 'TENANT' | 'SUPERADMIN' | '';

        console.log('[authorize:start]', { email, requestedRole });

        if (!email || !password) return null;

        const rate = checkRateLimit(email);
        if (!rate.allowed) {
          console.warn('[authorize] rate-limited', rate);
          return null;
        }

        // Seed superadmin
        const seedEmail = env.ADMIN_SEED_EMAIL?.toLowerCase();
        if (seedEmail && email === seedEmail) {
          if (password !== env.ADMIN_SEED_PASSWORD) {
            console.warn('[authorize][seed] wrong password');
            return null;
          }
          if (requestedRole && requestedRole !== 'SUPERADMIN') {
            console.warn('[authorize][seed] role mismatch (ignored)', { requestedRole });
          }
          resetRateLimit(email);
          console.log('[authorize][seed] success');
          return {
            id: 'seed-superadmin',
            email: env.ADMIN_SEED_EMAIL!,
            name: env.ADMIN_SEED_NAME ?? 'Super Admin',
            role: 'SUPERADMIN' as const,
            onboardingCompleted: true,
          };
        }

        // DB user
        const user = await getUserByEmail(email).catch((e) => {
          console.error('[authorize][db] error', e);
          return null;
        });

        if (!user) {
          console.warn('[authorize] no user found');
          return null;
        }

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) {
          console.warn('[authorize][db] invalid password');
          return null;
        }

        const storedRole = (user.role || '').toUpperCase() as 'OWNER' | 'TENANT' | 'SUPERADMIN';
        if (requestedRole && requestedRole !== storedRole) {
          console.warn('[authorize][db] role mismatch (ignored)', { requestedRole, storedRole });
        }

        resetRateLimit(email);
        console.log('[authorize][db] success');
        return {
          id: String(user._id),
          email: user.email.toLowerCase(),
          name: user.name,
          role: storedRole,
          onboardingCompleted: !!user.onboardingCompleted,
        };
      },
    }),

    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            async profile(profile) {
              return {
                id: profile.sub,
                email: (profile.email ?? '').toLowerCase(),
                name: profile.name ?? profile.email ?? 'Utilisateur',
                role: 'TENANT' as const,
                onboardingCompleted: false,
              };
            },
          }),
        ]
      : []),
  ],

  pages: { signIn: '/signin' },

  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },

  secret: env.NEXTAUTH_SECRET,
  debug: IS_DEV,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).role = (user as any).role;
        (token as any).onboardingCompleted = (user as any).onboardingCompleted;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = String((token as any).id);
        (session.user as any).role = (token as any).role;
        (session.user as any).onboardingCompleted = (token as any).onboardingCompleted;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.email) {
        try {
          const existing = await getUserByEmail(user.email.toLowerCase());
          if (!existing) {
            await updateUser(String(user.id), { onboardingCompleted: false });
          }
        } catch (e) {
          console.error('[auth] sync google error', e);
        }
      }
      return true;
    },

    // ✅ Toujours respecter la destination si même origine
    async redirect({ url, baseUrl }) {
      try {
        const base = new URL(baseUrl);
        const target = new URL(url, base);

        if (target.origin === base.origin) {
          return target.toString(); // respecte callbackUrl (/fr/dashboard/owner|tenant)
        }

        // fallback: home localisée
        const locale = getLocaleFromPathname(target.pathname) ?? defaultLocale;
        base.pathname = `/${locale}`;
        base.search = '';
        base.hash = '';
        return base.toString();
      } catch (e) {
        console.error('[auth] redirect error', e);
        return baseUrl;
      }
    },
  },
};

console.log('[authOptions] loaded');
