import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export function cookieValue(token: string): string {
  return createHash("sha256").update(`orakel:${token}`).digest("hex");
}

/** Prüft das Zugangs-Cookie, das der geheime Link gesetzt hat. */
export async function hasAccess(): Promise<boolean> {
  const token = process.env.ORAKEL_TOKEN;
  if (!token) return false;
  const c = (await cookies()).get("orakel")?.value;
  if (!c) return false;
  const a = Buffer.from(c);
  const b = Buffer.from(cookieValue(token));
  return a.length === b.length && timingSafeEqual(a, b);
}
