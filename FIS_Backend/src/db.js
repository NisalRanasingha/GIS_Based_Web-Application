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
    CREATE TABLE IF NOT EXISTS fish_forecasts (
      id SERIAL PRIMARY KEY,
      species VARCHAR(40) NOT NULL,
      forecast_date DATE NOT NULL,
      files JSONB NOT NULL DEFAULT '[]'::jsonb,
      hotspots JSONB NOT NULL DEFAULT '[]'::jsonb,
      confidence NUMERIC(5, 2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (species, forecast_date)
    );
    CREATE INDEX IF NOT EXISTS fish_forecasts_species_date_idx
      ON fish_forecasts(species, forecast_date DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS fish_forecast_runs (
      id BIGSERIAL PRIMARY KEY,
      species VARCHAR(40) NOT NULL CHECK (species IN ('yellowfin', 'bigeye', 'skipjack')),
      forecast_date DATE NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'uploaded'
        CHECK (status IN ('uploaded', 'processing', 'processed', 'failed')),
      confidence NUMERIC(5, 2) CHECK (confidence BETWEEN 0 AND 100),
      processing_error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ,
      UNIQUE (species, forecast_date)
    );

    CREATE TABLE IF NOT EXISTS fish_forecast_files (
      id BIGSERIAL PRIMARY KEY,
      run_id BIGINT NOT NULL REFERENCES fish_forecast_runs(id) ON DELETE CASCADE,
      layer_key VARCHAR(80) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(120),
      file_size BIGINT NOT NULL CHECK (file_size > 0),
      checksum_sha256 CHAR(64) NOT NULL,
      content BYTEA NOT NULL,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (run_id, layer_key)
    );

    CREATE TABLE IF NOT EXISTS fish_forecast_hotspots (
      id BIGSERIAL PRIMARY KEY,
      run_id BIGINT NOT NULL REFERENCES fish_forecast_runs(id) ON DELETE CASCADE,
      latitude NUMERIC(8, 5) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
      longitude NUMERIC(8, 5) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
      suitability_score NUMERIC(5, 2) NOT NULL CHECK (suitability_score BETWEEN 0 AND 100),
      label VARCHAR(120) NOT NULL,
      environmental_data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS fish_forecast_runs_species_date_idx
      ON fish_forecast_runs(species, forecast_date DESC);
    CREATE INDEX IF NOT EXISTS fish_forecast_files_run_idx
      ON fish_forecast_files(run_id);
    CREATE INDEX IF NOT EXISTS fish_forecast_files_uploaded_at_idx
      ON fish_forecast_files(uploaded_at);
    CREATE INDEX IF NOT EXISTS fish_forecast_hotspots_run_idx
      ON fish_forecast_hotspots(run_id);

    CREATE TABLE IF NOT EXISTS fish_forecast_shapes (
      id BIGSERIAL PRIMARY KEY,
      species VARCHAR(40) NOT NULL CHECK (species IN ('yellowfin', 'bigeye', 'skipjack')),
      forecast_date DATE NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(120),
      content BYTEA NOT NULL,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (species, forecast_date)
    );
    CREATE INDEX IF NOT EXISTS fish_forecast_shapes_species_date_idx
      ON fish_forecast_shapes(species, forecast_date DESC);

    CREATE TABLE IF NOT EXISTS yellowfin_forecast_shapes (
      id BIGSERIAL PRIMARY KEY,
      forecast_date DATE NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(120),
      content BYTEA NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'published')),
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      published_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '8 days')
    );
    CREATE TABLE IF NOT EXISTS bigeye_forecast_shapes (LIKE yellowfin_forecast_shapes INCLUDING ALL);
    CREATE TABLE IF NOT EXISTS skipjack_forecast_shapes (LIKE yellowfin_forecast_shapes INCLUDING ALL);
    CREATE INDEX IF NOT EXISTS yellowfin_forecast_shapes_date_idx ON yellowfin_forecast_shapes(forecast_date DESC, uploaded_at DESC);
    CREATE INDEX IF NOT EXISTS bigeye_forecast_shapes_date_idx ON bigeye_forecast_shapes(forecast_date DESC, uploaded_at DESC);
    CREATE INDEX IF NOT EXISTS skipjack_forecast_shapes_date_idx ON skipjack_forecast_shapes(forecast_date DESC, uploaded_at DESC);

    CREATE TABLE IF NOT EXISTS fish_forecast_publications (
      species VARCHAR(40) PRIMARY KEY CHECK (species IN ('yellowfin', 'bigeye', 'skipjack')),
      forecast_date DATE NOT NULL,
      published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS fish_forecast_publications_date_idx
      ON fish_forecast_publications(forecast_date DESC);
  `);
  await pool.query(`
    ALTER TABLE yellowfin_forecast_shapes ALTER COLUMN expires_at DROP NOT NULL;
    ALTER TABLE bigeye_forecast_shapes ALTER COLUMN expires_at DROP NOT NULL;
    ALTER TABLE skipjack_forecast_shapes ALTER COLUMN expires_at DROP NOT NULL;
    UPDATE yellowfin_forecast_shapes
    SET expires_at = uploaded_at + INTERVAL '8 days'
    WHERE expires_at IS NULL AND status = 'uploaded';
    UPDATE bigeye_forecast_shapes
    SET expires_at = uploaded_at + INTERVAL '8 days'
    WHERE expires_at IS NULL AND status = 'uploaded';
    UPDATE skipjack_forecast_shapes
    SET expires_at = uploaded_at + INTERVAL '8 days'
    WHERE expires_at IS NULL AND status = 'uploaded';
    UPDATE yellowfin_forecast_shapes
    SET expires_at = uploaded_at + INTERVAL '8 days'
    WHERE expires_at IS NULL;
    UPDATE bigeye_forecast_shapes
    SET expires_at = uploaded_at + INTERVAL '8 days'
    WHERE expires_at IS NULL;
    UPDATE skipjack_forecast_shapes
    SET expires_at = uploaded_at + INTERVAL '8 days'
    WHERE expires_at IS NULL;
    ALTER TABLE yellowfin_forecast_shapes ALTER COLUMN expires_at SET NOT NULL;
    ALTER TABLE bigeye_forecast_shapes ALTER COLUMN expires_at SET NOT NULL;
    ALTER TABLE skipjack_forecast_shapes ALTER COLUMN expires_at SET NOT NULL;
  `);
  for (const species of ['yellowfin', 'bigeye', 'skipjack']) {
    const table = `${species}_forecast_shapes`;
    await pool.query(`
      INSERT INTO fish_forecast_publications (species, forecast_date, published_at, updated_at)
      SELECT $1, forecast_date, MAX(COALESCE(published_at, uploaded_at)), NOW()
      FROM ${table}
      WHERE status = 'published'
      GROUP BY forecast_date
      ORDER BY forecast_date DESC, MAX(COALESCE(published_at, uploaded_at)) DESC
      LIMIT 1
      ON CONFLICT (species) DO NOTHING
    `, [species]);
  }
  await pool.query(`
    ALTER TABLE fish_forecast_hotspots
      ADD COLUMN IF NOT EXISTS environmental_data JSONB NOT NULL DEFAULT '{}'::jsonb
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS news_events_published_at_idx ON news_events(published_at DESC);
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';

    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS token TEXT;
  `);
}

export async function deleteExpiredForecastFiles() {
  const result = await pool.query(`
    WITH deleted_files AS (
      DELETE FROM fish_forecast_files
      WHERE uploaded_at < NOW() - INTERVAL '8 days'
      RETURNING id
    ), deleted_legacy_shapes AS (
      DELETE FROM fish_forecast_shapes
      WHERE uploaded_at < NOW() - INTERVAL '8 days'
      RETURNING id
    ), deleted_yellowfin AS (
      DELETE FROM yellowfin_forecast_shapes
      WHERE expires_at IS NOT NULL AND expires_at <= NOW()
      RETURNING id
    ), deleted_bigeye AS (
      DELETE FROM bigeye_forecast_shapes
      WHERE expires_at IS NOT NULL AND expires_at <= NOW()
      RETURNING id
    ), deleted_skipjack AS (
      DELETE FROM skipjack_forecast_shapes
      WHERE expires_at IS NOT NULL AND expires_at <= NOW()
      RETURNING id
    )
    SELECT
      (SELECT COUNT(*) FROM deleted_files) +
      (SELECT COUNT(*) FROM deleted_legacy_shapes) +
      (SELECT COUNT(*) FROM deleted_yellowfin) +
      (SELECT COUNT(*) FROM deleted_bigeye) +
      (SELECT COUNT(*) FROM deleted_skipjack) AS count
  `);
  const publicationResult = await pool.query(`
    DELETE FROM fish_forecast_publications publication
    WHERE NOT EXISTS (
      SELECT 1 FROM yellowfin_forecast_shapes shape
    WHERE shape.forecast_date = publication.forecast_date AND shape.status = 'published'
        AND publication.species = 'yellowfin'
      UNION ALL
      SELECT 1 FROM bigeye_forecast_shapes shape
    WHERE shape.forecast_date = publication.forecast_date AND shape.status = 'published'
        AND publication.species = 'bigeye'
      UNION ALL
      SELECT 1 FROM skipjack_forecast_shapes shape
    WHERE shape.forecast_date = publication.forecast_date AND shape.status = 'published'
        AND publication.species = 'skipjack'
    )
    RETURNING species
  `);

  const deletedCount = Number(result.rows[0]?.count || 0) + publicationResult.rowCount;
  if (deletedCount > 0) {
    console.log(`Deleted ${deletedCount} expired fish forecast file(s).`);
  }

  return deletedCount;
}