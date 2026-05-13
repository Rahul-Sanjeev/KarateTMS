-- ============================================================
-- Karate TMS — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'coach', 'scorer')),
  club_id TEXT,
  club_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT 'Men',
  age_group TEXT NOT NULL DEFAULT 'Senior',
  weight_class TEXT DEFAULT '',
  belt_level TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Clubs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  silver INTEGER DEFAULT 0,
  bronze INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Participants ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dob TEXT DEFAULT '',
  belt_rank TEXT DEFAULT 'White',
  weight TEXT DEFAULT '',
  gender TEXT DEFAULT 'Men',
  category_id TEXT,
  club_id TEXT,
  club_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Matches ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  category_id TEXT,
  round INTEGER,
  slot INTEGER,
  fighter1 JSONB,
  fighter2 JSONB,
  winner TEXT,
  winner_obj JSONB,
  scores JSONB DEFAULT '{"f1": 0, "f2": 0}',
  penalties JSONB DEFAULT '{}',
  senshu TEXT,
  status TEXT DEFAULT 'pending',
  is_bye BOOLEAN DEFAULT FALSE,
  is_third_place BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tournament Info (singleton row) ─────────────────────────
CREATE TABLE IF NOT EXISTS tournament_info (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT DEFAULT 'Karate Championship 2025',
  city TEXT DEFAULT '',
  date TEXT DEFAULT '',
  organizer TEXT DEFAULT '',
  durations JSONB DEFAULT '{"senior": 180, "junior": 120, "veteran": 120}',
  points JSONB DEFAULT '{"first": 5, "second": 3, "third": 1, "win": 1}'
);

-- Insert default tournament row
INSERT INTO tournament_info (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- ─── Row Level Security ──────────────────────────────────────
-- Disable RLS for now (using anon key for simplicity)
-- Enable these later if you need per-user access control

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_info ENABLE ROW LEVEL SECURITY;

-- Allow full access via anon key (for tournament admin use)
CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON clubs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tournament_info FOR ALL USING (true) WITH CHECK (true);
