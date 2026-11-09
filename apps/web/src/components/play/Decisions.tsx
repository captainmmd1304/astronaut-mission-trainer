'use client';
import type { ProjectId } from '@amt/shared';
import { useGame } from '@/game/store';

const PROJECTS: { id: ProjectId; label: string; note: string }[] = [
  { id: 'shielding-upgrade', label: 'Thicken the shielding', note: 'Less radiation for good' },
  { id: 'greenhouse-expansion', label: 'Expand the greenhouse', note: 'More food each sol' },
  { id: 'panel-cleaning', label: 'Build panel brushes', note: 'Clears most dust, no spacewalk' },
  { id: 'battery-bank', label: 'Add a battery bank', note: 'Holds a quarter more' },
];

function Toggle({ on, onChange, title, warn }: { on: boolean; onChange: (v: boolean) => void; title: string; warn?: string | null }) {
  return (
    <div className="py-2">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className="flex w-full items-center justify-between gap-3 text-left font-sans text-[15px] text-bone"
      >
        <span>{title}</span>
        <span className={`inline-block h-[18px] w-9 shrink-0 border ${on ? 'border-ember bg-ember/90' : 'border-rust bg-transparent'} relative`}>
          <span className={`absolute top-[1px] h-[14px] w-[14px] transition-all ${on ? 'left-[19px] bg-night' : 'left-[1px] bg-bone/70'}`} />
        </span>
      </button>
      {warn && <p className="mt-1 text-[14px] leading-snug text-caution">{warn}</p>}
    </div>
  );
}

export function Decisions({ onEnd }: { onEnd: () => void }) {
  const draft = useGame((s) => s.draft);
  const sim = useGame((s) => s.sim);
  const setFlag = useGame((s) => s.setFlag);
  const setProject = useGame((s) => s.setProject);
  if (!draft || !sim) return null;

  const threat = sim.activeEffects.some((e) => e.type === 'flare-watch' || e.type === 'solar-flare');
  const storm = sim.activeEffects.some((e) => e.type === 'dust-storm');
  const running = new Map(sim.projects.map((p) => [p.id, p.solsRemaining]));

  return (
    <section aria-label="Decisions for today" className="divide-y divide-rust/30">
      <div className="pb-1">
        <h2 className="mb-1 font-sans text-[15px] font-semibold text-bone">Crew today</h2>
        <Toggle
          on={draft.shelter}
          onChange={(v) => setFlag('shelter', v)}
          title="Crew shelters"
          warn={threat && !draft.shelter ? 'A radiation warning is active. Shelter only helps if it has power.' : null}
        />
        <Toggle
          on={draft.eva}
          onChange={(v) => setFlag('eva', v)}
          title="Send the crew out to clean the panels"
          warn={draft.eva && threat ? 'Radiation warning: the shelter cannot protect people outside.' : draft.eva && storm ? 'Wind and dust make it risky out there.' : null}
        />
      </div>
      <div className="pt-3">
        <h2 className="mb-1 font-sans text-[15px] font-semibold text-bone">Build</h2>
        <div role="radiogroup" aria-label="Project" className="space-y-[2px]">
          <label className="flex cursor-pointer items-baseline gap-2 py-1 font-sans text-[14px] text-bone/75">
            <input type="radio" name="project" checked={draft.project === null} onChange={() => setProject(null)} className="accent-[#d9732b]" />
            No project
          </label>
          {PROJECTS.map((p) => (
            <label key={p.id} className="flex cursor-pointer items-baseline gap-2 py-1 font-sans text-[14px] text-bone">
              <input type="radio" name="project" checked={draft.project === p.id} onChange={() => setProject(p.id)} className="accent-[#d9732b]" />
              <span>
                {p.label}
                <span className="ml-2 text-bone/55">{running.has(p.id) ? `${running.get(p.id)} sols left` : p.note}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="pt-4">
        <button
          type="button"
          onClick={onEnd}
          className="w-full bg-ember px-4 py-3 font-sans text-[16px] font-semibold text-night transition-colors hover:bg-haze"
        >
          End sol {draft.sol}
        </button>
      </div>
    </section>
  );
}
