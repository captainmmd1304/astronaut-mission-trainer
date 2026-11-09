'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGame } from '@/game/store';
import { api, ApiError, type AnswerResult, type DossierCase } from '@/lib/api';
import { ensureSession } from '@/lib/session';

const COLUMNS: { key: string; label: string; fmt?: (v: number) => string }[] = [
  { key: 'solarKwh', label: 'Solar kWh' },
  { key: 'panelDustPct', label: 'Panel dust %' },
  { key: 'batteryPct', label: 'Battery %' },
  { key: 'shelterPowered', label: 'Shelter power', fmt: (v) => (v >= 1 ? 'full' : v > 0 ? 'low' : 'off') },
  { key: 'doseMsv', label: 'Dose mSv' },
];

export default function BlackBox() {
  const router = useRouter();
  const begin = useGame((s) => s.begin);
  const [file, setFile] = useState<DossierCase | null>(null);
  const [chain, setChain] = useState<string[]>([]);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .blackbox()
      .then((c) => setFile(c[0] ?? null))
      .catch((e: ApiError) => setError(e.message));
  }, []);

  const text = (id: string) => file?.evidence.find((e) => e.id === id)?.text ?? id;
  const toggle = (id: string) => setChain((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const move = (i: number, d: -1 | 1) =>
    setChain((c) => {
      const n = [...c];
      const j = i + d;
      if (j < 0 || j >= n.length) return c;
      [n[i], n[j]] = [n[j]!, n[i]!];
      return n;
    });

  async function check() {
    if (!file) return;
    setBusy(true);
    try {
      setResult(await api.answer(file.id, chain));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not check the chain.');
    } finally {
      setBusy(false);
    }
  }

  async function refly() {
    if (!file) return;
    setBusy(true);
    try {
      const s = await ensureSession();
      const [run, t] = await Promise.all([
        api.startRun(s.token, { scenarioId: file.reflyScenarioId, siteId: 'jezero', seed: Math.floor(Math.random() * 2 ** 31), mode: 'blackbox-refly', difficulty: 'trainee' }),
        api.text(),
      ]);
      begin(run, t);
      router.push('/play');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not start the mission.');
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh bg-night px-4 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-[62rem]">
        <Link href="/" className="font-sans text-[15px] text-bone/70 underline decoration-rust underline-offset-4 hover:text-bone">
          Asteria
        </Link>
        {error && !file && <p role="alert" className="mt-8 border-l-2 border-critical pl-3">{error}</p>}
        {file && (
          <article className="paper settle mt-5 px-6 py-8 md:px-14 md:py-12">
            <p className="font-sans text-[13px] text-ink/60">Flight recorder, recovered. This is a fictional mission.</p>
            <h1 className="mt-1 text-[clamp(1.9rem,4vw,2.8rem)] font-medium leading-tight">{file.title}</h1>
            <p className="mt-4 max-w-[60ch] text-[19px] leading-relaxed">{file.briefing}</p>

            <h2 className="mt-10 text-[24px] font-medium">Telemetry</h2>
            <div className="mt-2 overflow-x-auto">
              <table className="instrument w-full min-w-[34rem] border-collapse text-[15px]">
                <thead>
                  <tr className="border-b-2 border-ink/70 text-left">
                    <th className="py-1 pr-3 font-semibold">Sol</th>
                    {COLUMNS.map((c) => (
                      <th key={c.key} className="py-1 pr-3 text-right font-semibold">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {file.telemetry.map((row) => (
                    <tr key={row.sol} className="border-b border-ink/20">
                      <td className="py-1 pr-3">{row.sol}</td>
                      {COLUMNS.map((c) => {
                        const v = row.values[c.key] ?? 0;
                        return (
                          <td key={c.key} className="py-1 pr-3 text-right">
                            {c.fmt ? c.fmt(v) : v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-10 text-[24px] font-medium">Decision log</h2>
            <ul className="mt-2 max-w-[66ch] divide-y divide-ink/20">
              {file.decisionLog.map((d, i) => (
                <li key={i} className="grid grid-cols-[4.5rem_1fr] gap-3 py-2 text-[17px]">
                  <span className="instrument pt-[3px] text-[14px] text-ink/65">Sol {d.sol}</span>
                  <span>{d.text}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-12 text-[24px] font-medium">What went wrong?</h2>
            <p className="mt-1 max-w-[60ch] text-[17px] text-ink/80">
              Some of these slips matter and some do not. Pick the ones that caused the loss and put them in the order they happened.
            </p>
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <ul className="space-y-2">
                {file.evidence.map((e) => {
                  const picked = chain.includes(e.id);
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        disabled={!!result}
                        onClick={() => toggle(e.id)}
                        aria-pressed={picked}
                        className={`w-full border-l-4 px-3 py-2 text-left text-[16.5px] leading-snug transition-colors ${picked ? 'border-ember bg-ink/10 text-ink/45' : 'border-ink/40 bg-white/10 hover:bg-white/25'}`}
                      >
                        {e.text}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div>
                <h3 className="font-sans text-[15px] font-semibold">Your chain, first event at the top</h3>
                {chain.length === 0 && <p className="mt-2 text-[16px] text-ink/60">Nothing pinned yet.</p>}
                <ol className="mt-2 space-y-2">
                  {chain.map((id, i) => (
                    <li key={id} className="flex items-start gap-3 border-l-4 border-ink bg-white/20 px-3 py-2 text-[16.5px] leading-snug">
                      <span className="instrument pt-[2px] text-[15px] font-semibold">{i + 1}</span>
                      <span className="flex-1">{text(id)}</span>
                      {!result && (
                        <span className="flex flex-col font-sans text-[13px]">
                          <button type="button" aria-label="Move earlier" onClick={() => move(i, -1)} className="px-1 hover:text-ember">
                            Up
                          </button>
                          <button type="button" aria-label="Move later" onClick={() => move(i, 1)} className="px-1 hover:text-ember">
                            Down
                          </button>
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                {!result && (
                  <button
                    type="button"
                    disabled={chain.length < 2 || busy}
                    onClick={check}
                    className="mt-5 bg-ink px-5 py-2.5 font-sans text-[16px] font-semibold text-paper transition-colors hover:bg-rust disabled:opacity-40"
                  >
                    Check my chain
                  </button>
                )}
              </div>
            </div>

            {result && (
              <section aria-live="polite" className="mt-12 border-t-2 border-ink pt-6">
                <h2 className="text-[26px] font-medium">
                  {result.exact ? 'That is what happened.' : result.correctSet >= 5 ? 'You found most of it.' : 'Not quite. Here is the real chain.'}
                </h2>
                <p className="instrument mt-1 text-[15px] text-ink/70">Score {Math.round(result.score * 100)} out of 100</p>
                <ol className="mt-4 max-w-[62ch] space-y-2">
                  {result.correctChain.map((c, i) => (
                    <li key={c.id} className="grid grid-cols-[2rem_1fr] text-[17px]">
                      <span className="instrument font-semibold">{i + 1}</span>
                      <span>{c.text}</span>
                    </li>
                  ))}
                </ol>
                <h3 className="mt-6 font-sans text-[15px] font-semibold">These looked suspicious but did not cause it</h3>
                <ul className="mt-1 max-w-[62ch] list-disc space-y-1 pl-5 text-[16.5px]">
                  {result.distractors.map((d) => (
                    <li key={d.id}>{d.text}</li>
                  ))}
                </ul>
                <p className="mt-6 max-w-[60ch] text-[17px] leading-relaxed">
                  Nobody on Crew 1 was careless. Every step protected something and weakened something else. Now you have the same sols to fly.
                </p>
                <button type="button" onClick={refly} disabled={busy} className="mt-5 bg-ember px-6 py-3 font-sans text-[16px] font-semibold text-night hover:bg-haze disabled:opacity-50">
                  Re-fly the last sols
                </button>
                {error && <p role="alert" className="mt-3 text-[15px] text-critical">{error}</p>}
              </section>
            )}
          </article>
        )}
      </div>
    </main>
  );
}
