import { headers } from "next/headers";

/**
 * Best-effort per-IP rate limiting for public endpoints that aren't already
 * covered by Supabase Auth's own limits (sign-in, sign-up, OTP emails).
 *
 * This is in-memory: no new external service/account. On serverless hosting
 * (Vercel) each function instance keeps its own counters, so a determined
 * attacker spread across many cold-started instances could exceed the
 * nominal limit — it's a speed bump against casual abuse and simple bots,
 * not a hard guarantee. Upstash Ratelimit (shared Redis) is the upgrade
 * path if that becomes a real problem.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map doesn't grow forever — runs inline on
// checks rather than a timer, so it can't keep a serverless instance alive.
function sweepExpired(now: number) {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * @param key Identifies the bucket — combine an action name with the caller's
 *   identity, e.g. `winback:${ip}`, so different actions never share a counter.
 * @param limit Max requests allowed within `windowSeconds`.
 */
export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Best-effort client IP from proxy headers (Vercel sets both). Falls back to
 * a constant so local dev / unknown setups still get one shared bucket
 * instead of throwing — never a security boundary on its own, just the
 * identity a rate limit is keyed on.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}
