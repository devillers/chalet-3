import { getDatabase, EmailLog } from './sqlite';
import { randomUUID } from 'crypto';
import crypto from 'crypto';

export interface CreateEmailLogData {
  to: string[];
  from: string;
  subject: string;
  html?: string;
  text?: string;
  status?: 'queued' | 'sent' | 'failed';
  provider?: string;
  responseId?: string;
  error?: string;
  meta?: {
    ip?: string;
    locale?: string;
    userAgent?: string;
  };
}

export function createEmailLog(data: CreateEmailLogData): EmailLog {
  const db = getDatabase();
  const id = randomUUID();

  const payload = JSON.stringify({
    to: data.to,
    from: data.from,
    subject: data.subject,
    html: data.html,
    text: data.text,
  });
  const payload_hash = crypto.createHash('sha256').update(payload).digest('hex');

  const storeBody = process.env.MAIL_LOG_STORE_BODY === 'true';

  const stmt = db.prepare(`
    INSERT INTO email_logs (
      id, to_addresses, from_address, subject, html_body, text_body,
      status, provider, response_id, error_message, meta, payload_hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    JSON.stringify(data.to),
    data.from,
    data.subject,
    storeBody ? data.html || null : null,
    storeBody ? data.text || null : null,
    data.status || 'queued',
    data.provider || 'smtp',
    data.responseId || null,
    data.error || null,
    data.meta ? JSON.stringify(data.meta) : null,
    payload_hash
  );

  return getEmailLogById(id)!;
}

export function updateEmailLog(
  id: string,
  updates: {
    status?: 'sent' | 'failed';
    responseId?: string;
    error?: string;
    sentAt?: Date;
  }
): boolean {
  const db = getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.responseId) {
    fields.push('response_id = ?');
    values.push(updates.responseId);
  }
  if (updates.error) {
    fields.push('error_message = ?');
    values.push(updates.error);
  }
  if (updates.sentAt) {
    fields.push('sent_at = ?');
    values.push(updates.sentAt.toISOString());
  }

  if (fields.length === 0) return false;

  const stmt = db.prepare(`
    UPDATE email_logs
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  const result = stmt.run(...values, id);
  return result.changes > 0;
}

export function getEmailLogById(id: string): EmailLog | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM email_logs WHERE id = ?');
  return stmt.get(id) as EmailLog | null;
}

export interface GetEmailLogsFilters {
  status?: 'queued' | 'sent' | 'failed';
  search?: string;
  toContains?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export function getEmailLogs(filters: GetEmailLogsFilters = {}): {
  logs: EmailLog[];
  total: number;
} {
  const db = getDatabase();

  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.search) {
    conditions.push('(subject LIKE ? OR to_addresses LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.toContains) {
    conditions.push('to_addresses LIKE ?');
    params.push(`%${filters.toContains}%`);
  }

  if (filters.dateFrom) {
    conditions.push('created_at >= ?');
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    conditions.push('created_at <= ?');
    params.push(filters.dateTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countStmt = db.prepare(`SELECT COUNT(*) as count FROM email_logs ${whereClause}`);
  const { count } = countStmt.get(...params) as { count: number };

  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  const stmt = db.prepare(`
    SELECT * FROM email_logs
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `);

  const logs = stmt.all(...params, limit, offset) as EmailLog[];

  return { logs, total: count };
}

export function maskEmail(email: string): string {
  if (process.env.MAIL_LOG_MASK_RECIPIENTS !== 'true') {
    return email;
  }

  const [local, domain] = email.split('@');
  if (!domain) return email;

  const maskedLocal = local.length > 2 ? local[0] + '****' : '****';
  const [domainName, tld] = domain.split('.');
  const maskedDomain = domainName.length > 2 ? domainName.substring(0, 2) + '****' : '****';

  return `${maskedLocal}@${maskedDomain}.${tld}`;
}
