import "server-only";
import { HttpError } from "./http";
import { optionalEnv } from "./env";

/**
 * Rate limiting on Upstash Redis (REST API, no extra npm package needed).
 * Fixed window: the first request starts a window of `windowSec` seconds; more than `limit`
 * requests inside it get HTTP 429. Counters live in Redis, so the limit works across all
 * serverless instances on Vercel (an in-memory counter would not).
 *
 * Needs UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN. If they are missing, or Upstash is
 * unreachable, requests are ALLOWED (and logged) so a Redis outage can never block payments.
 */
let warned = false;

export async function rateLimit(name: string, id: string, limit: number, windowSec: number): Promise<void> {
  const url = optionalEnv("UPSTASH_REDIS_REST_URL");
  const token = optionalEnv("UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) {
    if (!warned) { warned = true; console.warn("[ratelimit] UPSTASH_REDIS_REST_URL / _TOKEN not set - rate limiting is OFF."); }
    return;
  }

  const key = `rl:${name}:${id.replace(/[^\w.:-]/g, "_").slice(0, 80)}`;
  let count: number;
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/multi-exec`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", key], ["EXPIRE", key, String(windowSec), "NX"]]),
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
    const out = (await res.json()) as { result?: unknown; error?: string }[];
    count = Number(out?.[0]?.result);
    if (!Number.isFinite(count)) throw new Error(out?.[0]?.error || "bad Upstash reply");
  } catch (e) {
    console.error("[ratelimit] check failed, allowing request:", e instanceof Error ? e.message : e);
    return;
  }

  if (count > limit) {
    throw new HttpError(429, "RATE_LIMITED", "Too many requests. Please wait a minute and try again.");
  }
}

/** Caller's IP (Vercel sets x-forwarded-for). Used only for routes with no logged-in user. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim();
}
