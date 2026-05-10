export type Platform = "reel" | "carousel" | "thread" | "video" | string;

export type CharacterVisibility = 'private' | 'public' | 'listed';
export type CharacterLicense = 'personal' | 'free' | 'paid' | 'exclusive';

export interface CharacterProfile {
  id: string;
  user_id: string;
  name: string;
  occupation: string;
  description: string;
  voice_tone: string;
  catchphrases: string[];
  avoid_words: string[];
  references_list: string[];
  lora_trigger: string;
  style_words: string;
  camera_templates: string;
  default_humor: number;
  wpm: number;
  notes: string;
  created_at: string;
  updated_at: string;
  reference_image_url?: string | null;
  reference_image_description?: string | null;
  voice_reference_url?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  full_profile?: any | null;
  // Commercial metadata
  creator_id?: string | null;
  visibility?: CharacterVisibility;
  license_type?: CharacterLicense;
  version?: string;
  pack_format_version?: string;
}

/**
 * Portable export format for character trading/sharing.
 * Self-contained: includes all data needed to recreate the character.
 */
export interface CharacterPackExport {
  pack_format_version: string;
  exported_at: string;
  character: {
    name: string;
    occupation: string;
    description: string;
    voice_tone: string;
    catchphrases: string[];
    avoid_words: string[];
    references_list: string[];
    lora_trigger: string;
    style_words: string;
    camera_templates: string;
    default_humor: number;
    wpm: number;
    notes: string;
    version: string;
    license_type: CharacterLicense;
  };
  full_profile: any | null;
  assets: {
    reference_image_url?: string | null;
    voice_reference_url?: string | null;
  };
}

export interface Shot {
  index: number;
  duration_seconds: number;
  prompt_sujeto: string;
  prompt_visual: string;
  prompt_dialogo: string;
  prompt_sonido: string;
}

export interface PackContent {
  title: string;
  summary: string;
  script: { hook: string; body: string; punchline: string; voiceover_full: string };
  shots: Shot[];
  cover_image_prompt: string;
  cover_i2v_prompt: string;
  caption: string;
  hashtags: string[];
}

export interface ContentPack {
  id: string;
  user_id: string;
  character_id: string | null;
  topic: string;
  platform: Platform;
  format: string;
  humor_intensity: number;
  hook_hint: string | null;
  content: PackContent;
  published: boolean;
  published_at: string | null;
  published_link: string | null;
  created_at: string;
  updated_at: string;
}