import { fetchJson } from "../http";

export interface FngPoint { ts: number; value: number; label: string }

export async function fearGreed(limit = 400): Promise<FngPoint[]> {
  const j = await fetchJson<{ data: { value: string; value_classification: string; timestamp: string }[] }>(
    `https://api.alternative.me/fng/?limit=${limit}&format=json`,
  );
  return j.data
    .map((d) => ({ ts: Number(d.timestamp) * 1000, value: Number(d.value), label: d.value_classification }))
    .sort((a, b) => a.ts - b.ts);
}

export interface Stablecoins { usdt: number; usdc: number; usdtPrevWeek: number; usdcPrevWeek: number; usdtPrevMonth: number; usdcPrevMonth: number }

export async function stablecoinSupply(): Promise<Stablecoins> {
  type Asset = {
    id: string;
    circulating: { peggedUSD: number };
    circulatingPrevWeek: { peggedUSD: number };
    circulatingPrevMonth: { peggedUSD: number };
  };
  const j = await fetchJson<{ peggedAssets: Asset[] }>("https://stablecoins.llama.fi/stablecoins?includePrices=false", {
    timeoutMs: 15_000,
  });
  const usdt = j.peggedAssets.find((a) => a.id === "1");
  const usdc = j.peggedAssets.find((a) => a.id === "2");
  if (!usdt || !usdc) throw new Error("DefiLlama: USDT/USDC fehlen");
  return {
    usdt: usdt.circulating.peggedUSD,
    usdc: usdc.circulating.peggedUSD,
    usdtPrevWeek: usdt.circulatingPrevWeek.peggedUSD,
    usdcPrevWeek: usdc.circulatingPrevWeek.peggedUSD,
    usdtPrevMonth: usdt.circulatingPrevMonth.peggedUSD,
    usdcPrevMonth: usdc.circulatingPrevMonth.peggedUSD,
  };
}

export async function mempoolFees(): Promise<{ fastest: number; hour: number; economy: number }> {
  const j = await fetchJson<{ fastestFee: number; hourFee: number; economyFee: number }>(
    "https://mempool.space/api/v1/fees/recommended",
  );
  return { fastest: j.fastestFee, hour: j.hourFee, economy: j.economyFee };
}

export async function ethStaked(): Promise<number> {
  const j = await fetchJson<{ sum: number }>("https://ultrasound.money/api/v2/fees/effective-balance-sum");
  return j.sum / 1e9; // Gwei → ETH
}
