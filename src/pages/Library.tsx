import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ContentPack } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Search, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const platformLabel: Record<string, string> = {
  reel: "Reel",
  carousel: "Carrusel",
  thread: "Hilo",
};

export default function LibraryPage() {
  const { user } = useAuth();
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("content_packs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) { toast.error(error.message); return; }
        setPacks((data ?? []) as unknown as ContentPack[]);
        setLoading(false);
      });
  }, [user]);

  const filtered = packs.filter((p) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return p.topic.toLowerCase().includes(s) || p.content?.title?.toLowerCase().includes(s);
  });

  return (
    <div className="container max-w-5xl py-10 md:py-16 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Biblioteca</p>
          <h1 className="font-display text-4xl">Tus paquetes</h1>
        </div>
        <Link to="/"><Button className="shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]"><Sparkles className="h-4 w-4 mr-2" /> Nuevo paquete</Button></Link>
      </div>

      <div className="relative mb-8 max-w-md animate-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por tema o título…" className="pl-9 h-11 bg-background/50 focus-visible:bg-background transition-colors" />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Cargando…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">{packs.length === 0 ? "Aún no has generado nada." : "Nada coincide con tu búsqueda."}</p>
          {packs.length === 0 && <Link to="/"><Button><Sparkles className="h-4 w-4" /> Generar el primero</Button></Link>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          {filtered.map((p) => (
            <Link key={p.id} to={`/pack/${p.id}`}>
              <Card className="p-6 h-full border-primary/10 hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="text-xs bg-background/50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">{platformLabel[p.platform]} · {p.format}</Badge>
                  {p.published && <CheckCircle2 className="h-4 w-4 text-primary" />}
                </div>
                <h3 className="font-display text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">{p.content?.title || p.topic}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{p.content?.summary || p.topic}</p>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}