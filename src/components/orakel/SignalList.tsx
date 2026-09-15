import type { Signal, DirSignal } from "@/lib/orakel/signals";
import Info from "./Info";
import { ERKLAERUNG } from "./erklaerungen";

const badge = (status: string) =>
  status === "vorlaeufig" ? (
    <span className="ml-2 text-[10px] tracking-[0.15em] uppercase text-nero-gold" title="Die Vergleichshistorie ist noch kurz. Der Wert wird mit jedem Tag belastbarer.">vorläufig</span>
  ) : status === "fehlt" ? (
    <span className="ml-2 text-[10px] tracking-[0.15em] uppercase text-[#b4432e]">fehlt</span>
  ) : null;

const evidenz = (e: string) => (
  <span className="ml-2 text-[10px] tracking-[0.15em] uppercase text-nero-anthrazit/40" title={e === "belegt" ? "Durch Studien oder Backtests belegt." : "Mechanik klar, keine publizierte Trefferquote."}>
    {e}
  </span>
);

export function SpannungListe({ signals }: { signals: Signal[] }) {
  const sorted = [...signals].sort((a, b) => (Number.isFinite(b.score) ? b.score : -1) - (Number.isFinite(a.score) ? a.score : -1));
  return (
    <ul className="divide-y divide-nero-beige">
      {sorted.map((s) => {
        const v = Number.isFinite(s.score) ? Math.round(s.score) : null;
        const color = v == null ? "#d9d2c7" : v >= 75 ? "#b4432e" : v >= 55 ? "#c4a35a" : "#4a7878";
        return (
          <li key={s.id} className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <div className="text-base font-normal text-nero-black flex items-center flex-wrap">
                <span>{s.name}</span>
                <Info text={ERKLAERUNG[s.id]} label={s.name} />
                {badge(s.status)}
                {evidenz(s.evidence)}
              </div>
              <div className="font-display text-2xl" style={{ color }}>{v ?? "–"}</div>
            </div>
            <div className="h-1.5 bg-nero-beige mt-2 mb-3 rounded-sm overflow-hidden">
              <div className="h-full" style={{ width: `${v ?? 0}%`, background: color }} />
            </div>
            <p className="text-[15px] text-nero-anthrazit/80 leading-relaxed">{s.text}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function NeigungListe({ signals }: { signals: DirSignal[] }) {
  return (
    <ul className="divide-y divide-nero-beige">
      {signals.map((d) => {
        const t = Number.isFinite(d.tilt) ? d.tilt : null;
        const color = t == null ? "#d9d2c7" : t > 0.15 ? "#4a7878" : t < -0.15 ? "#b4432e" : "#909090";
        return (
          <li key={d.id} className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <div className="text-base font-normal text-nero-black flex items-center flex-wrap">
                <span>{d.name}</span>
                <Info text={ERKLAERUNG[d.id]} label={d.name} />
                {badge(d.status)}
                {evidenz(d.evidence)}
              </div>
              <div className="font-display text-2xl" style={{ color }}>{t == null ? "–" : (t > 0 ? "+" : "") + t.toFixed(2)}</div>
            </div>
            <div className="relative h-1.5 bg-nero-beige mt-2 mb-3 rounded-sm">
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-nero-anthrazit/30" />
              {t != null && (
                <div className="absolute top-0 bottom-0" style={{ left: t >= 0 ? "50%" : `${50 + t * 50}%`, width: `${Math.abs(t) * 50}%`, background: color }} />
              )}
            </div>
            <p className="text-[15px] text-nero-anthrazit/80 leading-relaxed">{d.text}</p>
          </li>
        );
      })}
    </ul>
  );
}
