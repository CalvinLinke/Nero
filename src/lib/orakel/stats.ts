/** Reine Rechenhilfen, ohne Abhängigkeiten. */

export function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
}

export function std(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
}

export function zScore(x: number, xs: number[]): number {
  const s = std(xs);
  return s > 0 ? (x - mean(xs)) / s : 0;
}

/** Rang von x innerhalb der Vergleichsmenge, 0 bis 100. */
export function percentileRank(x: number, xs: number[]): number {
  const valid = xs.filter((v) => Number.isFinite(v));
  if (!valid.length || !Number.isFinite(x)) return NaN;
  let below = 0;
  let equal = 0;
  for (const v of valid) {
    if (v < x) below++;
    else if (v === x) equal++;
  }
  return (100 * (below + 0.5 * equal)) / valid.length;
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

export function logReturns(closes: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1] > 0 && closes[i] > 0) out.push(Math.log(closes[i] / closes[i - 1]));
  }
  return out;
}

/** Annualisierte realisierte Volatilität in Vol-Punkten aus Tagesschlusskursen. */
export function realizedVol(closes: number[], window: number): number {
  const r = logReturns(closes.slice(-(window + 1)));
  if (r.length < Math.max(3, Math.floor(window * 0.8))) return NaN;
  return std(r) * Math.sqrt(365) * 100;
}

/** Realisierte Volatilität als Reihe (für Perzentile über die Historie). */
export function realizedVolSeries(closes: number[], window: number): number[] {
  const out: number[] = [];
  for (let i = window; i < closes.length; i++) {
    out.push(realizedVol(closes.slice(0, i + 1), window));
  }
  return out.filter((v) => Number.isFinite(v));
}

/** Bollinger-Bandbreite (20 Tage, 2 Sigma) relativ zum Mittel. */
export function bollingerWidth(closes: number[], window = 20): number {
  const w = closes.slice(-window);
  if (w.length < window) return NaN;
  const m = mean(w);
  const s = std(w);
  return (4 * s) / m;
}

/** Standardnormalverteilung. */
export function normCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (x > 0) p = 1 - p;
  return p;
}

/** Black-Scholes-Delta ohne Zins (Deribit-Optionen sind in Coin abgerechnet, Zins vernachlässigbar). */
export function bsDelta(spot: number, strike: number, iv: number, tYears: number, isCall: boolean): number {
  if (spot <= 0 || strike <= 0 || iv <= 0 || tYears <= 0) return NaN;
  const d1 = (Math.log(spot / strike) + 0.5 * iv * iv * tYears) / (iv * Math.sqrt(tYears));
  return isCall ? normCdf(d1) : normCdf(d1) - 1;
}

/** Lineare Interpolation von y an Stelle x über sortierte Stützstellen. */
export function interp(xs: number[], ys: number[], x: number): number {
  if (!xs.length) return NaN;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1];
  for (let i = 1; i < xs.length; i++) {
    if (x <= xs[i]) {
      const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
      return ys[i - 1] + t * (ys[i] - ys[i - 1]);
    }
  }
  return NaN;
}

export function round(x: number, digits = 2): number {
  if (!Number.isFinite(x)) return NaN;
  const f = 10 ** digits;
  return Math.round(x * f) / f;
}
