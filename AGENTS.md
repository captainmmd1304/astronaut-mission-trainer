# AGENTS.md — rules for AI agents and contributors

Project overview lives in `README.md`. System design lives in `docs/ARCHITECTURE.md`. This file is the *rulebook*: where code goes, what must never happen, and recipes for common tasks.

## Golden rules

1. **`packages/sim` is pure.** No `fetch`, no `fs`, no `Date.now()`, no `Math.random()`, no `process.env`, no imports from `apps/*` or `@amt/content`. Randomness comes only from the seeded PRNG in `sim/src/rng.ts`. Time is a number passed in (`sol`).
2. **Live data enters the sim only as a `WorldSnapshot`** (type in `@amt/shared`). Never call NASA from the sim or from the web app. Only `apps/api` talks to NASA and OpenRouter.
3. **Dependency direction:** `shared` ← `sim`, `content` ← `web`, `api`. `shared` imports nothing from the repo.
4. **Contracts first.** Change a request/response/socket payload in `packages/shared` first, then update both `api` and `web`. Never hand-write duplicate types.
5. **Validate at the edges with zod** (HTTP bodies, socket payloads, env, content files). Trust types inside.
6. **Content needs sources.** Every real-world fact in `packages/content` must have a `sources` entry (URL to NASA/ESA/JPL/etc.). Fictional material must set `fictional: true`. Check `docs/CONTENT_FACTS.md` first: it lists facts already verified, with sources.
7. **Game balance numbers are abstractions**, not NASA-validated physics. Keep them in config objects, document the intent in `docs/GAME_DESIGN.md`, never bury them in logic.
8. **Never commit secrets.** `.env` is gitignored; add new vars to `.env.example` and `apps/api/src/config/env.ts`.
9. **Youth audience.** No personal data (display names only), no free-form profile fields, chat is length-limited and filtered, rooms are private by code and expire.
10. **Demo safety.** Every external dependency (NASA, OpenRouter, WebSocket, WebGL) needs a working fallback. See "Failure modes" in `docs/ARCHITECTURE.md`.

## Backend conventions (`apps/api`)

- Pattern: `*.controller.ts` (HTTP, validation, status codes) → `*.service.ts` (business logic) → `*.repository.ts` (Prisma only). Controllers never touch Prisma. Services never touch `req`/`res`.
- One folder per module under `src/modules/<name>/`. Routes are mounted in `src/app.ts` under `/v1`.
- External APIs live in `src/integrations/*.client.ts` and return already-parsed, zod-validated data.
- Realtime code lives in `src/realtime/`. Delayed delivery uses `DelayedQueue` from `@amt/shared`; never `setTimeout` chains scattered around.
- Errors: throw typed errors in services, map to HTTP in one error middleware. Log with pino, no `console.log` in committed code (except boot line).

## Frontend conventions (`apps/web`)

- Next.js App Router. Pages in `src/app`, UI in `src/components`, 3D in `src/three`, client state in `src/game` (Zustand), network helpers in `src/lib`.
- **3D is client-only.** Components under `src/three` start with `'use client'`, and the canvas is loaded with `next/dynamic` (`ssr: false`) so non-play pages stay light.
- 3D rules: see `docs/3D_PIPELINE.md` (triangle budget, instancing, no per-frame allocations, no `useState` in `useFrame`).
- HUD and forms are normal React/Tailwind. Do not render UI text inside the WebGL canvas unless using drei `<Html>`.
- Workspace packages are consumed as TypeScript source; `next.config.ts` lists them in `transpilePackages`.

## How to... (recipes)

**Add a landing site:** add an object to `packages/content/src/sites/index.ts` (must pass `LandingSiteSchema`, include `sources`), add its terrain look to `apps/web/src/three/MarsTerrain.tsx` params, add a test that the site loads.

**Add a sim system or event:** create `packages/sim/src/systems/<name>.ts` (pure function `(state, decisions, world, rules, rng) => {state, events}`), register it in `engine.ts` in a fixed order, give every emitted event a `causedBy` list and an `explainKey`, add a determinism test.

**Add a historical scenario or black-box case:** add to `packages/content/src/scenarios` or `blackbox`, fill `sources`, `learningObjectives`, and scripted `worldInputs`. No code changes needed if it only uses existing event types.

**Add an API endpoint:** schema in `packages/shared` → controller/service/repository in `apps/api/src/modules` → mount in `app.ts` → client helper in `apps/web/src/lib/api.ts`.

**Add a socket event:** declare in `packages/shared/src/socket-events.ts` (both directions), handle in `apps/api/src/realtime/gateway.ts`, consume in `apps/web/src/lib/socket.ts`.

## Definition of done (any feature)

- Types and zod schemas updated in `shared` if a contract changed.
- `pnpm typecheck` and `pnpm test` pass.
- Determinism test added or updated if sim behavior changed.
- Works with `SPACE_DATA_MODE=fixture` (offline demo).
- Docs touched if behavior, env vars, or decisions changed.

## Commands

```bash
pnpm install            # install all workspaces
pnpm dev                # web :3000 + api :4000
pnpm test               # vitest across packages
pnpm typecheck
pnpm db:migrate         # prisma migrate dev
```

## Things that look tempting but are wrong

- Calling DONKI/Horizons from the browser (breaks rate limits, leaks the key, no fallback).
- Putting game logic in React components or socket handlers (it belongs in `@amt/sim`).
- Using `Math.random()` or `new Date()` inside the sim.
- Running Socket.IO on Vercel (serverless cannot hold WebSockets).
- Adding npm packages to `packages/sim` (keep it dependency-free apart from `@amt/shared` types).
- Treating game balance values as real physics in UI copy. Label them as simplified.
