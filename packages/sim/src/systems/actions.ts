import type { System } from '../types';
import { Emitter, clamp } from '../events/helpers';
import { effectMagnitude, hasEffect } from '../events';

/** Player actions that change the world: EVA and build projects. */
export const actionsSystem: System = (state, ctx) => {
  const { decisions, rules } = ctx;
  const b = rules.balance;
  const em = new Emitter(state.sol, ctx.priorEvents);
  const r = ctx.rng.next(); // always drawn: keeps the stream aligned
  let power = state.power;
  let crew = state.crew;
  let radiation = state.radiation;
  let food = state.food;
  let lastEvaPostponedSol = state.lastEvaPostponedSol;
  const causes = { ...state.causes };

  const stormM = effectMagnitude(state, 'dust-storm');
  const radiationThreat = hasEffect(state, 'flare-watch') || hasEffect(state, 'solar-flare');

  if (decisions.eva) {
    const removed = power.panelDust * b.evaCleanFraction;
    power = { ...power, panelDust: power.panelDust - removed };
    let risk = 0;
    if (stormM > 0) risk = r < stormM ? b.evaStormRisk * stormM : 0;
    if (risk > 0) crew = { ...crew, health: clamp(crew.health - risk, 0, 1) };
    const ev = em.emit('eva-done', 'eva-done', [causes['dust-storm'], causes['eva-postponed']], {
      dustRemoved: Math.round(removed * 100) / 100,
      crewRisk: risk,
    });
    causes['eva-done'] = ev.id;
    if (radiationThreat) {
      const w = em.emit('eva-in-warning', 'eva-in-warning', [ev.id, causes['flare-watch']], {});
      causes['eva-in-warning'] = w.id;
    }
  } else if (power.panelDust >= b.evaPostponeDustThreshold && state.sol - lastEvaPostponedSol > 4) {
    const ev = em.emit('eva-postponed', 'eva-postponed', [causes['dust-storm']], { panelDust: Math.round(power.panelDust * 100) / 100 });
    causes['eva-postponed'] = ev.id;
    lastEvaPostponedSol = state.sol;
  }

  // projects: one at a time, progress only on sols the player keeps working on it
  let projects = state.projects.map((p) => ({ ...p }));
  if (decisions.project) {
    let p = projects.find((x) => x.id === decisions.project);
    if (!p) {
      p = { id: decisions.project, solsRemaining: b.projectSols[decisions.project] ?? 4 };
      projects.push(p);
    }
    p.solsRemaining -= 1;
    if (p.solsRemaining <= 0) {
      projects = projects.filter((x) => x !== p);
      if (p.id === 'shielding-upgrade') radiation = { ...radiation, shieldingLevel: clamp(radiation.shieldingLevel + 0.15, 0, 0.45) };
      if (p.id === 'greenhouse-expansion') food = { ...food, greenhouseLevel: clamp(food.greenhouseLevel + 0.2, 0, 1) };
      if (p.id === 'panel-cleaning') power = { ...power, panelDust: power.panelDust * 0.3 };
      if (p.id === 'battery-bank') power = { ...power, capKwh: power.capKwh * 1.25 };
      const ev = em.emit('project-complete', 'project-complete', [], { project: p.id });
      causes['project-complete'] = ev.id;
    }
  }

  return { state: { ...state, power, crew, radiation, food, projects, causes, lastEvaPostponedSol }, events: em.events };
};
