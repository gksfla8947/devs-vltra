import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { adminSecret } from "./admin-token";

type HeaderReader = Pick<Headers, "get">;

// Only trust the header overwritten by the deployment edge. Arbitrary X-Forwarded-For
// headers on local/self-hosted servers must not let callers choose their rate-limit key.
export function clientIdentity(headers: HeaderReader): string {
  const forwarded = process.env.VERCEL === "1" ? headers.get("x-vercel-forwarded-for") : null;
  const ip = forwarded?.split(",")[0].trim();
  const identity = ip && isIP(ip) ? ip : "unknown-client";
  return opaqueIdentity(identity);
}

export function opaqueIdentity(value: string): string {
  return createHmac("sha256", adminSecret()).update(value).digest("hex");
}

export function isSameOriginRequest(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

export function tooManyRequests(seconds: number): Response {
  return Response.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }, {
    status: 429, headers: { "Retry-After": String(seconds), "Cache-Control": "no-store" },
  });
}
