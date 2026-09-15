import type { Signal, DirSignal } from "./signals";
import { clamp, round } from "./stats";
import type { Event } from "./calendar";
import { calendarMultiplier } from "./calendar";

export type Stufe = "stark bärisch" | "bärisch" | "neutral" | "bullisch" | "stark bullisch";

export interface Pegel {
  spannung: {
    score: number; // 0..100
    basis: number; // vor Kalenderfaktor
    faktor: number;
    gruende: string[];
    verdict: string;
    ampel: "gruen" | "gelb" | "rot";
    fehlend: string[];
    vorlaeufig: string[];
  };
  neigung: {
    wert: number; // -1..1
    stufe: Stufe;
    verdict: string;
    ampel: "gruen" | "gelb" | "rot";
    fehlend: string[];
    vorlaeufig: string[];
  };
}

/** Spannung: gewichtetes Mittel der Signalwerte, mal Kalenderfaktor. */
export function computePegel(spannung: Signal[], neigung: DirSignal[], events: Event[], now: number): Pegel {
  const ok = spannung.filter((s) => Number.isFinite(s.score));
  const wSum = ok.reduce((a, s) => a + s.weight, 0);
  const basis = wSum > 0 ? ok.reduce((a, s) => a + s.score * s.weight, 0) / wSum : NaN;
  const { factor, reasons } = calendarMultiplier(now, events);
  const score = Number.isFinite(basis) ? clamp(basis * factor, 0, 100) : NaN;

  const spannungVerdict =
    !Number.isFinite(score) ? "Keine Daten"
      : score >= 75 ? "Hohe Spannung"
        : score >= 55 ? "Erhöhte Spannung"
          : score >= 35 ? "Normal"
            : "Ruhig";

  const dOk = neigung.filter((d) => Number.isFinite(d.tilt));
  const dW = dOk.reduce((a, d) => a + d.weight, 0);
  const wert = dW > 0 ? clamp(dOk.reduce((a, d) => a + d.tilt * d.weight, 0) / dW, -1, 1) : NaN;
  const stufe: Stufe =
    !Number.isFinite(wert) ? "neutral"
      : wert <= -0.5 ? "stark bärisch"
        : wert <= -0.2 ? "bärisch"
          : wert >= 0.5 ? "stark bullisch"
            : wert >= 0.2 ? "bullisch"
              : "neutral";

  return {
    spannung: {
      score: round(score, 0),
      basis: round(basis, 0),
      faktor: round(factor, 2),
      gruende: reasons,
      verdict: spannungVerdict,
      ampel: score >= 75 ? "rot" : score >= 55 ? "gelb" : "gruen",
      fehlend: spannung.filter((s) => s.status === "fehlt").map((s) => s.name),
      vorlaeufig: spannung.filter((s) => s.status === "vorlaeufig").map((s) => s.name),
    },
    neigung: {
      wert: round(wert, 2),
      stufe,
      verdict: Number.isFinite(wert) ? stufe.charAt(0).toUpperCase() + stufe.slice(1) : "Keine Daten",
      ampel: stufe === "neutral" ? "gelb" : stufe.includes("bullisch") ? "gruen" : "rot",
      fehlend: neigung.filter((d) => d.status === "fehlt").map((d) => d.name),
      vorlaeufig: neigung.filter((d) => d.status === "vorlaeufig").map((d) => d.name),
    },
  };
}
