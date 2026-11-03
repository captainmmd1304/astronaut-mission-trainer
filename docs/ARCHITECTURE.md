# Architecture

Status: Proposed · Date: 2026-11-02 · Scope: whole system. Decision records are in `docs/adr/`.

## 1. Goals and constraints

**Goals**
- A playable Mars-outpost trainer for a Beginner/Youth audience (Intermediate engineering depth) that makes trade-offs tangible.
- Visibly powered by real NASA data (solar events, Earth–Mars distance) and real history.
- Premium feel: a 3D diorama outpost, strong narrative opening (black box), clear debrief.

**Constraints**
- Hackathon timeline, small team. Reuse the usual stack (Next.js, Node/Express, Prisma/Postgres, Tailwind v4, OpenRouter, Railway/Vercel).
- Runs on school laptops and phones: modest GPU, unreliable Wi-Fi.
- Minors in the audience: no personal data, safe chat.
- Demo day: must work even if NASA APIs, the LLM, or WebSockets fail.

## 2. Requirements

**Functional (from the agreed feature list)**
1. Survival core loop on Mars: power, life support, shielding, food, comms trade-offs per sol.
2. Real-time conditions: solar flares/CMEs, Earth–Mars light-time, solar conjunction blackout, eclipse/Phobos transit events (stretch).
3. Black-box backstory: investigate a failed mission, then re-fly it.
4. Failed mission shown (fictional hero case + real case files).
5. Multiplayer with delayed communications (Outpost players and a Mission Control player).
6. Landing-site choice: bright vs dark terrain and real candidate sites.
7. Historical missions as scenarios.
8. Multiple planets, Mars first (data-driven so a new planet is new content, not new code).
9. Debrief that explains cause and effect and scores learning objectives.

**Non-functional**
- Determinism: same seed + inputs → identical outcome (enables replay, debrief, anti-cheat).
- Availability of demo: graceful degradation on every external dependency.
- Performance: 60 fps target on integrated GPUs, under ~150k triangles in view, first interactive under 3 s on the landing page (3D loaded lazily).
- Scale: classroom scale (tens of concurrent rooms). No horizontal scaling required for the hackathon.
- Safety/privacy: see section 11.

## 3. System context

```
  Student browsers (Outpost players)        Teacher / Mission Control browser
              │                                         │
              └────────────────────┬────────────────────┘
                                   ▼
                       ┌───────────────────────┐
                       │ apps/web  (Vercel)    │  Next.js + R3F (3D) + Tailwind v4
                       │ imports sim, content, │  Solo mode runs the sim IN the browser
                       │ shared                │
                       └──────┬─────────┬──────┘
                    REST /v1  │         │ WebSocket (Socket.IO)
                              ▼         ▼
                       ┌───────────────────────┐        ┌───────────────────────┐
                       │ apps/api  (Railway)   │───────▶│ NASA DONKI (flares,   │
                       │ Express + Socket.IO   │        │ CMEs)                 │
                       │ imports sim (co-op),  │───────▶│ JPL Horizons (range → │
                       │ shared                │        │ light-time)           │
                       └───────────┬───────────┘───────▶│ OpenRouter (debrief)  │
                                   ▼                    └───────────────────────┘
                          PostgreSQL (Railway)
```

## 4. Packages and dependency rule

```
packages/shared   zod schemas, WorldSnapshot, SolDecisions, API + socket contracts, DelayedQueue
packages/sim      pure engine: createInitialState(), step(), events, cause links, seeded RNG
packages/content  landing sites, scenarios, black-box cases, balance config (zod-validated)
apps/web          UI + 3D; solo sim runs here
apps/api          HTTP + realtime + NASA/LLM integrations + persistence; co-op sim runs here
```

`shared` ← (`sim`, `content`) ← (`web`, `api`). `sim` never imports `content`; the caller passes a `SimRules` object built from content.

Workspace packages export TypeScript source (`"main": "./src/index.ts"`). The web app lists them in `transpilePackages`. The api runs with `tsx` in dev and bundles with `tsup` (`noExternal: [/^@amt\//]`) for production.

## 5. The deterministic simulation (core design)

One game turn = one **sol**. The engine is a pure function:

```ts
createInitialState(config: RunConfig, rules: SimRules): SimState
step(state: SimState, decisions: SolDecisions, world: WorldSnapshot, rules: SimRules): StepResult
// StepResult = { state, events: SimEvent[], status: 'running' | 'failed' | 'completed' }
```

