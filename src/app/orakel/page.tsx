import { notFound } from "next/navigation";
import { hasAccess } from "@/lib/orakel/access";
import { loadDashboard, type CoinView } from "@/lib/orakel/view";
import Gauge, { TiltGauge } from "@/components/orakel/Gauge";
import HistoryChart from "@/components/orakel/HistoryChart";
import { SpannungListe, NeigungListe } from "@/components/orakel/SignalList";
import { Optionen, Positionierung, Makro, Etf, Termine } from "@/components/orakel/Panels";
import { eur, pct, datum } from "@/components/orakel/Format";

export const dynamic = "force-dynamic";
export const preferredRegion = "fra1";

export default async function OrakelPage() {
  if (!(await hasAccess())) notFound();
  const data = await loadDashboard(90);
  const stand = data.letzterLauf?.ts ?? 0;
  const alterStd = stand ? (Date.now() - stand) / 3_600_000 : Infinity;
  const frische = alterStd < 2 ? "gruen" : alterStd < 4 ? "gelb" : "rot";
  const frischeText = !stand ? "Noch kein Lauf" : alterStd < 2 ? "aktuell" : alterStd < 4 ? "etwas veraltet" : "veraltet";
  const farbe = { gruen: "#4a7878", gelb: "#c4a35a", rot: "#b4432e" }[frische];

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pb-24">
      <header className="pt-10 md:pt-14 pb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.2em] uppercase text-nero-gold mb-2">NERO · Krypto-Orakel</p>
          <h1 className="font-display text-3xl md:text-4xl text-nero-black leading-tight">Spannung und Neigung</h1>
        </div>
        <div className="text-right text-sm">
          <div className="flex items-center justify-end gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: farbe }} />
            <span style={{ color: farbe }}>{frischeText}</span>
          </div>
          <div className="text-nero-anthrazit/60 text-xs mt-1">{stand ? `Stand ${datum(stand)} Uhr` : "Der erste Datenlauf steht noch aus."}</div>
        </div>
      </header>

      {!data.coins.length && (
        <div className="border-t border-nero-gold pt-6 text-sm text-nero-anthrazit/70">
          Noch keine Daten. Der stündliche Lauf füllt das Dashboard beim ersten Durchgang.
        </div>
      )}

      {/* Pegel zuerst */}
      <section className="grid lg:grid-cols-2 gap-6">
        {data.coins.map((c) => (
          <PegelKarte key={c.coin} c={c} />
        ))}
      </section>

      {/* Erklärung und Kontext je Coin */}
      {data.coins.map((c) => (
        <CoinDetails key={c.coin} c={c} />
      ))}

      <footer className="mt-20 border-t border-nero-beige pt-8 text-xs text-nero-anthrazit/60 leading-relaxed max-w-3xl">
        <p className="mb-3">
          <strong className="font-normal text-nero-anthrazit">Spannung</strong> misst, wie anfällig der Markt für eine große Bewegung ist, egal in welche Richtung. Sie wird aus Volatilität, Optionsstruktur, Hebel, Funding, Skew und Futures-Basis gerechnet, jeweils im Vergleich zur eigenen Historie. Termine wie Zinsentscheide erhöhen den Wert.
          <strong className="font-normal text-nero-anthrazit"> Neigung</strong> zeigt, in welche Richtung Positionierung und Zuflüsse tendieren. Richtung ist auf Tagessicht schlecht vorhersagbar, deshalb nur grob in fünf Stufen.
        </p>
        <p className="mb-3">
          Werte mit dem Vermerk „vorläufig" haben noch eine kurze Vergleichshistorie. Sie werden mit jedem Tag belastbarer. Daten: Kraken, Deribit, OKX, Bybit, SoSoValue, FRED, EZB, DefiLlama, Alternative.me, mempool.space. Stündlich aktualisiert.
        </p>
        <p>Dieses Werkzeug ist eine Messhilfe, keine Prognose und keine Anlageempfehlung. Strukturelle Schocks wie Börsenausfälle oder Regulierung sind nicht messbar.</p>
      </footer>
    </div>
  );
}

