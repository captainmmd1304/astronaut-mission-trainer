'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlanetStage } from '@/components/PlanetStage';
import { api } from '@/lib/api';
import { loadSession } from '@/lib/session';
import { lightTimeLabel } from '@/lib/text';

export default function Landing() {
  const [lt, setLt] = useState<{ seconds: number; source: string } | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    setSignedIn(!!loadSession());
    api
      .conditions()
      .then((r) => setLt({ seconds: r.snapshot.lightTimeSeconds, source: r.source }))
      .catch(() => setLt(null));
  }, []);

  return (
    <main className="relative h-dvh min-h-[36rem] overflow-hidden">
      <PlanetStage offsetX={-4.2} />
      <div className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/40 to-transparent md:via-night/20" />
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-10 md:justify-center md:px-[6vw] md:pb-0">
        <div className="max-w-[34rem]">
          <p className="rise font-sans text-[15px] font-semibold text-haze">NASA Space Apps 2026 · Junior Astronaut Mission Trainer</p>
          <h1 className="rise mt-3 text-[clamp(2.5rem,6.4vw,5rem)] font-medium leading-[1] tracking-[-0.02em]" style={{ animationDelay: '0.1s' }}>
            Keep a Mars outpost alive.
          </h1>
          <p className="rise mt-5 max-w-[44ch] text-[20px] leading-snug text-bone/90" style={{ animationDelay: '0.25s' }}>
            Asteria’s first crew came home early and the habitat did not survive. Take command with real space weather and the real delay to Earth, and find out why.
          </p>
          <div className="rise mt-8 flex flex-wrap items-center gap-4" style={{ animationDelay: '0.4s' }}>
            <Link href={signedIn ? '/missions' : '/login'} className="key key-go pulse">
              {signedIn ? 'Continue' : 'Play now'}
            </Link>
            <Link href="/blackbox" className="key">
              Read the black box
            </Link>
          </div>
          {lt && (
            <p className="rise instrument mt-8 text-[15px] text-starlight" style={{ animationDelay: '0.6s' }}>
              Right now a signal takes {lightTimeLabel(lt.seconds)} to travel between Earth and Mars{lt.source !== 'live' && ` (${lt.source} data)`}. The game uses that number.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
