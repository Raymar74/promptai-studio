-- Migracion: Agregar columna is_draft para borradores de personajes
-- Fecha: Mayo 2026

-- 1. Agregar la columna con valor por defecto false
ALTER TABLE public.character_profiles
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT false;

-- 2. Actualizar triggers si es necesario (el trigger touch_updated_at ya existe)

-- 3. Comentario
COMMENT ON COLUMN public.character_profiles.is_draft IS 'Indica si el personaje es un borrador incompleto del Character Forge';
