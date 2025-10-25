import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must accept the privacy policy',
  }),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export function validateContactData(data: unknown): {
  success: boolean;
  data?: ContactFormData;
  errors?: Record<string, string>;
} {
  const result = contactSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0].toString()] = err.message;
    }
  });

  return { success: false, errors };
}
