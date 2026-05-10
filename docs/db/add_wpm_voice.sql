-- Migration: wpm per character + voice reference audio
-- Run this in the Supabase SQL Editor

ALTER TABLE public.character_profiles
  ADD COLUMN IF NOT EXISTS wpm INTEGER NOT NULL DEFAULT 140,
  ADD COLUMN IF NOT EXISTS voice_reference_url TEXT;

-- Storage bucket for voice reference files (public, like character-refs)
-- Public buckets serve files via URL without a SELECT policy.
-- A broad SELECT policy would let any client LIST all files — avoid that.
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-voices', 'character-voices', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "char-voices insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'character-voices' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "char-voices update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'character-voices' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "char-voices delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'character-voices' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
