import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Step1Props {
  draft: any;
  updateDraft: (data: any) => void;
}

export function Step1Identity({ draft, updateDraft }: Step1Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre / Apodo <span className="text-red-500">*</span></Label>
          <Input 
            id="nombre" 
            placeholder="Ej: Analía" 
            value={draft?.nombre || ''}
            onChange={e => updateDraft({ nombre: e.target.value })}
            className="bg-slate-900 border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edad">Edad Real <span className="text-red-500">*</span></Label>
          <Input 
            id="edad" 
            type="number" 
            placeholder="Ej: 30" 
            value={draft?.edad || ''}
            onChange={e => updateDraft({ edad: parseInt(e.target.value) })}
            className="bg-slate-900 border-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="genero">Género</Label>
          <Input 
            id="genero" 
            placeholder="Ej: Femenino" 
            value={draft?.genero || ''}
            onChange={e => updateDraft({ genero: e.target.value })}
            className="bg-slate-900 border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nacionalidad">Nacionalidad / Región <span className="text-red-500">*</span></Label>
          <Input 
            id="nacionalidad" 
            placeholder="Ej: Argentina, Buenos Aires" 
            value={draft?.nacionalidad || ''}
            onChange={e => updateDraft({ nacionalidad: e.target.value })}
            className="bg-slate-900 border-slate-700"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rol">Rol Principal / Oficio <span className="text-red-500">*</span></Label>
        <Input 
          id="rol" 
          placeholder="Ej: Profesora de Física / Divulgadora científica" 
          value={draft?.rol_principal || ''}
          onChange={e => updateDraft({ rol_principal: e.target.value })}
          className="bg-slate-900 border-slate-700"
        />
        <p className="text-xs text-slate-400">El rol define su léxico técnico dominante.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filosofia">Filosofía Declarada <span className="text-red-500">*</span></Label>
        <Textarea 
          id="filosofia" 
          placeholder="Lo que el personaje diría que cree. Su misión en sus propias palabras." 
          value={draft?.filosofia_declarada || ''}
          onChange={e => updateDraft({ filosofia_declarada: e.target.value })}
          className="bg-slate-900 border-slate-700 min-h-[100px]"
        />
      </div>
    </div>
  );
}
