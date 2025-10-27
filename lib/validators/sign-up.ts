import { z } from 'zod';

export const signUpSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    role: z.enum(['OWNER', 'TENANT']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Les mots de passe doivent correspondre.',
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