- `SimState` includes the PRNG state, so `step` has no hidden inputs.
- `WorldSnapshot` = `{ capturedAt, source, lightTimeSeconds, solarConjunction, solarEvents[] }`. It is the **only** channel for live data. The client/server fetches conditions, stores the snapshot in the run log, then passes it in. Replays reuse the stored snapshots.
- Every `SimEvent` has `id, sol, type, causedBy: string[], explainKey, data`. The debrief walks `causedBy` backwards from the failure event to build a plain-language chain.
- Systems run in a fixed order each sol: world events → power → life support → radiation → food → comms → crew → failure/success check. Each system is its own file under `sim/src/systems/`.
- A **run** is stored as `{ config, seed, worldSnapshots[], decisions[] }`. Any client or the server can replay it and get identical events.

Modes built on the same engine:

| Mode | Where the sim runs | World inputs | Notes |
|---|---|---|---|
| Solo | browser | live snapshot per sol (or at run start) | run log uploaded at the end for debrief |
| Co-op | api (authoritative) | live snapshot, shared by room | clients send decisions, server resolves sols |
| Historical scenario | browser or api | scripted from `content` | e.g. a recorded dust storm or solar storm |
| Black box | browser | recorded telemetry (read-only), then scripted re-fly | investigation UI, then a normal run with the failed mission's starting conditions |

## 6. Live space data pipeline

```
 NASA DONKI ─┐                         ┌─ GET /v1/space/conditions ─▶ web (per run / per sol)
             ├─▶ space-data.service ───┤
 JPL Horizons┘     (poller + cache)    └─ used by rooms to build room snapshots
                        │
                        ▼
                 SpaceDataCache table (key, payload, fetchedAt)
```

- One server-side poller (interval from `SPACE_DATA_TTL_MINUTES`). Browsers never call NASA.
- Three tiers via `SPACE_DATA_MODE`: `live` (call NASA, fall back to cache on error) → `cached` (serve DB cache only) → `fixture` (recorded JSON in `integrations/fixtures`, always available). The response includes `source` so the UI can show a "LIVE / CACHED / REPLAY" badge honestly.
- Light-time = Earth–Mars range (from Horizons, in AU) × 499.0 s per AU. Verify exact query parameters in `docs/DATA_SOURCES.md`.
- DEMO_KEY is limited to 30 requests/hour and 50/day, so a registered key plus caching is mandatory.

## 7. Realtime and delayed communications

- Socket.IO on the api service. Rooms are keyed by a 6-character code. Roles: `OUTPOST` and `MISSION_CONTROL`.
- Delivery delay: `deliverAt = sentAt + lightTimeSeconds × COMMS_TIME_SCALE`. If the link is down (solar conjunction or a scripted blackout), `deliverAt = max(deliverAt, linkRestoredAt)`.
- Messages are persisted with `deliverAt`; on server restart, undelivered messages are rescheduled.
- Mission Control also sees **stale telemetry**: each resolved sol's public state is queued for MC with the same delay. "What Earth sees is minutes old" is a core mechanic, not a bug.

```
 Mission Control (Earth)          api (room clock + DelayedQueue)         Outpost (Mars)
        │ comms:send "shelter"            │                                      │
        │───────────────────────────────▶ │ persist Message(deliverAt = t + L·k) │
        │                                 │            … timer …                 │
        │                                 │ comms:deliver ─────────────────────▶ │
        │                                 │ ◀───────────────────── comms:send    │
        │ ◀── comms:deliver (after L·k)   │   (reply is delayed the same way)    │
        │ ◀── telemetry:delayed (state from L·k ago)                             │
```

- Solo mode uses the same `DelayedQueue` (pure, clock-injected, lives in `@amt/shared`) in the browser, driven by a scripted NPC Mission Control.

## 8. Data model (Postgres via Prisma)

Full schema: `apps/api/prisma/schema.prisma`.

| Table | Purpose |
|---|---|
| `Player` | guest identity: `id`, `displayName` only |
| `Room`, `RoomMember` | multiplayer session, role per member, `expiresAt` |
| `Run` | `scenarioId`, `siteId`, `seed`, `mode`, `status`, `decisions` (json), `worldSnapshots` (json), `score` |
| `Message` | room chat with `sentAt`, `deliverAt`, `deliveredAt` |
| `DebriefReport` | per run: summary text, cause chain (json), learning objectives result, `generatedBy` (`llm` or `template`) |
| `SpaceDataCache` | key → payload + `fetchedAt` for DONKI/Horizons |

