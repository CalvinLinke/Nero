"use client";

import { useEffect, useState } from "react";

/** Läuft im Browser weiter, damit die Restzeit stimmt, auch wenn die Seite länger offen ist. */
export default function Countdown({ ts }: { ts: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const diff = ts - now;
  if (diff <= 0) return <span>jetzt</span>;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 48) return <span>{Math.round(h / 24)} Tage</span>;
  return (
    <span>
      {h} Std. {m} Min.
    </span>
  );
}
