import { and, eq, gte } from "drizzle-orm";
import type { Db } from "./db/client";
import { alerts } from "./db/schema";
import type { Pegel } from "./pegel";
import type { SignalSet } from "./signals";
import type { Event } from "./calendar";
import { DAY } from "./series";

export interface CoinResult { coin: "BTC" | "ETH"; pegel: Pegel; signals: SignalSet; priceEur: number | undefined; prevSpannung: number | undefined }

interface Hinweis { kind: "warnung" | "gelegenheit" | "termin"; coin?: "BTC" | "ETH"; dedupeKey: string; titel: string; zeilen: string[] }

/** Leitet aus Pegeln und Kalender die Hinweise ab. Reine Funktion, ohne Versand. */
export function deriveHinweise(results: CoinResult[], events: Event[], now: number): Hinweis[] {
  const out: Hinweis[] = [];
  const day = new Date(now).toISOString().slice(0, 10);
  for (const r of results) {
    const s = r.pegel.spannung;
    const n = r.pegel.neigung;
    const top = r.signals.spannung.filter((x) => Number.isFinite(x.score)).sort((a, b) => b.score - a.score).slice(0, 3);
    const topLines = top.map((x) => `${x.name}: ${Math.round(x.score)} von 100. ${x.text}`);
    if (s.score >= 75) {
      out.push({
        kind: "warnung", coin: r.coin, dedupeKey: `warnung:${r.coin}:hoch:${day}`,
        titel: `${r.coin}: Spannung ${s.score} von 100, ${s.verdict.toLowerCase()}`,
        zeilen: [
          `Der Spannungspegel für ${r.coin} steht bei ${s.score}${s.faktor !== 1 ? ` (Basis ${s.basis}, Kalenderfaktor ${s.faktor}: ${s.gruende.join(", ")})` : ""}.`,
          `Neigung: ${n.verdict} (${n.wert}).`,
          ...topLines,
        ],
      });
    } else if (r.prevSpannung !== undefined && s.score - r.prevSpannung >= 20) {
      out.push({
        kind: "warnung", coin: r.coin, dedupeKey: `warnung:${r.coin}:sprung:${day}`,
        titel: `${r.coin}: Spannung springt von ${r.prevSpannung} auf ${s.score}`,
        zeilen: [`Anstieg um ${s.score - r.prevSpannung} Punkte innerhalb von 24 Stunden.`, ...topLines],
      });
    }
    if (s.score >= 50 && (n.stufe === "stark bullisch" || n.stufe === "stark bärisch")) {
      const dirLines = r.signals.neigung.filter((x) => Number.isFinite(x.tilt) && Math.abs(x.tilt) >= 0.3).map((x) => `${x.name}: ${x.text}`);
      out.push({
        kind: "gelegenheit", coin: r.coin, dedupeKey: `gelegenheit:${r.coin}:${n.stufe}:${day}`,
        titel: `${r.coin}: Neigung ${n.verdict.toLowerCase()} bei Spannung ${s.score}`,
        zeilen: [`Die Richtungssignale zeigen ${n.verdict.toLowerCase()} (${n.wert}), während der Spannungspegel bei ${s.score} steht.`, ...dirLines],
      });
    }
  }
  const soon = events.filter((e) => e.hoursAway > 0 && e.hoursAway <= 24 && (e.kind !== "verfall" || (e.notionalUsd ?? 0) >= 5e9));
  for (const e of soon) {
    const when = new Date(e.ts).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "short" });
    out.push({
      kind: "termin", dedupeKey: `termin:${e.kind}:${e.ts}`,
      titel: `In ${Math.round(e.hoursAway)} Std.: ${e.label}`,
      zeilen: [
        `${e.label} am ${when} Uhr${e.notionalUsd ? ` (${(e.notionalUsd / 1e9).toFixed(1)} Mrd. $ offenes Interesse)` : ""}.`,
        `Makrotermine verdoppeln die Tagesbewegung im Schnitt. Aktuelle Pegel: ${results.map((r) => `${r.coin} Spannung ${r.pegel.spannung.score}, Neigung ${r.pegel.neigung.verdict.toLowerCase()}`).join("; ")}.`,
      ],
    });
  }
  return out;
}

