import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

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
      status VARCHAR(20) NOT NULL DEFAULT 'new',
      priority VARCHAR(20) NOT NULL DEFAULT 'normal',
      admin_note TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE contact_inquiries
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'new',
      ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'normal',
      ADD COLUMN IF NOT EXISTS admin_note TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS contact_inquiries_status_idx ON contact_inquiries(status);
    CREATE INDEX IF NOT EXISTS contact_inquiries_created_at_idx ON contact_inquiries(created_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS news_events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(220) NOT NULL,
      category VARCHAR(60) NOT NULL DEFAULT 'News',
      content TEXT NOT NULL,
      image_url TEXT,
      published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS news_events_published_at_idx ON news_events(published_at DESC);
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS token TEXT;
  `);
}