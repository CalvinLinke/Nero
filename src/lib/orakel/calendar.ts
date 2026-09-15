import kalender from "./data/kalender.json";
import type { OptionRow } from "./sources/deribit";
import { DAY } from "./series";

export interface Event {
  kind: "cpi" | "nfp" | "fomc" | "verfall" | "wochenende";
  label: string;
  ts: number;
  hoursAway: number;
  notionalUsd?: number;
}

const LABEL: Record<string, string> = {
  cpi: "US-Inflationsdaten (CPI)",
  nfp: "US-Arbeitsmarktbericht",
  fomc: "Fed-Zinsentscheid (FOMC)",
};

/** Alle Termine der nächsten 14 Tage, sortiert. */
export function upcomingEvents(now: number, options: OptionRow[] | undefined): Event[] {
  const out: Event[] = [];
  const horizon = now + 14 * DAY;
  for (const kind of ["cpi", "nfp", "fomc"] as const) {
    for (const iso of kalender[kind]) {
      const ts = Date.parse(iso);
      if (ts >= now - 2 * 3_600_000 && ts <= horizon) {
        out.push({ kind, label: LABEL[kind], ts, hoursAway: (ts - now) / 3_600_000 });
      }
    }
  }
  if (options?.length) {
    const byExpiry = new Map<number, number>();
    for (const o of options) {
      byExpiry.set(o.expiryTs, (byExpiry.get(o.expiryTs) ?? 0) + o.openInterest * o.underlying);
    }
    for (const [ts, notional] of byExpiry) {
      if (ts < now || ts > horizon) continue;
      const d = new Date(ts);
      const isFriday = d.getUTCDay() === 5;
      const isMonthly = isFriday && d.getUTCDate() + 7 > daysInMonth(d);
      const isQuarterly = isMonthly && [2, 5, 8, 11].includes(d.getUTCMonth());
      // Tagesverfälle (Di–Sa) sind klein und werden nur gelistet, wenn sie groß sind.
      if (!isFriday && notional < 1e9) continue;
      const label = isQuarterly
        ? "Quartalsverfall Deribit"
        : isMonthly
          ? "Monatsverfall Deribit"
          : isFriday
            ? "Wochenverfall Deribit"
            : "Tagesverfall Deribit";
      out.push({ kind: "verfall", label, ts, hoursAway: (ts - now) / 3_600_000, notionalUsd: notional });
    }
  }
  return out.sort((a, b) => a.ts - b.ts);
}

function daysInMonth(d: Date): number {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
}

/**
 * Multiplikator auf den Spannungspegel. Belegt: Makrotermine verdoppeln
 * die Tagesbewegung etwa. Plausibel: große Verfälle und dünne Wochenendliquidität.
 */
export function calendarMultiplier(now: number, events: Event[]): { factor: number; reasons: string[] } {
  let factor = 1;
  const reasons: string[] = [];
  const within = (h: number) => events.filter((e) => e.hoursAway >= -2 && e.hoursAway <= h);
  const macro = within(24).filter((e) => e.kind === "cpi" || e.kind === "nfp" || e.kind === "fomc");
  if (macro.length) {
    factor *= 1.5;
    reasons.push(`${macro[0].label} in ${Math.max(0, Math.round(macro[0].hoursAway))} Std.`);
  }
  const big = within(24).filter((e) => e.kind === "verfall" && (e.notionalUsd ?? 0) >= 5e9);
  if (big.length) {
    factor *= 1.2;
    reasons.push(`${big[0].label} (${(big[0].notionalUsd! / 1e9).toFixed(1)} Mrd. $) in ${Math.max(0, Math.round(big[0].hoursAway))} Std.`);
  }
  const day = new Date(now).getUTCDay();
  if (day === 6 || day === 0) {
    factor *= 1.1;
    reasons.push("Wochenende, dünne Liquidität");
  }
  return { factor, reasons };
}
