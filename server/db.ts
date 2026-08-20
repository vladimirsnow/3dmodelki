import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

// If TURSO_DATABASE_URL is provided, it connects to Turso (production).
// Otherwise, it falls back to a local SQLite file (development).
const url = process.env.TURSO_DATABASE_URL || 'file:./database.sqlite';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

export default db;
