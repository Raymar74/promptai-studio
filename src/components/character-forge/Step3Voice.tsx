import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

interface Step3Props {
  draft: any;
  updateDraft: (section: string, data: any) => void;
}

export function Step3Voice({ draft, updateDraft }: Step3Props) {
  const voz = draft?.voz_y_lenguaje || {};
  const dialecto = draft?.dialecto || {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-indigo-300">Voz y Registro</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tono General</Label>
            <Input 
              placeholder="Ej: Cercano, juguetón, seductor" 
              value={voz.tono_general || ''}
              onChange={e => updateDraft('voz_y_lenguaje', { tono_general: e.target.value })}
              className="bg-slate-900 border-slate-700"
            />
          </div>
          <div className="space-y-2">
            <Label>Registro</Label>
            <Input 
              placeholder="Ej: Coloquial culto" 
              value={voz.registro || ''}
              onChange={e => updateDraft('voz_y_lenguaje', { registro: e.target.value })}
              className="bg-slate-900 border-slate-700"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Latiguillos (Separados por coma)</Label>
          <Textarea 
            placeholder="Frases frecuentes (ej: 'mirá vos', 'tal cual', 'en fin')" 
            value={(voz.latiguillos || []).join(', ')}
            onChange={e => {
              const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              updateDraft('voz_y_lenguaje', { latiguillos: arr });
            }}
            className="bg-slate-900 border-slate-700 min-h-[80px]"
          />
        </div>
      </div>

      <div className="border-t border-slate-800 my-4" />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-indigo-300">Dialecto</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo de Dialecto</Label>
            <Input 
              placeholder="Ej: Porteño argentino (Rioplatense)" 
              value={dialecto.tipo_dialecto || ''}
              onChange={e => updateDraft('dialecto', { tipo_dialecto: e.target.value })}
              className="bg-slate-900 border-slate-700"
            />
          </div>
          <div className="space-y-4 pt-2">
            <Label>Intensidad del Dialecto: {dialecto.intensidad || 50}</Label>
            <Slider 
              min={0} max={100} step={5}
              value={[dialecto.intensidad || 50]}
              onValueChange={(vals) => updateDraft('dialecto', { intensidad: vals[0] })}
            />
            <p className="text-xs text-slate-400">0 = neutro, 100 = máximo regional</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Marcadores Obligatorios</Label>
            <Textarea 
              placeholder="Ej: voseo, yeísmo rehilado" 
              value={(dialecto.marcadores_obligatorios || []).join(', ')}
              onChange={e => {
                const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                updateDraft('dialecto', { marcadores_obligatorios: arr });
              }}
              className="bg-slate-900 border-slate-700"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-red-400">Exclusiones Dialectales</Label>
            <Textarea 
              placeholder="Palabras que NUNCA debe usar. Ej: 'tú', 'chévere'" 
              value={(dialecto.exclusiones_dialectales || []).join(', ')}
              onChange={e => {
                const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                updateDraft('dialecto', { exclusiones_dialectales: arr });
              }}
              className="bg-slate-900 border-slate-700 border-red-900/50 focus-visible:ring-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
