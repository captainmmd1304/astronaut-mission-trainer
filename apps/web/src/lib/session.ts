import { api, type Session } from './api';

const KEY = 'amt.session';

/** Guest session lives in localStorage. Every access is wrapped: storage can be blocked or empty. */
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore: the session then lasts only for this page load */
  }
}

let memory: Session | null = null;

export async function ensureSession(displayName?: string): Promise<Session> {
  const existing = memory ?? loadSession();
  if (existing && !displayName) return (memory = existing);
  const created = await api.createSession(displayName?.trim() || existing?.displayName || 'Cadet');
  saveSession(created);
  return (memory = created);
}
