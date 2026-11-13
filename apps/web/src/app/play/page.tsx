'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Viewport } from '@/components/Viewport';
import { AccountChip } from '@/components/AccountChip';
import { AuthGate } from '@/components/AuthGate';
import { Icon } from '@/components/Icon';
import { Tour, markTourSeen, tourSeen, type TourStep } from '@/components/Tour';
import { BuildPicker, CrewOrders } from '@/components/play/Decisions';
import { EarthLink, Gauges } from '@/components/play/Gauges';
import { LogPanel } from '@/components/play/LogPanel';
import { PowerBus } from '@/components/play/PowerBus';
import { SolRail } from '@/components/play/SolRail';
import { useGame } from '@/game/store';
import { api, ApiError } from '@/lib/api';
import { ensureSession } from '@/lib/session';

function tourSteps(sols: number): TourStep[] {
  return [
    { title: 'You are in command', body: `You run a Mars outpost with a crew of four. Keep everyone alive for ${sols} sols (Martian days). This tour takes about a minute.` },
    { target: 'sol', title: 'One turn is one sol', body: 'Each sol you make a few choices, then end the sol and watch what happens. The strip shows every sol: orange is now, amber and red mark trouble.' },
    { target: 'gauges', title: 'Keep these alive', body: 'Battery, air, water and food keep the crew breathing and fed. A bar that turns amber is a warning. Red and blinking means act now.' },
    { target: 'power', title: 'Step 1: share the power', body: 'The panels make a set amount each sol. Drag the round grips, or tap + and −, to decide who gets it. The white arrow shows how much each system needs.' },
    { target: 'crew', title: 'Step 2: give crew orders', body: 'Shelter protects the crew from radiation but needs power. A spacewalk cleans dust off the panels, but it is dangerous in a storm or a radiation warning.' },
    { target: 'build', title: 'Step 3: pick a project', body: 'A project takes a few sols and then helps for good. Choose none if the crew is busy surviving.' },
    { target: 'end', title: 'End the sol', body: 'When you are happy with your choices, press this. The day passes, supplies are used and events can happen.' },
    { target: 'log', title: 'Earth is minutes away', body: 'Messages from Earth take real time to arrive because light is slow. You will often have to decide before help replies. That delay is the whole challenge.' },
  ];
}

function PlayInner() {
  const router = useRouter();
  const run = useGame((s) => s.run);
  const sim = useGame((s) => s.sim);
  const status = useGame((s) => s.status);
  const decisions = useGame((s) => s.decisions);
  const commit = useGame((s) => s.commit);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draft = useGame((s) => s.draft);
  const [tour, setTour] = useState(false);
  const sending = useRef(false);
  useEffect(() => {
    if (!tourSeen()) {
      const t = setTimeout(() => setTour(true), 3800); // after the arrival shot settles
      return () => clearTimeout(t);
    }
  }, []);

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
    <main className="relative min-h-dvh md:h-dvh md:overflow-hidden">
      <Viewport sim={sim} look={run.site.look} frame={false} eva={draft?.eva ?? false} shelter={draft?.shelter ?? false} className="fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,5,4,0.7))]" />

      <div key={solNow} className="sol-title pointer-events-none fixed inset-x-0 top-[34%] z-30 text-center">
        <div className="font-sans text-[clamp(3rem,10vw,7rem)] font-extrabold leading-none tracking-tight text-bone drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">Sol {solNow}</div>
        <div className="font-sans text-[18px] font-semibold text-haze">of {run.rules.durationSols}</div>
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col gap-3 p-3 md:h-full md:min-h-0 md:p-4">
        <header className="panel flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-sans text-[20px] font-extrabold text-haze">
              Asteria
            </Link>
            <div className="hidden font-sans text-[13.5px] leading-tight text-bone/75 lg:block">
              {run.site.name}
              <br />
              {run.scenario.title}
            </div>
          </div>
          <div data-tour="sol" className="order-last w-full min-w-0 md:order-none md:w-auto md:max-w-[46vw] md:flex-1">
            <SolRail />
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <EarthLink />
            <button type="button" className="key key-quiet" onClick={() => setTour(true)}>
              <Icon name="help" size={18} /> <span className="hidden sm:inline">How to play</span>
            </button>
            <AccountChip />
            <Link href="/blackbox" className="key key-quiet">
              <span className="hidden sm:inline">Black Box</span><span className="sm:hidden">Box</span>
            </Link>
          </div>
        </header>

        <div className="h-[30vh] shrink-0 md:hidden" aria-hidden />
        <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[300px_minmax(0,1fr)_390px]">
          <aside data-tour="gauges" className="panel rise min-h-0 p-3 md:overflow-y-auto">
            <h2 className="panel-title mb-2 px-1">Outpost status</h2>
            <Gauges />
          </aside>

          <section className="flex min-h-[16rem] flex-col justify-end gap-3">
            {over && (
              <div className="panel rise mx-auto max-w-md p-6 text-center">
                <p className="font-sans text-[24px] font-extrabold leading-tight">
                  {status === 'failed' ? `Mission ended on sol ${sim.sol}` : `You held the outpost for ${sim.sol} sols`}
                </p>
                <p className="mt-1 text-[16px] text-bone/80">{status === 'failed' ? 'The crew is safe in the ascent vehicle. Your mission log is saved so you can review the cause and try again.' : 'Your mission log is saved. Open the debrief to see how you did.'}</p>
                {error && (
                  <p role="alert" className="mt-3 text-[15px] text-critical">
                    {error}
                  </p>
                )}
                <div className="mt-4">
                  {saved ? (
                    <button type="button" onClick={() => router.push(`/debrief/${run.runId}`)} className="key key-go pulse">
                      Open the debrief
                    </button>
                  ) : (
                    <button type="button" onClick={save} className="key key-go">
                      {error ? 'Try saving again' : 'Saving'}
                    </button>
                  )}
                </div>
              </div>
            )}
            <div data-tour="log" className="panel h-44 shrink-0 px-4 py-2 md:h-48">
              <LogPanel />
            </div>
          </section>

          <aside className="panel rise flex min-h-0 flex-col p-3" style={{ animationDelay: '0.1s' }}>
            <div className="min-h-0 flex-1 space-y-5 md:overflow-y-auto md:pr-1">
              <div data-tour="power">
                <h2 className="panel-title mb-2 flex items-center gap-2">
                  <span className="step-badge">1</span> Share the power
                </h2>
                <PowerBus />
              </div>
              {!over && (
                <>
                  <div data-tour="crew">
                    <h2 className="panel-title mb-2 flex items-center gap-2">
                      <span className="step-badge">2</span> Crew orders
                    </h2>
                    <CrewOrders />
                  </div>
                  <div data-tour="build">
                    <h2 className="panel-title mb-2 flex items-center gap-2">
                      <span className="step-badge">3</span> Build project
                    </h2>
                    <BuildPicker />
                  </div>
                </>
              )}
            </div>
            {!over && (
              <div data-tour="end" className="mt-3 shrink-0 border-t border-rust/40 pt-3">
                <button type="button" onClick={commit} className="key key-go pulse w-full !text-[19px]">
                  End sol {draft?.sol} <Icon name="play" size={18} />
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>

      {tour && (
        <Tour
          steps={tourSteps(run.rules.durationSols)}
          onClose={() => {
            markTourSeen();
            setTour(false);
          }}
        />
      )}
    </main>
  );
}

export default function Play() {
  return (
    <AuthGate>
      <PlayInner />
    </AuthGate>
  );
}
