/**
 * Rücktest der beiden preisbasierten Signale (Volatilitätskompression, Volatilitätsprämie)
 * über die Kraken- und Deribit-Historie: Stand der Signale an den Tagen vor bekannten Ereignissen.
 * Läuft ohne Datenbank: npx tsx scripts/orakel-backtest.ts
 */
import { krakenDaily } from "../src/lib/orakel/sources/kraken";
import { deribitDvol } from "../src/lib/orakel/sources/deribit";
import { realizedVol, realizedVolSeries, bollingerWidth, percentileRank } from "../src/lib/orakel/stats";

const EVENTS = [
  ["2025-10-10", "Liquidationskaskade 10.10.2025"],
  ["2025-11-20", "Kaskade Nov 2025 (ca.)"],
  ["2026-05-08", "Negativserie Funding Mai 2026"],
  ["2026-08-19", "Short-Squeeze 19./20.08.2026"],
  ["2026-08-22", "Long-Flush 22.08.2026"],
];

async function main() {
  for (const coin of ["BTC", "ETH"] as const) {
    const candles = (await krakenDaily(coin, "USD")).slice(0, -1);
    const dvol = await deribitDvol(coin, 720);
    const dvolByDay = new Map(dvol.map((d) => [Math.floor(d.ts / 86_400_000), d.close]));
    const closes = candles.map((c) => c.close);
    console.log(`\n=== ${coin}: ${candles.length} Tage bis ${new Date(candles[candles.length - 1].ts).toISOString().slice(0, 10)}`);
    console.log("Datum       | Kurs    | Δ5d nachher | RV7   RV30  | Score RV | DVOL  VRP   | Score VRP");
    for (const [iso, label] of EVENTS) {
      const t = Date.parse(`${iso}T00:00:00Z`);
      const idx = candles.findIndex((c) => c.ts >= t);
      if (idx < 40) { console.log(`${iso}: keine Daten (${label})`); continue; }
      // Stand am Vortag (Signale kennen den Ereignistag noch nicht)
      for (const back of [3, 1]) {
        const i = idx - back;
        const hist = closes.slice(0, i + 1);
        const rv7 = realizedVol(hist, 7);
        const rv30 = realizedVol(hist, 30);
        const rv30Hist = realizedVolSeries(hist.slice(-400), 30);
        const pRv = percentileRank(rv30, rv30Hist.slice(-365));
        const bw = bollingerWidth(hist, 20);
        const bwHist: number[] = [];
        for (let j = Math.max(20, hist.length - 365); j <= hist.length; j++) bwHist.push(bollingerWidth(hist.slice(0, j), 20));
        const pBw = percentileRank(bw, bwHist);
        let scoreRv = Math.max(0, ((35 - (pRv + pBw) / 2) / 35) * 100);
        if (rv7 < 0.6 * rv30) scoreRv = Math.max(scoreRv, 70);
        if (pRv > 90) scoreRv = Math.max(scoreRv, 60);
        const dv = dvolByDay.get(Math.floor(candles[i].ts / 86_400_000));
        const rvAll = realizedVolSeries(hist, 30);
        const vrpHist: number[] = [];
        for (let j = 0; j < rvAll.length; j++) {
          const d = dvolByDay.get(Math.floor(candles[j + 30].ts / 86_400_000));
          if (d !== undefined) vrpHist.push(d - rvAll[j]);
        }
        const vrp = dv !== undefined ? dv - rv30 : NaN;
        let scoreVrp = Number.isFinite(vrp) && vrpHist.length > 60 ? 100 - percentileRank(vrp, vrpHist.slice(-365)) : NaN;
        if (vrp < 0) scoreVrp = Math.max(scoreVrp, 80);
        const after = candles[Math.min(idx + 5, candles.length - 1)].close / candles[i].close - 1;
        console.log(
          `${new Date(candles[i].ts).toISOString().slice(0, 10)} (${back} Tage vor ${label.slice(0, 22)}) | ${candles[i].close.toFixed(0).padStart(6)} | ${(after * 100).toFixed(1).padStart(6)} % | ${rv7.toFixed(0).padStart(4)} ${rv30.toFixed(0).padStart(5)} | ${scoreRv.toFixed(0).padStart(8)} | ${dv?.toFixed(0).padStart(4) ?? "   –"} ${vrp.toFixed(0).padStart(5)} | ${Number.isFinite(scoreVrp) ? scoreVrp.toFixed(0).padStart(9) : "        –"}`,
        );
      }
    }
    // Basisrate: wie oft steht der RV-Score über 65 an einem beliebigen Tag?
    let hi = 0, n = 0, hiMove = 0, loMove = 0, hiN = 0, loN = 0;
    for (let i = 60; i < closes.length - 5; i++) {
      const hist = closes.slice(0, i + 1);
      const rv7 = realizedVol(hist, 7), rv30 = realizedVol(hist, 30);
      const p = percentileRank(rv30, realizedVolSeries(hist.slice(-400), 30).slice(-365));
      const bwH: number[] = [];
      for (let j = Math.max(20, hist.length - 365); j <= hist.length; j++) bwH.push(bollingerWidth(hist.slice(0, j), 20));
      const pb = percentileRank(bollingerWidth(hist, 20), bwH);
      let s = Math.max(0, ((35 - (p + pb) / 2) / 35) * 100);
      if (rv7 < 0.6 * rv30) s = Math.max(s, 70);
      const move = Math.abs(closes[i + 5] / closes[i] - 1);
      n++;
      if (s >= 65) { hi++; hiMove += move; hiN++; } else { loMove += move; loN++; }
    }
    console.log(`Basisrate RV-Score >= 65: ${((hi / n) * 100).toFixed(0)} % der Tage. Mittlere 5-Tage-Bewegung danach: ${((hiMove / hiN) * 100).toFixed(2)} % gegen ${((loMove / loN) * 100).toFixed(2)} % an den übrigen Tagen.`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
