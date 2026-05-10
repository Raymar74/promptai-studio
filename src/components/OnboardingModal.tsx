import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Video, UserPlus, Zap, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = [
  {
    title: "Bienvenido a PromptAI Studio",
    description: "La herramienta definitiva para creadores de contenido con IA. Diseñada para dar vida a personajes con profundidad psicológica y coherencia visual.",
    icon: <Sparkles className="w-12 h-12 text-primary" />,
  },
  {
    title: "1. Forja tu Personaje",
    description: "Usa el Character Forge para definir no solo cómo se ve, sino cómo habla y piensa. Puedes hacerlo manualmente o dejar que nuestra IA genere un perfil psicológico completo.",
    icon: <UserPlus className="w-12 h-12 text-amber-500" />,
  },
  {
    title: "2. Genera Contenido",
    description: "Escribe un tema y deja que la IA genere guiones optimizados, prompts visuales (I2V) y descripciones de sonido listos para usar en tus herramientas de video favoritas.",
    icon: <Zap className="w-12 h-12 text-blue-500" />,
  },
  {
    title: "3. Produce con Coherencia",
    description: "Copia los prompts generados a Runway, Luma o LTX. El WPM y el tono de voz están calibrados para que el resultado final sea profesional y sincronizado.",
    icon: <Video className="w-12 h-12 text-green-500" />,
  },
];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('promptai_onboarding_seen');
    if (!hasSeenOnboarding) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('promptai_onboarding_seen', 'true');
    setOpen(false);
  };

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleClose();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[500px] border-primary/20 bg-slate-950/95 backdrop-blur-xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10 animate-pulse">
            {STEPS[currentStep].icon}
          </div>
          <DialogTitle className="text-2xl font-display tracking-tight">
            {STEPS[currentStep].title}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-lg leading-relaxed">
            {STEPS[currentStep].description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? "w-8 bg-primary" : "w-2 bg-slate-800"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="ghost" onClick={prev}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
              </Button>
            )}
            <Button onClick={next} className="min-w-[100px] shadow-lg shadow-primary/20">
              {currentStep === STEPS.length - 1 ? "Comenzar" : "Siguiente"}
              {currentStep < STEPS.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
