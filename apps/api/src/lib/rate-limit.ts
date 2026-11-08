import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './http';

interface Options {
  windowMs: number;
  max: number;
  now?: () => number;
  /** What to count by. Defaults to the client IP (set `trust proxy` behind Railway/Vercel). */
  key?: (req: Request) => string;
}

/** Small fixed-window limiter. In-memory, so it is per instance: fine for one Railway service. */
export function rateLimit({ windowMs, max, now = Date.now, key = (r) => r.ip ?? 'unknown' }: Options) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const t = now();
    if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt <= t) hits.delete(k);
    const k = key(req);
    let entry = hits.get(k);
    if (!entry || entry.resetAt <= t) {
      entry = { count: 0, resetAt: t + windowMs };
      hits.set(k, entry);
    }
    entry.count++;
    res.setHeader('RateLimit-Remaining', Math.max(0, max - entry.count));
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - t) / 1000));
      return next(new HttpError(429, 'Too many requests, slow down a little', 'rate_limited'));
    }
    next();
  };
}
