import { Request, Response, NextFunction } from 'express';

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip || 'local'}:${req.path}`;
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || now > existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (existing.count >= maxRequests) {
      res.status(429).json({ success: false, message: 'Too many requests. Please try again shortly.' });
      return;
    }

    existing.count += 1;
    next();
  };
}
