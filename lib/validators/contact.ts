import { z } from 'zod';

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AttachmentMimeType = (typeof ALLOWED_ATTACHMENT_TYPES)[number];

const attachmentSchema = z
  .object({
    name: z.string().min(1, 'Attachment name is required'),
    type: z
      .string()
      .refine((value) => ALLOWED_ATTACHMENT_TYPES.includes(value as AttachmentMimeType), {
        message: 'Unsupported attachment type',
      }),
    size: z
      .number()
      .nonnegative()
      .max(MAX_ATTACHMENT_SIZE, 'Each attachment must be 10MB or less'),
    data: z.string().min(1, 'Attachment data is required'),
  })
  .strict();

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must accept the privacy policy',
  }),
  attachments: z.array(attachmentSchema).optional().default([]),
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
