import "server-only";
import { headers } from "next/headers";

// Simple in-memory limiter: fine for a single server. Use Upstash/Redis if you scale out.
const hits = new Map<string, number[]>();

export async function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) return false;
  recent.push(now);
  hits.set(id, recent);
  return true;
}
