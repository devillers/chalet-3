import nodemailer from 'nodemailer';
import { z } from 'zod';
import { createEmailLog, updateEmailLog } from '../db/emailLogs';

const emailPayloadSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  from: z.string().email().optional(),
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
  replyTo: z.string().email().optional(),
  meta: z
    .object({
      ip: z.string().optional(),
      locale: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

export type EmailPayload = z.infer<typeof emailPayloadSchema>;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(payload: EmailPayload): Promise<{
  success: boolean;
  logId: string;
  messageId?: string;
  error?: string;
}> {
  try {
    const validated = emailPayloadSchema.parse(payload);

    const toAddresses = Array.isArray(validated.to) ? validated.to : [validated.to];
    const fromAddress = validated.from || process.env.SMTP_USER || 'noreply@chaletmanager.fr';

    const log = createEmailLog({
      to: toAddresses,
      from: fromAddress,
      subject: validated.subject,
      html: validated.html,
      text: validated.text,
      status: 'queued',
      meta: validated.meta,
    });

    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toAddresses,
        subject: validated.subject,
        text: validated.text,
        html: validated.html,
        replyTo: validated.replyTo,
      });

      updateEmailLog(log.id, {
        status: 'sent',
        responseId: info.messageId,
        sentAt: new Date(),
      });

      return {
        success: true,
        logId: log.id,
        messageId: info.messageId,
      };
    } catch (sendError: any) {
      updateEmailLog(log.id, {
        status: 'failed',
        error: sendError.message || 'Unknown error',
      });

      return {
        success: false,
        logId: log.id,
        error: sendError.message || 'Failed to send email',
      };
    }
  } catch (validationError: any) {
    console.error('Email validation error:', validationError);
    throw new Error(`Invalid email payload: ${validationError.message}`);
  }
}

export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
