CREATE TABLE IF NOT EXISTS news_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(220) NOT NULL,
  category VARCHAR(60) NOT NULL DEFAULT 'News',
  content TEXT NOT NULL,
  image_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS news_events_published_at_idx
  ON news_events(published_at DESC);

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

-- Published shapefiles are kept separately for each species and remain active
-- until a newer map is published. Multiple files can be staged for one date.
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
CREATE INDEX IF NOT EXISTS yellowfin_forecast_shapes_date_idx
  ON yellowfin_forecast_shapes(forecast_date DESC, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS bigeye_forecast_shapes_date_idx
  ON bigeye_forecast_shapes(forecast_date DESC, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS skipjack_forecast_shapes_date_idx
  ON skipjack_forecast_shapes(forecast_date DESC, uploaded_at DESC);

-- One active publication per species. Publishing a new map advances this
-- pointer, so the public service always shows the latest published map.
CREATE TABLE IF NOT EXISTS fish_forecast_publications (
  species VARCHAR(40) PRIMARY KEY CHECK (species IN ('yellowfin', 'bigeye', 'skipjack')),
  forecast_date DATE NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fish_forecast_publications_date_idx
  ON fish_forecast_publications(forecast_date DESC);