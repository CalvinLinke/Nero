import type { OptionRow } from "./sources/deribit";
import { bsDelta, interp, mean } from "./stats";
import { DAY } from "./series";

export interface ExpirySummary {
  expiryTs: number;
  daysToExpiry: number;
  atmIv: number;
  putOi: number;
  callOi: number;
  notionalUsd: number;
  maxPain: number;
  putWall: number | null;
  callWall: number | null;
}

/** Fasst die Kette je Verfall zusammen (ATM-IV, Max Pain, Wände, Put/Call). */
export function summarizeExpiries(options: OptionRow[], now: number): ExpirySummary[] {
  const groups = new Map<number, OptionRow[]>();
  for (const o of options) {
    if (o.expiryTs <= now) continue;
    (groups.get(o.expiryTs) ?? groups.set(o.expiryTs, []).get(o.expiryTs)!).push(o);
  }
  const out: ExpirySummary[] = [];
  for (const [expiryTs, rows] of groups) {
    const spot = rows[0].underlying;
    const strikes = [...new Set(rows.map((r) => r.strike))].sort((a, b) => a - b);
    // ATM-IV: Mittel aus Call und Put am Strike, der dem Spot am nächsten liegt
    const atmStrike = strikes.reduce((best, k) => (Math.abs(k - spot) < Math.abs(best - spot) ? k : best), strikes[0]);
    const atmRows = rows.filter((r) => r.strike === atmStrike && r.markIv > 0);
    const atmIv = atmRows.length ? mean(atmRows.map((r) => r.markIv)) : NaN;
    const putOi = rows.filter((r) => !r.isCall).reduce((a, r) => a + r.openInterest, 0);
    const callOi = rows.filter((r) => r.isCall).reduce((a, r) => a + r.openInterest, 0);
    // Max Pain: Settlement-Preis, bei dem die Optionsinhaber in Summe am wenigsten bekommen
    let maxPain = NaN;
    let minLoss = Infinity;
    for (const s of strikes) {
      let loss = 0;
      for (const r of rows) {
        const intrinsic = r.isCall ? Math.max(s - r.strike, 0) : Math.max(r.strike - s, 0);
        loss += intrinsic * r.openInterest;
      }
      if (loss < minLoss) {
        minLoss = loss;
        maxPain = s;
      }
    }
    const wall = (isCall: boolean, below: boolean) => {
      const cand = rows.filter((r) => r.isCall === isCall && (below ? r.strike < spot : r.strike > spot));
      if (!cand.length) return null;
      return cand.reduce((b, r) => (r.openInterest > b.openInterest ? r : b)).strike;
    };
    out.push({
      expiryTs,
      daysToExpiry: (expiryTs - now) / DAY,
      atmIv,
      putOi,
      callOi,
      notionalUsd: (putOi + callOi) * spot,
      maxPain,
      putWall: wall(false, true),
      callWall: wall(true, false),
    });
  }
  return out.sort((a, b) => a.expiryTs - b.expiryTs);
}

/** ATM-IV für eine Zielrestlaufzeit in Tagen, in Varianz-Zeit interpoliert. */
export function atmIvAtDays(summaries: ExpirySummary[], days: number): number {
  const pts = summaries.filter((s) => Number.isFinite(s.atmIv) && s.daysToExpiry > 0.5).sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  if (!pts.length) return NaN;
  const xs = pts.map((p) => p.daysToExpiry);
  const ys = pts.map((p) => (p.atmIv / 100) ** 2 * (p.daysToExpiry / 365)); // Gesamtvarianz
  const totalVar = interp(xs, ys, days);
  return Math.sqrt(Math.max(totalVar, 0) / (days / 365)) * 100;
}

/** 25-Delta-Skew (Put-IV minus Call-IV, relativ zur ATM-IV) für den Verfall nahe der Zieldauer. */
export function skew25(options: OptionRow[], summaries: ExpirySummary[], targetDays: number, now: number): { skewRel: number; ivPut: number; ivCall: number; expiryTs: number } | null {
  const cand = summaries.filter((s) => s.daysToExpiry >= 10).sort((a, b) => Math.abs(a.daysToExpiry - targetDays) - Math.abs(b.daysToExpiry - targetDays));
  if (!cand.length) return null;
  const exp = cand[0];
  const rows = options.filter((o) => o.expiryTs === exp.expiryTs && o.markIv > 0);
  const t = (exp.expiryTs - now) / (365 * DAY);
  const withDelta = rows.map((r) => ({ ...r, delta: bsDelta(r.underlying, r.strike, r.markIv / 100, t, r.isCall) }));
  const puts = withDelta.filter((r) => !r.isCall && r.delta < -0.05 && r.delta > -0.6).sort((a, b) => a.delta - b.delta);
  const calls = withDelta.filter((r) => r.isCall && r.delta > 0.05 && r.delta < 0.6).sort((a, b) => a.delta - b.delta);
  if (puts.length < 2 || calls.length < 2) return null;
  const ivPut = interp(puts.map((p) => p.delta), puts.map((p) => p.markIv), -0.25);
  const ivCall = interp(calls.map((c) => c.delta), calls.map((c) => c.markIv), 0.25);
  if (!Number.isFinite(ivPut) || !Number.isFinite(ivCall) || !Number.isFinite(exp.atmIv)) return null;
  return { skewRel: ((ivPut - ivCall) / exp.atmIv) * 100, ivPut, ivCall, expiryTs: exp.expiryTs };
}
