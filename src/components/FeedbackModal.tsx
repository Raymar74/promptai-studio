import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageSquarePlus, Loader2 } from "lucide-react";

const FORMSPREE_URL = "https://formspree.io/f/mjglpwow";

export function FeedbackModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<string>("idea");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (message.trim().length < 10) {
      toast.error("Por favor, escribe un mensaje un poco más descriptivo.");
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: type,
          mensaje: message.trim(),
          usuario: user.email,
        }),
      });

      if (!response.ok) throw new Error("Error al enviar");

      toast.success("¡Gracias por tu aporte! Lo revisaremos pronto.");
      setOpen(false);
      setMessage("");
      setType("idea");
    } catch (e: any) {
      toast.error("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg border-primary/30 bg-background/80 backdrop-blur-sm hover:bg-primary/10 transition-all group"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-medium text-xs">Feedback</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Envíanos tu Feedback</DialogTitle>
          <DialogDescription>
            ¿Encontraste un error? ¿Tienes una idea para mejorar PromptAI Studio? Te escuchamos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de mensaje</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">💡 Sugerir una Mejora / Idea</SelectItem>
                <SelectItem value="bug">🐛 Reportar un Error (Bug)</SelectItem>
                <SelectItem value="other">💬 Otro comentario</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Tu mensaje</Label>
            <Textarea 
              placeholder="Explícanos un poco más..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={busy || message.trim().length === 0}>
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Enviar mensaje
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
