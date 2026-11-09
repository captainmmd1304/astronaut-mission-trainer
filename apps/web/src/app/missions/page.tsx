'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { LandingSite, Scenario } from '@amt/content'; // types only
import { Viewport, DEFAULT_LOOK } from '@/components/Viewport';
import { useGame } from '@/game/store';
import { api, ApiError } from '@/lib/api';
import { AccountChip } from '@/components/AccountChip';
import { AuthGate } from '@/components/AuthGate';
import { ensureSession } from '@/lib/session';

const TERRAIN: Record<string, string> = { bright: 'Bright, dusty ground', dark: 'Dark basalt', mixed: 'Mixed terrain' };

function MissionsInner() {
  const router = useRouter();
  const begin = useGame((s) => s.begin);
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [siteId, setSiteId] = useState('jezero');
  const [scenarioId, setScenarioId] = useState('free-play-30');
  const [difficulty, setDifficulty] = useState<'trainee' | 'commander'>('trainee');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.sites(), api.scenarios()])
      .then(([s, sc]) => {
        setSites(s);
        setScenarios(sc);
      })
      .catch((e: ApiError) => setError(e.message));
  }, []);

  const site = useMemo(() => sites.find((s) => s.id === siteId), [sites, siteId]);
  const scenario = scenarios.find((s) => s.id === scenarioId);

  async function start() {
    if (!scenario) return;
    setBusy(true);
    setError(null);
    try {
      const session = await ensureSession();
      const [run, text] = await Promise.all([
        api.startRun(session.token, {
          scenarioId,
          siteId,
          seed: Math.floor(Math.random() * 2 ** 31),
          mode: scenarioId === 'asteria-refly' ? 'blackbox-refly' : scenario.kind === 'historical' ? 'scenario' : 'solo',
          difficulty,
        }),
        api.text(),
      ]);
      begin(run, text);
      router.push('/play');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not start the mission.');
      setBusy(false);
    }
  }

  const Card = ({ on, onClick, title, meta, text }: { on: boolean; onClick: () => void; title: string; meta?: string; text: string }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`group w-full rounded-2xl border-2 p-4 text-left transition-all duration-150 ${
        on ? 'border-ember bg-ember/15 shadow-[0_0_30px_-6px_rgba(217,115,43,0.7)]' : 'border-rust/50 bg-night/60 hover:-translate-y-0.5 hover:border-haze/70 hover:bg-basalt/70'
      }`}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-sans text-[18px] font-bold text-bone">{title}</span>
        {on && <span className="font-sans text-[13px] font-bold text-ember">Selected</span>}
        {!on && meta && <span className="instrument text-[13px] text-bone/55">{meta}</span>}
      </span>
      <span className="mt-1 block text-[15.5px] leading-snug text-bone/80">{text}</span>
    </button>
  );

  return (
    <main className="relative min-h-dvh">
      <Viewport sim={null} look={site?.look ?? DEFAULT_LOOK} frame={false} className="fixed inset-0" />
      <div className="fixed inset-0 bg-gradient-to-r from-night via-night/80 to-night/10" />
      <div className="relative z-10 max-w-[40rem] px-5 py-8 md:px-[6vw] md:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="font-sans text-[15px] font-bold text-haze">
            Asteria
          </Link>
          <AccountChip />
        </div>
        <h1 className="rise mt-6 text-[clamp(2.1rem,4.6vw,3.2rem)] font-medium leading-tight">Plan your mission</h1>
        <p className="rise mt-1 text-[17px] text-bone/75">Three choices, then you launch. The tour starts when you land.</p>

        <h2 className="mt-8 flex items-center gap-3 font-sans text-[18px] font-bold">
          <span className="step-badge">1</span> Landing site
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {sites.map((s) => (
            <Card key={s.id} on={s.id === siteId} onClick={() => setSiteId(s.id)} title={s.name} meta={TERRAIN[s.terrain]} text={s.blurb} />
          ))}
        </div>

        <h2 className="mt-8 flex items-center gap-3 font-sans text-[18px] font-bold">
          <span className="step-badge">2</span> Mission
        </h2>
        <div className="mt-3 space-y-3">
          {scenarios.map((s) => (
            <Card key={s.id} on={s.id === scenarioId} onClick={() => setScenarioId(s.id)} title={s.title} meta={`${s.durationSols} sols`} text={s.summary} />
          ))}
        </div>
        {scenarioId === 'asteria-refly' && (
          <p className="mt-3 text-[15.5px] text-bone/80">
            This one makes more sense after you have read the{' '}
            <Link href="/blackbox" className="underline decoration-ember underline-offset-4">
              black box
            </Link>
            .
          </p>
        )}

        <h2 className="mt-8 flex items-center gap-3 font-sans text-[18px] font-bold">
          <span className="step-badge">3</span> Difficulty
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Card on={difficulty === 'trainee'} onClick={() => setDifficulty('trainee')} title="Trainee" text="More supplies. Forgiving. Start here." />
          <Card on={difficulty === 'commander'} onClick={() => setDifficulty('commander')} title="Commander" text="Tight supplies and harsher weather." />
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-lg border border-critical/60 bg-critical/10 px-3 py-2 text-[16px]">
            {error}
          </p>
        )}
        <div className="mt-9">
          <button type="button" disabled={busy || !scenario} onClick={start} className="key key-go pulse">
            {busy ? 'Launching' : 'Launch mission'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function Missions() {
  return (
    <AuthGate>
      <MissionsInner />
    </AuthGate>
  );
}
