import type { EffectType, SimState, System } from '../types';
import { Emitter } from './helpers';

export { makeEvent, Emitter, clamp } from './helpers';

const FLARE_BASE: Record<string, number> = { A: 0.02, B: 0.05, C: 0.1, M: 0.3, X: 0.6 };

/** Map a flare class like "X1.2" to a 0..1 game magnitude. */
export function flareMagnitude(classType: string | undefined): number {
  if (!classType) return 0.2;
  const base = FLARE_BASE[classType[0]!.toUpperCase()] ?? 0.1;
  const num = parseFloat(classType.slice(1));
  return Math.min(1, base + (Number.isFinite(num) ? 0.04 * (num - 1) : 0));
}

export function hasEffect(state: SimState, type: EffectType): boolean {
  return state.activeEffects.some((e) => e.type === type);
}
export function effectMagnitude(state: SimState, type: EffectType): number {
  return state.activeEffects.filter((e) => e.type === type).reduce((m, e) => Math.max(m, e.magnitude), 0);
}

const DEFAULT_STORM_SOLS = 6;

/**
 * World events: turns scripted scenario events and live WorldSnapshot events into active effects.
 * Always draws exactly three random numbers per sol so recorded runs stay aligned.
 */
export const worldEventsSystem: System = (state, ctx) => {
  const { rules, world } = ctx;
  const b = rules.balance;
  const em = new Emitter(state.sol, ctx.priorEvents);
  const r1 = ctx.rng.next();
  const r2 = ctx.rng.next();
  const r3 = ctx.rng.next();

  // 1. age effects; cme-pending that expire may become a real spike
  const effects: SimState['activeEffects'] = [];
  const causes = { ...state.causes };
  const flags = { ...state.flags };
  for (const e of state.activeEffects) {
    const left = e.solsRemaining - 1;
    if (left > 0) {
      effects.push({ ...e, solsRemaining: left });
    } else if (e.type === 'cme-pending' && r2 < b.cmeHitChance) {
      const ev = em.emit('cme-arrival', 'cme-arrival', [e.eventId], { magnitude: e.magnitude });
      causes['cme-arrival'] = ev.id;
      effects.push({ type: 'solar-flare', solsRemaining: 1, magnitude: e.magnitude, eventId: ev.id });
    }
  }

  const linkDown = !state.comms.linkUp || state.power.powered.comms < 0.5;
  const delayMin = Math.round((2 * world.lightTimeSeconds) / 60);
  const addWatch = (magnitude: number, solsRemaining: number, cause?: string) => {
    const ev = em.emit('flare-watch', 'flare-watch', [cause], { magnitude, delayMin });
    causes['flare-watch'] = ev.id;
    effects.push({ type: 'flare-watch', solsRemaining, magnitude, eventId: ev.id });
    if (linkDown) {
      const late = em.emit('flare-warning-delayed', 'flare-warning-delayed', [ev.id], { delayMin });
      causes['flare-warning-delayed'] = late.id;
    }
  };

  // 2. scripted events
  for (const s of rules.scriptedEvents) {
    if (s.sol === state.sol) {
      if (s.type === 'dust-storm') {
        const ev = em.emit('dust-storm-start', 'dust-storm-start', [], { magnitude: s.magnitude });
        causes['dust-storm'] = ev.id;
        effects.push({ type: 'dust-storm', solsRemaining: s.durationSols ?? DEFAULT_STORM_SOLS, magnitude: s.magnitude, eventId: ev.id });
      } else if (s.type === 'solar-flare') {
        effects.push({ type: 'solar-flare', solsRemaining: 1, magnitude: s.magnitude });
      } else if (s.type === 'comms-blackout') {
        const ev = em.emit('comms-blackout', 'comms-blackout', [], {});
        causes['comms-blackout'] = ev.id;
        effects.push({ type: 'comms-blackout', solsRemaining: s.durationSols ?? 3, magnitude: s.magnitude, eventId: ev.id });
      } else if (s.type === 'equipment-fault') {
        const ev = em.emit('equipment-fault', 'equipment-fault', [], { magnitude: s.magnitude });
        causes['equipment-fault'] = ev.id;
        effects.push({ type: 'equipment-fault', solsRemaining: s.durationSols ?? 3, magnitude: s.magnitude, eventId: ev.id });
      }
    }
    // a scripted flare is announced one sol ahead
    if (s.type === 'solar-flare' && s.sol === state.sol + 1) addWatch(s.magnitude, 2);
  }

  // 3. random dust storm (free play)
  const random = rules.randomEvents ?? rules.scriptedEvents.length === 0;
  if (random && !effects.some((e) => e.type === 'dust-storm') && r1 < b.randomStormChancePerSol) {
    const magnitude = Math.round((0.3 + 0.6 * r2) * 100) / 100;
    const ev = em.emit('dust-storm-start', 'dust-storm-start', [], { magnitude });
    causes['dust-storm'] = ev.id;
    effects.push({ type: 'dust-storm', solsRemaining: DEFAULT_STORM_SOLS + Math.floor(r2 * 6), magnitude, eventId: ev.id });
  }

  // 3b. random CME forecast (free play): a watch now, may arrive in 2 sols
  const forecastActive = effects.some((e) => e.type === 'flare-watch' || e.type === 'cme-pending' || e.type === 'solar-flare');
  if (random && !forecastActive && r3 < b.randomCmeChancePerSol) {
    const magnitude = Math.round((0.25 + 0.65 * r2) * 100) / 100;
    addWatch(magnitude, 3);
    effects.push({ type: 'cme-pending', solsRemaining: 2, magnitude, eventId: causes['flare-watch'] });
  }

  // 4. live space weather from the stored snapshot
  for (const se of world.solarEvents) {
    const key = `seen:${se.id}`;
    if (flags[key]) continue;
    flags[key] = true;
    if (se.kind === 'flare') {
      effects.push({ type: 'solar-flare', solsRemaining: 1, magnitude: flareMagnitude(se.classType) });
    } else {
      // A CME is only a "possible Mars event": warn now, may hit in 2 sols.
      addWatch(0.5, 3);
      effects.push({ type: 'cme-pending', solsRemaining: 2, magnitude: 0.5, eventId: causes['flare-watch'] });
    }
  }

  return { state: { ...state, activeEffects: effects, causes, flags }, events: em.events };
};
