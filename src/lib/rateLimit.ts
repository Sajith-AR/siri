import { NextRequest } from "next/server";

// In-memory rate limiting (for production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  req: NextRequest,
  maxRequests: number,
  windowMs: number
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter: number;
}> {
  const identifier = getClientIdentifier(req);
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up old entries
  cleanupExpiredEntries(windowStart);

  const current = rateLimitStore.get(identifier);
  
  if (!current || current.resetTime <= now) {
    // First request in window or window expired
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
      retryAfter: 0
    };
  }

  if (current.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
      retryAfter: Math.ceil((current.resetTime - now) / 1000)
    };
  }

  // Increment count
  current.count++;
  rateLimitStore.set(identifier, current);

  return {
    allowed: true,
    remaining: maxRequests - current.count,
    resetTime: current.resetTime,
    retryAfter: 0
  };
}

function getClientIdentifier(req: NextRequest): string {
  // Try to get real IP from various headers
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  
  // Include user agent for additional uniqueness
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  return `${ip}:${userAgent.slice(0, 50)}`;
}

function cleanupExpiredEntries(cutoff: number): void {
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime <= cutoff) {
      rateLimitStore.delete(key);
    }
  }
}

// Advanced rate limiting with different tiers
export class AdvancedRateLimit {
  private store = new Map<string, {
    requests: { timestamp: number; endpoint: string }[];
    tier: 'free' | 'premium' | 'enterprise';
  }>();

  async checkLimit(
    req: NextRequest,
    endpoint: string,
    tier: 'free' | 'premium' | 'enterprise' = 'free'
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    tier: string;
  }> {
    const identifier = getClientIdentifier(req);
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window

    const limits = {
      free: { requests: 10, windowMs },
      premium: { requests: 100, windowMs },
      enterprise: { requests: 1000, windowMs }
    };

    const limit = limits[tier];
    const windowStart = now - limit.windowMs;

    let userData = this.store.get(identifier);
    if (!userData) {
      userData = { requests: [], tier };
      this.store.set(identifier, userData);
    }

    // Remove old requests
    userData.requests = userData.requests.filter(req => req.timestamp > windowStart);

    // Check if limit exceeded
    if (userData.requests.length >= limit.requests) {
      const oldestRequest = userData.requests[0];
      const resetTime = oldestRequest.timestamp + limit.windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        tier
      };
    }

    // Add current request
    userData.requests.push({ timestamp: now, endpoint });

    return {
      allowed: true,
      remaining: limit.requests - userData.requests.length,
      resetTime: now + limit.windowMs,
      tier
    };
  }
}