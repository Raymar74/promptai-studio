import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipBack, Loader2, AlertTriangle, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import "@hyperframes/player";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "hyperframes-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          srcdoc?: string;
          width?: string | number;
          height?: string | number;
          controls?: boolean;
          muted?: boolean;
          autoplay?: boolean;
          loop?: boolean;
          volume?: number;
          "playback-rate"?: number;
        },
        HTMLElement
      >;
    }
  }
}

interface HyperframesPreviewProps {
  htmlContent: string | null | undefined;
  onHtmlChange?: (newHtml: string) => void;
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: "vertical" | "square";
}

const SAFE_PLAY = (player: Record<string, unknown>) => {
  try {
    const fn = player.play as () => Promise<unknown> | undefined;
    const p = fn?.();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  } catch {
    // ignore
  }
};

const SAFE_PAUSE = (player: Record<string, unknown>) => {
  try {
    const fn = player.pause as () => void;
    fn?.();
  } catch {
    // ignore
  }
};

const SAFE_SEEK = (player: Record<string, unknown>, t: number) => {
  try {
    const fn = player.seek as (time: number) => void;
    fn?.(t);
  } catch {
    // ignore
  }
};

export default function HyperframesPreview({
  htmlContent,
  onHtmlChange,
  width: defaultWidth,
  height: defaultHeight,
  className,
  aspectRatio = "vertical",
}: HyperframesPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLElement>(null);
  const readyFiredRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [editableHtml, setEditableHtml] = useState(htmlContent || "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const width = defaultWidth || (aspectRatio === "vertical" ? 1080 : 1080);
  const height = defaultHeight || (aspectRatio === "vertical" ? 1920 : 1080);

  const maxContainerWidth = aspectRatio === "vertical" ? 360 : 500;
  const scaleFactor = maxContainerWidth / width;
  const displayWidth = Math.min(width, maxContainerWidth);
  const displayHeight = height * scaleFactor;

  useEffect(() => {
    setEditableHtml(htmlContent || "");
    readyFiredRef.current = false;
    setStatus("loading");
    setIsPlaying(false);
    setShowRaw(false);

    const el = containerRef.current?.querySelector("hyperframes-player");
    if (el) {
      playerRef.current = el;

      const onReady = () => {
        readyFiredRef.current = true;
        setStatus("ready");
      };
      const onError = () => setStatus("error");
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);

      el.addEventListener("ready", onReady);
      el.addEventListener("error", onError);
      el.addEventListener("playbackerror", onError);
      el.addEventListener("play", onPlay);
      el.addEventListener("pause", onPause);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (!readyFiredRef.current) {
          setStatus("error");
        }
      }, 10000);

      return () => {
        el.removeEventListener("ready", onReady);
        el.removeEventListener("error", onError);
        el.removeEventListener("playbackerror", onError);
        el.removeEventListener("play", onPlay);
        el.removeEventListener("pause", onPause);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [htmlContent]);

  useEffect(() => {
    if (htmlContent) {
      console.log("HTML Generado por la IA:", htmlContent);
    } else {
      console.log("HTML Generado por la IA está vacío o nulo.");
    }
  }, [htmlContent]);

  const handlePlayPause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    
    const iframe = player.shadowRoot?.querySelector('iframe') || player.querySelector('iframe');
    
    if (isPlaying) {
      SAFE_PAUSE(player);
      try { iframe?.contentWindow?.postMessage('pause', '*'); } catch (e) {}
      setIsPlaying(false);
    } else {
      SAFE_PLAY(player);
      try { iframe?.contentWindow?.postMessage('play', '*'); } catch (e) {}
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleRestart = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    SAFE_SEEK(player, 0);
    SAFE_PAUSE(player);
    const iframe = player.shadowRoot?.querySelector('iframe') || player.querySelector('iframe');
    try { 
      iframe?.contentWindow?.postMessage('pause', '*'); 
      // Force GSAP restart if possible via custom message
      iframe?.contentWindow?.postMessage('restart', '*'); 
    } catch (e) {}
    setIsPlaying(false);
  }, []);

  if (!htmlContent || !htmlContent.trim()) {
    return (
      <Card className={cn("flex flex-col items-center justify-center py-20 text-muted-foreground", className)}>
        <AlertTriangle className="w-10 h-10 mb-4 opacity-50" />
        <p className="text-sm">Preview no disponible</p>
        <p className="text-xs mt-1 opacity-60">Este paquete no incluye previsualización HTML.</p>
      </Card>
    );
  }

  if (showRaw) {
    const handleSave = () => {
      onHtmlChange?.(editableHtml);
      setShowRaw(false);
    };

    return (
      <Card className={cn("p-4 w-full max-w-2xl", className)}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">Editar HTML</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRaw(false)}>Cancelar</Button>
            {onHtmlChange && <Button size="sm" onClick={handleSave}>Guardar cambios</Button>}
          </div>
        </div>
        <textarea
          className="w-full h-96 text-xs bg-muted p-3 rounded overflow-auto border font-mono leading-relaxed whitespace-pre-wrap break-words focus:outline-none focus:ring-1 focus:ring-primary"
          value={editableHtml}
          onChange={(e) => setEditableHtml(e.target.value)}
          spellCheck={false}
        />
        <p className="text-xs text-muted-foreground mt-2">Puedes modificar los diálogos u otros elementos del HTML y guardar los cambios.</p>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col items-center", className)} ref={containerRef}>
      <div
        className="relative border border-border rounded-lg overflow-hidden shadow-lg bg-black"
        style={{ width: displayWidth, height: displayHeight }}
      >
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-10 p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-destructive/70 mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No se pudo cargar la previsualización</p>
            <Button variant="outline" size="sm" onClick={() => setShowRaw(true)} className="gap-1.5">
              <Bug className="w-3.5 h-3.5" /> Ver HTML generado
            </Button>
          </div>
        )}

        <hyperframes-player
          ref={playerRef as any}
          srcdoc={(() => {
            if (!htmlContent) return "";
            let finalHtml = htmlContent;
            
            // Fix para los backgrounds opacos que la IA pone por error en cada clip
            const styleFix = `<style>
              html, body { width: 100%; height: 100%; margin: 0; padding: 0; background: transparent; }
              .clip { background: transparent !important; }
            </style>`;
            
            // Fix para asegurar que GSAP se reproduzca aunque el player falle en iniciarlo
            const scriptFix = `<script>
              window.addEventListener('message', (e) => {
                if (!window.__timelines) return;
                const tls = Object.values(window.__timelines);
                if (e.data === 'play') {
                  tls.forEach(tl => tl.play());
                } else if (e.data === 'pause') {
                  tls.forEach(tl => tl.pause());
                } else if (e.data === 'restart') {
                  tls.forEach(tl => { tl.pause(); tl.progress(0); });
                }
              });
              // Auto-play de contingencia
              setTimeout(() => {
                if (window.__timelines) Object.values(window.__timelines).forEach(tl => tl.play());
              }, 1000);
            </script>`;

            if (finalHtml.includes("<html")) {
              return finalHtml.replace('</head>', styleFix + '</head>').replace('</body>', scriptFix + '</body>');
            }
            return `<!DOCTYPE html><html><head><meta charset="utf-8">${styleFix}</head><body>${finalHtml}${scriptFix}</body></html>`;
          })()}
          width={width}
          height={height}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${scaleFactor})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0
          }}
          muted
          loop
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={handleRestart}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
            </div>
            <div className="text-xs text-white/70 flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-white/50 hover:text-white" onClick={() => setShowRaw(true)}>
                Ver HTML
              </Button>
              {aspectRatio === "vertical" ? "Reel" : "Carrusel"} (1080×{aspectRatio === "vertical" ? "1920" : "1080"})
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center max-w-md">
        Preview animado del texto. Usa los prompts en las otras pestañas para generar el video real.
      </p>
    </div>
  );
}