/** Sendet neue Hinweise gebündelt in einer Mail. Was in den letzten 24 Std. schon ging, geht nicht nochmal. */
export async function sendHinweise(db: Db, hinweise: Hinweis[], now: number, linkUrl: string): Promise<{ sent: number; skipped: number }> {
  const to = process.env.ORAKEL_MAIL_TO;
  if (!to || !hinweise.length) return { sent: 0, skipped: hinweise.length };
  const recent = await db.select({ key: alerts.dedupeKey }).from(alerts).where(gte(alerts.ts, new Date(now - DAY)));
  const seen = new Set(recent.map((r) => r.key));
  const fresh = hinweise.filter((h) => !seen.has(h.dedupeKey));
  if (!fresh.length) return { sent: 0, skipped: hinweise.length };

  const subject = fresh.length === 1 ? `Orakel: ${fresh[0].titel}` : `Orakel: ${fresh.length} Hinweise (${fresh.map((h) => h.kind).join(", ")})`;
  const html = renderMail(fresh, linkUrl, now);
  await sendMail(to, subject, html);
  for (const h of fresh) {
    await db.insert(alerts).values({ ts: new Date(now), coin: h.coin ?? null, kind: h.kind, dedupeKey: h.dedupeKey, payload: { titel: h.titel, zeilen: h.zeilen }, sentTo: to });
  }
  return { sent: fresh.length, skipped: hinweise.length - fresh.length };
}

/** Störungsmeldung an Calvin, höchstens einmal je 24 Std. */
export async function sendStoerung(db: Db, text: string, now: number): Promise<boolean> {
  const to = process.env.ORAKEL_MAIL_ADMIN || process.env.ORAKEL_MAIL_TO;
  if (!to) return false;
  const key = `stoerung:${new Date(now).toISOString().slice(0, 10)}`;
  const dup = await db.select({ id: alerts.id }).from(alerts).where(and(eq(alerts.dedupeKey, key), gte(alerts.ts, new Date(now - DAY)))).limit(1);
  if (dup.length) return false;
  await sendMail(to, "Orakel: Störung beim Datenlauf", `<p style="font-family:sans-serif">${escapeHtml(text).replace(/\n/g, "<br>")}</p>`);
  await db.insert(alerts).values({ ts: new Date(now), coin: null, kind: "stoerung", dedupeKey: key, payload: { text }, sentTo: to });
  return true;
}

async function sendMail(to: string, subject: string, html: string) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.ORAKEL_MAIL_FROM || "NERO Orakel <onboarding@resend.dev>";
  const { error } = await resend.emails.send({ from, to: to.split(",").map((s) => s.trim()), subject, html });
  if (error) throw new Error(`Resend: ${error.message}`);
}

function renderMail(hs: Hinweis[], link: string, now: number): string {
  const farbe: Record<Hinweis["kind"], string> = { warnung: "#b4432e", gelegenheit: "#4a7878", termin: "#c4a35a" };
  const label: Record<Hinweis["kind"], string> = { warnung: "Warnung", gelegenheit: "Gelegenheit", termin: "Termin" };
  const blocks = hs
    .map(
      (h) => `
      <div style="border-left:3px solid ${farbe[h.kind]};padding:12px 16px;margin:0 0 20px">
        <div style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:${farbe[h.kind]}">${label[h.kind]}</div>
        <div style="font-size:18px;font-weight:500;margin:4px 0 8px;color:#363636">${escapeHtml(h.titel)}</div>
        ${h.zeilen.map((z) => `<p style="margin:0 0 6px;color:#606060;line-height:1.5">${escapeHtml(z)}</p>`).join("")}
      </div>`,
    )
    .join("");
  const stamp = new Date(now).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "medium", timeStyle: "short" });
  return `
  <div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f5f2ed;color:#363636">
    <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c4a35a;margin-bottom:16px">Krypto-Orakel · ${stamp} Uhr</div>
    ${blocks}
    <p style="margin:24px 0 0"><a href="${link}" style="color:#4a7878">Zum Dashboard</a></p>
    <p style="font-size:12px;color:#909090;margin-top:24px">Die Pegel messen, wie anfällig der Markt für eine große Bewegung ist und in welche Richtung die Positionierung neigt. Sie sind keine Prognose und keine Anlageempfehlung.</p>
  </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
