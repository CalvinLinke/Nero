import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { cookieValue } from "@/lib/orakel/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Geheimer Link: setzt ein Cookie für ein Jahr und leitet auf das Dashboard. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const expected = process.env.ORAKEL_TOKEN;
  if (!expected || !safeEqual(token, expected)) {
    return new NextResponse("Nicht gefunden", { status: 404 });
  }
  const res = NextResponse.redirect(new URL("/orakel", req.url));
  res.cookies.set("orakel", cookieValue(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}
