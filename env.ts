
// env.ts

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SITE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  MONGODB_URI: z.string().url(),
  MONGODB_URI_TEST: z.string().url().optional(),
  MONGODB_DB: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_TEST_FOLDER: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_IS_STAGING: z.enum(['true', 'false']).optional(),
  ADMIN_SEED_EMAIL: z.string().email().optional(),
  ADMIN_SEED_PASSWORD: z.string().min(8).optional(),
  ADMIN_SEED_NAME: z.string().optional(),
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
