-- Flash Fungi v2.0 — Clean Database Schema
-- Run this in Supabase SQL Editor (or via CLI: supabase db push)
--
-- Security model:
--   - Anon users: can read approved specimens, published field guides, published modules
--   - Authenticated users: can read all public data + write their own progress/sessions
--   - Service role (admin API): bypasses RLS for admin operations
--   - User emails/passwords: managed entirely by Supabase Auth (never stored in app tables)

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE specimen_status AS ENUM ('pending', 'approved', 'rejected', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE guide_status AS ENUM ('draft', 'published', 'review');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- SPECIMENS
-- ============================================================
CREATE TABLE IF NOT EXISTS specimens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species_name TEXT NOT NULL,
  genus TEXT NOT NULL,
  family TEXT NOT NULL,
  common_name TEXT,
  inaturalist_id TEXT UNIQUE NOT NULL,
  location TEXT,
  description TEXT,
  dna_sequenced BOOLEAN DEFAULT FALSE,
  status specimen_status DEFAULT 'pending',
  quality_score NUMERIC,
  admin_notes TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specimens_status ON specimens(status);
CREATE INDEX IF NOT EXISTS idx_specimens_species ON specimens(species_name);
CREATE INDEX IF NOT EXISTS idx_specimens_family ON specimens(family);
CREATE INDEX IF NOT EXISTS idx_specimens_genus ON specimens(genus);

-- ============================================================
-- SPECIMEN PHOTOS (normalized — replaces JSON photo ID arrays)
-- ============================================================
CREATE TABLE IF NOT EXISTS specimen_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specimen_id UUID NOT NULL REFERENCES specimens(id) ON DELETE CASCADE,
  inaturalist_photo_id TEXT NOT NULL,
  url TEXT NOT NULL,
  attribution TEXT,
  license TEXT NOT NULL DEFAULT 'CC-BY',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specimen_photos_specimen ON specimen_photos(specimen_id);

-- ============================================================
-- FIELD GUIDES (merged with species_hints — single source per species)
-- ============================================================
CREATE TABLE IF NOT EXISTS field_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species_name TEXT UNIQUE NOT NULL,
  common_name TEXT,
  genus TEXT NOT NULL,
  family TEXT NOT NULL,
  description TEXT DEFAULT '',
  ecology TEXT DEFAULT '',
  hints JSONB DEFAULT '[]'::JSONB,
  diagnostic_features JSONB DEFAULT '{}'::JSONB,
  comparison_species TEXT[] DEFAULT '{}',
  status guide_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_guides_species ON field_guides(species_name);
CREATE INDEX IF NOT EXISTS idx_field_guides_status ON field_guides(status);
CREATE INDEX IF NOT EXISTS idx_field_guides_family ON field_guides(family);

-- ============================================================
-- TRAINING MODULES
-- ============================================================
CREATE TABLE IF NOT EXISTS training_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT DEFAULT '📖',
  category TEXT NOT NULL,
  difficulty_level difficulty_level NOT NULL DEFAULT 'beginner',
  duration_minutes INT DEFAULT 20,
  content JSONB DEFAULT '{}'::JSONB,
  prerequisites TEXT[] DEFAULT '{}',
  unlocks TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER PROFILES
-- Linked to auth.users via id. Emails/passwords live ONLY in auth.users.
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'user',
  privacy_settings JSONB DEFAULT '{"show_stats": true, "show_achievements": true}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STUDY SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  mode TEXT NOT NULL,
  stats JSONB DEFAULT '{}'::JSONB,
  metadata JSONB,
  filters JSONB,
  difficulty_level TEXT DEFAULT 'mixed',
  is_complete BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON study_sessions(user_id);

-- ============================================================
-- USER PROGRESS (module completion)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  score NUMERIC,
  progress_data JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);

-- ============================================================
-- USER ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- SPECIMENS: public read for approved only
ALTER TABLE specimens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read approved specimens"
  ON specimens FOR SELECT USING (status = 'approved');
-- Admin writes use service role key (bypasses RLS)

-- SPECIMEN PHOTOS: readable if parent specimen is approved
ALTER TABLE specimen_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read photos of approved specimens"
  ON specimen_photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM specimens
    WHERE specimens.id = specimen_photos.specimen_id
    AND specimens.status = 'approved'
  ));

-- FIELD GUIDES: public read for published
ALTER TABLE field_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published field guides"
  ON field_guides FOR SELECT USING (status = 'published');

-- TRAINING MODULES: public read for published
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published modules"
  ON training_modules FOR SELECT USING (published = TRUE);

-- USER PROFILES: publicly readable, self-update only
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable"
  ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- STUDY SESSIONS: users own their data
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own sessions"
  ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions"
  ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions"
  ON study_sessions FOR UPDATE USING (auth.uid() = user_id);

-- USER PROGRESS: users own their data
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE USING (auth.uid() = user_id);

-- USER ACHIEVEMENTS: users own their data
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER (auto-update timestamps)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON specimens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON field_guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON training_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
