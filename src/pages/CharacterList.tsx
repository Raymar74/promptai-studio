import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getCharacters, createCharacter, importCharacterPack } from "@/lib/character";
import { CharacterProfile, CharacterPackExport } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCog, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function CharacterListPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) return;
    getCharacters(user.id).then(data => {
      setCharacters(data);
      setLoading(false);
    }).catch(e => {
      toast.error(e.message);
      setLoading(false);
    });
  }, [user]);

  const handleCreate = () => {
    nav('/character/forge');
  };

  return (
    <div className="container max-w-5xl py-10 md:py-16 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">Estudio</p>
          <h1 className="font-display text-4xl">Tus Personajes</h1>
        </div>
      <div className="flex flex-wrap gap-3">
          <Button onClick={handleCreate} disabled={creating} className="shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
            {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Nuevo Personaje
          </Button>
          <label className="inline-flex">
            <Button variant="outline" asChild>
              <span className="cursor-pointer gap-2">
                <Upload className="h-4 w-4" /> Importar JSON
              </span>
            </Button>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                e.target.value = "";
                try {
                  const text = await file.text();
                  const pack: CharacterPackExport = JSON.parse(text);
                  if (!pack.pack_format_version || !pack.character?.name) {
                    toast.error("Archivo inválido: no es un Character Pack.");
                    return;
                  }
                  const created = await importCharacterPack(user.id, pack);
                  setCharacters((prev) => [created, ...prev]);
                  toast.success(`Personaje "${created.name}" importado`);
                } catch (err: any) {
                  toast.error(err.message || "Error al importar");
                }
              }}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm animate-in fade-in">Cargando...</p>
      ) : characters.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both border-primary/20 bg-primary/5">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <UserCog className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-display mb-2">Comienza tu historia</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Para generar contenido, primero necesitas un personaje. Puedes crearlo desde cero o usar nuestra IA para que te ayude a definir su personalidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleCreate} disabled={creating} size="lg" className="px-8">
              <Plus className="h-4 w-4 mr-2" /> Crear Personaje
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
          {characters.map((c) => (
            <Link key={c.id} to={`/character/${c.id}`}>
              <Card className="p-6 h-full flex flex-col items-center text-center border-primary/10 hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 group">
                <div className="w-24 h-24 mb-4 rounded-full bg-background border-2 border-border group-hover:border-primary/50 transition-colors overflow-hidden flex items-center justify-center relative shadow-sm">
                  {c.reference_image_url ? (
                    <img src={c.reference_image_url} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCog className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <h3 className="font-display text-xl mb-1 group-hover:text-primary transition-colors">{c.name}</h3>
                <p className="text-sm text-muted-foreground">{c.occupation || "Sin ocupación"}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
