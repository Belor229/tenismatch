-- Supabase (PostgreSQL) Schema for Tennis Platform

-- 1. Create custom types
DO $$ BEGIN
    CREATE TYPE ad_type AS ENUM ('partenaire', 'match', 'tournoi', 'materiel');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_level AS ENUM ('debutant', 'intermediaire', 'avance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_reason AS ENUM ('spam', 'harcelement', 'contenu_inapproprie', 'fraude', 'autre');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('nouveau', 'en_cours', 'traite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create tables
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  age INT NULL,
  city TEXT NULL,
  level user_level NULL,
  avatar_url TEXT NULL,
  bio TEXT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS ads (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type ad_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  location TEXT NULL,
  event_datetime TIMESTAMPTZ NULL,
  required_level user_level NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_ads_type ON ads(type);
CREATE INDEX IF NOT EXISTS idx_ads_city ON ads(city);
CREATE INDEX IF NOT EXISTS idx_ads_event_datetime ON ads(event_datetime);

CREATE TABLE IF NOT EXISTS ad_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ad_id BIGINT NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ad_id BIGINT NULL REFERENCES ads(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NULL,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  blocker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
  reported_ad_id BIGINT NULL REFERENCES ads(id) ON DELETE SET NULL,
  reason report_reason NOT NULL,
  description TEXT NULL,
  status report_status NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Note: In Supabase, you might want to disable RLS for direct access or define proper policies.
-- For V1 simplicity, you can run: 
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
-- (and repeat for all tables)
