'use client';
import type { ProjectId } from '@amt/shared';
import { Icon } from '@/components/Icon';
import { useGame } from '@/game/store';

const PROJECTS: { id: ProjectId; label: string; note: string; icon: string }[] = [
  { id: 'shielding-upgrade', label: 'Thicker shielding', note: 'Less radiation for good', icon: 'shield' },
  { id: 'greenhouse-expansion', label: 'Bigger greenhouse', note: 'More food each sol', icon: 'leaf' },
  { id: 'panel-cleaning', label: 'Panel brushes', note: 'Clears dust, no spacewalk', icon: 'dust' },
  { id: 'battery-bank', label: 'Battery bank', note: 'Holds a quarter more', icon: 'battery' },
];

const REVIEW: Record<ProjectId, { result: string; tradeoff: string; next: string }> = {
  'shielding-upgrade': { result: 'Reduces future radiation dose.', tradeoff: 'Uses crew time and power while the build is active.', next: 'Keep shielding powered when a warning arrives.' },
  'greenhouse-expansion': { result: 'Grows more food each sol.', tradeoff: 'Needs steady greenhouse power before it pays back.', next: 'Reserve power for life support first.' },
  'panel-cleaning': { result: 'Clears most panel dust without an EVA.', tradeoff: 'Takes three sols of focused work.', next: 'Use it when dust is the main power risk.' },
  'battery-bank': { result: 'Raises the energy reserve ceiling.', tradeoff: 'Takes the longest build time.', next: 'Charge it before the next storm.' },
};

function Order({ on, onClick, icon, title, sub, warn }: { on: boolean; onClick: () => void; icon: string; title: string; sub: string; warn?: string | null }) {
  return (
    <div>
      <button type="button" role="switch" aria-checked={on} onClick={onClick} className={`key w-full !justify-start !gap-3 !text-left ${on ? 'key-on' : ''}`}>
        <Icon name={icon} size={24} className={on ? 'text-haze' : 'text-bone/70'} />
        <span className="flex-1">
          <span className="block text-[16px] leading-tight">{title}</span>
          <span className="block text-[12.5px] font-medium text-bone/65">{sub}</span>
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-extrabold ${on ? 'bg-haze text-night' : 'bg-black/50 text-bone/60'}`}>{on ? 'ON' : 'OFF'}</span>
      </button>
      {warn && <p className="mt-1.5 rounded-lg border border-caution/50 bg-caution/10 px-2.5 py-1.5 font-sans text-[13.5px] leading-snug text-caution">{warn}</p>}
    </div>
  );
}

export function CrewOrders() {
  const draft = useGame((s) => s.draft);
  const sim = useGame((s) => s.sim);
  const setFlag = useGame((s) => s.setFlag);
  if (!draft || !sim) return null;
  const threat = sim.activeEffects.some((e) => e.type === 'flare-watch' || e.type === 'solar-flare');
  const storm = sim.activeEffects.some((e) => e.type === 'dust-storm');
  return (
    <div className="space-y-3">
      <Order
        on={draft.shelter}
        onClick={() => setFlag('shelter', !draft.shelter)}
        icon="shield"
        title="Crew shelters"
        sub="Stay inside the shielded room"
        warn={threat && !draft.shelter ? 'A radiation warning is active. Shelter only helps if it has power.' : null}
      />
      <Order
        on={draft.eva}
        onClick={() => setFlag('eva', !draft.eva)}
        icon="suit"
        title="Spacewalk: clean panels"
        sub="Removes dust, but it is risky"
        warn={draft.eva && threat ? 'Radiation warning: the shelter cannot protect people outside.' : draft.eva && storm ? 'Wind and dust make it risky out there.' : null}
      />
    </div>
  );
}

export function BuildPicker() {
  const draft = useGame((s) => s.draft);
  const sim = useGame((s) => s.sim);
  const run = useGame((s) => s.run);
  const setProject = useGame((s) => s.setProject);
  if (!draft || !sim || !run) return null;
  // sim.projects holds solsRemaining *after* the last committed sol.
  // For a project the player has selected this sol but not yet committed,
  // it won't be in sim.projects yet — show the full project length as the
  // "starting" estimate so the counter reads "5 sols" → "4" → … → done.
  const committed = new Map(sim.projects.map((p) => [p.id, p.solsRemaining]));
  const projectSolsConfig = run.rules.balance.projectSols;
  const selected = draft.project ? PROJECTS.find((p) => p.id === draft.project) : null;
  return (
    <div>
      <div role="radiogroup" aria-label="Project" className="grid grid-cols-2 gap-2.5">
        {PROJECTS.map((p) => {
          const on = draft.project === p.id;
          // If the project is in-flight (committed at least once), show remaining.
          // If it is selected this sol for the first time, show the full duration
          // so the player sees how long it will take before they commit.
          const solsLeft = committed.has(p.id)
            ? committed.get(p.id)
            : on
              ? projectSolsConfig[p.id] ?? null
              : null;
          return (
            <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setProject(on ? null : p.id)} className={`key !flex-col !gap-1 !px-2 !py-2.5 !text-center ${on ? 'key-on' : ''}`}>
              <Icon name={p.icon} size={22} className={on ? 'text-haze' : 'text-bone/70'} />
              <span className="text-[13.5px] leading-tight">{p.label}</span>
              <span className="text-[11.5px] font-medium leading-tight text-bone/60">{solsLeft != null ? `${solsLeft} sols left` : p.note}</span>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="mt-3 rounded-xl border border-haze/40 bg-night/60 px-3 py-2.5 font-sans text-[13px] leading-snug text-bone/80">
          <p className="font-bold text-haze">Project review · {selected.label}</p>
          <p className="mt-1"><span className="text-bone">Decision:</span> build it over time.</p>
          <p><span className="text-bone">Result:</span> {REVIEW[selected.id].result}</p>
          <p><span className="text-bone">Trade-off:</span> {REVIEW[selected.id].tradeoff}</p>
          <p><span className="text-bone">Next action:</span> {REVIEW[selected.id].next}</p>
        </div>
      )}
    </div>
  );
}
