import { Router } from 'express';
import { CreateSessionBody, UsernameSchema } from '@amt/shared';
import { handler, parseBody } from '../../lib/http';
import { z } from 'zod';
import { requireAuth } from '../../lib/auth';
import type { SessionsService } from './sessions.service';

const Password = z.string().min(8).max(100);
const RegisterBody = z.object({ username: UsernameSchema, password: Password, displayName: z.string().trim().min(1).max(24).optional() });
const LoginBody = z.object({ username: UsernameSchema, password: z.string().min(1).max(100) });

export function authRouter(service: SessionsService, secret: string) {
  const r = Router();
  r.post('/register', handler(async (req, res) => {
    const b = parseBody(RegisterBody, req.body);
    res.status(201).json(await service.register(b.username, b.password, b.displayName));
  }));
  r.post('/login', handler(async (req, res) => {
    const b = parseBody(LoginBody, req.body);
    res.json(await service.login(b.username, b.password));
  }));
  r.get('/me', requireAuth(secret), handler(async (req, res) => {
    res.json(await service.me(req.playerId!));
  }));
  return r;
}

export function sessionsRouter(service: SessionsService) {
  const r = Router();
  r.post('/', handler(async (req, res) => {
    const body = parseBody(CreateSessionBody, req.body);
    res.status(201).json(await service.createGuest(body.displayName));
  }));
  return r;
}
