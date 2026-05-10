-- Añadir columna JSONB para guardar el perfil psicológico completo sin perder datos
ALTER TABLE public.character_profiles
ADD COLUMN IF NOT EXISTS full_profile JSONB DEFAULT '{}'::jsonb;
