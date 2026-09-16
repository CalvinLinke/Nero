"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
};

// Hero-Video, das bei jedem Seitenaufruf von vorn startet:
// - beim Einhängen (Neuladen, Rückkehr über einen Link innerhalb der Seite)
// - bei „pageshow" mit persisted=true (Browser-Zurück aus dem Seiten-Cache,
//   bei dem der Browser das alte Videoelement samt Endposition wiederherstellt)
export default function HeroVideo({ src, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const restart = () => {
      try {
        video.pause();
        video.currentTime = 0;
        video.load();
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch {
        // Autoplay kann vom Browser blockiert werden; dann bleibt das Standbild.
      }
    };

    restart();

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) restart();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [src]);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
