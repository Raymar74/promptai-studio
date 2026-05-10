
-- Character profiles (one or more characters per user)
CREATE TABLE public.character_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Analía',
  occupation TEXT NOT NULL DEFAULT 'Profesora de física',
  description TEXT NOT NULL DEFAULT '',
  voice_tone TEXT NOT NULL DEFAULT 'Cercana y divulgadora, con humor negro y doble sentido sutil. Habla de tú, usa analogías cotidianas.',
  catchphrases TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  avoid_words TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  references_list TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  lora_trigger TEXT NOT NULL DEFAULT 'analia_lora',
  style_words TEXT NOT NULL DEFAULT 'photorealistic, soft natural lighting, cinematic, shallow depth of field',
  camera_templates TEXT NOT NULL DEFAULT 'slow push-in, subtle parallax, handheld micro-movement',
  default_humor INTEGER NOT NULL DEFAULT 50,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own characters" ON public.character_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own characters" ON public.character_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own characters" ON public.character_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own characters" ON public.character_profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Content packs (generated)
CREATE TABLE public.content_packs (
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

CREATE POLICY "Users view own packs" ON public.content_packs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own packs" ON public.content_packs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own packs" ON public.content_packs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own packs" ON public.content_packs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_touch_character_profiles BEFORE UPDATE ON public.character_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_touch_content_packs BEFORE UPDATE ON public.content_packs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_packs_user_created ON public.content_packs(user_id, created_at DESC);
CREATE INDEX idx_chars_user ON public.character_profiles(user_id);
