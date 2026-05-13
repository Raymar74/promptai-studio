import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipBack, Loader2, AlertTriangle } from "lucide-react";
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

interface HyperframesPlayerElement extends HTMLElement {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  currentTime: number;
  duration: number;
  paused: boolean;
  ready: boolean;
  addEventListener: (
    type: "ready" | "play" | "pause" | "ended" | "timeupdate" | "error" | "playbackerror",
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => void;
}

interface HyperframesPreviewProps {
  htmlContent: string | null | undefined;
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: "vertical" | "square";
}

export default function HyperframesPreview({
  htmlContent,
  width: defaultWidth,
  height: defaultHeight,
  className,
  aspectRatio = "vertical",
}: HyperframesPreviewProps) {
  const playerRef = useRef<HyperframesPlayerElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const width = defaultWidth || (aspectRatio === "vertical" ? 1080 : 1080);
  const height = defaultHeight || (aspectRatio === "vertical" ? 1920 : 1080);

  useEffect(() => {
    setIsReady(false);
    setIsPlaying(false);
    setHasError(false);
    setCurrentTime(0);
  }, [htmlContent]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleReady = () => {
      setIsReady(true);
      setHasError(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeupdate = () => {
      setCurrentTime(player.currentTime);
    };
    const handleError = () => {
      setHasError(true);
      setIsReady(false);
    };

    player.addEventListener("ready", handleReady);
    player.addEventListener("play", handlePlay);
    player.addEventListener("pause", handlePause);
    player.addEventListener("timeupdate", handleTimeupdate);
    player.addEventListener("error", handleError);
    player.addEventListener("playbackerror", handleError);

    return () => {
      player.removeEventListener("ready", handleReady);
      player.removeEventListener("play", handlePlay);
      player.removeEventListener("pause", handlePause);
      player.removeEventListener("timeupdate", handleTimeupdate);
      player.removeEventListener("error", handleError);
      player.removeEventListener("playbackerror", handleError);
    };
  }, [htmlContent]);

  const handlePlayPause = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.paused) {
      player.play().catch(() => setHasError(true));
    } else {
      player.pause();
    }
  };

  const handleRestart = () => {
    const player = playerRef.current;
    if (!player) return;
    player.seek(0);
    setCurrentTime(0);
    if (!player.paused) {
      player.pause();
    }
  };

  if (!htmlContent) {
    return (
      <Card className={cn("flex flex-col items-center justify-center py-20 text-muted-foreground", className)}>
        <AlertTriangle className="w-10 h-10 mb-4 opacity-50" />
        <p className="text-sm">Este paquete no tiene preview generado</p>
        <p className="text-xs mt-1 opacity-60">Los paquetes generados antes de esta actualización no incluyen previsualización.</p>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className={cn("flex flex-col items-center justify-center py-20 text-muted-foreground", className)}>
        <AlertTriangle className="w-10 h-10 mb-4 text-destructive/70" />
        <p className="text-sm">Error al cargar la previsualización</p>
        <p className="text-xs mt-1 opacity-60">El formato del HTML puede ser incorrecto.</p>
      </Card>
    );
  }

  const maxContainerWidth = aspectRatio === "vertical" ? 360 : 500;
  const scaleFactor = aspectRatio === "vertical" ? maxContainerWidth / width : maxContainerWidth / width;
  const displayWidth = Math.min(width, maxContainerWidth);
  const displayHeight = height * scaleFactor;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className="relative border border-border rounded-lg overflow-hidden shadow-lg bg-black"
        style={{ width: displayWidth, height: displayHeight }}
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <hyperframes-player
          ref={playerRef as React.Ref<HTMLElement>}
          srcdoc={htmlContent}
          width={width}
          height={height}
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
            <div className="text-xs text-white/70">
              {aspectRatio === "vertical" ? "Reel (1080x1920)" : "Carrusel (1080x1080)"}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        La previsualización muestra la estructura y animación del texto. Usa los prompts para generar el video real con imágenes.
      </p>
    </div>
  );
}
