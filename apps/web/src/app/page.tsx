'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Viewport } from '@/components/Viewport';
import { api } from '@/lib/api';
import { lightTimeLabel } from '@/lib/text';

export default function Landing() {
  const [lt, setLt] = useState<{ seconds: number; source: string } | null>(null);
  useEffect(() => {
    api
      .conditions()
      .then((r) => setLt({ seconds: r.snapshot.lightTimeSeconds, source: r.source }))
      .catch(() => setLt(null));
  }, []);

  return (
    <main className="relative h-dvh min-h-[34rem] overflow-hidden">
      <Viewport sim={null} side="right" className="absolute inset-0" />
      <div className="settle absolute inset-x-0 bottom-0 z-10 px-6 pb-10 md:px-[6vw] md:pb-[9vh]">
        <h1 className="max-w-[17ch] text-[clamp(2.4rem,6.2vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.015em]">
          Asteria’s first crew came home early. The habitat did not.
        </h1>
        <p className="mt-5 max-w-[46ch] text-[19px] leading-snug text-bone/85">
          Run a Mars outpost with the real delay to Earth and real space weather. Read the black box, then take command.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 font-sans">
          <Link href="/missions" className="bg-ember px-6 py-3 text-[16px] font-semibold text-night transition-colors hover:bg-haze">
            Start the mission
          </Link>
          <Link href="/blackbox" className="py-3 text-[16px] text-bone underline decoration-rust decoration-2 underline-offset-[6px] hover:decoration-ember">
            Read the black box first
          </Link>
        </div>
        {lt && (
          <p className="instrument mt-8 text-[14px] text-starlight/90">
            Right now a signal takes {lightTimeLabel(lt.seconds)} to cross between Earth and Mars
            {lt.source !== 'live' && ` (${lt.source} data)`}. The game uses that number.
          </p>
        )}
      </div>
    </main>
  );
}
