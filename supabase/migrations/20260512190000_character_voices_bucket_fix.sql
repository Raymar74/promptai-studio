-- ============================================================
-- MIGRACIÓN: Crear bucket character-voices con policies CORRECTAS
-- ============================================================
-- Problema anterior: El índice era [0] pero character-refs usa [1]
-- Solución: Usar el MISMO índice [1] que funciona en character-refs
-- ============================================================

-- 1. Primero eliminar policies INCORRECTAS existentes (con índice [0])
DROP POLICY IF EXISTS "char-voices read public" ON storage.objects;
DROP POLICY IF EXISTS "char-voices insert own" ON storage.objects;
DROP POLICY IF EXISTS "char-voices update own" ON storage.objects;
DROP POLICY IF EXISTS "char-voices delete own" ON storage.objects;

-- 2. Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-voices', 'character-voices', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. Crear policies CORRECTAS usando índice [1]
--    (IGUAL QUE character-refs que SÍ FUNCIONA)
-- ============================================================

-- Policy: Lectura pública (todos pueden leer URLs de archivos de voz)
CREATE POLICY "char-voices read public"
ON storage.objects FOR SELECT
USING (bucket_id = 'character-voices');

-- Policy: Insertar solo en tu propia carpeta (índice [1])
CREATE POLICY "char-voices insert own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'character-voices' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Actualizar solo tus propios archivos (índice [1])
CREATE POLICY "char-voices update own"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'character-voices' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Eliminar solo tus propios archivos (índice [1])
CREATE POLICY "char-voices delete own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'character-voices' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
