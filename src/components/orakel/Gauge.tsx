import Info from "./Info";
import { ERKLAERUNG } from "./erklaerungen";

type Ampel = "gruen" | "gelb" | "rot";
const FARBE: Record<Ampel, string> = { gruen: "#4a7878", gelb: "#c4a35a", rot: "#b4432e" };

const CX = 100;
const CY = 92;
const R = 74;
const angle = (p: number) => Math.PI - (p / 100) * Math.PI; // 0 → links, 100 → rechts
const pt = (p: number, rad = R) => ({ x: CX + rad * Math.cos(angle(p)), y: CY - rad * Math.sin(angle(p)) });
const arc = (from: number, to: number, color: string) => {
  const a = pt(from);
  const b = pt(to);
  return <path key={`${from}-${to}`} d={`M ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${b.x} ${b.y}`} stroke={color} strokeWidth="16" fill="none" />;
};

function Needle({ p }: { p: number }) {
  const n = pt(p, R - 6);
  return (
    <g>
      <line x1={CX} y1={CY} x2={n.x} y2={n.y} stroke="#363636" strokeWidth="3" strokeLinecap="round" />
      <circle cx={CX} cy={CY} r="6" fill="#363636" />
      <circle cx={CX} cy={CY} r="2.5" fill="#f5f2ed" />
    </g>
  );
}

function Frame({ children, value, label, verdict, ampel, infoKey }: { children: React.ReactNode; value: string; label: string; verdict: string; ampel: Ampel; infoKey: string }) {
  return (
    <div className="flex flex-col items-center w-full max-w-[400px]">
      <svg viewBox="0 0 200 108" className="w-full h-auto" role="img" aria-label={`${label}: ${value}`}>
        {children}
      </svg>
      <div className="font-display text-6xl text-nero-black -mt-1 leading-none">{value}</div>
      <div className="mt-4 text-sm tracking-[0.2em] uppercase text-nero-anthrazit/60 flex items-center">
        {label}
        <Info text={ERKLAERUNG[infoKey]} label={label} />
      </div>
      <div className="mt-2 text-xl font-normal" style={{ color: FARBE[ampel] }}>
        {verdict}
      </div>
    </div>
  );
}

/** Halbkreis-Tacho, 0 bis 100, drei Farbzonen und Nadel. */
export default function Gauge({ value, label, verdict, ampel }: { value: number; label: string; verdict: string; ampel: Ampel }) {
  const v = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : NaN;
  return (
    <Frame value={Number.isFinite(v) ? String(Math.round(v)) : "–"} label={label} verdict={verdict} ampel={ampel} infoKey="spannung">
      {arc(0, 35, "#4a787855")}
      {arc(35, 55, "#4a7878")}
      {arc(55, 75, "#c4a35a")}
      {arc(75, 100, "#b4432e")}
      {[25, 50, 75].map((p) => {
        const a = pt(p, R + 13);
        return (
          <text key={p} x={a.x} y={a.y + 3} fontSize="9" textAnchor="middle" fill="#909090" fontFamily="var(--font-dm-sans)">
            {p}
          </text>
        );
      })}
      <text x={CX - R} y={CY + 14} fontSize="9" textAnchor="middle" fill="#909090" fontFamily="var(--font-dm-sans)">0</text>
      <text x={CX + R} y={CY + 14} fontSize="9" textAnchor="middle" fill="#909090" fontFamily="var(--font-dm-sans)">100</text>
      {Number.isFinite(v) && <Needle p={v} />}
    </Frame>
  );
}

/** Tacho für die Neigung: -1 (bärisch) bis +1 (bullisch). */
export function TiltGauge({ value, verdict, ampel }: { value: number; verdict: string; ampel: Ampel }) {
  const v = Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : NaN;
  const pct = Number.isFinite(v) ? ((v + 1) / 2) * 100 : NaN;
  const top = pt(50, R + 13);
  return (
    <Frame value={Number.isFinite(v) ? (v > 0 ? "+" : "") + v.toFixed(2) : "–"} label="Neigung" verdict={verdict} ampel={ampel} infoKey="neigung">
      {arc(0, 25, "#b4432e")}
      {arc(25, 40, "#b4432e88")}
      {arc(40, 60, "#d9d2c7")}
      {arc(60, 75, "#4a787888")}
      {arc(75, 100, "#4a7878")}
      <text x={top.x} y={top.y + 3} fontSize="9" textAnchor="middle" fill="#909090" fontFamily="var(--font-dm-sans)">neutral</text>
      <text x={CX - R} y={CY + 14} fontSize="9" textAnchor="middle" fill="#b4432e" fontFamily="var(--font-dm-sans)">bärisch</text>
      <text x={CX + R} y={CY + 14} fontSize="9" textAnchor="middle" fill="#4a7878" fontFamily="var(--font-dm-sans)">bullisch</text>
      {Number.isFinite(pct) && <Needle p={pct} />}
    </Frame>
  );
}
