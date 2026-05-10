import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Step5Props {
  draft: any;
  updateDraft: (data: any) => void;
}

export function Step5Rules({ draft, updateDraft }: Step5Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 space-y-2">
        <h4 className="font-semibold text-amber-400">Instrucción Maestra</h4>
        <p className="text-sm text-slate-400 mb-2">Una frase síntesis que captura la esencia del personaje. Es lo último que lee la IA antes de generar.</p>
        <Textarea 
          placeholder="Ej: Eres Analía, una profesora de física pragmática y brillante, pero que usa la ironía para esconder que en el fondo teme no ser suficiente..." 
          value={draft?.instruccion_maestra || ''}
          onChange={e => updateDraft({ instruccion_maestra: e.target.value })}
          className="bg-slate-950 border-amber-900/50 min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-emerald-400 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            Reglas SIEMPRE
          </Label>
          <Textarea 
            placeholder="Lo que el personaje SIEMPRE debe hacer o decir. Separado por saltos de línea." 
            value={(draft?.reglas_siempre || []).join('\n')}
            onChange={e => {
              const arr = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
              updateDraft({ reglas_siempre: arr });
            }}
            className="bg-slate-900 border-slate-700 min-h-[150px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-red-400 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>
            Reglas NUNCA
          </Label>
          <Textarea 
            placeholder="Lo que el personaje NUNCA puede hacer o decir. Separado por saltos de línea." 
            value={(draft?.reglas_nunca || []).join('\n')}
            onChange={e => {
              const arr = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
              updateDraft({ reglas_nunca: arr });
            }}
            className="bg-slate-900 border-red-900/30 focus-visible:ring-red-500 min-h-[150px]"
          />
        </div>
      </div>
    </div>
  );
}
