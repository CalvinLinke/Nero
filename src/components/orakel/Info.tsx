"use client";

import { useEffect, useRef, useState } from "react";

/** Kleines (i), das auf Klick oder Tipp eine Erklärung einblendet. */
export default function Info({ text, label }: { text?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  if (!text) return null;
  return (
    <span ref={ref} className="relative inline-block align-middle ml-1.5">
      <button
        type="button"
        aria-label={label ? `Erklärung zu ${label}` : "Erklärung"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-nero-gold text-nero-gold text-[10px] leading-none font-normal hover:bg-nero-gold hover:text-white transition-colors"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-30 left-1/2 -translate-x-1/2 top-6 w-72 max-w-[85vw] bg-nero-black text-nero-offwhite text-xs font-light leading-relaxed p-3 shadow-lg normal-case tracking-normal text-left"
        >
          {label && <span className="block text-nero-gold text-[10px] tracking-[0.15em] uppercase mb-1">{label}</span>}
          {text}
        </span>
      )}
    </span>
  );
}
