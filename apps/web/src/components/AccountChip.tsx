'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGame } from '@/game/store';
import { clearSession, loadSession } from '@/lib/session';

export function AccountChip() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  useEffect(() => setName(loadSession()?.displayName ?? null), []);
  if (!name) return null;
  return (
    <div className="flex items-center gap-2 font-sans text-[14px]">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-ember font-bold text-night">{name.slice(0, 1).toUpperCase()}</span>
      <span className="hidden max-w-[9rem] truncate text-bone sm:inline">{name}</span>
      <button
        type="button"
        className="key key-quiet !px-2.5 !py-1.5 text-[13px]"
        onClick={() => {
          clearSession();
          useGame.getState().reset();
          router.replace('/login');
        }}
      >
        Sign out
      </button>
    </div>
  );
}
