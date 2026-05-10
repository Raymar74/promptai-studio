import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TagInput } from "@/components/TagInput";
import { getCharacterById, updateCharacterProfile, rebuildFullProfileFromFlat, exportCharacterPack } from "@/lib/character";
import { CharacterProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Save, Upload, Loader2, Trash2, Music, Download } from "lucide-react";
import { HelpTooltip } from "@/components/HelpTooltip";

export default function CharacterPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const nav = useNavigate();
  const [c, setC] = useState<CharacterProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    if (!userId || !id) return;
    getCharacterById(id).then(data => {
      if (!data) {
        toast.error("Personaje no encontrado");
        nav("/characters");
        return;
      }

      // Pre-populate empty flat fields from full_profile JSONB (populated by the Forge)
      const fp = data.full_profile;
      const enriched = { ...data };
      if (fp) {
        if (!enriched.voice_tone && fp.voz_y_lenguaje?.tono_general)
          enriched.voice_tone = fp.voz_y_lenguaje.tono_general;
        if (!enriched.catchphrases?.length && fp.voz_y_lenguaje?.latiguillos?.length)
          enriched.catchphrases = fp.voz_y_lenguaje.latiguillos;
        if (!enriched.avoid_words?.length && fp.dialecto?.exclusiones_dialectales?.length)
          enriched.avoid_words = fp.dialecto.exclusiones_dialectales;
        if (!enriched.notes && fp.reglas_maestras?.instruccion_maestra)
          enriched.notes = fp.reglas_maestras.instruccion_maestra;
        if ((!enriched.wpm || enriched.wpm === 140) && fp.voz_y_lenguaje?.velocidad_habla_wpm)
          enriched.wpm = fp.voz_y_lenguaje.velocidad_habla_wpm;
        if (!enriched.style_words && fp.apariencia?.prompt_visual_base)
          enriched.style_words = fp.apariencia.prompt_visual_base;
      }
      setC(enriched);
    }).catch((e) => toast.error(e.message));
  }, [userId, id, nav]);

  if (!c) return <div className="container py-16 text-muted-foreground text-sm">Cargando…</div>;

  const update = <K extends keyof CharacterProfile>(k: K, v: CharacterProfile[K]) => setC({ ...c, [k]: v });
  const arrField = (k: keyof CharacterProfile, v: string) =>
    update(k, v.split("\n").map((s) => s.trim()).filter(Boolean) as any);

  const save = async () => {
    setBusy(true);
    // Sync flat fields back into full_profile JSONB so it stays up-to-date
    const updatedFullProfile = rebuildFullProfileFromFlat(c);
    const updatedProfile = { ...c, full_profile: updatedFullProfile };
    try {
      const saved = await updateCharacterProfile(updatedProfile);
      setC(saved);
      toast.success("Ficha guardada");
    } catch (e: any) {
      toast.error(e.message ?? "Error al guardar");
    }
    setBusy(false);
  };

  const handleExport = () => {
    const pack = exportCharacterPack(c);
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.name.replace(/\s+/g, "_").toLowerCase()}_v${c.version ?? "1.0"}.character.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Personaje exportado como JSON");
  };

  // ── Image upload ────────────────────────────────────────────────────────────
  const onUploadRef = async (file: File) => {
    if (!user || !c) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Imagen demasiado grande (máx 8MB)"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${c.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("character-refs").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("character-refs").getPublicUrl(path);
      const url = pub.publicUrl;
      setC({ ...c, reference_image_url: url });
      await supabase.from("character_profiles").update({ reference_image_url: url }).eq("id", c.id);
      toast.success("Imagen subida");
    } catch (e: any) {
      toast.error(e.message ?? "Error subiendo imagen");
    } finally {
      setUploading(false);
    }
  };

  const removeRef = async () => {
    if (!c) return;
    setC({ ...c, reference_image_url: null });
    await supabase.from("character_profiles").update({ reference_image_url: null } as any).eq("id", c.id);
    toast.success("Referencia eliminada");
  };

  // ── Audio upload ────────────────────────────────────────────────────────────
  const onUploadAudio = async (file: File) => {
    if (!user || !c) return;
    if (file.size > 25 * 1024 * 1024) { toast.error("Archivo demasiado grande (máx 25MB)"); return; }
    setUploadingAudio(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp3";
      const path = `${user.id}/${c.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("character-voices").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("character-voices").getPublicUrl(path);
      const url = pub.publicUrl;
      setC({ ...c, voice_reference_url: url });
      await supabase.from("character_profiles").update({ voice_reference_url: url } as any).eq("id", c.id);
      toast.success("Audio de referencia subido");
    } catch (e: any) {
      toast.error(e.message ?? "Error subiendo audio");
    } finally {
      setUploadingAudio(false);
    }
  };

  const removeAudio = async () => {
    if (!c) return;
    setC({ ...c, voice_reference_url: null });
    await supabase.from("character_profiles").update({ voice_reference_url: null } as any).eq("id", c.id);
    toast.success("Audio eliminado");
  };

  return (
    <div className="container max-w-3xl py-10 md:py-16 space-y-8 animate-in fade-in duration-700">
      <div className="animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Ficha del personaje</p>
        <h1 className="font-display text-4xl md:text-5xl mb-3">
          {c.name}
          {c.version && (
            <span className="ml-2 text-sm text-muted-foreground">v{c.version}</span>
          )}
        </h1>
        <p className="text-muted-foreground text-lg">Lo que pongas aquí se inyecta automáticamente en cada generación.</p>
      </div>

      {/* ── Identidad ── */}
      <Card className="p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both border-primary/10 shadow-sm">
        <h2 className="font-display text-xl">Identidad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre"><Input value={c.name} onChange={(e) => update("name", e.target.value)} /></Field>
          <Field label="Ocupación"><Input value={c.occupation} onChange={(e) => update("occupation", e.target.value)} /></Field>
        </div>
        <Field label="Descripción / lore">
          <Textarea rows={3} value={c.description} onChange={(e) => update("description", e.target.value)} placeholder="ej: profesora joven, exalumna del CERN, vive en Madrid…" />
        </Field>
      </Card>

      {/* ── Voz ── */}
      <Card className="p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both border-primary/10 shadow-sm">
        <h2 className="font-display text-xl">Voz</h2>
        <Field label="Tono de voz">
          <Textarea rows={3} value={c.voice_tone} onChange={(e) => update("voice_tone", e.target.value)} />
        </Field>
        <Field label="Latiguillos (uno por línea)">
          <Textarea rows={3} value={c.catchphrases.join("\n")} onChange={(e) => arrField("catchphrases", e.target.value)} placeholder="A ver, físicamente hablando…" />
        </Field>
        <Field label="Referentes (uno por línea)">
          <Textarea rows={3} value={c.references_list.join("\n")} onChange={(e) => arrField("references_list", e.target.value)} />
        </Field>
        <Field label="Palabras / temas a evitar (uno por línea)">
          <Textarea rows={3} value={c.avoid_words.join("\n")} onChange={(e) => arrField("avoid_words", e.target.value)} placeholder="palabras que el personaje no usa nunca" />
        </Field>

        {/* WPM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <Field label="Velocidad de habla (WPM)" tooltip="Palabras por Minuto. Valor crítico para el lip-sync. Una persona promedio habla a 140 WPM. Locutores rápidos llegan a 160+ WPM.">
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={60}
                max={300}
                value={c.wpm}
                onChange={(e) => update("wpm", Math.max(60, Math.min(300, Number(e.target.value) || 140)))}
                className="w-28 font-mono"
              />
              <span className="text-xs text-muted-foreground">palabras/min · default: 140</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">La IA usa este valor para calcular cuántas palabras caben por clip y no desincronizar el lip-sync.</p>
          </Field>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Intensidad de humor por defecto</Label>
              <span className="text-xs text-muted-foreground">{c.default_humor}</span>
            </div>
            <Slider value={[c.default_humor]} min={0} max={100} step={5} onValueChange={(v) => update("default_humor", v[0])} />
          </div>
        </div>

        {/* Audio reference */}
        <div className="space-y-3 border-t border-border/50 pt-4">
          <Label>Audio de referencia (para TTS / clonación de voz)</Label>
          <p className="text-xs text-muted-foreground">
            Sube un archivo de audio con la voz del personaje. Formatos soportados: MP3, WAV, M4A, OGG (máx 25 MB).
          </p>
          {c.voice_reference_url ? (
            <div className="space-y-3">
              <audio controls src={c.voice_reference_url} className="w-full h-10 rounded-md" />
              <div className="flex gap-2">
                <label className="inline-flex">
                  <Button type="button" variant="outline" size="sm" disabled={uploadingAudio} asChild>
                    <span className="cursor-pointer gap-2">
                      {uploadingAudio ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      Reemplazar
                    </span>
                  </Button>
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadAudio(f); e.target.value = ""; }} />
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={removeAudio} className="gap-2 text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" /> Quitar
                </Button>
              </div>
            </div>
          ) : (
            <label className="inline-flex">
              <Button type="button" variant="outline" disabled={uploadingAudio} asChild>
                <span className="cursor-pointer gap-2">
                  {uploadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Music className="h-4 w-4" />}
                  Subir audio de referencia
                </span>
              </Button>
              <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadAudio(f); e.target.value = ""; }} />
            </label>
          )}
        </div>
      </Card>

      {/* ── Producción visual ── */}
      <Card className="p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both border-primary/10 shadow-sm">
        <h2 className="font-display text-xl">Producción visual</h2>
        <div className="space-y-3 pb-2">
          <Label>Imagen de referencia del personaje</Label>
          <p className="text-xs text-muted-foreground">Sube una foto representativa para usar como miniatura y en el selector del generador.</p>
          {c.reference_image_url ? (
            <div className="flex gap-4 items-start">
              <img src={c.reference_image_url} alt="Referencia" className="w-32 h-32 object-cover rounded-md border border-border" />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex">
                    <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                      <span className="cursor-pointer gap-2">
                        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        Reemplazar
                      </span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadRef(f); e.target.value = ""; }} />
                  </label>
                  <Button type="button" variant="ghost" size="sm" onClick={removeRef} className="gap-2 text-muted-foreground">
                    <Trash2 className="h-3.5 w-3.5" /> Quitar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <label className="inline-flex">
              <Button type="button" variant="outline" disabled={uploading} asChild>
                <span className="cursor-pointer gap-2">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Subir imagen
                </span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadRef(f); e.target.value = ""; }} />
            </label>
          )}
        </div>
        <Field label="Trigger word del LoRA" tooltip="La palabra clave que activa la apariencia física del personaje en modelos como Stable Diffusion o Lora.">
          <Input value={c.lora_trigger} onChange={(e) => update("lora_trigger", e.target.value)} className="font-mono" />
        </Field>
        <Field label="Palabras de estilo recurrentes (en inglés)" tooltip="Tags visuales que definen el look del personaje (ej: 'long hair, glasses, casual wear'). Se inyectan en cada prompt visual.">
          <Textarea rows={2} value={c.style_words} onChange={(e) => update("style_words", e.target.value)} className="font-mono text-sm" />
        </Field>
        <Field label="Plantillas de cámara para LTX" tooltip="Estilos de movimiento de cámara preferidos para este personaje (ej: 'close-up, tilt-down').">
          <Textarea rows={2} value={c.camera_templates} onChange={(e) => update("camera_templates", e.target.value)} className="font-mono text-sm" />
        </Field>
      </Card>

      {/* ── Notas extra ── */}
      <Card className="p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both border-primary/10 shadow-sm">
        <h2 className="font-display text-xl">Notas de contexto para la IA</h2>
        <p className="text-xs text-muted-foreground -mt-4">Este texto se inyecta directamente en el prompt del sistema. Si creaste el personaje con el Forge, aquí aparece su instrucción maestra y psicología.</p>
        <Textarea rows={6} value={c.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Instrucción maestra, arquetipos, reglas de comportamiento…" />
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={save} disabled={busy} size="lg" className="h-12 px-8 text-base shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all">
          <Save className="h-4 w-4 mr-2" /> {busy ? "Guardando…" : "Guardar ficha"}
        </Button>
        <Button onClick={handleExport} variant="outline" size="lg" className="h-12 px-6 text-base">
          <Download className="h-4 w-4 mr-2" /> Exportar JSON
        </Button>
      </div>
    </div>
  );
}

function Field({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {tooltip && <HelpTooltip content={tooltip} />}
      </div>
      {children}
    </div>
  );
}