Events are **not** stored per row: they are derivable by replaying `seed + worldSnapshots + decisions`.

## 9. API surface (REST under `/v1`, plus sockets)

| Method + path | Purpose |
|---|---|
| `POST /sessions` | create a guest session (`displayName`) → JWT |
| `GET /space/conditions` | current `WorldSnapshot` (+ `source`) |
| `POST /runs` | register a run start (`scenarioId`, `siteId`, `seed`, `mode`) |
| `PUT /runs/:id/finish` | upload decisions + snapshots + outcome |
| `GET /runs/:id` | fetch run log for replay |
| `POST /runs/:id/debrief` | build debrief (LLM prose or template) |
| `POST /rooms`, `POST /rooms/:code/join`, `GET /rooms/:code` | multiplayer lifecycle |
| `GET /health` | liveness |

Content (sites, scenarios, black-box cases) is imported directly from `@amt/content` by the web app, so there are no content endpoints.

Socket events (declared in `packages/shared/src/socket-events.ts`): client→server `room:join`, `comms:send`, `sim:commit`; server→client `room:state`, `comms:deliver`, `telemetry:delayed`, `sim:sol-resolved`, `room:closed`.

## 10. Frontend and 3D

- Routes: `/` (landing + start), `/play` (the game), `/blackbox` (investigation), `/lobby/[code]` (multiplayer), `/debrief/[runId]`.
- 3D is a client-only React Three Fiber scene, lazy-loaded on `/play`. Style: stylized low-poly diorama, procedural terrain per landing site, effects for solar flare and dust storm. Details, budgets and the "what Claude can build" breakdown are in `docs/3D_PIPELINE.md`.
- Client state: Zustand store holds `SimState`, pending decisions, world snapshot, comms queue.
- Fallback: if WebGL is unavailable or `?lite=1`, show a 2D SVG diorama with the same HUD.

## 11. Security, privacy, youth safety

- Guest sessions only: `displayName` (max 24 chars, filtered). No email, no real names, no analytics that identify a person.
- Rooms are private by code, capped in size, expire (default 24 h), and messages are purged with the room.
- Chat: length limit (e.g. 140 chars), basic profanity filter, quick-reply templates to encourage on-topic comms, rate limit per socket.
- API: helmet, CORS allow-list from `CORS_ORIGIN`, zod validation on every body, JWT signed with `JWT_SECRET`, per-IP rate limits.
- Secrets only in env. NASA and OpenRouter keys never reach the browser.

## 12. Failure modes and degradation

| Failure | Behavior |
|---|---|
| NASA API down or rate-limited | serve cache, then fixtures; UI badge shows source |
| OpenRouter down or no key | template-based debrief from the cause chain |
| WebSocket drops | client auto-reconnects and re-syncs `room:state`; if impossible, offer solo mode |
| WebGL unsupported / slow device | 2D diorama fallback, reduced effects |
| API restart mid-room | rooms and undelivered messages reloaded from Postgres |
| Bad content file | zod validation fails at build/test time, not at runtime |

## 13. Deployment

- `apps/web` → Vercel. `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` point to the api.
- `apps/api` + Postgres → **one** Railway project with two services (api, Postgres). Run `prisma migrate deploy` on release.
- Environments: local, production. Use `SPACE_DATA_MODE=fixture` for rehearsals and the demo recording fallback.

## 14. Trade-offs and what to revisit

| Decision | Trade-off | Revisit when |
|---|---|---|
| Shared pure sim in a package | slightly more setup; huge gain in testability, replay, anti-cheat | never likely |
| Socket.IO in-memory rooms | no horizontal scale | more than one api instance (add Redis adapter) |
| Co-op sim on the server | more server code than peer-to-peer | latency issues (unlikely at turn-based pace) |
| Procedural low-poly 3D | less photoreal than scanned assets | time left for hero assets |
| Balance values are abstractions | not NASA-validated | educators ask for accuracy review |
| Guest-only auth | no persistent profiles | teacher dashboards or progress tracking |
| Light-time scaled by `COMMS_TIME_SCALE` | less "real" feeling | demo wants a real-delay moment (set to 1 for one scene) |
