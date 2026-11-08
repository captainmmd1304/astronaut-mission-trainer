import { describe, expect, it } from 'vitest';
import type { Request, Response } from 'express';
import { rateLimit } from '../src/lib/rate-limit';

const run = (mw: ReturnType<typeof rateLimit>) => {
  let err: unknown;
  mw({ ip: '1.2.3.4' } as Request, { setHeader() {} } as unknown as Response, (e?: unknown) => (err = e));
  return err as { status?: number } | undefined;
};

describe('rate limit', () => {
  it('blocks after max and resets after the window', () => {
    let t = 0;
    const mw = rateLimit({ windowMs: 1000, max: 2, now: () => t });
    expect(run(mw)).toBeUndefined();
    expect(run(mw)).toBeUndefined();
    expect(run(mw)?.status).toBe(429);
    t = 1001;
    expect(run(mw)).toBeUndefined();
  });
});
