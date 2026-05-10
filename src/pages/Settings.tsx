import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, ExternalLink, Save } from "lucide-react";

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("GEMINI_API_KEY");
    if (savedKey) {
      setGeminiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (!geminiKey.trim()) {
      localStorage.removeItem("GEMINI_API_KEY");
      toast.success("Clave de Gemini eliminada");
      return;
    }
    
    // Basic validation to check if it looks like a Gemini key (starts with AIza)
    if (!geminiKey.startsWith("AIza")) {
      toast.warning("La clave ingresada no parece ser una API Key de Google Gemini válida. Asegúrate de copiarla completa.");
    }
    
    localStorage.setItem("GEMINI_API_KEY", geminiKey.trim());
    toast.success("Clave guardada exitosamente en tu navegador");
  };

  return (
    <div className="container max-w-2xl py-10 md:py-16 animate-in fade-in duration-700">
      <div className="mb-10 animate-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        <p className="text-xs uppercase tracking-[0.3em] text-primary mb-3">
          Configuración
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-balance mb-3">
          Ajustes de Integración
        </h1>
        <p className="text-muted-foreground">
          Configura tus claves de acceso de Inteligencia Artificial. Por tu seguridad, 
          esta información solo se guarda localmente en tu navegador y no se envía a nuestros servidores.
        </p>
      </div>

      <Card className="p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-display">Google Gemini API</h2>
            <p className="text-sm text-muted-foreground">Requerida para analizar personajes y generar guiones.</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="gemini-key">API Key de Gemini</Label>
            <Input
              id="gemini-key"
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="font-mono bg-background/50 focus-visible:bg-background transition-colors"
            />
          </div>
          
          <div className="bg-primary/5 p-4 rounded-md border border-primary/10">
            <h3 className="text-sm font-medium text-primary mb-2 flex items-center gap-1.5">
              ¿No tienes una clave?
            </h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              Google ofrece acceso gratuito a sus modelos Gemini. Puedes obtener tu clave en 1 minuto desde Google AI Studio.
            </p>
            <Button variant="outline" size="sm" asChild className="text-xs">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                Obtener API Key Gratis <ExternalLink className="ml-1.5 h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} className="gap-2 shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
            <Save className="h-4 w-4" />
            Guardar Configuración
          </Button>
        </div>
      </Card>
    </div>
  );
}
