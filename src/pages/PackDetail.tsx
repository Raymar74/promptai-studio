import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ContentPack, PackContent, CarouselSlide, ThreadPost, isVideoContent, isCarouselContent, isThreadContent } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CopyButton from "@/components/CopyButton";
import HyperframesPreview from "@/components/HyperframesPreview";
import { ArrowLeft, Trash2, Video, Type, Hash, RefreshCw, Images, MessageSquare, FileText, Image, Play } from "lucide-react";
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
  const isVideo = isVideoContent(c);
  const isCarousel = isCarouselContent(c);
  const isThread = isThreadContent(c);

  const togglePublished = async (v: boolean) => {
    const { error } = await supabase
      .from("content_packs")
      .update({ published: v, published_at: v ? new Date().toISOString() : null })
      .eq("id", pack.id);
    if (error) { toast.error(error.message); return; }
    setPack({ ...pack, published: v, published_at: v ? new Date().toISOString() : null });
  };

  const updatePreviewHtml = async (newHtml: string) => {
    if (!pack) return;
    const newContent = { ...pack.content, preview_html: newHtml };
    const { error } = await supabase
      .from("content_packs")
      .update({ content: newContent })
      .eq("id", pack.id);
    
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("HTML actualizado");
    setPack({ ...pack, content: newContent as PackContent });
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
      platform: pack.platform,
    });
    if (pack.hook_hint) params.set("hook", pack.hook_hint);
    nav(`/?${params.toString()}`);
  };

  const getPlatformIcon = () => {
    if (isVideo) return <Video className="h-3.5 w-3.5 mr-1.5" />;
    if (isCarousel) return <Images className="h-3.5 w-3.5 mr-1.5" />;
    return <MessageSquare className="h-3.5 w-3.5 mr-1.5" />;
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
          <Badge variant="outline" className="text-xs">{getPlatformIcon()}{pack.platform} · {pack.format}</Badge>
          <Badge variant="outline" className="text-xs">humor {pack.humor_intensity}</Badge>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-balance mb-2">{c.title}</h1>
        <p className="text-muted-foreground">{c.summary}</p>
      </div>

      {/* VIDEO / REEL */}
      {isVideo && (
        <Tabs defaultValue="preview">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="preview"><Play className="h-3.5 w-3.5 mr-1.5" />Preview</TabsTrigger>
            <TabsTrigger value="script"><Type className="h-3.5 w-3.5 mr-1.5" />Guion</TabsTrigger>
            <TabsTrigger value="shots"><Video className="h-3.5 w-3.5 mr-1.5" />Tomas / I2V</TabsTrigger>
            <TabsTrigger value="caption"><Hash className="h-3.5 w-3.5 mr-1.5" />Caption</TabsTrigger>
            <TabsTrigger value="meta">Publicar</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-6 flex justify-center">
            <HyperframesPreview
              htmlContent={c.preview_html}
              onHtmlChange={updatePreviewHtml}
              aspectRatio="vertical"
            />
          </TabsContent>

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
            <CaptionSection caption={c.caption} hashtags={c.hashtags} />
          </TabsContent>

          <TabsContent value="meta" className="space-y-4 mt-6">
            <MetaSection pack={pack} togglePublished={togglePublished} updateLink={updateLink} remove={remove} />
          </TabsContent>
        </Tabs>
      )}

      {/* CAROUSEL */}
      {isCarousel && (
        <Tabs defaultValue="preview">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="preview"><Play className="h-3.5 w-3.5 mr-1.5" />Preview</TabsTrigger>
            <TabsTrigger value="slides"><Images className="h-3.5 w-3.5 mr-1.5" />Slides</TabsTrigger>
            <TabsTrigger value="cover"><Image className="h-3.5 w-3.5 mr-1.5" />Cover</TabsTrigger>
            <TabsTrigger value="caption"><Hash className="h-3.5 w-3.5 mr-1.5" />Caption</TabsTrigger>
            <TabsTrigger value="meta">Publicar</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-6 flex justify-center">
            <HyperframesPreview
              htmlContent={c.preview_html}
              onHtmlChange={updatePreviewHtml}
              aspectRatio="square"
            />
          </TabsContent>

          <TabsContent value="slides" className="space-y-4 mt-6">
            {c.slides.map((slide) => (
              <CarouselSlideCard key={slide.index} slide={slide} />
            ))}
          </TabsContent>

          <TabsContent value="cover" className="space-y-4 mt-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Prompt de imagen (Cover / Master)</h3>
                <CopyButton text={c.cover_image_prompt} />
              </div>
              <code className="block w-full text-xs bg-background/60 border border-border rounded px-3 py-3 font-mono leading-relaxed whitespace-pre-wrap break-words">
                {c.cover_image_prompt}
              </code>
            </Card>
            {c.first_comment && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Primer comentario (pinado</h3>
                  <CopyButton text={c.first_comment} />
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.first_comment}</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="caption" className="space-y-4 mt-6">
            <CaptionSection caption={c.caption} hashtags={c.hashtags} />
          </TabsContent>

          <TabsContent value="meta" className="space-y-4 mt-6">
            <MetaSection pack={pack} togglePublished={togglePublished} updateLink={updateLink} remove={remove} />
          </TabsContent>
        </Tabs>
      )}

      {/* THREAD */}
      {isThread && (
        <Tabs defaultValue="posts">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="posts"><MessageSquare className="h-3.5 w-3.5 mr-1.5" />Posts</TabsTrigger>
            <TabsTrigger value="caption"><Hash className="h-3.5 w-3.5 mr-1.5" />Caption</TabsTrigger>
            <TabsTrigger value="meta">Publicar</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4 mt-6">
            {c.posts.map((post) => (
            <ThreadPostCard key={post.index} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="caption" className="space-y-4 mt-6">
            <CaptionSection caption={c.caption} hashtags={c.hashtags} />
            {c.cover_image_prompt && (
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Prompt de imagen (Media</h3>
                  <CopyButton text={c.cover_image_prompt} />
                </div>
                <code className="block w-full text-xs bg-background/60 border border-border rounded px-3 py-3 font-mono leading-relaxed whitespace-pre-wrap break-words">
                  {c.cover_image_prompt}
                </code>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="meta" className="space-y-4 mt-6">
            <MetaSection pack={pack} togglePublished={togglePublished} updateLink={updateLink} remove={remove} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// ============================================================
// COMPONENTES COMPARTIDOS
// ============================================================

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

function ShotCard({ shot }: { shot: any }) {
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
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Prompt I2V Completo</p>
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
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Diálogo</p>
              <CopyButton text={shot.prompt_dialogo} />
            </div>
            <p className="text-sm leading-relaxed border-l-2 border-primary/50 pl-3 italic">{shot.prompt_dialogo}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function CarouselSlideCard({ index, slide }: { index: number; slide: CarouselSlide }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl text-primary">Slide #{slide.index}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Texto superpuesto</p>
            <CopyButton text={slide.overlay_text} />
          </div>
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-base font-medium text-center">{slide.overlay_text}</p>
          </Card>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Prompt de imagen (EN INGLÉS)</p>
            <CopyButton text={slide.image_prompt} />
          </div>
          <code className="block w-full text-xs bg-background/60 border border-border rounded px-3 py-2 font-mono leading-relaxed whitespace-pre-wrap break-words">
            {slide.image_prompt}
          </code>
        </div>
        
        {slide.alt_text && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Alt text</p>
            <p className="text-sm text-muted-foreground">{slide.alt_text}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function ThreadPostCard({ post }: { post: ThreadPost }) {
  const badge = post.is_hook ? (
    <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
      HOOK
    </Badge>
  ) : post.is_cta ? (
    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
      CTA
    </Badge>
  ) : null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl text-primary">#{post.index}</span>
          {badge}
        </div>
        <CopyButton text={post.content} />
      </div>
      
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
      
      {post.media_prompt && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Prompt de imagen (media)</p>
          <code className="block w-full text-xs bg-background/60 border border-border rounded px-3 py-2 font-mono leading-relaxed whitespace-pre-wrap break-words">
            {post.media_prompt}
          </code>
        </div>
      )}
    </Card>
  );
}

function CaptionSection({ caption, hashtags }: { caption: string; hashtags: string[] }) {
  return (
    <>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Caption</h3>
          <CopyButton text={caption} />
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{caption}</p>
      </Card>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Hashtags</h3>
          <CopyButton text={hashtags?.map((h) => `#${h}`).join(" ") ?? ""} label="Copiar todos" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {hashtags?.map((h, i) => <Badge key={i} variant="secondary" className="text-xs">#{h}</Badge>)}
        </div>
      </Card>
    </>
  );
}

function MetaSection({ pack, togglePublished, updateLink, remove }: {
  pack: ContentPack; togglePublished: (v: boolean) => Promise<void>; updateLink: (link: string) => Promise<void>; remove: () => Promise<void>;
}) {
  return (
    <>
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
    </>
  );
}
