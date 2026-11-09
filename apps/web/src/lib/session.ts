import { api, type Session } from './api';

const KEY = 'amt.session';
let memory: Session | null = null;

/** The session lives in localStorage. Every access is wrapped: storage can be blocked or empty. */
export function loadSession(): Session | null {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (memory = JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session) {
  memory = s;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore: the session then lasts only for this page load */
  }
}

export function clearSession() {
  memory = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export async function signIn(username: string, password: string) {
  const s = await api.login(username, password);
  saveSession(s);
  return s;
}
export async function signUp(username: string, password: string, displayName?: string) {
  const s = await api.register(username, password, displayName);
  saveSession(s);
  return s;
}
export async function playAsGuest(displayName: string) {
  const s = await api.createSession(displayName.trim() || 'Cadet');
  saveSession(s);
  return s;
}

/** Existing session, else a guest one. The pages are gated by AuthGate, so the fallback is only a safety net. */
export async function ensureSession(): Promise<Session> {
  return loadSession() ?? playAsGuest('Cadet');
}
