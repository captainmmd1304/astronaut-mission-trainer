import type { SimEvent } from '../types';

/** Build a cause-linked event. `n` disambiguates several events of one type in one sol. */
export function makeEvent(
  sol: number,
  type: string,
  explainKey: string,
  causedBy: string[] = [],
  data?: SimEvent['data'],
  n = 0,
): SimEvent {
  return { id: `${sol}:${type}:${n}`, sol, type, causedBy, explainKey, data };
}

/** Collects events for one system, numbering ids against everything already emitted this sol. */
export class Emitter {
  readonly events: SimEvent[] = [];
  constructor(
    private readonly sol: number,
    private readonly prior: SimEvent[],
  ) {}

  emit(type: string, explainKey: string, causedBy: (string | undefined)[] = [], data?: SimEvent['data']): SimEvent {
    const n = [...this.prior, ...this.events].filter((e) => e.type === type).length;
    const ev = makeEvent(this.sol, type, explainKey, causedBy.filter((c): c is string => !!c), data, n);
    this.events.push(ev);
    return ev;
  }
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
