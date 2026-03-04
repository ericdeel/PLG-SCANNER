import type { MiddlewareHandler } from "hono";

interface Entry { count: number; reset: number }
const hits = new Map<string, Entry>();

/**
 * Simple in-memory rate limiter.
 * Swap the Map for an Upstash Redis client when you need multi-instance support.
 */
export const rateLimit = (max: number, windowMs: number): MiddlewareHandler =>
  async (c, next) => {
    const ip = c.req.header("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now > entry.reset) {
      hits.set(ip, { count: 1, reset: now + windowMs });
      return next();
    }
    if (entry.count >= max) {
      return c.json({ error: "Rate limit exceeded. Try again shortly." }, 429);
    }
    entry.count++;
    return next();
  };
