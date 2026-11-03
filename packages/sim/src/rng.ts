/**
 * Seeded PRNG (mulberry32). This is the ONLY source of randomness allowed in @amt/sim.
 * The generator state is stored in SimState.rngState so step() has no hidden inputs.
 */
export interface Rng {
  next(): number; // [0, 1)
  readonly state: number;
}

export function createRng(initialState: number): Rng {
  let s = initialState >>> 0;
  return {
    next() {
      s = (s + 0x6d2b79f5) >>> 0;
      let r = Math.imul(s ^ (s >>> 15), 1 | s);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    },
    get state() {
      return s;
    },
  };
}
