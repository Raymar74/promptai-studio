-- Migration: Commercial metadata fields for character marketplace
-- Run this in the Supabase SQL Editor

-- Ownership & visibility
ALTER TABLE public.character_profiles
  ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS license_type TEXT NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS pack_format_version TEXT NOT NULL DEFAULT '1';

-- Set creator_id = user_id for all existing rows (original creators)
UPDATE public.character_profiles SET creator_id = user_id WHERE creator_id IS NULL;

-- Index for future marketplace queries (public characters)
CREATE INDEX IF NOT EXISTS idx_chars_visibility ON public.character_profiles(visibility) WHERE visibility != 'private';
