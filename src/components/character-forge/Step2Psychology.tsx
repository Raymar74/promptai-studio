import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step2Props {
  draft: any;
  updateDraft: (section: string, data: any) => void;
}

const ARQUETIPOS = [
  "Héroe", "Rebelde", "Sabio", "Bufón", "Cuidador", "Explorador",
  "Amante", "Gobernante", "Creador", "Inocente", "Forajido", "Mago",
  "Mártir", "Seductor", "Estratega", "Superviviente", "Devoto",
  "Nihilista", "Trickster", "Sombra"
];

export function Step2Psychology({ draft, updateDraft }: Step2Props) {
  const nucleo = draft?.nucleo_psicologico || {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Arquetipo Primario</Label>
          <Select 
            value={nucleo.arquetipo_primario || ''} 
            onValueChange={(val) => updateDraft('nucleo_psicologico', { arquetipo_primario: val })}
          >
            <SelectTrigger className="bg-slate-900 border-slate-700">
              <SelectValue placeholder="Selecciona" />
            </SelectTrigger>
            <SelectContent>
              {ARQUETIPOS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Arquetipo en Tensión</Label>
          <Select 
            value={nucleo.arquetipo_en_tension || ''} 
            onValueChange={(val) => updateDraft('nucleo_psicologico', { arquetipo_en_tension: val })}
          >
            <SelectTrigger className="bg-slate-900 border-slate-700">
              <SelectValue placeholder="Conflicto interno" />
            </SelectTrigger>
            <SelectContent>
              {ARQUETIPOS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sombra Junguiana</Label>
          <Select 
            value={nucleo.sombra_junguiana || ''} 
            onValueChange={(val) => updateDraft('nucleo_psicologico', { sombra_junguiana: val })}
          >
            <SelectTrigger className="bg-slate-900 border-slate-700">
              <SelectValue placeholder="Lo que rechaza" />
            </SelectTrigger>
            <SelectContent>
              {ARQUETIPOS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Creencia Nuclear</Label>
        <Input 
          placeholder="Ej: 'El conocimiento es la única forma de no ser vulnerable'" 
          value={nucleo.creencia_nuclear || ''}
          onChange={e => updateDraft('nucleo_psicologico', { creencia_nuclear: e.target.value })}
          className="bg-slate-900 border-slate-700"
        />
        <p className="text-xs text-slate-400">La frase sobre el mundo si fuera 100% honesto. Su comportamiento orbita aquí.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Motivación Visible (Lo que dice que quiere)</Label>
          <Textarea 
            placeholder="Ej: Educar a las masas" 
            value={nucleo.motivacion_visible || ''}
            onChange={e => updateDraft('nucleo_psicologico', { motivacion_visible: e.target.value })}
            className="bg-slate-900 border-slate-700 h-20"
          />
        </div>
        <div className="space-y-2">
          <Label>Motivación Real (Lo que busca sin admitirlo)</Label>
          <Textarea 
            placeholder="Ej: Validar su intelecto porque teme ser ignorada" 
            value={nucleo.motivacion_real || ''}
            onChange={e => updateDraft('nucleo_psicologico', { motivacion_real: e.target.value })}
            className="bg-slate-900 border-slate-700 h-20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Contradicción Central</Label>
        <Input 
          placeholder="Quiere [X] pero actúa como si quisiera [Y]" 
          value={nucleo.contradiccion_central || ''}
          onChange={e => updateDraft('nucleo_psicologico', { contradiccion_central: e.target.value })}
          className="bg-slate-900 border-slate-700"
        />
      </div>
    </div>
  );
}
