"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  className?: string;
};

// Hero-Video, das bei jedem Seitenaufruf von vorn startet und auf dem
// iPhone auch dann anläuft, wenn der Browser das automatische Abspielen
// blockiert (z. B. Stromsparmodus): dann startet es bei der ersten Berührung.
export default function HeroVideo({ src, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    let cleanupGesture: (() => void) | null = null;

    const playOnFirstGesture = () => {
      if (cleanupGesture) return;
      const handler = () => {
        video.play().catch(() => {});
        cleanupGesture?.();
      };
      const opts: AddEventListenerOptions = { once: true, passive: true };
      window.addEventListener("touchstart", handler, opts);
      window.addEventListener("pointerdown", handler, opts);
      window.addEventListener("scroll", handler, opts);
      cleanupGesture = () => {
        window.removeEventListener("touchstart", handler);
        window.removeEventListener("pointerdown", handler);
        window.removeEventListener("scroll", handler);
        cleanupGesture = null;
      };
    };

    const restart = () => {
      // Kein load(): das bricht auf iOS den bereits laufenden Autoplay ab.
      try {
        video.currentTime = 0;
      } catch {
        // Metadaten evtl. noch nicht geladen; dann startet es ohnehin bei 0.
      }
      const p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => playOnFirstGesture());
      }
    };

    restart();

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) restart();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      cleanupGesture?.();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      className={`hero-video ${className ?? ""}`}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
