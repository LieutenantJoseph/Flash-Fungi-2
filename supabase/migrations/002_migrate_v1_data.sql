-- Flash Fungi v1 → v2 Data Migration
-- Run this AFTER the v2 schema is created (001_initial_schema.sql)
-- Run this in Supabase SQL Editor using the service role connection
--
-- This script assumes:
--   1. The v2 tables already exist (from 001_initial_schema.sql)
--   2. The v1 tables still exist with their original names
--   3. You want to COPY data, not move it (v1 tables are left intact)
--
-- If your v1 tables have the SAME names as v2 (they do), you have two options:
--   Option A: Create the v2 schema in a NEW Supabase project and use this script
--             to migrate data via pg_dump/pg_restore or CSV export/import.
--   Option B: Rename v1 tables, create v2 tables, then run this migration.
--
-- Below is Option B — rename-then-migrate approach.

-- ============================================================
-- STEP 1: Rename existing v1 tables
-- ============================================================
-- Uncomment and run this block first if using Option B:
/*
ALTER TABLE IF EXISTS specimens RENAME TO v1_specimens;
ALTER TABLE IF EXISTS field_guides RENAME TO v1_field_guides;
ALTER TABLE IF EXISTS species_hints RENAME TO v1_species_hints;
ALTER TABLE IF EXISTS training_modules RENAME TO v1_training_modules;
ALTER TABLE IF EXISTS user_profiles RENAME TO v1_user_profiles;
ALTER TABLE IF EXISTS study_sessions RENAME TO v1_study_sessions;
ALTER TABLE IF EXISTS user_progress RENAME TO v1_user_progress;
ALTER TABLE IF EXISTS user_achievements RENAME TO v1_user_achievements;
*/

-- ============================================================
-- STEP 2: Run 001_initial_schema.sql to create v2 tables
-- ============================================================
-- (Do this before continuing)

-- ============================================================
-- STEP 3: Migrate specimens
-- ============================================================
/*
INSERT INTO specimens (
  species_name, genus, family, common_name, inaturalist_id,
  location, description, dna_sequenced, status, quality_score,
  admin_notes, approved_at, created_at, updated_at
)
SELECT
  species_name, genus, family, common_name, inaturalist_id,
  location, description, dna_sequenced,
  -- Cast text status to enum
  CASE
    WHEN status = 'approved' THEN 'approved'::specimen_status
    WHEN status = 'rejected' THEN 'rejected'::specimen_status
    WHEN status = 'archived' THEN 'archived'::specimen_status
    ELSE 'pending'::specimen_status
  END,
  quality_score,
  admin_notes, approved_at, created_at, updated_at
FROM v1_specimens
ON CONFLICT (inaturalist_id) DO NOTHING;
*/

-- ============================================================
-- STEP 4: Migrate specimen photos (from JSON arrays to rows)
-- ============================================================
/*
INSERT INTO specimen_photos (specimen_id, inaturalist_photo_id, url, license, position)
SELECT
  s2.id as specimen_id,
  photo_id::TEXT as inaturalist_photo_id,
  'https://inaturalist-open-data.s3.amazonaws.com/photos/' || photo_id || '/medium.jpg' as url,
  'CC-BY' as license,
  (row_number() OVER (PARTITION BY s1.id ORDER BY ordinality))::INT - 1 as position
FROM v1_specimens s1
CROSS JOIN LATERAL unnest(s1.selected_photos) WITH ORDINALITY AS t(photo_id, ordinality)
JOIN specimens s2 ON s2.inaturalist_id = s1.inaturalist_id
WHERE s1.selected_photos IS NOT NULL;
*/

-- ============================================================
-- STEP 5: Migrate field guides (merge with species_hints)
-- ============================================================
/*
-- First, insert from field_guides
INSERT INTO field_guides (
  species_name, common_name, genus, family,
  description, ecology, hints, diagnostic_features,
  comparison_species, status, created_at, updated_at
)
SELECT
  fg.species_name,
  fg.common_name,
  COALESCE(fg.genus, split_part(fg.species_name, ' ', 1)),
  COALESCE(fg.family, 'Unknown'),
  COALESCE(fg.description, ''),
  COALESCE(fg.ecology, ''),
  COALESCE(fg.hints, '[]'::JSONB),
  COALESCE(fg.diagnostic_features, '{}'::JSONB),
  COALESCE(fg.comparison_species, '{}'),
  'draft'::guide_status,
  fg.created_at,
  fg.updated_at
FROM v1_field_guides fg
ON CONFLICT (species_name) DO NOTHING;

-- Then, merge species_hints into field_guides where hints are missing
UPDATE field_guides fg
SET hints = sh.hints
FROM v1_species_hints sh
WHERE fg.species_name = sh.species_name
AND (fg.hints IS NULL OR fg.hints = '[]'::JSONB)
AND sh.hints IS NOT NULL;
*/

-- ============================================================
-- STEP 6: Migrate training modules
-- ============================================================
/*
INSERT INTO training_modules (
  id, title, icon, category, difficulty_level,
  duration_minutes, content, prerequisites, unlocks,
  published, created_at, updated_at
)
SELECT
  id, title, COALESCE(icon, '📖'), category,
  CASE
    WHEN difficulty_level = 'beginner' THEN 'beginner'::difficulty_level
    WHEN difficulty_level = 'intermediate' THEN 'intermediate'::difficulty_level
    WHEN difficulty_level = 'advanced' THEN 'advanced'::difficulty_level
    ELSE 'beginner'::difficulty_level
  END,
  COALESCE(duration_minutes, 20),
  COALESCE(content, '{}'::JSONB),
  COALESCE(prerequisites, '{}'),
  COALESCE(unlocks, '{}'),
  COALESCE(published, false),
  created_at, updated_at
FROM v1_training_modules
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================
-- STEP 7: Verify migration
-- ============================================================
/*
SELECT 'specimens' as tbl, count(*) FROM specimens
UNION ALL SELECT 'specimen_photos', count(*) FROM specimen_photos
UNION ALL SELECT 'field_guides', count(*) FROM field_guides
UNION ALL SELECT 'training_modules', count(*) FROM training_modules;
*/
