/** Halbkreis-Tacho, 0 bis 100, drei Farbzonen und Nadel. Reines SVG, serverseitig renderbar. */
export default function Gauge({
  value,
  label,
  verdict,
  ampel,
  size = 260,
}: {
  value: number;
  label: string;
  verdict: string;
  ampel: "gruen" | "gelb" | "rot";
  size?: number;
}) {
  const v = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : NaN;
  const cx = 100;
  const cy = 96;
  const r = 78;
  const angle = (p: number) => Math.PI - (p / 100) * Math.PI; // 0 → links, 100 → rechts
  const pt = (p: number, rad = r) => ({ x: cx + rad * Math.cos(angle(p)), y: cy - rad * Math.sin(angle(p)) });
  const arc = (from: number, to: number, color: string) => {
    const a = pt(from);
    const b = pt(to);
    return <path d={`M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`} stroke={color} strokeWidth="14" fill="none" strokeLinecap="butt" />;
  };
  const needle = Number.isFinite(v) ? pt(v, r - 4) : null;
  const farbe = { gruen: "#4a7878", gelb: "#c4a35a", rot: "#b4432e" }[ampel];
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 200 138" width={size} height={size * 0.69} role="img" aria-label={`${label}: ${Number.isFinite(v) ? Math.round(v) : "keine Daten"} von 100`}>
        {arc(0, 35, "#4a787855")}
        {arc(35, 55, "#4a7878")}
        {arc(55, 75, "#c4a35a")}
        {arc(75, 100, "#b4432e")}
        {[0, 25, 50, 75, 100].map((p) => {
          const a = pt(p, r + 11);
          return (
            <text key={p} x={a.x} y={a.y + 3} fontSize="7" textAnchor="middle" fill="#909090" fontFamily="var(--font-dm-sans)">
              {p}
            </text>
          );
        })}
        {needle && (
          <g>
            <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="#363636" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="5" fill="#363636" />
            <circle cx={cx} cy={cy} r="2" fill="#f5f2ed" />
          </g>
        )}
        <text x={cx} y={cy + 34} fontSize="28" textAnchor="middle" fill="#363636" fontFamily="var(--font-playfair)">
          {Number.isFinite(v) ? Math.round(v) : "–"}
        </text>
      </svg>
      <div className="text-[11px] tracking-[0.2em] uppercase text-nero-anthrazit/60 mt-1">{label}</div>
      <div className="mt-1 text-sm font-normal" style={{ color: farbe }}>
        {verdict}
      </div>
    </div>
  );
}

/** Tacho für die Neigung: -1 (bärisch) bis +1 (bullisch). */
export function TiltGauge({ value, verdict, ampel, size = 260 }: { value: number; verdict: string; ampel: "gruen" | "gelb" | "rot"; size?: number }) {
  const v = Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : NaN;
  const pct = Number.isFinite(v) ? ((v + 1) / 2) * 100 : NaN;
  const cx = 100;
  const cy = 96;
  const r = 78;
  const angle = (p: number) => Math.PI - (p / 100) * Math.PI;
  const pt = (p: number, rad = r) => ({ x: cx + rad * Math.cos(angle(p)), y: cy - rad * Math.sin(angle(p)) });
  const arc = (from: number, to: number, color: string) => {
    const a = pt(from);
    const b = pt(to);
    return <path d={`M ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y}`} stroke={color} strokeWidth="14" fill="none" />;
  };
  const needle = Number.isFinite(pct) ? pt(pct, r - 4) : null;
  const farbe = { gruen: "#4a7878", gelb: "#c4a35a", rot: "#b4432e" }[ampel];
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 200 138" width={size} height={size * 0.69} role="img" aria-label={`Neigung: ${verdict}`}>
        {arc(0, 25, "#b4432e")}
        {arc(25, 40, "#b4432e88")}
        {arc(40, 60, "#d9d2c7")}
        {arc(60, 75, "#4a787888")}
        {arc(75, 100, "#4a7878")}
        {[
          [0, "bärisch"],
          [50, "neutral"],
          [100, "bullisch"],
        ].map(([p, t]) => {
          const a = pt(Number(p), r + 12);
          return (
            <text key={String(p)} x={a.x} y={a.y + 3} fontSize="6.5" textAnchor={p === 0 ? "start" : p === 100 ? "end" : "middle"} fill="#909090" fontFamily="var(--font-dm-sans)">
              {t}
            </text>
          );
        })}
        {needle && (
          <g>
            <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="#363636" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="5" fill="#363636" />
            <circle cx={cx} cy={cy} r="2" fill="#f5f2ed" />
          </g>
        )}
        <text x={cx} y={cy + 34} fontSize="28" textAnchor="middle" fill="#363636" fontFamily="var(--font-playfair)">
          {Number.isFinite(v) ? (v > 0 ? "+" : "") + v.toFixed(2) : "–"}
        </text>
      </svg>
      <div className="text-[11px] tracking-[0.2em] uppercase text-nero-anthrazit/60 mt-1">Neigung</div>
      <div className="mt-1 text-sm font-normal" style={{ color: farbe }}>
        {verdict}
      </div>
    </div>
  );
}