function PegelKarte({ c }: { c: CoinView }) {
  const p = c.context.preis;
  const alt = (Date.now() - c.ts) / 3_600_000 > 4;
  return (
    <div className="bg-white/60 border-t-2 border-nero-gold px-5 md:px-8 py-6">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <span className="font-display text-2xl text-nero-black">{c.coin === "BTC" ? "Bitcoin" : "Ethereum"}</span>
          <span className="ml-3 text-sm text-nero-anthrazit/60">{c.coin}</span>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl text-nero-black">{eur(p.eur)}</div>
          <div className="text-xs text-nero-anthrazit/60">
            <span style={{ color: (p.aenderung24h ?? 0) >= 0 ? "#4a7878" : "#b4432e" }}>{pct(p.aenderung24h)}</span> 24 h ·{" "}
            <span style={{ color: (p.aenderung7d ?? 0) >= 0 ? "#4a7878" : "#b4432e" }}>{pct(p.aenderung7d)}</span> 7 Tage
          </div>
        </div>
      </div>
      {alt && <div className="mt-2 text-xs text-[#b4432e]">Diese Werte sind älter als vier Stunden.</div>}
      <div className="mt-6 flex flex-wrap justify-around gap-y-6">
        <Gauge value={c.pegel.spannung.score} label="Spannung" verdict={c.pegel.spannung.verdict} ampel={c.pegel.spannung.ampel} size={230} />
        <TiltGauge value={c.pegel.neigung.wert} verdict={c.pegel.neigung.verdict} ampel={c.pegel.neigung.ampel} size={230} />
      </div>
      {c.pegel.spannung.gruende.length > 0 && (
        <p className="mt-4 text-xs text-nero-anthrazit/70 text-center">
          Kalenderfaktor {c.pegel.spannung.faktor} (Basis {c.pegel.spannung.basis}): {c.pegel.spannung.gruende.join(", ")}
        </p>
      )}
      <div className="mt-5 grid grid-cols-3 gap-4 text-center text-xs text-nero-anthrazit/70">
        <div>
          <div className="text-[10px] tracking-[0.15em] uppercase text-nero-anthrazit/50">200-Tage-Linie</div>
          <div className="text-nero-black mt-1">{p.ma200 ? `${eur(p.ma200 * (p.eur / p.usd))} ${p.usd > p.ma200 ? "darüber" : "darunter"}` : "–"}</div>
        </div>
        <div>
          <div className="text-[10px] tracking-[0.15em] uppercase text-nero-anthrazit/50">7-Tage-Spanne</div>
          <div className="text-nero-black mt-1">{eur(p.tief7d * (p.eur / p.usd))} bis {eur(p.hoch7d * (p.eur / p.usd))}</div>
        </div>
        <div>
          <div className="text-[10px] tracking-[0.15em] uppercase text-nero-anthrazit/50">30 Tage</div>
          <div className="mt-1" style={{ color: (p.aenderung30d ?? 0) >= 0 ? "#4a7878" : "#b4432e" }}>{pct(p.aenderung30d)}</div>
        </div>
      </div>
    </div>
  );
}

function CoinDetails({ c }: { c: CoinView }) {
  const name = c.coin === "BTC" ? "Bitcoin" : "Ethereum";
  return (
    <section className="mt-16">
      <div className="flex items-baseline gap-3 mb-8">
        <h2 className="font-display text-2xl md:text-3xl text-nero-black">{name}</h2>
        <span className="text-[11px] tracking-[0.2em] uppercase text-nero-gold">Warum die Nadel so steht</span>
      </div>
      <div className="grid lg:grid-cols-2 gap-x-12 gap-y-10">
        <div>
          <h3 className="text-[11px] tracking-[0.2em] uppercase text-nero-anthrazit/55 mb-2">Spannung: sieben Signale</h3>
          <SpannungListe signals={c.signals.spannung} />
        </div>
        <div>
          <h3 className="text-[11px] tracking-[0.2em] uppercase text-nero-anthrazit/55 mb-2">Neigung: vier Signale</h3>
          <NeigungListe signals={c.signals.neigung} />
          <h3 className="text-[11px] tracking-[0.2em] uppercase text-nero-anthrazit/55 mt-10 mb-2">Termine</h3>
          <Termine t={c.context.termine} />
        </div>
      </div>

      <Block titel="Verlauf 90 Tage" hinweis="Spannung als Fläche, Kurs in Euro gestrichelt">
        <HistoryChart spannung={c.historie.spannung} preis={c.historie.preisEur} days={90} />
      </Block>
      <Block titel="Optionsmarkt (Deribit)">
        <Optionen o={c.context.optionen} spot={c.context.preis.usd} />
      </Block>
      <Block titel="Positionierung (Perpetuals)">
        <Positionierung p={c.context.positionierung} />
      </Block>
      <Block titel="US-Spot-ETFs">
        <Etf e={c.context.etf} />
      </Block>
      <Block titel="Makro">
        <Makro m={c.context.makro} coin={c.coin} />
      </Block>
      {Object.keys(c.context.quellenFehler).length > 0 && (
        <p className="mt-6 text-xs text-nero-anthrazit/50">
          Beim letzten Lauf nicht erreichbar: {Object.keys(c.context.quellenFehler).join(", ")}. Betroffene Werte stammen aus dem vorherigen Stand oder fehlen.
        </p>
      )}
    </section>
  );
}

function Block({ titel, hinweis, children }: { titel: string; hinweis?: string; children: React.ReactNode }) {
  return (
    <div className="mt-12">
      <div className="flex items-baseline gap-3 mb-5">
        <h3 className="font-display text-xl text-nero-black">{titel}</h3>
        {hinweis && <span className="text-xs text-nero-anthrazit/50">{hinweis}</span>}
      </div>
      {children}
    </div>
  );
}
