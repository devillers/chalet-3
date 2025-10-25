import { getDatabase, User } from './sqlite';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'editor';
}): Promise<User> {
  const db = getDatabase();
  const id = randomUUID();
  const password_hash = await bcrypt.hash(data.password, 10);

  const stmt = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, data.name, data.email, password_hash, data.role);

  return getUserById(id)!;
}

export function getUserById(id: string): User | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | null;
}

export function getUserByEmail(email: string): User | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | null;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getAllUsers(): User[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  return stmt.all() as User[];
}

export function updateUser(
  id: string,
  data: Partial<Omit<User, 'id' | 'password_hash' | 'created_at' | 'updated_at'>>
): boolean {
  const db = getDatabase();
  const fields = Object.keys(data);
  const values = Object.values(data);

  if (fields.length === 0) return false;

  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const stmt = db.prepare(`
    UPDATE users
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = stmt.run(...values, id);
  return result.changes > 0;
}
