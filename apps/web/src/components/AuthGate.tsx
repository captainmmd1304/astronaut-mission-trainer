'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { loadSession } from '@/lib/session';

/** Sends signed-out visitors to the login screen, then renders the page. */
export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (loadSession()) setOk(true);
    else router.replace('/login');
  }, [router]);
  return ok ? <>{children}</> : null;
}
