import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'app.db');
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dataDir = path.join(process.cwd(), 'data');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'editor')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      to_addresses TEXT NOT NULL,
      from_address TEXT NOT NULL,
      subject TEXT NOT NULL,
      html_body TEXT,
      text_body TEXT,
      status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed')) DEFAULT 'queued',
      provider TEXT NOT NULL DEFAULT 'smtp',
      response_id TEXT,
      error_message TEXT,
      meta TEXT,
      payload_hash TEXT NOT NULL,
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
    CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_email_logs_subject ON email_logs(subject);
  `);
}

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'superadmin' | 'admin' | 'editor';
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  to_addresses: string;
  from_address: string;
  subject: string;
  html_body?: string;
  text_body?: string;
  status: 'queued' | 'sent' | 'failed';
  provider: string;
  response_id?: string;
  error_message?: string;
  meta?: string;
  payload_hash: string;
  sent_at?: string;
  created_at: string;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
