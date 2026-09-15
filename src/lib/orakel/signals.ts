import type { Db } from "./db/client";
import type { CoinRaw, GlobalRaw } from "./collect";
import { readSeries, DAY, YEAR } from "./series";
import { percentileRank, realizedVol, realizedVolSeries, bollingerWidth, clamp, mean, zScore, round } from "./stats";
import { summarizeExpiries, atmIvAtDays, skew25, type ExpirySummary } from "./options";

export type Status = "ok" | "vorlaeufig" | "fehlt";
export type Evidence = "belegt" | "plausibel";

/** Ein Spannungssignal: trägt 0 bis 100 zum Pegel bei. */
export interface Signal {
  id: string;
  name: string;
  score: number; // 0..100, NaN wenn fehlt
  percentile?: number;
  status: Status;
  evidence: Evidence;
  weight: number;
  text: string; // ein Satz, warum
  values: Record<string, number | string | null>;
  historyPoints?: number;
}

/** Ein Richtungssignal: Neigung zwischen -1 (bärisch) und +1 (bullisch). */
export interface DirSignal {
  id: string;
  name: string;
  tilt: number; // -1..1, NaN wenn fehlt
  status: Status;
  evidence: Evidence;
  weight: number;
  text: string;
  values: Record<string, number | string | null>;
}

export interface SignalSet {
  spannung: Signal[];
  neigung: DirSignal[];
  expiries: ExpirySummary[];
}

const MIN_HISTORY = 60; // ab so vielen Punkten gilt ein Perzentil als belastbar

const fehlt = (id: string, name: string, weight: number, evidence: Evidence, why: string): Signal => ({
  id, name, score: NaN, status: "fehlt", evidence, weight, text: why, values: {},
});

