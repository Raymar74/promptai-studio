-- Migration: character_history table for full version snapshots
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.character_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.character_profiles(id) ON DELETE CASCADE,
  profile_snapshot JSONB NOT NULL,
  version TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for quick lookup by character_id
CREATE INDEX IF NOT EXISTS idx_character_history_char_id ON public.character_history (character_id);
