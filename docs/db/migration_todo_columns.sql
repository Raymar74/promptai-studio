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
-- Listo!
-- ============================================================
