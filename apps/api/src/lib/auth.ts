import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './http';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      playerId?: string;
    }
  }
}

export const signToken = (secret: string, playerId: string) => jwt.sign({ sub: playerId }, secret, { expiresIn: '7d' });

export function requireAuth(secret: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.header('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    try {
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;
      if (!payload.sub) throw new Error('no subject');
      req.playerId = payload.sub;
      next();
    } catch {
      next(new HttpError(401, 'Sign in as a guest first', 'unauthorized'));
    }
  };
}
