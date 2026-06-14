import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// ===========================
// Redis Client
// ===========================

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
  lazyConnect: true,
});

redis.on("connect", () => {
  console.log("[Redis] Connected");
});

redis.on("error", (err) => {
  console.error("[Redis] Error:", err.message);
});

/** Cache a JSON value with optional TTL. */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  if (ttlSeconds) {
    await redis.setex(key, ttlSeconds, serialized);
  } else {
    await redis.set(key, serialized);
  }
}

/** Get a cached JSON value. */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return data as unknown as T;
  }
}

/** Delete a cached value. */
export async function cacheDel(key: string): Promise<void> {
  await redis.del(key);
}

/** Rate limit check using sliding window counter. */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
  };
}
