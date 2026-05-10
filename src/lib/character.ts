import { supabase } from "@/integrations/supabase/client";
import { CharacterProfile, CharacterPackExport } from "./types";

const PACK_FORMAT_VERSION = "1";

export async function getCharacters(userId: string): Promise<CharacterProfile[]> {
  const { data, error } = await supabase
    .from("character_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as CharacterProfile[];
}

export async function getCharacterById(id: string): Promise<CharacterProfile | null> {
  const { data, error } = await supabase
    .from("character_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as CharacterProfile | null;
}

export async function createCharacter(userId: string): Promise<CharacterProfile> {
  const { data: created, error } = await supabase
    .from("character_profiles")
    .insert({
      user_id: userId,
      creator_id: userId,
      name: "Nuevo Personaje",
      occupation: "",
      description: "",
      voice_tone: "",
      catchphrases: [],
      avoid_words: [],
      references_list: [],
      lora_trigger: "",
      style_words: "",
      camera_templates: "",
      default_humor: 50,
      wpm: 140,
      notes: "",
    } as any)
    .select("*")
    .single();

  if (error) throw error;
  return created as CharacterProfile;
}

/**
 * Called from CharacterForgePage after the wizard completes.
 * Saves all AI-generated fields to the flat columns AND stores the full
 * CharacterProfileSchema object in the `full_profile` JSONB column.
 */
export async function saveCharacterProfile(userId: string, fullProfile: any): Promise<CharacterProfile> {
  const name = fullProfile?.identidad?.nombre || "Nuevo Personaje";
  const occupation = fullProfile?.identidad?.rol_principal || "";
  const description = fullProfile?.apariencia?.descripcion_fisica || "";
  const voiceTone = fullProfile?.voz_y_lenguaje?.tono_general || "";
  const wpm = fullProfile?.voz_y_lenguaje?.velocidad_habla_wpm || 140;

  // Build a rich human-readable notes field so the content generator has a
  // useful text injection even without reading the JSONB column.
  const notesParts: string[] = [];
  if (fullProfile?.reglas_maestras?.instruccion_maestra)
    notesParts.push(`INSTRUCCIÓN MAESTRA:\n${fullProfile.reglas_maestras.instruccion_maestra}`);
  if (fullProfile?.nucleo_psicologico?.arquetipo_primario)
    notesParts.push(`Arquetipo: ${fullProfile.nucleo_psicologico.arquetipo_primario}`);
  if (fullProfile?.nucleo_psicologico?.sombra_junguiana)
    notesParts.push(`Sombra Junguiana: ${fullProfile.nucleo_psicologico.sombra_junguiana}`);
  if (fullProfile?.nucleo_psicologico?.motivacion_real)
    notesParts.push(`Motivación Real: ${fullProfile.nucleo_psicologico.motivacion_real}`);
  if (fullProfile?.nucleo_psicologico?.contradiccion_central)
    notesParts.push(`Contradicción Central: ${fullProfile.nucleo_psicologico.contradiccion_central}`);
  if (fullProfile?.dialecto?.tipo_dialecto)
    notesParts.push(`Dialecto: ${fullProfile.dialecto.tipo_dialecto}`);
  if (fullProfile?.humor?.tipos_activos?.length)
    notesParts.push(`Humor: ${fullProfile.humor.tipos_activos.join(", ")}`);
  if (fullProfile?.reglas_maestras?.reglas_siempre?.length)
    notesParts.push(`Siempre: ${fullProfile.reglas_maestras.reglas_siempre.join(" | ")}`);
  if (fullProfile?.reglas_maestras?.reglas_nunca?.length)
    notesParts.push(`Nunca: ${fullProfile.reglas_maestras.reglas_nunca.join(" | ")}`);
  if (fullProfile?.gesticulacion?.gestos_tipicos?.length)
    notesParts.push(`Gestos típicos: ${fullProfile.gesticulacion.gestos_tipicos.join(", ")}`);

  const { data: created, error } = await supabase
    .from("character_profiles")
    .insert({
      user_id: userId,
      creator_id: userId,
      name,
      occupation,
      description,
      voice_tone: voiceTone,
      catchphrases: fullProfile?.voz_y_lenguaje?.latiguillos || [],
      avoid_words: fullProfile?.dialecto?.exclusiones_dialectales || [],
      references_list: [],
      lora_trigger: "",
      style_words: fullProfile?.apariencia?.prompt_visual_base || "",
      camera_templates: "",
      default_humor: fullProfile?.humor?.intensidad || 50,
      wpm,
      notes: notesParts.join("\n"),
      full_profile: fullProfile,
      version: "1.0",
    } as any)
    .select("*")
    .single();

  if (error) throw error;
  return created as CharacterProfile;
}

// ── Export / Import ──────────────────────────────────────────────────────────

/**
 * Builds a portable, self-contained JSON pack from a character.
 * This is the "product" unit for future marketplace trading.
 */
export function exportCharacterPack(c: CharacterProfile): CharacterPackExport {
  return {
    pack_format_version: PACK_FORMAT_VERSION,
    exported_at: new Date().toISOString(),
    character: {
      name: c.name,
      occupation: c.occupation,
      description: c.description,
      voice_tone: c.voice_tone,
      catchphrases: c.catchphrases ?? [],
      avoid_words: c.avoid_words ?? [],
      references_list: c.references_list ?? [],
      lora_trigger: c.lora_trigger ?? "",
      style_words: c.style_words ?? "",
      camera_templates: c.camera_templates ?? "",
      default_humor: c.default_humor ?? 50,
      wpm: c.wpm ?? 140,
      notes: c.notes ?? "",
      version: c.version ?? "1.0",
      license_type: c.license_type ?? "personal",
    },
    full_profile: c.full_profile ?? null,
    assets: {
      reference_image_url: c.reference_image_url ?? null,
      voice_reference_url: c.voice_reference_url ?? null,
    },
  };
}

/**
 * Creates a new character from an imported pack JSON.
 * The imported character belongs to the importing user (new creator_id).
 */
export async function importCharacterPack(userId: string, pack: CharacterPackExport): Promise<CharacterProfile> {
  const ch = pack.character;

  const { data: created, error } = await supabase
    .from("character_profiles")
    .insert({
      user_id: userId,
      creator_id: userId,
      name: ch.name,
      occupation: ch.occupation,
      description: ch.description,
      voice_tone: ch.voice_tone,
      catchphrases: ch.catchphrases,
      avoid_words: ch.avoid_words,
      references_list: ch.references_list,
      lora_trigger: ch.lora_trigger,
      style_words: ch.style_words,
      camera_templates: ch.camera_templates,
      default_humor: ch.default_humor,
      wpm: ch.wpm,
      notes: ch.notes,
      full_profile: pack.full_profile,
      version: ch.version ?? "1.0",
      // Assets: URLs from the original creator's storage (read-only for now).
      // In a marketplace these would be copied to the buyer's bucket.
      reference_image_url: pack.assets?.reference_image_url ?? null,
      voice_reference_url: pack.assets?.voice_reference_url ?? null,
    } as any)
    .select("*")
    .single();

  if (error) throw error;
  return created as CharacterProfile;
}

/**
 * Rebuilds full_profile JSONB from the flat editor fields.
 * Called when saving from Character.tsx to keep full_profile in sync.
 */
export function rebuildFullProfileFromFlat(c: CharacterProfile): any {
  const existing = c.full_profile ?? {};
  return {
    ...existing,
    identidad: {
      ...(existing.identidad ?? {}),
      nombre: c.name,
      rol_principal: c.occupation,
    },
    voz_y_lenguaje: {
      ...(existing.voz_y_lenguaje ?? {}),
      tono_general: c.voice_tone,
      latiguillos: c.catchphrases,
      velocidad_habla_wpm: c.wpm,
    },
    dialecto: {
      ...(existing.dialecto ?? {}),
      exclusiones_dialectales: c.avoid_words,
    },
    humor: {
      ...(existing.humor ?? {}),
      intensidad: c.default_humor,
    },
    apariencia: {
      ...(existing.apariencia ?? {}),
      descripcion_fisica: c.description,
      prompt_visual_base: c.style_words,
    },
  };
}