import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import { validateContactData } from '@/lib/validators/contact';
import { sendEmail } from '@/lib/mail/sendEmail';

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    const validation = validateContactData(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const { name, email, phone, message, attachments } = validation.data!;

    const attachmentsHtml =
      attachments && attachments.length > 0
        ? `
          <p><strong>Attachments:</strong></p>
          <ul>
            ${attachments
              .map(
                (file) =>
                  `<li>${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)</li>`
              )
              .join('')}
          </ul>
        `
        : '';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Contact Form Submission</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
          ${attachmentsHtml}
        </div>
      </div>
    `;

    const textContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}

Message:
${message}

Attachments:
${
  attachments && attachments.length > 0
    ? attachments
        .map((file) => `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`)
        .join('\n')
    : 'None'
}
    `;

    const result = await sendEmail({
      to: process.env.SMTP_USER || 'contact@chalet-manager.fr',
      from: process.env.SMTP_USER || 'noreply@chalet-manager.fr',
      replyTo: email,
      subject: `Contact Form: ${name}`,
      html: htmlContent,
      text: textContent,
      attachments:
        attachments && attachments.length > 0
          ? attachments.map((file) => ({
              filename: file.name,
              content: Buffer.from(file.data, 'base64'),
              contentType: file.type,
            }))
          : undefined,
      meta: {
        ip,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    if (!result.success) {
      console.error('Email send failed:', result.error);
      return NextResponse.json(
        { success: false, message: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
