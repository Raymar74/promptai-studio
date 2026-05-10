import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentPack, Shot } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CopyButton from "@/components/CopyButton";
import { ArrowLeft, Trash2, Video, Type, Hash, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function PackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [pack, setPack] = useState<ContentPack | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!id) return;
    supabase.from("content_packs").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) toast.error(error.message);
      setPack(data as unknown as ContentPack);
      setLoading(false);
    });
  };
  useEffect(load, [id]);

  if (loading) return <div className="container py-16 text-muted-foreground text-sm">Cargando…</div>;
  if (!pack) return <div className="container py-16">No encontrado. <Link to="/library" className="text-primary">Volver</Link></div>;

  const c = pack.content;

  const togglePublished = async (v: boolean) => {
    const { error } = await supabase
      .from("content_packs")
      .update({ published: v, published_at: v ? new Date().toISOString() : null })
      .eq("id", pack.id);
    if (error) { toast.error(error.message); return; }
    setPack({ ...pack, published: v, published_at: v ? new Date().toISOString() : null });
  };

  const updateLink = async (link: string) => {
    const { error } = await supabase.from("content_packs").update({ published_link: link }).eq("id", pack.id);
    if (error) toast.error(error.message);
    else setPack({ ...pack, published_link: link });
  };

  const remove = async () => {
    if (!confirm("¿Borrar este paquete?")) return;
    const { error } = await supabase.from("content_packs").delete().eq("id", pack.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Borrado");
    nav("/library");
  };

  const regenerate = () => {
    const params = new URLSearchParams({
      retry: "1",
      topic: pack.topic,
      humor: String(pack.humor_intensity),
    });
    if (pack.hook_hint) params.set("hook", pack.hook_hint);
    nav(`/?${params.toString()}`);
  };

  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <Link to="/library" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Biblioteca
        </Link>
        <Button variant="outline" size="sm" onClick={regenerate} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Regenerar
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">{pack.platform} · {pack.format}</Badge>
          <Badge variant="outline" className="text-xs">humor {pack.humor_intensity}</Badge>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-balance mb-2">{c.title}</h1>
        <p className="text-muted-foreground">{c.summary}</p>
      </div>

      <Tabs defaultValue="script">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="script"><Type className="h-3.5 w-3.5 mr-1.5" />Guion</TabsTrigger>
          <TabsTrigger value="shots"><Video className="h-3.5 w-3.5 mr-1.5" />Tomas / I2V</TabsTrigger>
          <TabsTrigger value="caption"><Hash className="h-3.5 w-3.5 mr-1.5" />Caption</TabsTrigger>
          <TabsTrigger value="meta">Publicar</TabsTrigger>
        </TabsList>
            <TabsContent value="script" className="space-y-4 mt-6">
              <ScriptBlock label="Hook (0-3s)" text={c.script.hook} />
              <ScriptBlock label="Desarrollo" text={c.script.body} />
              <ScriptBlock label="Punchline / cierre" text={c.script.punchline} />
              <ScriptBlock label="Voz en off completa" text={c.script.voiceover_full} />
            </TabsContent>
            <TabsContent value="shots" className="space-y-4 mt-6">
              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-sm text-primary font-medium mb-2">Portada / keyframe principal</p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Prompt de imagen (LoRA)</p>
                    <PromptLine text={c.cover_image_prompt} />
                  </div>
                  {c.cover_i2v_prompt && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Prompt I2V (LTX)</p>
                      <PromptLine text={c.cover_i2v_prompt} />
                    </div>
                  )}
                </div>
              </Card>
              {c.shots?.map((s) => <ShotCard key={s.index} shot={s} />)}
            </TabsContent>

        <TabsContent value="caption" className="space-y-4 mt-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Caption</h3>
              <CopyButton text={c.caption} />
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.caption}</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Hashtags</h3>
              <CopyButton text={c.hashtags?.map((h) => `#${h}`).join(" ") ?? ""} label="Copiar todos" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.hashtags?.map((h, i) => <Badge key={i} variant="secondary" className="text-xs">#{h}</Badge>)}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="meta" className="space-y-4 mt-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marcar como publicado</p>
                <p className="text-xs text-muted-foreground">{pack.published_at ? `Desde ${new Date(pack.published_at).toLocaleString()}` : "Aún no publicado"}</p>
              </div>
              <Switch checked={pack.published} onCheckedChange={togglePublished} />
            </div>
          </Card>
          <Card className="p-5 space-y-2">
            <Label htmlFor="link">Link de la publicación</Label>
            <Input id="link" placeholder="https://…" defaultValue={pack.published_link ?? ""} onBlur={(e) => updateLink(e.target.value)} />
          </Card>
          <Button variant="destructive" onClick={remove} className="gap-1.5">
            <Trash2 className="h-4 w-4" /> Borrar paquete
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ScriptBlock({ label, text }: { label: string; text: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase tracking-wider text-primary font-medium">{label}</h3>
        <CopyButton text={text} />
      </div>
      <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
    </Card>
  );
}

function PromptLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 mt-1">
      <code className="flex-1 text-xs bg-background/60 border border-border rounded px-2 py-1.5 font-mono leading-relaxed break-words">{text}</code>
      <CopyButton text={text} />
    </div>
  );
}

function ShotCard({ shot }: { shot: Shot }) {
  const fullPrompt = `[Sujeto]: ${shot.prompt_sujeto}\n[VISUAL]: ${shot.prompt_visual}\n[DIÁLOGO]: ${shot.prompt_dialogo}\n[SONIDO]: ${shot.prompt_sonido}`;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl text-primary">#{shot.index}</span>
          <Badge variant="outline" className="text-xs">{shot.duration_seconds}s</Badge>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Prompt I2V Completo (Copiar para Video)</p>
            <CopyButton text={fullPrompt} />
          </div>
          <pre className="text-xs bg-background/60 border border-border rounded px-3 py-2 font-mono leading-relaxed whitespace-pre-wrap break-words">
            <span className="text-primary/70 font-bold">[Sujeto]:</span> {shot.prompt_sujeto}{"\n"}
            <span className="text-primary/70 font-bold">[VISUAL]:</span> {shot.prompt_visual}{"\n"}
            <span className="text-primary/70 font-bold">[DIÁLOGO]:</span> {shot.prompt_dialogo}{"\n"}
            <span className="text-primary/70 font-bold">[SONIDO]:</span> {shot.prompt_sonido}
          </pre>
        </div>

        {shot.prompt_dialogo && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Diálogo (Locución / Actuación)</p>
              <CopyButton text={shot.prompt_dialogo} />
            </div>
            <p className="text-sm leading-relaxed border-l-2 border-primary/50 pl-3 italic">{shot.prompt_dialogo}</p>
          </div>
        )}
      </div>
    </Card>
  );
}