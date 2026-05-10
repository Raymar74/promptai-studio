
ALTER TABLE public.character_profiles
  ADD COLUMN IF NOT EXISTS reference_image_url text,
  ADD COLUMN IF NOT EXISTS reference_image_description text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('character-refs', 'character-refs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "char-refs read public"
ON storage.objects FOR SELECT
USING (bucket_id = 'character-refs');

CREATE POLICY "char-refs insert own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'character-refs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "char-refs update own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'character-refs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "char-refs delete own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'character-refs' AND auth.uid()::text = (storage.foldername(name))[1]);
