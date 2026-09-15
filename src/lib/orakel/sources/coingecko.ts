import { fetchJson } from "../http";
import type { Coin } from "./kraken";

const ID: Record<Coin, string> = { BTC: "bitcoin", ETH: "ethereum" };

export interface McapPoint { ts: number; marketCapUsd: number; volumeUsd: number; priceUsd: number }

/** Marktkapitalisierung, Volumen und Preis je Tag, 365 Tage. */
export async function coingeckoMarketChart(coin: Coin): Promise<McapPoint[]> {
  const url = `https://api.coingecko.com/api/v3/coins/${ID[coin]}/market_chart?vs_currency=usd&days=365&interval=daily`;
  const j = await fetchJson<{ prices: number[][]; market_caps: number[][]; total_volumes: number[][] }>(url, {
    timeoutMs: 15_000,
  });
  return j.market_caps.map((m, i) => ({
    ts: m[0],
    marketCapUsd: m[1],
    volumeUsd: j.total_volumes[i]?.[1] ?? NaN,
    priceUsd: j.prices[i]?.[1] ?? NaN,
  }));
}

export interface SimplePrice { usd: number; eur: number; marketCapUsd: number; volume24hUsd: number; change24h: number }

export async function coingeckoSimple(): Promise<Record<Coin, SimplePrice>> {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true";
  const j = await fetchJson<Record<string, Record<string, number>>>(url);
  const map = (o: Record<string, number>): SimplePrice => ({
    usd: o.usd,
    eur: o.eur,
    marketCapUsd: o.usd_market_cap,
    volume24hUsd: o.usd_24h_vol,
    change24h: o.usd_24h_change,
  });
  return { BTC: map(j.bitcoin), ETH: map(j.ethereum) };
}
