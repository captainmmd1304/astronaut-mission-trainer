'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { LandingSite, Scenario } from '@amt/content'; // types only
import { Viewport, DEFAULT_LOOK } from '@/components/Viewport';
import { useGame } from '@/game/store';
import { api, ApiError } from '@/lib/api';
import { ensureSession, loadSession } from '@/lib/session';

const TERRAIN: Record<string, string> = { bright: 'Bright, dusty ground', dark: 'Dark basalt', mixed: 'Mixed terrain' };

export default function Missions() {
  const router = useRouter();
  const begin = useGame((s) => s.begin);
  const [sites, setSites] = useState<LandingSite[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [siteId, setSiteId] = useState('jezero');
  const [scenarioId, setScenarioId] = useState('free-play-30');
  const [difficulty, setDifficulty] = useState<'trainee' | 'commander'>('trainee');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(loadSession()?.displayName ?? '');
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
      const session = await ensureSession(name.trim() || undefined);
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

  return (
    <main className="relative min-h-dvh">
      <Viewport sim={null} look={site?.look ?? DEFAULT_LOOK} frame={false} className="fixed inset-0" />
      <div className="fixed inset-0 bg-gradient-to-r from-night via-night/85 to-night/10 md:via-night/70" />
      <div className="relative z-10 max-w-[38rem] px-6 py-10 md:px-[6vw] md:py-14">
        <Link href="/" className="font-sans text-[15px] text-bone/70 underline decoration-rust underline-offset-4 hover:text-bone">
          Asteria
        </Link>
        <h1 className="mt-6 text-[clamp(2rem,4.4vw,3rem)] font-medium leading-tight">Choose where to land</h1>

        <fieldset className="mt-5">
          <legend className="sr-only">Landing site</legend>
          <div className="divide-y divide-rust/40 border-y border-rust/40">
            {sites.map((s) => (
              <label key={s.id} className={`flex cursor-pointer gap-4 py-3 ${s.id === siteId ? 'text-bone' : 'text-bone/65 hover:text-bone/90'}`}>
                <input type="radio" name="site" className="mt-[9px] accent-[#d9732b]" checked={s.id === siteId} onChange={() => setSiteId(s.id)} />
                <span>
                  <span className="block text-[20px]">{s.name}</span>
                  <span className="block text-[15.5px] leading-snug">{s.blurb}</span>
                  <span className="instrument block text-[13px] text-haze/80">{TERRAIN[s.terrain]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <h2 className="mt-10 text-[26px] font-medium">Choose a mission</h2>
        <fieldset className="mt-3">
          <legend className="sr-only">Mission</legend>
          <div className="divide-y divide-rust/40 border-y border-rust/40">
            {scenarios.map((s) => (
              <label key={s.id} className={`flex cursor-pointer gap-4 py-3 ${s.id === scenarioId ? 'text-bone' : 'text-bone/65 hover:text-bone/90'}`}>
                <input type="radio" name="scenario" className="mt-[9px] accent-[#d9732b]" checked={s.id === scenarioId} onChange={() => setScenarioId(s.id)} />
                <span>
                  <span className="block text-[20px]">
                    {s.title} <span className="instrument text-[14px] text-bone/55">{s.durationSols} sols</span>
                  </span>
                  <span className="block text-[15.5px] leading-snug">{s.summary}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {scenarioId === 'asteria-refly' && (
          <p className="mt-3 text-[15.5px] text-bone/80">
            This one makes more sense after you have read the{' '}
            <Link href="/blackbox" className="underline decoration-ember underline-offset-4">
              black box
            </Link>
            .
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-5 font-sans">
          <fieldset>
            <legend className="mb-1 text-[14px] text-bone/65">Difficulty</legend>
            {(['trainee', 'commander'] as const).map((d) => (
              <label key={d} className="mr-5 inline-flex cursor-pointer items-center gap-2 text-[16px]">
                <input type="radio" name="difficulty" className="accent-[#d9732b]" checked={difficulty === d} onChange={() => setDifficulty(d)} />
                {d === 'trainee' ? 'Trainee' : 'Commander'}
              </label>
            ))}
          </fieldset>
          <label className="block">
            <span className="mb-1 block text-[14px] text-bone/65">Your call sign (no real names needed)</span>
            <input
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cadet"
              className="w-56 border-b-2 border-rust bg-transparent py-1 text-[17px] text-bone placeholder:text-bone/35 focus:border-ember focus:outline-none"
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-6 border-l-2 border-critical pl-3 text-[16px] text-bone">
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={busy || !scenario}
          onClick={start}
          className="mt-8 bg-ember px-7 py-3 font-sans text-[16px] font-semibold text-night transition-colors hover:bg-haze disabled:opacity-50"
        >
          {busy ? 'Starting' : 'Begin mission'}
        </button>
      </div>
    </main>
  );
}
