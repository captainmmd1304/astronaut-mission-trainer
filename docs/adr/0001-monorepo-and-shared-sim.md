# ADR-0001: Monorepo with a pure, shared simulation package

**Status:** Proposed
**Date:** 2026-11-02
**Deciders:** AMT team

## Context
The game logic must run in the browser (solo), on the server (co-op, authoritative), and in tests. We need replayable runs for debrief and the black-box "re-fly", and live NASA data must not make results irreproducible.

## Decision
Use a pnpm monorepo. Put all game rules in `packages/sim` as a pure, deterministic library (`step(state, decisions, world, rules)`), with a seeded PRNG and no I/O. Live data enters only as a stored `WorldSnapshot`. Contracts live in `packages/shared`; static game content lives in `packages/content`.

## Options Considered

### Option A: Shared pure sim package (chosen)
| Dimension | Assessment |
|---|---|
| Complexity | Medium (workspace setup, TS source packages) |
| Cost | Low |
| Scalability | Fine for classroom scale |
| Team familiarity | Good (monorepo experience) |

**Pros:** one source of truth for rules; deterministic replay; trivial unit tests; same code client and server.
**Cons:** needs `transpilePackages` and a bundling step for the api.

### Option B: Game logic inside the API only
| Dimension | Assessment |
|---|---|
| Complexity | Low initially |
| Cost | Low |
| Scalability | Server load grows with players |
| Team familiarity | High |

**Pros:** simple authority. **Cons:** solo play needs network; latency in the loop; harder replay/test; duplicated logic if the client wants prediction.

### Option C: Logic in React components/state
**Pros:** fastest to start. **Cons:** untestable, no replay, cannot be reused for multiplayer; rejected.

## Trade-off Analysis
A costs a little setup but removes the largest risks (inconsistent rules, unreproducible bugs, multiplayer rewrite). B and C are faster for a day and slower for everything after.

## Consequences
- Easier: tests, replays, debrief, anti-cheat (server can replay a submitted run).
- Harder: sim cannot fetch anything; all inputs must be modeled explicitly.
- Revisit: if sim performance becomes an issue (unlikely at one step per sol).

## Action Items
1. [ ] Implement `rng.ts`, `types.ts`, `engine.ts` with determinism test.
2. [ ] Configure `transpilePackages` (web) and `tsup noExternal` (api).
3. [ ] Add lint rule or test forbidding `Date`, `Math.random`, `fetch` in `packages/sim`.
