import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  content: string;
  className?: string;
}

export function HelpTooltip({ content, className }: HelpTooltipProps) {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button 
          type="button" 
          className={cn("text-muted-foreground hover:text-primary transition-colors focus:outline-none", className)}
          tabIndex={-1}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="sr-only">Ayuda</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[250px] bg-slate-900 border-slate-800 text-slate-200">
        <p className="text-xs leading-relaxed">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
