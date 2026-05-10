import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Step4Props {
  draft: any;
  updateDraft: (data: any) => void;
}

export function Step4Appearance({ draft, updateDraft }: Step4Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="space-y-2">
        <Label>Descripción Física Completa</Label>
        <Textarea 
          placeholder="Rasgos faciales, contextura, color de pelo, estilo..." 
          value={draft?.descripcion_fisica || ''}
          onChange={e => updateDraft({ descripcion_fisica: e.target.value })}
          className="bg-slate-900 border-slate-700 min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Elementos Identitarios (Firma Visual)</Label>
        <Textarea 
          placeholder="Rasgos visuales que NUNCA faltan. Ej: Gafas redondas metálicas, lunar en la mejilla..." 
          value={(draft?.elementos_identitarios || []).join(', ')}
          onChange={e => {
            const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
            updateDraft({ elementos_identitarios: arr });
          }}
          className="bg-slate-900 border-slate-700"
        />
        <p className="text-xs text-slate-400">Separados por comas.</p>
      </div>

      <div className="space-y-2">
        <Label>Prompt Visual Base (Generación de Imágenes AI)</Label>
        <Textarea 
          placeholder="Ej: Photorealistic, highly detailed face, 8k, cinematic lighting, shallow depth of field..." 
          value={draft?.prompt_visual_base || ''}
          onChange={e => updateDraft({ prompt_visual_base: e.target.value })}
          className="bg-slate-900 border-slate-700 min-h-[100px] font-mono text-sm"
        />
        <p className="text-xs text-indigo-300">Este prompt se usará junto con la descripción física si decides generar el avatar del personaje.</p>
      </div>

    </div>
  );
}
