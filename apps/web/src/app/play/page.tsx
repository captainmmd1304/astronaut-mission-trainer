'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Viewport } from '@/components/Viewport';
import { Decisions } from '@/components/play/Decisions';
import { EarthLink, Gauges } from '@/components/play/Gauges';
import { LogPanel } from '@/components/play/LogPanel';
import { PowerBus } from '@/components/play/PowerBus';
import { SolRail } from '@/components/play/SolRail';
import { useGame } from '@/game/store';
import { api, ApiError } from '@/lib/api';
import { ensureSession } from '@/lib/session';

export default function Play() {
  const router = useRouter();
  const run = useGame((s) => s.run);
  const sim = useGame((s) => s.sim);
  const status = useGame((s) => s.status);
  const decisions = useGame((s) => s.decisions);
  const commit = useGame((s) => s.commit);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);

  // A page reload loses the in-memory run: go back and pick again.
  useEffect(() => {
    if (!run) router.replace('/missions');
  }, [run, router]);

  async function save() {
    if (!run || sending.current) return;
    sending.current = true;
    setError(null);
    try {
      const s = await ensureSession();
      await api.finishRun(s.token, run.runId, { status, decisions, worldSnapshots: [run.world] });
      setSaved(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save the run.');
    } finally {
      sending.current = false;
    }
  }
  useEffect(() => {
    if (status !== 'running' && run && !saved) void save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!run || !sim) return null;
  const over = status !== 'running';
  const solNow = over ? sim.sol : sim.sol + 1;

  return (
    <main className="min-h-dvh md:grid md:h-dvh md:grid-cols-[92px_minmax(0,1fr)_360px] md:grid-rows-[auto_minmax(0,1fr)] md:overflow-hidden">
      <header className="flex items-start justify-between gap-4 px-5 py-3 md:col-span-3 md:px-6">
        <div>
          <Link href="/" className="text-[22px] font-medium leading-none">
            Asteria
          </Link>
          <div className="instrument mt-1 text-[14px] text-bone/65">
            {run.site.name}. {run.scenario.title}
          </div>
        </div>
        <EarthLink />
      </header>

      <aside className="px-5 pb-2 md:overflow-hidden md:px-3 md:pb-0 md:pl-6">
        <SolRail />
      </aside>

      <section className="flex min-h-0 flex-col">
        <div className="relative h-[46vh] min-h-[16rem] md:h-auto md:flex-1">
          <Viewport sim={sim} look={run.site.look} className="absolute inset-0" />
          <div className="pointer-events-none absolute bottom-[7%] left-[3.5%] z-10 md:bottom-[9%]">
            <div className="text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-none">Sol {solNow}</div>
            <div className="instrument mt-1 text-[15px] text-bone/70">of {run.rules.durationSols}</div>
          </div>
          {over && (
            <div className="absolute inset-x-[27%] bottom-[10%] z-20 bg-night/90 p-5">
              <p className="text-[19px] leading-snug">
                {status === 'failed' ? `The habitat was lost on sol ${sim.sol}. Here is what led to it.` : `You held the outpost for ${sim.sol} sols.`}
              </p>
              {error && (
                <p role="alert" className="mt-2 text-[15px] text-critical">
                  {error}
                </p>
              )}
              <div className="mt-4 font-sans">
                {saved ? (
                  <button type="button" onClick={() => router.push(`/debrief/${run.runId}`)} className="bg-ember px-5 py-2.5 text-[16px] font-semibold text-night hover:bg-haze">
                    Open the debrief
                  </button>
                ) : (
                  <button type="button" onClick={save} className="bg-ember px-5 py-2.5 text-[16px] font-semibold text-night hover:bg-haze">
                    {error ? 'Try saving again' : 'Saving'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="h-48 shrink-0 border-t border-rust/40 px-5 py-2 md:px-6">
          <LogPanel />
        </div>
      </section>

      <aside className="min-h-0 space-y-7 px-5 py-5 md:overflow-y-auto md:py-2 md:pr-6">
        <PowerBus />
        <Gauges />
        {!over && <Decisions onEnd={commit} />}
      </aside>
    </main>
  );
}
