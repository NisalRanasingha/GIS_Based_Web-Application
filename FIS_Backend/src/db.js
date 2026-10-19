import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  ...(process.env.NODE_ENV === 'production'
    ? { ssl: { rejectUnauthorized: false } }
    : {})
});

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(120) NOT NULL,
      last_name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      contact VARCHAR(10) NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      token TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(40),
      organization VARCHAR(160),
      department VARCHAR(80) NOT NULL,
      subject VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS token TEXT;
  `);
}