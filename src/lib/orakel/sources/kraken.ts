import { fetchJson } from "../http";

export type Coin = "BTC" | "ETH";
export interface Candle { ts: number; open: number; high: number; low: number; close: number; volume: number }

const PAIR: Record<Coin, Record<"USD" | "EUR", string>> = {
  BTC: { USD: "XBTUSD", EUR: "XBTEUR" },
  ETH: { USD: "ETHUSD", EUR: "ETHEUR" },
};

interface OhlcResp { error: string[]; result: Record<string, unknown> }

/** Tageskerzen, ca. 720 Stück in einem Aufruf. Letzte Kerze ist der laufende Tag. */
export async function krakenDaily(coin: Coin, quote: "USD" | "EUR"): Promise<Candle[]> {
  const url = `https://api.kraken.com/0/public/OHLC?pair=${PAIR[coin][quote]}&interval=1440`;
  const j = await fetchJson<OhlcResp>(url);
  if (j.error?.length) throw new Error(`Kraken: ${j.error.join(", ")}`);
  const key = Object.keys(j.result).find((k) => k !== "last");
  if (!key) throw new Error("Kraken: leere Antwort");
  const rows = j.result[key] as (string | number)[][];
  return rows.map((r) => ({
    ts: Number(r[0]) * 1000,
    open: Number(r[1]),
    high: Number(r[2]),
    low: Number(r[3]),
    close: Number(r[4]),
    volume: Number(r[6]),
  }));
}

export interface Ticker { last: number; volume24h: number; high24h: number; low24h: number; open24h: number }

export async function krakenTicker(coin: Coin, quote: "USD" | "EUR"): Promise<Ticker> {
  const url = `https://api.kraken.com/0/public/Ticker?pair=${PAIR[coin][quote]}`;
  const j = await fetchJson<OhlcResp>(url);
  if (j.error?.length) throw new Error(`Kraken: ${j.error.join(", ")}`);
  const key = Object.keys(j.result)[0];
  const t = j.result[key] as Record<string, string[]>;
  return {
    last: Number(t.c[0]),
    volume24h: Number(t.v[1]),
    high24h: Number(t.h[1]),
    low24h: Number(t.l[1]),
    open24h: Number(t.o),
  };
}
