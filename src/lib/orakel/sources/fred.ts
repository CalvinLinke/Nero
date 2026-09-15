import { fetchText } from "../http";

export interface FredPoint { date: string; value: number }

/** FRED-Reihe als CSV ohne Key, z. B. DGS2, DGS10, DFF, DTWEXBGS. */
export async function fredSeries(id: string): Promise<FredPoint[]> {
  const csv = await fetchText(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}`, { timeoutMs: 15_000 });
  const out: FredPoint[] = [];
  for (const line of csv.split("\n").slice(1)) {
    const [date, v] = line.trim().split(",");
    const value = Number(v);
    if (date && Number.isFinite(value)) out.push({ date, value });
  }
  if (!out.length) throw new Error(`FRED ${id}: keine Werte`);
  return out;
}
