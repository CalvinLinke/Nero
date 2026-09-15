import { NextRequest, NextResponse } from "next/server";
import { runOrakel } from "@/lib/orakel/run";

export const runtime = "nodejs";
export const preferredRegion = "fra1";
export const maxDuration = 120;
export const dynamic = "force-dynamic";

/**
 * Wird von Vercel Cron aufgerufen (Header "Authorization: Bearer <CRON_SECRET>").
 * Manuell auslösbar mit demselben Header.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Nicht erlaubt." }, { status: 401 });
  }
  try {
    const report = await runOrakel("cron");
    return NextResponse.json(report, { status: report.status === "failed" ? 500 : 200 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
