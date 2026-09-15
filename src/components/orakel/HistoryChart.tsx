import { datum } from "./Format";

interface P { ts: number; value: number }

/** Verlauf des Spannungspegels (Fläche) gegen den Kurs (Linie), reines SVG. */
export default function HistoryChart({ spannung, preis, days }: { spannung: P[]; preis: P[]; days: number }) {
  const w = 720;
  const h = 200;
  const padL = 34;
  const padR = 58;
  const padT = 12;
  const padB = 24;
  const now = Date.now();
  const t0 = now - days * 86_400_000;
  const s = spannung.filter((p) => p.ts >= t0);
  const k = preis.filter((p) => p.ts >= t0);
  if (s.length < 2) {
    return (
      <div className="text-sm text-nero-anthrazit/60 py-10 text-center border-t border-nero-beige">
        Die Historie füllt sich mit jedem Lauf. Nach ein paar Tagen erscheint hier der Verlauf.
      </div>
    );
  }
  const x = (ts: number) => padL + ((ts - t0) / (now - t0)) * (w - padL - padR);
  const yS = (v: number) => padT + (1 - v / 100) * (h - padT - padB);
  const kMin = Math.min(...k.map((p) => p.value));
  const kMax = Math.max(...k.map((p) => p.value));
  const yK = (v: number) => padT + (1 - (v - kMin) / Math.max(kMax - kMin, 1)) * (h - padT - padB);
  const path = (pts: P[], y: (v: number) => number) => pts.map((p, i) => `${i ? "L" : "M"} ${x(p.ts).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const area = `${path(s, yS)} L ${x(s[s.length - 1].ts).toFixed(1)} ${yS(0)} L ${x(s[0].ts).toFixed(1)} ${yS(0)} Z`;
  const ticks = [0, 25, 50, 75, 100];
  const dayTicks: number[] = [];
  const step = days > 40 ? 14 : days > 10 ? 7 : 1;
  for (let d = Math.ceil((t0 + 1) / 86_400_000) * 86_400_000; d <= now; d += step * 86_400_000) dayTicks.push(d);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Verlauf Spannung und Kurs">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={w - padR} y1={yS(t)} y2={yS(t)} stroke="#e8e0d5" strokeWidth="1" />
          <text x={padL - 6} y={yS(t) + 3} fontSize="9" textAnchor="end" fill="#909090">{t}</text>
        </g>
      ))}
      <rect x={padL} y={yS(100)} width={w - padL - padR} height={yS(75) - yS(100)} fill="#b4432e0f" />
      <rect x={padL} y={yS(75)} width={w - padL - padR} height={yS(55) - yS(75)} fill="#c4a35a12" />
      <path d={area} fill="#4a787822" />
      <path d={path(s, yS)} fill="none" stroke="#4a7878" strokeWidth="1.8" />
      {k.length > 1 && <path d={path(k, yK)} fill="none" stroke="#363636" strokeWidth="1.2" strokeDasharray="3 3" />}
      {k.length > 1 && (
        <>
          <text x={w - padR + 6} y={yK(kMax) + 3} fontSize="9" fill="#606060">{Math.round(kMax).toLocaleString("de-DE")} €</text>
          <text x={w - padR + 6} y={yK(kMin) + 3} fontSize="9" fill="#606060">{Math.round(kMin).toLocaleString("de-DE")} €</text>
        </>
      )}
      {dayTicks.map((d) => (
        <text key={d} x={x(d)} y={h - 6} fontSize="9" textAnchor="middle" fill="#909090">{datum(d, false).slice(0, 5)}</text>
      ))}
    </svg>
  );
}
