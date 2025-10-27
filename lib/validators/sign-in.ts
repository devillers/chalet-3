import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['OWNER', 'TENANT', 'SUPERADMIN']).optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
