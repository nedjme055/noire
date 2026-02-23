const buckets = new Map<string, {count: number; resetAt: number}>();

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  return req.headers.get('x-real-ip') || 'unknown';
}

export function checkRateLimit({key, limit, windowMs}: RateLimitOptions) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, {count: 1, resetAt: now + windowMs});
    return {allowed: true, remaining: limit - 1, retryAfter: 0};
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000)
    };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: true,
    remaining: limit - current.count,
    retryAfter: 0
  };
}
