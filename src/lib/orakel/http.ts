/**
 * Kleine HTTP-Hilfe: Zeitlimit, ein Wiederholungsversuch, klare Fehler.
 * Alle Quellen laufen darüber, damit ein hängender Anbieter den Lauf nicht blockiert.
 */
const UA = "nero-orakel/1.0 (+https://nero-familienbesitz.de)";

export interface FetchOpts {
  timeoutMs?: number;
  retries?: number;
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
}

export async function fetchText(url: string, opts: FetchOpts = {}): Promise<string> {
  const { timeoutMs = 12_000, retries = 1 } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: opts.method ?? "GET",
        headers: {
          "User-Agent": UA,
          Accept: "application/json, text/csv, text/plain, */*",
          ...(opts.body ? { "Content-Type": "application/json" } : {}),
          ...(opts.headers ?? {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: ctrl.signal,
        cache: "no-store",
      });
      if (res.status === 429 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 2500));
        throw new Error(`HTTP 429 ${url}`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
      return await res.text();
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 800));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export async function fetchJson<T = unknown>(url: string, opts: FetchOpts = {}): Promise<T> {
  const text = await fetchText(url, opts);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Keine gültige JSON-Antwort von ${url}`);
  }
}

/** Führt mehrere Abrufe parallel aus und sammelt Fehler statt abzubrechen. */
export async function settle<T extends Record<string, Promise<unknown>>>(
  jobs: T,
): Promise<{ [K in keyof T]: Awaited<T[K]> | undefined } & { errors: Record<string, string> }> {
  const keys = Object.keys(jobs) as (keyof T)[];
  const results = await Promise.allSettled(keys.map((k) => jobs[k]));
  const out: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  results.forEach((r, i) => {
    const k = String(keys[i]);
    if (r.status === "fulfilled") out[k] = r.value;
    else errors[k] = r.reason instanceof Error ? r.reason.message : String(r.reason);
  });
  return { ...(out as { [K in keyof T]: Awaited<T[K]> | undefined }), errors };
}
