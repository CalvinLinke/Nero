export const eur = (v: number | null | undefined, digits = 0) =>
  v == null || !Number.isFinite(v) ? "–" : new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);
export const usd = (v: number | null | undefined, digits = 0) =>
  v == null || !Number.isFinite(v) ? "–" : new Intl.NumberFormat("de-DE", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v) + " $";
export const num = (v: number | null | undefined, digits = 1) =>
  v == null || !Number.isFinite(v) ? "–" : new Intl.NumberFormat("de-DE", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);
export const pct = (v: number | null | undefined, digits = 1) => (v == null || !Number.isFinite(v) ? "–" : `${v > 0 ? "+" : ""}${num(v, digits)} %`);
export const mrd = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? "–" : `${num(v / 1e9, 2)} Mrd. $`);
export const mio = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? "–" : `${num(v / 1e6, 1)} Mio. $`);
export const datum = (ts: number, withTime = true) =>
  new Date(ts).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) });
