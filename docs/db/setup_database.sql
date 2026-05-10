-- 1. Create character_profiles table
CREATE TABLE IF NOT EXISTS public.character_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Nuevo Personaje',
  occupation TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  voice_tone TEXT NOT NULL DEFAULT '',
  catchphrases TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  avoid_words TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  references_list TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  lora_trigger TEXT NOT NULL DEFAULT '',
  style_words TEXT NOT NULL DEFAULT '',
  camera_templates TEXT NOT NULL DEFAULT '',
  default_humor INTEGER NOT NULL DEFAULT 50,
  wpm INTEGER NOT NULL DEFAULT 140,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Add columns from migrations
ALTER TABLE public.character_profiles
  ADD COLUMN IF NOT EXISTS reference_image_url TEXT,
  ADD COLUMN IF NOT EXISTS reference_image_description TEXT,
  ADD COLUMN IF NOT EXISTS full_profile JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS voice_reference_url TEXT,
  ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS license_type TEXT NOT NULL DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS version TEXT NOT NULL DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS pack_format_version TEXT NOT NULL DEFAULT '1',
  ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT false;

-- Set creator_id = user_id for any existing rows
UPDATE public.character_profiles SET creator_id = user_id WHERE creator_id IS NULL;

ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users view own characters" ON public.character_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own characters" ON public.character_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users update own characters" ON public.character_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users delete own characters" ON public.character_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Create content_packs table
CREATE TABLE IF NOT EXISTS public.content_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES public.character_profiles(id) ON DELETE SET NULL,
  topic TEXT NOT NULL,
  platform TEXT NOT NULL,
  format TEXT NOT NULL,
  humor_intensity INTEGER NOT NULL DEFAULT 50,
  hook_hint TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  published_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content_packs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users view own packs" ON public.content_packs FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert own packs" ON public.content_packs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users update own packs" ON public.content_packs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users delete own packs" ON public.content_packs FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

DO $$ BEGIN
  CREATE TRIGGER trg_touch_character_profiles BEFORE UPDATE ON public.character_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_touch_content_packs BEFORE UPDATE ON public.content_packs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_packs_user_created ON public.content_packs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chars_user ON public.character_profiles(user_id);

-- 5. Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('character-refs', 'character-refs', true) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "char-refs read public" ON storage.objects FOR SELECT USING (bucket_id = 'character-refs');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "char-refs insert own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'character-refs' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "char-refs update own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'character-refs' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "char-refs delete own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'character-refs' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. Character History table (for version snapshots)
CREATE TABLE IF NOT EXISTS public.character_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID NOT NULL REFERENCES public.character_profiles(id) ON DELETE CASCADE,
  profile_snapshot JSONB NOT NULL,
  version TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_character_history_char_id ON public.character_history (character_id);

-- 7. Voice References Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('character-voices', 'character-voices', true) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "char-voices read public" ON storage.objects FOR SELECT USING (bucket_id = 'character-voices');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

-- Additional Indexes
CREATE INDEX IF NOT EXISTS idx_chars_visibility ON public.character_profiles(visibility) WHERE visibility != 'private';

-- Comments
COMMENT ON COLUMN public.character_profiles.full_profile IS 'Perfil completo CharacterProfileSchema en JSONB (del Character Forge)';
COMMENT ON COLUMN public.character_profiles.is_draft IS 'Indica si el personaje es un borrador incompleto';
COMMENT ON COLUMN public.character_profiles.creator_id IS 'ID del creador original (para marketplace)';
