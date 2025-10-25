import nodemailer from 'nodemailer';
import type { ContactFormData } from '../validators/contact';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendContactEmail(data: ContactFormData): Promise<void> {
  const { name, email, phone, message } = data;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">New Contact Form Submission</h2>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
      <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
        This message was sent from the Chalet Manager contact form.
      </p>
    </div>
  `;

  const textContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}

Message:
${message}

---
This message was sent from the Chalet Manager contact form.
  `;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.SMTP_USER,
    replyTo: email,
    subject: `Contact Form: ${name}`,
    text: textContent,
    html: htmlContent,
  });
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
