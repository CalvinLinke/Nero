import { fetchJson } from "../http";

export interface Fx { date: string; usdEur: number; usdJpy: number }

/** EZB-Referenzkurse über Frankfurter, ein Wert je Werktag. */
export async function fxLatest(): Promise<Fx> {
  const j = await fetchJson<{ date: string; rates: { EUR: number; JPY: number } }>(
    "https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,JPY",
  );
  return { date: j.date, usdEur: j.rates.EUR, usdJpy: j.rates.JPY };
}

export async function fxHistory(fromIso: string): Promise<Fx[]> {
  const j = await fetchJson<{ rates: Record<string, { EUR: number; JPY: number }> }>(
    `https://api.frankfurter.dev/v1/${fromIso}..?base=USD&symbols=EUR,JPY`,
  );
  return Object.entries(j.rates)
    .map(([date, r]) => ({ date, usdEur: r.EUR, usdJpy: r.JPY }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
