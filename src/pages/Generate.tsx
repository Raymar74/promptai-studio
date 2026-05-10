import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getCharacters } from "@/lib/character";
import { generateContentPack } from "@/lib/gemini";
import { CharacterProfile, Platform, PackContent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, Loader2, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpTooltip } from "@/components/HelpTooltip";

const schema = z.object({
  topic: z.string().trim().min(3, "Cuéntame un poco más").max(500),
  script_duration: z.number().min(5, "El guion debe durar al menos 5s"),
  clip_duration: z.number().min(5, "El clip debe durar al menos 5s"),
  wpm_factor: z.number().min(0.5).max(1.0),
  humor_intensity: z.number().min(0).max(100),
  hook_hint: z.string().max(280).optional(),
});

export default function GeneratePage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [character, setCharacter] = useState<CharacterProfile | null>(null);
  const [topic, setTopic] = useState(searchParams.get("topic") ?? "");
  const [scriptDurationStr, setScriptDurationStr] = useState(searchParams.get("script") ?? "30");
  const [customScriptDuration, setCustomScriptDuration] = useState("");
  const [clipDurationStr, setClipDurationStr] = useState(searchParams.get("clip") ?? "10");
  const [customClipDuration, setCustomClipDuration] = useState("");
  const [wpmFactor, setWpmFactor] = useState(0.8);
  const [humor, setHumor] = useState(
    searchParams.get("humor") ? Number(searchParams.get("humor")) : 60,
  );
  const [hookHint, setHookHint] = useState(searchParams.get("hook") ?? "");
  const isRetry = searchParams.get("retry") === "1";
  const [busy, setBusy] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    getCharacters(userId)
      .then((list) => {
        if (list.length === 0) {
          toast.error("Debes crear un personaje primero");
          nav("/characters");
          return;
        }
        setCharacters(list);
        const initialChar = list[0];
        setCharacter(initialChar);
        if (!searchParams.get("humor")) setHumor(initialChar.default_humor);
      })
      .catch((e) => toast.error(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);



  const generate = async () => {
    if (!character || !user) return;
    const script_duration = scriptDurationStr === "custom" ? Number(customScriptDuration) : Number(scriptDurationStr);
    const clip_duration = clipDurationStr === "custom" ? Number(customClipDuration) : Number(clipDurationStr);

    const parsed = schema.safeParse({ topic, script_duration, clip_duration, wpm_factor: wpmFactor, humor_intensity: humor, hook_hint: hookHint || undefined });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    try {
      const pack: PackContent = await generateContentPack({ ...parsed.data, character });

      const { data: saved, error: e2 } = await supabase
        .from("content_packs")
        .insert({
          user_id: user.id,
          character_id: character.id,
          topic: parsed.data.topic,
          platform: "video",
          format: `${parsed.data.script_duration}s / ${parsed.data.clip_duration}s`,
          humor_intensity: parsed.data.humor_intensity,
          hook_hint: parsed.data.hook_hint ?? null,
          content: pack as any,
        })
        .select("id")
        .single();
      if (e2) throw e2;
      toast.success("Paquete listo");
      nav(`/pack/${saved.id}`);
    } catch (e: any) {
      if (e.message === "NO_API_KEY") {
        toast.error("Falta la clave de Gemini", {
          description: "Ve a Ajustes para configurar tu clave gratuita.",
          action: { label: "Ir a Ajustes", onClick: () => nav("/settings") }
        });
      } else {
        toast.error(e.message ?? "Error generando");
      }
    } finally {
      setBusy(false);
    }
  };

  const humorLabel =
    humor < 30 ? "sutil" : humor < 60 ? "moderado" : humor < 85 ? "marcado" : "humor negro / doble sentido";

  return (
    <div className="container max-w-3xl py-10 md:py-16 animate-in fade-in duration-700">
      <div className="mb-10 animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">
          {isRetry ? "Reintentar generación" : "Nuevo paquete"}
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-balance mb-3">
          {isRetry
            ? `Ajusta y vuelve a generar con ${character?.name ?? "tu personaje"}`
            : `¿Qué te explica hoy ${character?.name ?? "tu personaje"}?`}
        </h1>
        <p className="text-muted-foreground max-w-xl">
          {isRetry
            ? "Cambia el tema, las duraciones o la intensidad psicológica. El resto de la configuración se mantiene."
            : "Describe la idea, define las duraciones y obtén guion, prompt maestro y prompts I2V para LTX, listos para producir."}
        </p>
      </div>

      <Card className="p-6 md:p-8 space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="space-y-3">
          <Label className="text-base">Selecciona un personaje</Label>
          <div className="flex flex-wrap gap-4">
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCharacter(c);
                  if (!searchParams.get("humor")) setHumor(c.default_humor);
                }}
                className={cn(
                  "flex flex-col items-center gap-2 p-2 rounded-lg border-2 transition-all",
                  character?.id === c.id
                    ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                    : "border-transparent hover:border-border hover:bg-background/50"
                )}
                type="button"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-border bg-background flex items-center justify-center">
                  {c.reference_image_url ? (
                    <img src={c.reference_image_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCog className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <span className="text-xs font-medium max-w-[80px] truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="topic" className="text-base">Tema o idea</Label>
          <Textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="ej: paradoja de los gemelos pero contada como chisme de barrio..."
            rows={4}
            maxLength={500}
            className="resize-none min-h-[120px] text-lg leading-relaxed bg-background/50 focus-visible:bg-background transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Duración total del guion</Label>
            <Select value={scriptDurationStr} onValueChange={setScriptDurationStr}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 segundos</SelectItem>
                <SelectItem value="30">30 segundos</SelectItem>
                <SelectItem value="60">60 segundos</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            {scriptDurationStr === "custom" && (
              <Input type="number" placeholder="Segundos" value={customScriptDuration} onChange={(e) => setCustomScriptDuration(e.target.value)} className="mt-2" />
            )}
          </div>
          <div className="space-y-3">
            <Label>Duración por clip</Label>
            <Select value={clipDurationStr} onValueChange={setClipDurationStr}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 segundos</SelectItem>
                <SelectItem value="10">10 segundos</SelectItem>
                <SelectItem value="15">15 segundos</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
            {clipDurationStr === "custom" && (
              <Input type="number" placeholder="Segundos" value={customClipDuration} onChange={(e) => setCustomClipDuration(e.target.value)} className="mt-2" />
            )}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Factor de Seguridad WPM</Label>
              <HelpTooltip content="Ajusta la densidad del guion. Un valor menor (0.7) genera menos palabras para clips lentos o con pausas. Un valor mayor (1.0) usa la capacidad máxima de habla del personaje." />
            </div>
            <span className="text-sm font-medium text-primary">{wpmFactor}</span>
          </div>
          <Slider value={[wpmFactor]} min={0.5} max={1.0} step={0.1} onValueChange={(v) => setWpmFactor(v[0])} className="py-2" />
          <p className="text-xs text-muted-foreground">Ajusta la cantidad de palabras por clip según tu velocidad de lectura (menor = menos palabras, más pausas).</p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Intensidad de Rasgos Psicológicos</Label>
              <HelpTooltip content="Define qué tanto se verán reflejados los arquetipos, traumas y vicios del personaje en el guion. 'Humor negro' forzará un tono más ácido si el personaje lo permite." />
            </div>
            <span className="text-sm font-medium text-primary">{humor} · {humorLabel}</span>
          </div>
          <Slider value={[humor]} min={0} max={100} step={5} onValueChange={(v) => setHumor(v[0])} className="py-2" />
        </div>

        <div className="space-y-3">
          <Label htmlFor="hook">Gancho sugerido <span className="text-muted-foreground font-normal">(opcional)</span></Label>
          <Input
            id="hook"
            value={hookHint}
            onChange={(e) => setHookHint(e.target.value)}
            placeholder="ej: abre con una pregunta incómoda sobre el tiempo"
            maxLength={280}
            className="h-11 bg-background/50 focus-visible:bg-background transition-colors"
          />
        </div>

        <div className="chalk-divider my-6 opacity-50" />

        <Button className="w-full h-14 text-lg font-medium tracking-wide shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)]" onClick={generate} disabled={busy || !character}>
          {busy ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Generando la magia…</> : <><Sparkles className="h-5 w-5 mr-2" /> Generar paquete de contenido</>}
        </Button>
      </Card>
    </div>
  );
}