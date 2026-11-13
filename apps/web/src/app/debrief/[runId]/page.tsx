'use client';
import Link from 'next/link';
import { AuthGate } from '@/components/AuthGate';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGame } from '@/game/store';
import { api, ApiError, type Debrief, type RunRecord } from '@/lib/api';
import { ensureSession } from '@/lib/session';

function DebriefInner() {
  const { runId } = useParams<{ runId: string }>();
  const router = useRouter();
  const begin = useGame((s) => s.begin);
  const [d, setD] = useState<Debrief | null>(null);
  const [record, setRecord] = useState<RunRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await ensureSession();
        const [deb, rec] = await Promise.all([api.debrief(s.token, runId), api.run(s.token, runId)]);
        setD(deb);
        setRecord(rec);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Could not load the debrief.');
      }
    })();
  }, [runId]);

  /** Branch: replay the same seed and your first decisions, then play on from `sol`. */
  async function tryAgain(sol: number) {
    if (!record) return;
    setBusy(true);
    try {
      const s = await ensureSession();
      const [run, text] = await Promise.all([
        api.startRun(s.token, { scenarioId: record.scenarioId, siteId: record.siteId, seed: record.seed, mode: record.mode, difficulty: record.difficulty }),
        api.text(),
      ]);
      begin(run, text, record.decisions.slice(0, sol - 1));
      router.push('/play');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not restart.');
      setBusy(false);
    }
  }

  if (error) {
    return (
      <main className="min-h-dvh px-6 py-12 md:px-[8vw]">
        <p role="alert" className="max-w-[50ch] border-l-2 border-critical pl-3 text-[18px]">{error}</p>
        <Link href="/missions" className="key key-go mt-6">Pick a mission</Link>
      </main>
    );
  }
  if (!d) return <main className="min-h-dvh px-6 py-12 md:px-[8vw] text-bone/60">Reading the flight recorder.</main>;

  const failed = d.outcome === 'failed';
  const firstCauseSol = d.causeChain[0]?.sol;
  const trigger = failed ? d.causeChain.at(-2) ?? d.causeChain.at(-1) : undefined;
  const projectReviews = d.keyEvents.filter((e) => e.explainKey === 'project-complete');
  return (
    <main className="min-h-dvh px-5 py-10 md:px-[8vw] md:py-16">
      <div className="settle mx-auto max-w-[64rem]">
        <Link href="/" className="font-sans text-[15px] text-bone/70 underline decoration-rust underline-offset-4 hover:text-bone">Asteria</Link>
        <h1 className="mt-6 max-w-[22ch] text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-[1.05]">
          {failed ? `The habitat was lost on sol ${d.solsPlayed}.` : `You held the outpost for ${d.solsPlayed} sols.`}
        </h1>
        <p className="mt-5 max-w-[62ch] text-[19px] leading-relaxed text-bone/90">{d.summary}</p>
        <p className="instrument mt-3 text-[14px] text-bone/55">
          {d.generatedBy === 'llm' ? 'Rewritten by a free AI model from the facts below.' : 'Written from the mission log.'} Score {d.score ?? 0}.
        </p>

        <section className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="Mission result">
          <div className="panel p-4"><p className="instrument text-[12px] uppercase tracking-wider text-haze">Crew status</p><p className="mt-1 text-[18px]">{failed ? 'Returned safely' : 'Mission crew active'}</p></div>
          <div className="panel p-4"><p className="instrument text-[12px] uppercase tracking-wider text-haze">Score</p><p className="mt-1 text-[18px]">{d.score ?? 0} points</p></div>
          <div className="panel p-4"><p className="instrument text-[12px] uppercase tracking-wider text-haze">{failed ? 'Primary trigger' : 'Result'}</p><p className="mt-1 text-[16px] leading-tight">{failed ? trigger?.text ?? 'The flight recorder has no single confirmed trigger.' : 'The outpost reached its target duration.'}</p></div>
        </section>

        {d.causeChain.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[28px] font-medium">What led to it</h2>
            <ol className="mt-5 max-w-[46rem]">
              {d.causeChain.map((c, i) => (
                <li key={c.id} className="relative grid grid-cols-[4.2rem_1fr] gap-x-4 pb-6">
                  {i < d.causeChain.length - 1 && <span aria-hidden className="absolute bottom-0 left-[4.2rem] top-3 w-px translate-x-[-9px] bg-rust" />}
                  <span className="instrument pt-[2px] text-right text-[15px] text-haze">Sol {c.sol}</span>
                  <span className="relative pl-5 text-[18px] leading-snug">
                    <span aria-hidden className={`absolute left-[-5px] top-[10px] h-[9px] w-[9px] rounded-full ${i === d.causeChain.length - 1 ? 'bg-critical' : 'bg-ember'}`} />
                    {c.text}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {projectReviews.length > 0 && (
          <section className="mt-12">
            <h2 className="text-[28px] font-medium">Project review</h2>
            <p className="mt-1 max-w-[58ch] text-[17px] text-bone/75">Each build changed what the crew could do next. The result includes its benefit and the trade-off that came with choosing it.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {projectReviews.map((p) => (
                <article key={p.id} className="panel p-4">
                  <p className="font-sans text-[13px] font-bold uppercase tracking-wider text-safe">Completed · sol {p.sol}</p>
                  <p className="mt-1 text-[17px] leading-snug">{p.text}</p>
                  <p className="mt-2 font-sans text-[13px] text-bone/60">Next action: keep checking power and choose the next build only when the crew has capacity.</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-[28px] font-medium">What you learned</h2>
          <ul className="mt-4 max-w-[46rem] divide-y divide-rust/35 border-y border-rust/35">
            {d.objectives.map((o) => (
              <li key={o.id} className="flex items-baseline justify-between gap-6 py-3 text-[17px]">
                <span>{o.text}</span>
                <span className={`instrument shrink-0 text-[15px] ${o.met ? 'text-safe' : 'text-caution'}`}>{o.met ? '✓ Met' : '○ Not yet'}</span>
              </li>
            ))}
          </ul>
          <p className="instrument mt-4 text-[14px] text-bone/60">
            Radiation taken {d.finalStats.doseMsv} mSv. Crew health {Math.round(d.finalStats.crewHealth * 100)}%. Battery {d.finalStats.batteryKwh} kWh. Game values.
          </p>
        </section>

        <section className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4 font-sans">
          {firstCauseSol !== undefined && record && (
            <button type="button" disabled={busy} onClick={() => tryAgain(firstCauseSol)} className="key key-go">
              Try again from sol {firstCauseSol}
            </button>
          )}
          <button type="button" disabled={busy || !record} onClick={() => tryAgain(1)} className="key">
            Start over with the same sky
          </button>
          <Link href="/missions" className="key">
            Pick another mission
          </Link>
        </section>
      </div>
    </main>
  );
}

export default function DebriefPage() {
  return (
    <AuthGate>
      <DebriefInner />
    </AuthGate>
  );
}
