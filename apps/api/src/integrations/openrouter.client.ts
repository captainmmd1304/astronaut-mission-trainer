export interface OpenRouterConfig {
  apiKey: string;
  model: string;
}

/** Project rule: free models only. Refuse anything else before a request is made. */
export function assertFreeModel(model: string) {
  if (!model.endsWith(':free')) throw new Error(`Refusing non-free model: ${model}`);
}

/**
 * Ask the model to rephrase facts we computed. It must not add facts (see docs/ARCHITECTURE.md).
 * Returns null on any failure so the caller uses the template text.
 */
export async function rephrase(cfg: OpenRouterConfig, lines: string[], timeoutMs = 12_000): Promise<string | null> {
  try {
    assertFreeModel(cfg.model);
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content:
              'You write short, friendly debriefs for a space-training game for young players. Rewrite the facts into 3-4 sentences. Use only the facts given. Do not add numbers, causes or events that are not in the list.',
          },
          { role: 'user', content: lines.join('\n') },
        ],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim();
    return text && text.length > 20 ? text : null;
  } catch {
    return null;
  }
}
