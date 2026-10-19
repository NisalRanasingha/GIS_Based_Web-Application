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