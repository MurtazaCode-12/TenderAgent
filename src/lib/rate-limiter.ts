import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Initializes Upstash Redis sliding-window rate limiters.
 * Falls back to pass-through in development if credentials are not configured.
 */
let ratelimit: Ratelimit | null = null;
let aiEndpointRatelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Standard API rate limit: 60 requests per 60 seconds
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    analytics: true,
    prefix: "@tenderops/api",
  });

  // Expensive AI compliance / summarization rate limit: 10 requests per 60 seconds
  aiEndpointRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
    prefix: "@tenderops/ai",
  });
}

export async function checkRateLimit(
  identifier: string,
  isAI = false
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  const limiter = isAI ? aiEndpointRatelimit : ratelimit;

  if (!limiter) {
    // If Redis is not configured in local environment, allow request
    return { success: true, remaining: 999 };
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
