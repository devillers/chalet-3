
// env.ts

import { z } from 'zod';

const defaults = {
  SITE_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'testtesttesttesttesttesttesttest',
  MONGODB_URI: 'mongodb://localhost:27017/chalet',
  CLOUDINARY_CLOUD_NAME: 'test-cloud',
  CLOUDINARY_API_KEY: 'test-api-key',
  CLOUDINARY_API_SECRET: 'test-api-secret',
} as const;

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    SITE_URL: z.string().url().default(defaults.SITE_URL),
    NEXTAUTH_SECRET: z.string().min(32).default(defaults.NEXTAUTH_SECRET),
    NEXTAUTH_URL: z.string().url().optional(),
    MONGODB_URI: z.string().url().default(defaults.MONGODB_URI),
    MONGODB_URI_TEST: z.string().url().optional(),
    MONGODB_DB: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().default(defaults.CLOUDINARY_CLOUD_NAME),
    CLOUDINARY_API_KEY: z.string().default(defaults.CLOUDINARY_API_KEY),
    CLOUDINARY_API_SECRET: z.string().default(defaults.CLOUDINARY_API_SECRET),
    CLOUDINARY_TEST_FOLDER: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    NEXT_PUBLIC_IS_STAGING: z.enum(['true', 'false']).optional(),
    ADMIN_SEED_EMAIL: z.string().email().optional(),
    ADMIN_SEED_PASSWORD: z.string().min(8).optional(),
    ADMIN_SEED_NAME: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production') {
      const requiredKeys: (keyof typeof defaults)[] = [
        'SITE_URL',
        'NEXTAUTH_SECRET',
        'MONGODB_URI',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
      ];

      const missingKeys = requiredKeys.filter((key) => !process.env[key]);
      if (missingKeys.length === 0) {
        return;
      }

      const shouldBlockBuild =
        process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'production';

      if (shouldBlockBuild) {
        missingKeys.forEach((key) => {
          ctx.addIssue({
            path: [key],
            code: z.ZodIssueCode.custom,
            message: 'Required in production environment',
          });
        });
        return;
      }

      console.warn(
        `⚠️  Missing production environment variables: ${missingKeys.join(', ')}`,
      );
      console.warn(
        '    Using fallback defaults for local production builds. Set VERCEL=1 and VERCEL_ENV=production to enforce strict validation.',
      );
    }
  });

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  SITE_URL: process.env.SITE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_URI_TEST: process.env.MONGODB_URI_TEST,
  MONGODB_DB: process.env.MONGODB_DB,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_TEST_FOLDER: process.env.CLOUDINARY_TEST_FOLDER,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXT_PUBLIC_IS_STAGING: process.env.NEXT_PUBLIC_IS_STAGING,
  ADMIN_SEED_EMAIL: process.env.ADMIN_SEED_EMAIL,
  ADMIN_SEED_PASSWORD: process.env.ADMIN_SEED_PASSWORD,
  ADMIN_SEED_NAME: process.env.ADMIN_SEED_NAME,
});

if (!parsed.success) {
  console.error('❌ Invalid environment variables', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
export type AppEnvironment = typeof env;
