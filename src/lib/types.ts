export type Platform = "video" | "reel" | "carousel" | "thread";

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
  creator_id?: string | null;
  visibility?: CharacterVisibility;
  license_type?: CharacterLicense;
  version?: string;
  pack_format_version?: string;
  is_draft?: boolean;
}

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

// ============================================================
// TIPOS COMPARTIDOS
// ============================================================

export interface Shot {
  index: number;
  duration_seconds: number;
  prompt_sujeto: string;
  prompt_visual: string;
  prompt_dialogo: string;
  prompt_sonido: string;
}

export interface VideoScript {
  hook: string;
  body: string;
  punchline: string;
  voiceover_full: string;
}

// ============================================================
// PLATFORM: VIDEO / REEL (existente)
// ============================================================

export interface VideoPackContent {
  platform: "video" | "reel";
  title: string;
  summary: string;
  script: VideoScript;
  shots: Shot[];
  cover_image_prompt: string;
  cover_i2v_prompt: string;
  caption: string;
  hashtags: string[];
}

// ============================================================
// PLATFORM: CAROUSEL (Carrusel de Instagram)
// ============================================================

export interface CarouselSlide {
  index: number;
  image_prompt: string;
  overlay_text: string;
  alt_text: string;
}

export interface CarouselPackContent {
  platform: "carousel";
  title: string;
  summary: string;
  slides: CarouselSlide[];
  cover_image_prompt: string;
  caption: string;
  hashtags: string[];
  first_comment?: string;
}

// ============================================================
// PLATFORM: THREAD (Hilo de X / LinkedIn)
// ============================================================

export interface ThreadPost {
  index: number;
  content: string;
  is_hook?: boolean;
  is_cta?: boolean;
  media_prompt?: string;
}

export interface ThreadPackContent {
  platform: "thread";
  title: string;
  summary: string;
  posts: ThreadPost[];
  cover_image_prompt?: string;
  caption: string;
  hashtags: string[];
}

// ============================================================
// UNION DISCRIMINADA (PackContent)
// ============================================================

export type PackContent = VideoPackContent | CarouselPackContent | ThreadPackContent;

// ============================================================
// ContentPack (en BD)
// ============================================================

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

// ============================================================
// Type Guards
// ============================================================

export function isVideoContent(p: PackContent): p is VideoPackContent {
  return p.platform === "video" || p.platform === "reel";
}

export function isCarouselContent(p: PackContent): p is CarouselPackContent {
  return p.platform === "carousel";
}

export function isThreadContent(p: PackContent): p is ThreadPackContent {
  return p.platform === "thread";
}
