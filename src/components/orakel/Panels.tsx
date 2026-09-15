import type { Context } from "@/lib/orakel/run";
import { usd, num, pct, mrd, mio, datum } from "./Format";
import Countdown from "./Countdown";

export function Kachel({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border-t border-nero-gold/60 pt-3">
      <div className="text-[10px] tracking-[0.15em] uppercase text-nero-anthrazit/55">{label}</div>
      <div className="font-display text-lg text-nero-black mt-1">{value}</div>
      {sub && <div className="text-xs text-nero-anthrazit/60 mt-0.5">{sub}</div>}
    </div>
  );
}

export function Optionen({ o, spot }: { o: Context["optionen"]; spot: number }) {
  const n = o.naechsterVerfall;
  const g = o.groessterVerfall;
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
        <Kachel label="Nächster Verfall" value={n ? datum(n.ts) : "–"} sub={n ? `${mrd(n.notionalMrd * 1e9)} offen, IV ${num(n.atmIv)} %` : undefined} />
        <Kachel label="Max Pain" value={n ? usd(n.maxPain) : "–"} sub={n ? `${pct(((n.maxPain - spot) / spot) * 100)} zum Kurs. Nur Information, kein Kursziel.` : undefined} />
        <Kachel label="Put-Wand / Call-Wand" value={n ? `${usd(n.putWall)} / ${usd(n.callWall)}` : "–"} sub="Strikes mit dem meisten offenen Interesse unter und über dem Kurs" />
        <Kachel label="Put/Call (OI, gesamt)" value={o.putCallOi == null ? "–" : num(o.putCallOi, 2)} sub={`${mrd(o.gesamtOiUsd)} offenes Interesse in Optionen`} />
      </div>
      {g && g.ts !== n?.ts && (
        <p className="text-sm text-nero-anthrazit/70 mt-5">
          Größter Verfall: {datum(g.ts)} mit {mrd(g.notionalMrd * 1e9)}, Max Pain {usd(g.maxPain)}, Put/Call {num(g.putCall ?? NaN, 2)}.
        </p>
      )}
      <div className="overflow-x-auto mt-5">
        <table className="w-full text-xs text-nero-anthrazit/80">
          <thead>
            <tr className="text-[10px] tracking-[0.15em] uppercase text-nero-anthrazit/50">
              <th className="text-left font-normal py-1">Verfall</th>
              <th className="text-right font-normal">Tage</th>
              <th className="text-right font-normal">Offen</th>
              <th className="text-right font-normal">ATM-IV</th>
              <th className="text-right font-normal">Max Pain</th>
              <th className="text-right font-normal">Put/Call</th>
            </tr>
          </thead>
          <tbody>
            {o.verfaelle.map((v) => (
              <tr key={v.ts} className="border-t border-nero-beige">
                <td className="py-1.5">{datum(v.ts, false)}</td>
                <td className="text-right">{num(v.tage, 1)}</td>
                <td className="text-right">{mrd(v.notionalMrd * 1e9)}</td>
                <td className="text-right">{num(v.atmIv)} %</td>
                <td className="text-right">{usd(v.maxPain)}</td>
                <td className="text-right">{v.putCall == null ? "–" : num(v.putCall, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Positionierung({ p }: { p: Context["positionierung"] }) {
  const oi = [
    ["OKX", p.oiOkxUsd],
    ["Bybit", p.oiBybitUsd],
    ["Deribit", p.oiDeribitUsd],
  ] as const;
  const max = Math.max(...oi.map(([, v]) => v ?? 0), 1);
  const f = (v: number | null) => (v == null ? "–" : `${pct(v * 100, 4)} / 8 h (${pct(v * 3 * 365 * 100, 1)} p. a.)`);
  const liq = p.liquidationen24h;
  const liqTotal = liq ? liq.longUsd + liq.shortUsd : 0;
  return (
    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
      <div>
        <div className="text-[10px] tracking-[0.15em] uppercase text-nero-anthrazit/55 mb-3">Offenes Interesse Perpetuals</div>
        {oi.map(([name, v]) => (
          <div key={name} className="flex items-center gap-3 mb-2 text-xs">
            <span className="w-14 text-nero-anthrazit/70">{name}</span>
            <div className="flex-1 h-1.5 bg-nero-beige">
              <div className="h-full bg-nero-teal" style={{ width: `${((v ?? 0) / max) * 100}%` }} />
            </div>
            <span className="w-24 text-right text-nero-black">{mrd(v)}</span>
          </div>
        ))}
        <div className="text-[10px] tracking-[0.15em] uppercase text-nero-anthrazit/55 mt-6 mb-2">Funding</div>
        <div className="text-xs text-nero-anthrazit/80 space-y-1">
          <div>OKX {f(p.fundingOkx8h)}</div>
          <div>Bybit {f(p.fundingBybit8h)}</div>
          <div>Deribit {f(p.fundingDeribit8h)}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <Kachel label="Long/Short-Konten OKX" value={p.longShortOkx == null ? "–" : num(p.longShortOkx, 2)} sub="über 1 = mehr Konten long" />
        <Kachel label="Long-Anteil Bybit" value={p.longAnteilBybit == null ? "–" : `${num(p.longAnteilBybit * 100, 1)} %`} />
        <Kachel label="Taker-Käufe / -Verkäufe" value={p.takerBuyUsd && p.takerSellUsd ? num(p.takerBuyUsd / p.takerSellUsd, 2) : "–"} sub={p.takerBuyUsd ? `${mrd(p.takerBuyUsd)} gegen ${mrd(p.takerSellUsd)} (OKX, Tag)` : undefined} />
        <Kachel label="Liquidationen 24 h (OKX)" value={liq ? mio(liqTotal) : "–"} sub={liq && liqTotal > 0 ? `${num((liq.longUsd / liqTotal) * 100, 0)} % Longs, ${liq.count} Orders. Nur OKX, keine Marktsumme.` : undefined} />
        <Kachel label="Basis Quartalsfuture" value={p.basis ? `${num(p.basis.jahresrate, 1)} % p. a.` : "–"} sub={p.basis ? `${p.basis.kontrakt}, ${p.basis.resttage} Tage` : undefined} />
      </div>
    </div>
  );
}

export function Makro({ m, coin }: { m: Context["makro"]; coin: "BTC" | "ETH" }) {
  const fg = m.fearGreed;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
      <Kachel label="US-Zins 2 Jahre" value={m.zins2j ? `${num(m.zins2j.value, 2)} %` : "–"} sub={m.zins2j ? `Stand ${m.zins2j.date}` : undefined} />
      <Kachel label="US-Zins 10 Jahre" value={m.zins10j ? `${num(m.zins10j.value, 2)} %` : "–"} sub={m.fedFunds ? `Leitzins effektiv ${num(m.fedFunds.value, 2)} %` : undefined} />
      <Kachel label="Dollar-Index (Fed, breit)" value={m.dollarIndex ? num(m.dollarIndex.value, 1) : "–"} sub={m.dollarIndex ? `Stand ${m.dollarIndex.date}` : undefined} />
      <Kachel label="EUR/USD · USD/JPY" value={m.usdEur ? `${num(1 / m.usdEur, 4)} · ${num(m.usdJpy ?? NaN, 1)}` : "–"} sub={m.fxDatum ? `EZB-Kurs ${m.fxDatum}` : undefined} />
      <Kachel label="Fear & Greed" value={fg ? `${fg.value}` : "–"} sub={fg ? `${fg.label}. Kein Vorhersagewert, nur Stimmung.` : undefined} />
      <Kachel label="Stablecoins" value={m.stablecoins ? `${num(m.stablecoins.usdtMrd + m.stablecoins.usdcMrd, 0)} Mrd. $` : "–"} sub={m.stablecoins ? `USDT ${pct(m.stablecoins.usdtWoche, 2)}, USDC ${pct(m.stablecoins.usdcWoche, 2)} je Woche` : undefined} />
      {coin === "BTC" ? (
        <Kachel label="Bitcoin-Gebühren" value={m.btcGebuehren ? `${m.btcGebuehren.fastest} sat/vB` : "–"} sub="schnellste Bestätigung" />
      ) : (
        <Kachel label="ETH gestakt" value={m.ethGestaktMio ? `${num(m.ethGestaktMio, 2)} Mio. ETH` : "–"} />
      )}
    </div>
  );
}

export function Etf({ e }: { e: Context["etf"] }) {
  if (!e) return <p className="text-sm text-nero-anthrazit/60">ETF-Daten derzeit nicht verfügbar.</p>;
  const max = Math.max(...e.verlauf.map((v) => Math.abs(v.m)), 1);
  return (
    <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <Kachel label={`Letzter Tag (${e.letzterTag})`} value={`${pct(e.letzterFlowMio, 0).replace(" %", "")} Mio. $`} />
        <Kachel label="5 Tage" value={`${pct(e.summe5dMio, 0).replace(" %", "")} Mio. $`} />
        <Kachel label="30 Tage" value={`${pct(e.summe30dMio, 0).replace(" %", "")} Mio. $`} />
        <Kachel label="Verwaltetes Vermögen" value={`${num(e.vermoegenMrd, 1)} Mrd. $`} />
      </div>
      <div>
        <div className="text-[10px] tracking-[0.15em] uppercase text-nero-anthrazit/55 mb-3">Tägliche Netto-Flows, 30 Handelstage</div>
        <div className="flex items-end gap-[3px] h-24">
          {e.verlauf.map((v) => (
            <div key={v.d} className="flex-1 flex flex-col justify-end h-full" title={`${v.d}: ${num(v.m, 0)} Mio. $`}>
              <div className="w-full" style={{ height: `${(Math.abs(v.m) / max) * 100}%`, background: v.m >= 0 ? "#4a7878" : "#b4432e", opacity: 0.85 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Termine({ t }: { t: Context["termine"] }) {
  if (!t.length) return <p className="text-sm text-nero-anthrazit/60">Keine Termine in den nächsten 14 Tagen.</p>;
  return (
    <ul className="divide-y divide-nero-beige">
      {t.map((e) => (
        <li key={`${e.art}-${e.ts}`} className="py-3 flex items-baseline justify-between gap-4 text-sm">
          <div>
            <span className="text-nero-black">{e.label}</span>
            {e.notionalMrd != null && <span className="text-nero-anthrazit/60"> · {num(e.notionalMrd, 1)} Mrd. $ offen</span>}
            <div className="text-xs text-nero-anthrazit/55">{datum(e.ts)} Uhr</div>
          </div>
          <div className="font-display text-nero-teal whitespace-nowrap">
            <Countdown ts={e.ts} />
          </div>
        </li>
      ))}
    </ul>
  );
}
