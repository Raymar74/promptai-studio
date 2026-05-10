-- MIGRACION MAESTRA: Agregar TODAS las columnas faltantes a character_profiles
-- Ejecuta ESTE ARCHIVO COMPLETO en el SQL Editor de Supabase

-- ============================================================
-- 1. Columna full_profile JSONB (para el perfil completo del Forge)
-- ============================================================
ALTER TABLE public.character_profiles
ADD COLUMN IF NOT EXISTS full_profile JSONB DEFAULT '{}'::jsonb;

-- ============================================================
-- 2. Columnas de metadata comercial (para marketplace futuro)
-- ============================================================
ALTER TABLE public.character_profiles
  ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS license_type TEXT NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS pack_format_version TEXT NOT NULL DEFAULT '1';

-- Actualizar creator_id para filas existentes
UPDATE public.character_profiles SET creator_id = user_id WHERE creator_id IS NULL;

-- ============================================================
-- 3. Columna is_draft BOOLEAN (para borradores del Forge)
-- ============================================================
ALTER TABLE public.character_profiles
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- 4. Columnas de referencias adicionales (referencia de audio)
-- ============================================================
ALTER TABLE public.character_profiles
ADD COLUMN IF NOT EXISTS voice_reference_url TEXT;

-- ============================================================
-- Comentarios descriptivos (opcional)
-- ============================================================
COMMENT ON COLUMN public.character_profiles.full_profile 
IS 'Perfil completo CharacterProfileSchema en JSONB (del Character Forge)';

COMMENT ON COLUMN public.character_profiles.is_draft 
IS 'Indica si el personaje es un borrador incompleto';

COMMENT ON COLUMN public.character_profiles.creator_id 
IS 'ID del creador original (para marketplace)';

-- ============================================================
-- 5. Tabla character_history (para snapshots de versiones)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.character_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.character_profiles(id) ON DELETE CASCADE,
  profile_snapshot JSONB NOT NULL,
  version TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_character_history_char_id ON public.character_history (character_id);

-- ============================================================
-- 6. Storage Bucket para referencias de voz
-- ============================================================
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

-- ============================================================
-- 7. Indices adicionales
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_chars_visibility ON public.character_profiles(visibility) WHERE visibility != 'private';

-- ============================================================
-- Listo!
-- ============================================================
