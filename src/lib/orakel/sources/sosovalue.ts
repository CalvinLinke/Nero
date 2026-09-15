import { fetchJson } from "../http";
import type { Coin } from "./kraken";

const TYPE: Record<Coin, string> = { BTC: "us-btc-spot", ETH: "us-eth-spot" };

export interface EtfFlow { date: string; netInflowUsd: number; netAssetsUsd: number; cumNetInflowUsd: number }

/** Tägliche Netto-Zuflüsse der US-Spot-ETFs, ca. 300 Handelstage. Kein Key nötig (Stand 15.09.2026). */
export async function sosovalueFlows(coin: Coin): Promise<EtfFlow[]> {
  const key = process.env.SOSOVALUE_API_KEY;
  const j = await fetchJson<{ code: number; msg?: string; data: Record<string, unknown>[] }>(
    "https://api.sosovalue.xyz/openapi/v2/etf/historicalInflowChart",
    { method: "POST", body: { type: TYPE[coin] }, headers: key ? { "x-soso-api-key": key } : {}, timeoutMs: 15_000 },
  );
  if (j.code !== 0) throw new Error(`SoSoValue: ${j.msg ?? j.code}`);
  return j.data
    .map((d) => ({
      date: String(d.date),
      netInflowUsd: Number(d.totalNetInflow),
      netAssetsUsd: Number(d.totalNetAssets),
      cumNetInflowUsd: Number(d.cumNetInflow),
    }))
    .filter((d) => Number.isFinite(d.netInflowUsd))
    .sort((a, b) => a.date.localeCompare(b.date));
}
