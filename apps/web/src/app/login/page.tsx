'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { PlanetStage } from '@/components/PlanetStage';
import { ApiError } from '@/lib/api';
import { loadSession, playAsGuest, signIn, signUp } from '@/lib/session';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dive, setDive] = useState(false);

  useEffect(() => {
    if (loadSession()) router.replace('/missions');
  }, [router]);

  async function go(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setDive(true);
      setTimeout(() => router.push('/missions'), 1100);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reach the server. Check that the API is running.');
      setBusy(false);
    }
  }
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void go(() => (mode === 'in' ? signIn(username, password) : signUp(username, password, displayName || undefined)));
  };

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <PlanetStage offsetX={4.6} dive={dive} className="fixed inset-0" />
      <div className="fixed inset-0 bg-gradient-to-l from-night/90 via-night/30 to-transparent" />
      <div className={`relative z-10 flex min-h-dvh items-center justify-center px-5 py-10 md:justify-end md:px-[7vw] ${dive ? 'opacity-0 transition-opacity duration-700' : ''}`}>
        <div className="panel rise w-full max-w-[26rem] p-6 md:p-8">
          <Link href="/" className="font-sans text-[14px] font-semibold text-haze">
            Asteria
          </Link>
          <h1 className="mt-2 text-[34px] font-medium leading-tight">{mode === 'in' ? 'Welcome back, commander' : 'Join the crew'}</h1>
          <p className="mt-1 text-[16px] leading-snug text-bone/75">
            {mode === 'in' ? 'Sign in to pick up your missions and debriefs.' : 'Make a call sign and password. No email and no real name needed.'}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" className={`key key-quiet ${mode === 'in' ? 'key-on' : ''}`} onClick={() => setMode('in')}>
              Sign in
            </button>
            <button type="button" className={`key key-quiet ${mode === 'up' ? 'key-on' : ''}`} onClick={() => setMode('up')}>
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4 font-sans">
            <label className="block">
              <span className="mb-1 block text-[14px] font-semibold text-bone/80">Call sign</span>
              <input className="field" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required minLength={mode === 'up' ? 3 : 1} maxLength={24} placeholder="e.g. red_dust_7" />
            </label>
            {mode === 'up' && (
              <label className="block">
                <span className="mb-1 block text-[14px] font-semibold text-bone/80">Name shown in the game (optional)</span>
                <input className="field" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={24} placeholder="Cadet" />
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-[14px] font-semibold text-bone/80">Password</span>
              <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required minLength={mode === 'up' ? 8 : 1} maxLength={100} placeholder={mode === 'up' ? 'At least 8 characters' : ''} />
            </label>
            {error && (
              <p role="alert" className="rounded-lg border border-critical/60 bg-critical/10 px-3 py-2 text-[15px] text-bone">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="key key-go w-full">
              {busy ? 'One moment' : mode === 'in' ? 'Sign in and launch' : 'Create account and launch'}
            </button>
          </form>

          <div className="mt-5 border-t border-rust/40 pt-4">
            <button type="button" disabled={busy} className="key key-quiet w-full" onClick={() => void go(() => playAsGuest(displayName || 'Cadet'))}>
              Just try it as a guest
            </button>
            <p className="mt-2 text-center text-[13.5px] text-bone/55">Guest progress stays on this device.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
