import { Router } from 'express';
import { z } from 'zod';
import { blackBoxCases, debriefTemplates, getBlackBoxCase, landingSites, scenarios, scoreChain, scriptedMessages } from '@amt/content';
import { handler, HttpError, parseBody } from '../../lib/http';

/** Public game content. The black-box answer key (rootCauseChain, relevant flags) never leaves the server. */
export function contentRouter() {
  const r = Router();
  r.get('/sites', (_req, res) => res.json({ sites: landingSites }));
  r.get('/scenarios', (_req, res) => res.json({ scenarios }));
  r.get('/text', (_req, res) => res.json({ messages: scriptedMessages, templates: debriefTemplates }));
  r.get('/blackbox', (_req, res) =>
    res.json({
      cases: blackBoxCases.map(({ rootCauseChain: _k, evidence, ...rest }) => ({
        ...rest,
        evidence: evidence.map(({ id, text }) => ({ id, text })),
      })),
    }),
  );
  r.post('/blackbox/:id/answer', handler((req, res) => {
    const c = getBlackBoxCase(req.params['id']!);
    if (!c) throw new HttpError(404, 'Case not found', 'not_found');
    const { chain } = parseBody(z.object({ chain: z.array(z.string()).max(20) }), req.body);
    const result = scoreChain(c, chain);
    res.json({
      ...result,
      correctChain: c.rootCauseChain.map((id) => ({ id, text: c.evidence.find((e) => e.id === id)?.text })),
      distractors: c.evidence.filter((e) => !c.rootCauseChain.includes(e.id)).map((e) => ({ id: e.id, text: e.text })),
      reflyScenarioId: c.reflyScenarioId,
    });
  }));
  return r;
}
