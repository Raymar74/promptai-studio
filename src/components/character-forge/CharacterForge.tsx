import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CharacterProfileSchema, createEmptyDraftCharacter } from '@/types/character';
import { Sparkles, Save, X, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateCharacterProfile } from '@/lib/gemini';

import { Step1Identity } from './Step1Identity';
import { Step2Psychology } from './Step2Psychology';
import { Step3Voice } from './Step3Voice';
import { Step4Appearance } from './Step4Appearance';
import { Step5Rules } from './Step5Rules';

const DRAFT_KEY = 'character_forge_draft';

function loadDraftFromStorage(): Partial<CharacterProfileSchema> {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return createEmptyDraftCharacter();
}

interface CharacterForgeProps {
  onComplete: (character: CharacterProfileSchema) => void;
  onCancel: () => void;
}

export function CharacterForge({ onComplete, onCancel }: CharacterForgeProps) {
  const nav = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [hasDraftRecovered] = useState(() => !!localStorage.getItem(DRAFT_KEY));
  const [draft, setDraft] = useState<Partial<CharacterProfileSchema>>(loadDraftFromStorage);
  
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateDraft = (section: keyof CharacterProfileSchema, data: any) => {
    setDraft((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        ...data,
      },
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(c => c + 1);
    } else {
      // Finish
      onComplete(draft as CharacterProfileSchema);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(c => c - 1);
  };

  const handleExitClick = () => {
    setShowExitDialog(true);
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      toast.success('Borrador guardado. Se recuperará la próxima vez que entres al Forge.');
    } catch {
      toast.error('No se pudo guardar el borrador.');
    }
    setShowExitDialog(false);
    onCancel();
  };

  const handleDiscard = () => {
    localStorage.removeItem(DRAFT_KEY);
    onCancel();
  };

  const handleAiAutoFill = async () => {
    setIsGenerating(true);
    try {
      const profile = await generateCharacterProfile(draft);

      const newDraft = { ...draft };
      if (profile) {
        newDraft.nucleo_psicologico = profile.nucleo_psicologico;
        newDraft.psicometria = profile.psicometria;
        newDraft.voz_y_lenguaje = profile.voz_y_lenguaje;
        newDraft.dialecto = profile.dialecto;
        newDraft.humor = profile.humor;
        newDraft.apariencia = profile.apariencia;
        newDraft.reglas_maestras = profile.reglas_maestras;
        if (profile.dimension_humana) newDraft.dimension_humana = profile.dimension_humana;
        if (profile.gesticulacion) newDraft.gesticulacion = profile.gesticulacion;
      }

      setDraft(newDraft);
      // Auto-save the AI-filled draft to localStorage so it's not lost
      localStorage.setItem(DRAFT_KEY, JSON.stringify(newDraft));
      toast.success('Personaje autocompletado con IA');
      setShowExitDialog(false);
      setCurrentStep(2);
    } catch (e: any) {
      console.error(e);
      if (e.message === 'NO_API_KEY') {
        toast.error('Falta la clave de Gemini', {
          description: 'Ve a Ajustes para configurar tu clave gratuita.',
          action: { label: 'Ir a Ajustes', onClick: () => nav('/settings') }
        });
      } else {
        toast.error(e.message || 'Error al autocompletar personaje');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1Identity draft={draft.identidad} updateDraft={(data) => updateDraft('identidad', data)} />;
      case 2: return <Step2Psychology draft={draft} updateDraft={updateDraft} />;
      case 3: return <Step3Voice draft={draft} updateDraft={updateDraft} />;
      case 4: return <Step4Appearance draft={draft.apariencia} updateDraft={(data) => updateDraft('apariencia', data)} />;
      case 5: return <Step5Rules draft={draft.reglas_maestras} updateDraft={(data) => updateDraft('reglas_maestras', data)} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in zoom-in-95 duration-300">
      {hasDraftRecovered && (
        <div className="mb-4 px-4 py-2.5 rounded-md bg-primary/10 border border-primary/20 text-sm text-primary flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          Borrador recuperado automáticamente. Puedes continuar desde donde lo dejaste.
        </div>
      )}
      <Card className="border-2 border-slate-800 shadow-xl bg-slate-950/50 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Character Forge
            </CardTitle>
            <CardDescription>
              Paso {currentStep} de {totalSteps}: {
                ['Identidad Base', 'Psicología Profunda', 'Voz y Dialecto', 'Apariencia y Producción', 'Reglas Maestras'][currentStep - 1]
              }
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExitClick}>
              <X className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 min-h-[500px]">
          {renderStep()}
        </CardContent>

        <CardFooter className="flex justify-between border-t border-slate-800 pt-4">
          <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 1}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
          </Button>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowExitDialog(true)}>
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              Autocompletar con IA
            </Button>
            <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700">
              {currentStep === totalSteps ? 'Finalizar' : 'Siguiente'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Modal de Salida Incompleta */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Personaje Incompleto</DialogTitle>
            <DialogDescription>
              No has terminado de definir a tu personaje. ¿Qué te gustaría hacer?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button variant="default" className="w-full justify-start bg-indigo-600 hover:bg-indigo-700" onClick={handleAiAutoFill} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-5 h-5 mr-3 animate-spin text-yellow-300" /> : <Sparkles className="w-5 h-5 mr-3 text-yellow-300" />}
              <div className="text-left">
                <p className="font-semibold">{isGenerating ? "Generando..." : "Autocompletar con IA"}</p>
                <p className="text-xs text-indigo-200 font-normal">La IA deducirá el resto de la psicología y dialecto en base a lo que escribiste.</p>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleSaveDraft}>
              <Save className="w-5 h-5 mr-3 text-slate-400" />
              <div className="text-left">
                <p className="font-semibold">Guardar Borrador</p>
                <p className="text-xs text-slate-400 font-normal">Guarda tu progreso para continuar más tarde.</p>
              </div>
            </Button>
            <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30" onClick={handleDiscard}>
              <X className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-semibold">Descartar y Salir</p>
                <p className="text-xs font-normal">Se perderán todos los datos no guardados.</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