export async function computeSignals(db: Db, raw: CoinRaw, global: GlobalRaw, now: number): Promise<SignalSet> {
  const c = raw.coin.toLowerCase();
  const since = now - 2 * YEAR;
  const [closes1d, dvol1d, fundOkx, fundBybit, oiOkx1d, mcap1d, etf1d, skewHist, termHist, basisHist, liqLong, liqShort] = await Promise.all([
    readSeries(db, `${c}.close.usd.1d`, since),
    readSeries(db, `${c}.dvol.1d`, since),
    readSeries(db, `${c}.funding.okx.8h`, now - YEAR),
    readSeries(db, `${c}.funding.bybit.8h`, now - YEAR),
    readSeries(db, `${c}.oi.okx.usd.1d`, now - YEAR),
    readSeries(db, `${c}.mcap.usd.1d`, now - YEAR),
    readSeries(db, `${c}.etf.netflow.usd.1d`, now - 2 * YEAR),
    readSeries(db, `${c}.skew25.30d.1h`, now - YEAR),
    readSeries(db, `${c}.iv.term.1h`, now - YEAR),
    readSeries(db, `${c}.basis.okx.1h`, now - YEAR),
    readSeries(db, `${c}.liq.okx.long.usd.1h`, now - YEAR),
    readSeries(db, `${c}.liq.okx.short.usd.1h`, now - YEAR),
  ]);

  const spannung: Signal[] = [];
  const neigung: DirSignal[] = [];

  // Tagesreihe ohne den laufenden Tag (Kraken liefert die offene Kerze mit)
  const closedDays = closes1d.filter((p) => p.ts < now - (now % DAY));
  const closes = closedDays.map((p) => p.value);
  const spot = raw.tickerUsd?.last ?? closes[closes.length - 1];

  // 1) Realisierte Volatilität und Kompression
  {
    const rv7 = realizedVol(closes, 7);
    const rv30 = realizedVol(closes, 30);
    const rv30Hist = realizedVolSeries(closes.slice(-400), 30);
    const bw = bollingerWidth(closes, 20);
    const bwHist: number[] = [];
    for (let i = 20; i <= closes.length; i++) bwHist.push(bollingerWidth(closes.slice(0, i), 20));
    if (Number.isFinite(rv30) && rv30Hist.length >= MIN_HISTORY) {
      const pRv = percentileRank(rv30, rv30Hist.slice(-365));
      const pBw = percentileRank(bw, bwHist.slice(-365));
      // Kompression = niedrige RV und enge Bänder. Streng abgebildet: erst unter dem 35. Perzentil zählt es,
      // sonst steht das Signal an jedem zweiten Tag hoch (Rücktest 15.09.2026: 53 % der Tage bei linearer Abbildung).
      const pMix = (pRv + pBw) / 2;
      let score = clamp(((35 - pMix) / 35) * 100, 0, 100);
      if (rv7 < 0.6 * rv30) score = Math.max(score, 70);
      // Sehr hohe RV bedeutet, dass die Bewegung schon läuft: ebenfalls erhöhte Spannung, aber schwächer
      if (pRv > 90) score = Math.max(score, 60);
      spannung.push({
        id: "rv",
        name: "Volatilitätskompression",
        score: clamp(score, 0, 100),
        percentile: pRv,
        status: "ok",
        evidence: "belegt",
        weight: 1,
        text:
          rv7 < 0.6 * rv30
            ? `Die 7-Tage-Volatilität (${round(rv7, 1)} %) ist auf unter 60 % der 30-Tage-Volatilität (${round(rv30, 1)} %) gefallen. Der Markt beruhigt sich abrupt. Solche Ruhephasen lösten sich historisch in kräftige Bewegungen auf, in beide Richtungen.`
            : pRv <= 15
              ? `Realisierte 30-Tage-Volatilität ${round(rv30, 1)} % liegt im ${round(pRv, 0)}. Perzentil, die Bänder sind eng. Kompression dieser Art ging Ausbrüchen voraus, die Richtung ist offen.`
              : pRv > 90
                ? `Realisierte 30-Tage-Volatilität ${round(rv30, 1)} % im ${round(pRv, 0)}. Perzentil. Die Bewegung läuft bereits, Volatilität kommt in Clustern.`
                : `Realisierte 30-Tage-Volatilität ${round(rv30, 1)} % (${round(pRv, 0)}. Perzentil). Keine ungewöhnliche Kompression.`,
        values: { rv7: round(rv7, 1), rv30: round(rv30, 1), bandbreite: round(bw * 100, 1), perzentilRv: round(pRv, 0) },
        historyPoints: rv30Hist.length,
      });
    } else spannung.push(fehlt("rv", "Volatilitätskompression", 1, "belegt", "Zu wenig Kurshistorie."));
  }

  // Optionskette vorbereiten
  const expiries = raw.options?.length ? summarizeExpiries(raw.options, now) : [];
  const iv7 = atmIvAtDays(expiries, 7);
  const iv30 = atmIvAtDays(expiries, 30);

  // 2) Laufzeitstruktur 7 Tage gegen 30 Tage (Verhältnis > 1 = invertiert = Stress)
  if (Number.isFinite(iv7) && Number.isFinite(iv30) && iv30 > 0) {
    const ratio = iv7 / iv30;
    // feste Schwellen sind belegt (Inversion über 1,05 = Stress); Perzentil ergänzt, sobald Historie da ist
    let score = clamp(((ratio - 0.9) / (1.15 - 0.9)) * 100, 0, 100);
    const hist = termHist.map((p) => p.value);
    let percentile: number | undefined;
    if (hist.length >= MIN_HISTORY) {
      percentile = percentileRank(ratio, hist);
      score = 0.5 * score + 0.5 * percentile;
    }
    spannung.push({
      id: "term",
      name: "Laufzeitstruktur der Optionen",
      score,
      percentile,
      status: hist.length >= MIN_HISTORY ? "ok" : "vorlaeufig",
      evidence: "belegt",
      weight: 1.2,
      text:
        ratio > 1.05
          ? `Die 7-Tage-Volatilität (${round(iv7, 1)} %) liegt über der 30-Tage-Volatilität (${round(iv30, 1)} %). Der Optionsmarkt preist akuten Stress, die Struktur ist invertiert. Solche Phasen dauern im Schnitt nur wenige Tage.`
          : ratio < 0.95
            ? `7-Tage-IV ${round(iv7, 1)} % deutlich unter 30-Tage-IV ${round(iv30, 1)} %. Normale, ruhige Struktur.`
            : `7-Tage-IV ${round(iv7, 1)} % gegen 30-Tage-IV ${round(iv30, 1)} %. Struktur flach, leicht erhöhte Aufmerksamkeit.`,
      values: { iv7: round(iv7, 1), iv30: round(iv30, 1), verhaeltnis: round(ratio, 3) },
      historyPoints: hist.length,
    });
  } else spannung.push(fehlt("term", "Laufzeitstruktur der Optionen", 1.2, "belegt", "Deribit-Kette nicht verfügbar."));

  // 3) Volatilitätsprämie: DVOL minus realisierte 30-Tage-Volatilität
  {
    const dvolByDay = new Map(dvol1d.map((p) => [p.ts, p.value]));
    const rvHist = realizedVolSeries(closes, 30); // ausgerichtet auf closedDays ab Index 30
    const vrpHist: number[] = [];
    const rv30Hist: number[] = [];
    for (let i = 0; i < rvHist.length; i++) {
      const day = closedDays[i + 30]?.ts;
      const dv = day !== undefined ? dvolByDay.get(day) : undefined;
      if (dv !== undefined) {
        vrpHist.push(dv - rvHist[i]);
        rv30Hist.push(rvHist[i]);
      }
    }
    const dvolNow = dvol1d.length ? dvol1d[dvol1d.length - 1].value : NaN;
    const rv30 = realizedVol(closes, 30);
    if (Number.isFinite(dvolNow) && Number.isFinite(rv30) && vrpHist.length >= MIN_HISTORY) {
      const vrp = dvolNow - rv30;
      const pVrp = percentileRank(vrp, vrpHist.slice(-365));
      const pRv = percentileRank(rv30, rv30Hist.slice(-365));
      let score = 100 - pVrp; // niedrige oder negative Prämie = Stress
      if (vrp < 0) score = Math.max(score, 80);
      if (pVrp > 90 && pRv < 20) score = Math.max(score, 70); // teure Ruhe: Absicherung gefragt, Kurs bewegt sich nicht
      spannung.push({
        id: "vrp",
        name: "Volatilitätsprämie",
        score: clamp(score, 0, 100),
        percentile: pVrp,
        status: "ok",
        evidence: "belegt",
        weight: 1.2,
        text:
          vrp < 0
            ? `DVOL ${round(dvolNow, 1)} liegt unter der realisierten Volatilität ${round(rv30, 1)} %. Der Markt bewegt sich stärker, als Optionen einpreisen: Stressregime.`
            : pVrp > 90 && pRv < 20
              ? `Optionen sind teuer (DVOL ${round(dvolNow, 1)}) bei ruhigem Kurs (RV ${round(rv30, 1)} %). Absicherungsnachfrage bei Kompression.`
              : `DVOL ${round(dvolNow, 1)} gegen realisierte ${round(rv30, 1)} %: Prämie ${round(vrp, 1)} Punkte (${round(pVrp, 0)}. Perzentil). Normalzustand, Optionen sind teurer als die Bewegung.`,
        values: { dvol: round(dvolNow, 1), rv30: round(rv30, 1), praemie: round(vrp, 1), perzentil: round(pVrp, 0) },
        historyPoints: vrpHist.length,
      });
    } else spannung.push(fehlt("vrp", "Volatilitätsprämie", 1.2, "belegt", "DVOL-Historie fehlt."));
  }

  // 4) Hebelquote: offenes Interesse gegen Marktkapitalisierung
  {
    const mcapByDay = new Map(mcap1d.map((p) => [p.ts, p.value]));
    const ratioHist: { ts: number; v: number }[] = [];
    for (const p of oiOkx1d) {
      const m = mcapByDay.get(p.ts);
      if (m) ratioHist.push({ ts: p.ts, v: p.value / m });
    }
    const mcapNow = raw.simple?.marketCapUsd ?? mcap1d[mcap1d.length - 1]?.value;
    const oiNow = oiOkx1d[oiOkx1d.length - 1]?.value;
    if (ratioHist.length >= 30 && mcapNow && oiNow) {
      const ratioNow = oiNow / mcapNow;
      const p = percentileRank(ratioNow, ratioHist.map((r) => r.v));
      // OI-Aufbau über 7 Tage bei flachem Kurs = einseitiger Hebelaufbau
      const oi7 = oiOkx1d[oiOkx1d.length - 8]?.value;
      const px7 = closes[closes.length - 8];
      const oiChg = oi7 ? oiNow / oi7 - 1 : NaN;
      const pxChg = px7 ? spot / px7 - 1 : NaN;
      let score = p;
      if (oiChg > 0.1 && Math.abs(pxChg) < 0.03) score = Math.max(score, 75);
      spannung.push({
        id: "hebel",
        name: "Hebelquote",
        score: clamp(score, 0, 100),
        percentile: p,
        status: ratioHist.length >= 120 ? "ok" : "vorlaeufig",
        evidence: "plausibel",
        weight: 1,
        text:
          p > 85
            ? `Offenes Interesse (OKX, alle Kontrakte) entspricht ${round(ratioNow * 100, 2)} % der Marktkapitalisierung, ${round(p, 0)}. Perzentil. Viel Hebel im System, Kaskaden werden wahrscheinlicher.`
            : `Offenes Interesse bei ${round(ratioNow * 100, 2)} % der Marktkapitalisierung (${round(p, 0)}. Perzentil). Hebel unauffällig.`,
        values: { oiUsdMrd: round(oiNow / 1e9, 2), quoteProzent: round(ratioNow * 100, 2), oiAenderung7d: round(oiChg * 100, 1), kursAenderung7d: round(pxChg * 100, 1) },
        historyPoints: ratioHist.length,
      });
    } else spannung.push(fehlt("hebel", "Hebelquote", 1, "plausibel", "OI- oder Marktkapitalisierungs-Historie fehlt."));
  }

  // 5) Funding: Perzentil des Absolutwerts und Persistenz; 30-Tage-Mittel als Richtung
  {
    const okx = fundOkx.map((p) => p.value);
    const cur = raw.okxFunding?.rate ?? okx[okx.length - 1];
    if (okx.length >= 30 && Number.isFinite(cur)) {
      const abs = okx.map(Math.abs);
      const p = percentileRank(Math.abs(cur), abs);
      const thr = quantile(abs, 0.95);
      let streak = 0;
      for (let i = okx.length - 1; i >= 0 && Math.abs(okx[i]) >= thr; i--) streak++;
      let score = p;
      if (streak >= 3) score = Math.max(score, 85);
      const annual = cur * 3 * 365 * 100;
      spannung.push({
        id: "funding",
        name: "Funding-Rate",
        score: clamp(score, 0, 100),
        percentile: p,
        status: okx.length >= 3 * MIN_HISTORY ? "ok" : "vorlaeufig",
        evidence: "belegt",
        weight: 1,
        text:
          streak >= 3
            ? `Funding ${round(annual, 1)} % p. a. seit ${streak} Terminen im Extrembereich. Eine Seite zahlt dauerhaft, der Markt ist einseitig gehebelt.`
            : p > 90
              ? `Funding ${round(annual, 1)} % p. a. im ${round(p, 0)}. Perzentil. Positionierung wird einseitig.`
              : `Funding ${round(annual, 1)} % p. a. (${round(p, 0)}. Perzentil). Unauffällig. Hinweis: Seit 2024 sind Funding-Extreme strukturell kleiner.`,
        values: { funding8h: round(cur * 100, 4), fundingJahr: round(annual, 1), perzentil: round(p, 0), serie: streak, bybit8h: raw.bybit ? round(raw.bybit.fundingRate * 100, 4) : null },
        historyPoints: okx.length,
      });

      // Richtung: 30-Tage-Mittel und Negativserie
      const last30 = fundOkx.filter((pt) => pt.ts >= now - 30 * DAY).map((pt) => pt.value);
      const m30 = mean(last30);
      let negDays = 0;
      for (let i = fundOkx.length - 1; i >= 0 && fundOkx[i].value < 0; i--) negDays++;
      negDays = negDays / 3;
      let tilt = 0;
      let text = `30-Tage-Funding im Mittel ${round(m30 * 3 * 365 * 100, 1)} % p. a. Kein Regime-Signal.`;
      if (m30 < 0 && negDays >= 21) {
        tilt = 0.6;
        text = `Funding seit ${Math.round(negDays)} Tagen negativ. Solche Phasen waren historisch Bodenregime mit positiven Renditen auf 90 Tage (K33). Wirkt auf Wochen, nicht Tage.`;
      } else if (m30 < 0) {
        tilt = 0.25;
        text = `30-Tage-Funding leicht negativ (${round(m30 * 3 * 365 * 100, 1)} % p. a.). Shorts zahlen, Tendenz konstruktiv.`;
      } else if (m30 * 3 * 365 > 0.2) {
        tilt = -0.4;
        text = `30-Tage-Funding hoch (${round(m30 * 3 * 365 * 100, 1)} % p. a.). Longs zahlen viel, Überhitzungsrisiko.`;
      }
      neigung.push({ id: "funding30", name: "Funding-Regime (30 Tage)", tilt, status: last30.length >= 60 ? "ok" : "vorlaeufig", evidence: "belegt", weight: 1, text, values: { mittel30dJahr: round(m30 * 3 * 365 * 100, 1), negativeTage: Math.round(negDays) } });
    } else {
      spannung.push(fehlt("funding", "Funding-Rate", 1, "belegt", "Funding-Historie fehlt."));
      neigung.push({ id: "funding30", name: "Funding-Regime (30 Tage)", tilt: NaN, status: "fehlt", evidence: "belegt", weight: 1, text: "Funding-Historie fehlt.", values: {} });
    }
    void fundBybit;
  }

  // 6) 25-Delta-Skew
  {
    const sk = raw.options?.length ? skew25(raw.options, expiries, 30, now) : null;
    if (sk) {
      const hist = skewHist.map((p) => p.value);
      let score: number;
      let percentile: number | undefined;
      if (hist.length >= MIN_HISTORY) {
        percentile = percentileRank(sk.skewRel, hist);
        score = Math.max(percentile, 100 - percentile) * 0.8 + (percentile > 90 ? 20 : 0);
      } else {
        // vorläufige feste Schwellen: > 10 % Put-Aufschlag = Angst, < -2 % = Sorglosigkeit
        score = sk.skewRel > 10 ? 80 : sk.skewRel < -2 ? 65 : clamp(Math.abs(sk.skewRel) * 5, 0, 50);
      }
      spannung.push({
        id: "skew",
        name: "Put-Skew (25 Delta)",
        score: clamp(score, 0, 100),
        percentile,
        status: hist.length >= MIN_HISTORY ? "ok" : "vorlaeufig",
        evidence: "plausibel",
        weight: 0.8,
        text:
          sk.skewRel > 10
            ? `Puts kosten ${round(sk.skewRel, 1)} % mehr als Calls (30 Tage). Hohe Absicherungsnachfrage: Angst, zugleich Squeeze-Potenzial.`
            : sk.skewRel < -2
              ? `Calls sind teurer als Puts (Skew ${round(sk.skewRel, 1)} %). Sorglosigkeit, Long-Flush-Risiko.`
              : `Skew ${round(sk.skewRel, 1) } % (Put-IV ${round(sk.ivPut, 1)} gegen Call-IV ${round(sk.ivCall, 1)}). Unauffällig.`,
        values: { skewProzent: round(sk.skewRel, 1), ivPut25: round(sk.ivPut, 1), ivCall25: round(sk.ivCall, 1) },
        historyPoints: hist.length,
      });
    } else spannung.push(fehlt("skew", "Put-Skew (25 Delta)", 0.8, "plausibel", "Nicht genug Optionsquotes für die Delta-Rechnung."));
  }

  // 7) Basis gegen 2-Jahres-US-Zins
  {
    const dgs2 = global.fred.DGS2?.value;
    const b = raw.okxFuture;
    if (b && Number.isFinite(dgs2)) {
      const excess = b.basisAnnual - dgs2!;
      const hist = basisHist.map((p) => p.value);
      let score = excess < 0 ? clamp(60 + -excess * 10, 60, 90) : b.basisAnnual > 15 ? 80 : clamp(b.basisAnnual * 3, 0, 45);
      let percentile: number | undefined;
      if (hist.length >= MIN_HISTORY) {
        percentile = percentileRank(b.basisAnnual, hist);
        score = 0.6 * score + 0.4 * Math.max(percentile, 100 - percentile);
      }
      spannung.push({
        id: "basis",
        name: "Futures-Basis",
        score: clamp(score, 0, 100),
        percentile,
        status: hist.length >= MIN_HISTORY ? "ok" : "vorlaeufig",
        evidence: "plausibel",
        weight: 0.8,
        text:
          excess < 0
            ? `Quartalsbasis ${round(b.basisAnnual, 1)} % p. a. liegt unter dem 2-Jahres-US-Zins ${round(dgs2!, 2)} %. Cash-and-Carry lohnt nicht mehr, Abbau dieser Positionen kann in beide Richtungen wirken.`
            : b.basisAnnual > 15
              ? `Quartalsbasis ${round(b.basisAnnual, 1)} % p. a. Überhitzung wie 2021 und Anfang 2024.`
              : `Quartalsbasis ${round(b.basisAnnual, 1)} % p. a. gegen ${round(dgs2!, 2)} % Zins. Normal.`,
        values: { basisJahr: round(b.basisAnnual, 2), zins2j: round(dgs2!, 2), kontrakt: b.instId, resttage: Math.round(b.daysToExpiry) },
        historyPoints: hist.length,
      });
    } else spannung.push(fehlt("basis", "Futures-Basis", 0.8, "plausibel", "Quartalsfuture oder US-Zins fehlt."));
  }

  // Richtung A) Positionsaufbau aus Preis und offenem Interesse (7 Tage)
  {
    const closeByDay = new Map(closedDays.map((p) => [p.ts, p.value]));
    const quads: { ts: number; longOpen: number; shortOpen: number; longClose: number; shortClose: number }[] = [];
    for (let i = 1; i < oiOkx1d.length; i++) {
      const p0 = closeByDay.get(oiOkx1d[i - 1].ts);
      const p1 = closeByDay.get(oiOkx1d[i].ts);
      if (!p0 || !p1) continue;
      const dOi = oiOkx1d[i].value - oiOkx1d[i - 1].value;
      const dPx = p1 - p0;
      quads.push({
        ts: oiOkx1d[i].ts,
        longOpen: dPx > 0 && dOi > 0 ? dOi : 0,
        shortOpen: dPx < 0 && dOi > 0 ? dOi : 0,
        longClose: dPx < 0 && dOi < 0 ? -dOi : 0,
        shortClose: dPx > 0 && dOi < 0 ? -dOi : 0,
      });
    }
    if (quads.length >= 30) {
      const sum7 = (k: "longOpen" | "shortOpen") => {
        const out: number[] = [];
        for (let i = 6; i < quads.length; i++) out.push(quads.slice(i - 6, i + 1).reduce((a, q) => a + q[k], 0));
        return out;
      };
      const lo = sum7("longOpen");
      const so = sum7("shortOpen");
      const zLo = zScore(lo[lo.length - 1], lo);
      const zSo = zScore(so[so.length - 1], so);
      const diff = zSo - zLo;
      const tilt = Math.abs(zLo) < 1 && Math.abs(zSo) < 1 ? 0 : clamp(diff / 4, -1, 1);
      neigung.push({
        id: "lpoc",
        name: "Positionsaufbau (Preis × OI)",
        tilt,
        status: quads.length >= 120 ? "ok" : "vorlaeufig",
        evidence: "plausibel",
        weight: 1,
        text:
          zLo >= 2
            ? `Sieben Tage starker Long-Aufbau bei steigendem Kurs (z = ${round(zLo, 1)}). Solche Rampen gingen Umkehrungen voraus, Long-Squeeze-Risiko.`
            : zSo >= 2
              ? `Sieben Tage starker Short-Aufbau bei fallendem Kurs (z = ${round(zSo, 1)}). Wenn diese Shorts schließen müssen, entsteht der Squeeze nach oben.`
              : zLo >= 1 || zSo >= 1
                ? `Leichter ${zSo > zLo ? "Short" : "Long"}-Aufbau über sieben Tage (z = ${round(Math.max(zLo, zSo), 1)}). Noch kein Extrem.`
                : "Kein auffälliger einseitiger Positionsaufbau in den letzten sieben Tagen.",
        values: { zLongOpen: round(zLo, 2), zShortOpen: round(zSo, 2) },
      });
    } else neigung.push({ id: "lpoc", name: "Positionsaufbau (Preis × OI)", tilt: NaN, status: "fehlt", evidence: "plausibel", weight: 1, text: "OI-Historie fehlt.", values: {} });
  }

  // Richtung B) ETF-Zuflüsse, 5-Tage-Summe
  {
    const flows = etf1d.map((p) => p.value);
    if (flows.length >= 30) {
      const sums: number[] = [];
      for (let i = 4; i < flows.length; i++) sums.push(flows.slice(i - 4, i + 1).reduce((a, b) => a + b, 0));
      const s5 = sums[sums.length - 1];
      const z = zScore(s5, sums);
      let outDays = 0;
      for (let i = flows.length - 1; i >= 0 && flows[i] < 0; i--) outDays++;
      let tilt = clamp(z / 2, -1, 1);
      if (outDays >= 5) tilt = Math.min(tilt, -0.5);
      neigung.push({
        id: "etf",
        name: "ETF-Zuflüsse (5 Tage)",
        tilt,
        status: "ok",
        evidence: "belegt",
        weight: 1.2,
        text:
          Math.abs(z) > 2
            ? `US-Spot-ETFs: ${round(s5 / 1e6, 0)} Mio. $ netto in fünf Tagen (z = ${round(z, 1)}). Flows wirken am selben und am Folgetag in Kursrichtung.`
            : outDays >= 5
              ? `${outDays} Abflusstage in Folge. Nachfrageschwäche über die ETFs.`
              : `ETF-Netto-Flow fünf Tage: ${round(s5 / 1e6, 0)} Mio. $. Kein Extrem.`,
        values: { summe5dMio: round(s5 / 1e6, 0), z: round(z, 2), abflusstage: outDays, letzterTag: raw.etf?.[raw.etf.length - 1]?.date ?? null },
      });
    } else neigung.push({ id: "etf", name: "ETF-Zuflüsse (5 Tage)", tilt: NaN, status: "fehlt", evidence: "belegt", weight: 1.2, text: "ETF-Flow-Historie fehlt.", values: {} });
  }

  // Richtung C) Liquidations-Impuls (OKX, letzte 24 Stunden)
  {
    const l24 = raw.liquidations24h;
    const dayLong = dailySums(liqLong);
    const dayShort = dailySums(liqShort);
    if (l24) {
      const total = l24.longUsd + l24.shortUsd;
      const histTotals = dayLong.map((v, i) => v + (dayShort[i] ?? 0));
      const p = histTotals.length >= 14 ? percentileRank(total, histTotals) : NaN;
      const share = total > 0 ? l24.longUsd / total : 0.5;
      // Nach einem Long-Flush neigt der Markt kurz zum Gegenschub nach oben, nach einem Short-Squeeze nach unten.
      let tilt = 0;
      if (Number.isFinite(p) && p > 90) tilt = share > 0.7 ? 0.4 : share < 0.3 ? -0.4 : 0;
      neigung.push({
        id: "liq",
        name: "Liquidations-Impuls (24 h)",
        tilt,
        status: histTotals.length >= 30 ? "ok" : "vorlaeufig",
        evidence: "plausibel",
        weight: 0.6,
        text:
          Number.isFinite(p) && p > 90
            ? `${round(total / 1e6, 1)} Mio. $ liquidiert (OKX, ${round(share * 100, 0)} % Longs), ${round(p, 0)}. Perzentil. Hebel wurde abgeräumt, ein bis drei Tage erhöhtes Gegenrisiko.`
            : `${round(total / 1e6, 1)} Mio. $ liquidiert in 24 Std. (OKX, ${round(share * 100, 0)} % Longs). Keine Kaskade.`,
        values: { longMio: round(l24.longUsd / 1e6, 2), shortMio: round(l24.shortUsd / 1e6, 2), anzahl: l24.count, perzentil: Number.isFinite(p) ? round(p, 0) : null },
      });
    } else neigung.push({ id: "liq", name: "Liquidations-Impuls (24 h)", tilt: NaN, status: "fehlt", evidence: "plausibel", weight: 0.6, text: "OKX-Liquidationen nicht verfügbar.", values: {} });
  }

  return { spannung, neigung, expiries };
}

function quantile(xs: number[], q: number): number {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return NaN;
  const i = (s.length - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}

function dailySums(points: { ts: number; value: number }[]): number[] {
  const m = new Map<number, number>();
  for (const p of points) {
    const d = Math.floor(p.ts / DAY) * DAY;
    m.set(d, (m.get(d) ?? 0) + p.value);
  }
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
}
