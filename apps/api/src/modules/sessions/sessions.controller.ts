import { Router } from 'express';
import { CreateSessionBody } from '@amt/shared';
import { handler, parseBody } from '../../lib/http';
import type { SessionsService } from './sessions.service';

export function sessionsRouter(service: SessionsService) {
  const r = Router();
  r.post('/', handler(async (req, res) => {
    const body = parseBody(CreateSessionBody, req.body);
    res.status(201).json(await service.createGuest(body.displayName));
  }));
  return r;
}
