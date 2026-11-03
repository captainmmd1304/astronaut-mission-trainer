# Astronaut Mission Trainer (AMT)

> NASA Space Apps Challenge 2026 — *"Build a Junior Astronaut Mission Trainer"*
> (event tags: Intermediate difficulty, Beginner/Youth audience; subjects: Games, Planets & Moons, Software, Space Exploration, Sun)

**One-line pitch:** a Mars-outpost trainer for students where **the real universe is the game engine**: real solar flares, real Earth–Mars light-time delay, and real historical missions decide whether your crew lives.

**Status:** SCAFFOLD ONLY. Folder structure, contracts, docs and stubs exist. There is no working gameplay yet. Build order is in `docs/BUILD_PLAN.md`.

---

## Read this first (for humans and AI agents)

Reading order: `README.md` (this file) → `AGENTS.md` (rules for editing the repo) → `docs/ARCHITECTURE.md` (system design) → `docs/BUILD_PLAN.md` (what to do next).
Other docs: `docs/GAME_DESIGN.md` (rules of the game), `docs/DATA_SOURCES.md` (NASA APIs), `docs/3D_PIPELINE.md` (3D scene), `docs/adr/` (decision records).

## The product in 60 seconds

The player commands a Mars outpost. Every **sol** (Mars day) they split a limited power budget across life support, radiation shielding, food production and comms, and may start one build project. The trade-offs are the lesson: more shielding means less power for the greenhouse, and so on.

What makes it different from a generic survival game:

1. **Black box opening.** The game starts by investigating a *failed* mission (telemetry + decisions). The player finds the root cause, then "re-flies" the mission and tries to do better.
2. **Live universe.** Real solar flares/CMEs (NASA DONKI) trigger radiation events. Real Earth–Mars distance (JPL Horizons) sets the comms delay. Mars solar conjunction causes a comms blackout.
3. **Autonomy under delay.** Earth cannot answer instantly, so the player must decide alone. In multiplayer, a *Mission Control* player on "Earth" sees Mars telemetry that is already minutes old, and every message is delayed by the real light-time (scaled for playability).
4. **Landing site matters.** Bright (dust-covered) vs dark (bare basalt) terrain, plus real candidate sites, change power, dust, temperature and radiation.
5. **History as scenarios.** Real events (dust storm that ended the Opportunity mission, a major solar storm, real mission failures) are playable scenarios or black-box case files, each with cited sources.
6. **Trainer, not just a game.** Every run ends in a *debrief* that explains cause and effect ("you under-shielded before the flare because...") and scores learning objectives.

## Run it

Requirements: Node 22+, pnpm 9+, PostgreSQL 15+ (local or Railway).

```bash
pnpm install
cp .env.example .env            # then fill values (see Environment below)
pnpm db:migrate                 # prisma migrate dev (apps/api)
pnpm dev                        # web on :3000, api on :4000
pnpm test                       # runs vitest in packages (sim determinism tests first)
pnpm typecheck
```

The scaffold ships without dependency versions. First-time install commands are in `docs/BUILD_PLAN.md` (section "Step 0").

## Repo map

```
astronaut-mission-trainer/
├── README.md               ← you are here
├── AGENTS.md               ← rules and recipes for AI agents / contributors
├── CLAUDE.md               ← points Claude Code at AGENTS.md
├── docs/
│   ├── ARCHITECTURE.md     ← system design, diagrams, contracts, failure modes
│   ├── GAME_DESIGN.md      ← loop, systems, events, sites, scoring, modes
│   ├── DATA_SOURCES.md     ← NASA/JPL APIs, keys, rate limits, fallbacks
│   ├── 3D_PIPELINE.md      ← how the 3D scene is built (React Three Fiber)
│   ├── BUILD_PLAN.md       ← phased plan + install commands + demo path
│   └── adr/                ← architecture decision records (0001…0004)
├── apps/
│   ├── web/                ← Next.js (App Router) + Tailwind v4 + React Three Fiber
│   └── api/                ← Node.js + Express + Socket.IO + Prisma (controller→service→repository)
└── packages/
    ├── shared/             ← zod schemas, API + socket contracts, DelayedQueue (no deps on other packages)
    ├── sim/                ← PURE deterministic game engine (no I/O, no clock, no Math.random)
    └── content/            ← landing sites, scenarios, black-box case files (typed + zod-validated)
```

Dependency direction (never violate): `shared` ← `sim` and `content` ← `web` and `api`. `sim` must not import `content`; content is passed into `sim` as arguments.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Monorepo | pnpm workspaces | simple, no extra tooling |
| Web | Next.js (App Router), React, TypeScript, Tailwind CSS v4 | same stack as the author's other projects |
| 3D | three.js via React Three Fiber + drei, procedural low-poly "diorama" style | can be authored in code by Claude; light enough for school laptops |
| State (client) | Zustand | small, works well with R3F |
| API | Node.js, Express, TypeScript, controller→service→repository | same pattern as the author's other backends |
| Realtime | Socket.IO on the api service | rooms, reconnection, simple delayed delivery |
| DB | PostgreSQL + Prisma | usual stack; stores runs, rooms, messages, NASA cache |
| Validation | zod everywhere at the edges | one schema → types + runtime checks |
| AI | OpenRouter (model id from env) | only for debrief prose + optional co-pilot; always has a template fallback |
| Tests | vitest (sim, content), supertest (api, later) | determinism tests are the priority |
| Hosting | Vercel (web), Railway (api + Postgres, one project, two services) | WebSockets need a long-lived server, so api cannot be serverless |

## Key concepts (glossary)

- **Sol**: one Mars day = 24 h 39 min 35 s. One game turn = one sol.
- **Light-time (L)**: one-way signal delay Earth↔Mars, from JPL Horizons range. Roughly 3 to 22 minutes depending on orbital positions.
- **Comms time scale**: `COMMS_TIME_SCALE` multiplies real light-time for gameplay (0.05 → 12 min becomes 36 s; 1 = real).
- **Solar conjunction**: Sun between Earth and Mars; comms blackout for roughly two weeks.
- **WorldSnapshot**: the only way live NASA data enters the sim. Captured, stored in the run log, so replays are deterministic.
- **Run**: one playthrough = `{config, seed, worldSnapshots[], decisions[]}`. Replaying it yields the same result.
- **Black box**: case file of a failed mission (telemetry frames + decision log + root cause). Fictional hero case plus real case files.
- **Debrief**: post-run explanation built by walking the cause chain of events back from the failure.
- **Room**: multiplayer session with a 6-character code. Roles: `OUTPOST` (1–3 players) and `MISSION_CONTROL` (1 player).

## Contracts (single sources of truth)

| What | Where |
|---|---|
| API request/response schemas, `WorldSnapshot`, `SolDecisions`, roles | `packages/shared/src` |
| Socket event names and payloads | `packages/shared/src/socket-events.ts` |
| Game state, step function, events | `packages/sim/src` |
| Landing site / scenario / black-box schemas and data | `packages/content/src` |
| DB schema | `apps/api/prisma/schema.prisma` |

## Environment

See `.env.example`. Key variables: `DATABASE_URL`, `JWT_SECRET`, `NASA_API_KEY` (free at api.nasa.gov; `DEMO_KEY` is heavily rate-limited), `SPACE_DATA_MODE` (`live|cached|fixture`), `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `COMMS_TIME_SCALE`, `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`.

## Non-negotiables

1. The sim is pure and deterministic. Same seed + same inputs → same outputs.
2. Live NASA data never reaches the sim directly, only through a stored `WorldSnapshot`.
3. The demo must never break because NASA is down: live → cached → fixture fallback.
4. Every factual claim in `packages/content` has a `sources` entry (unless explicitly marked `fictional: true`).
5. Audience includes minors: no personal data collected, rooms are private by code, chat is length-limited and filtered, messages expire.

## License / credits

Data: NASA and JPL public APIs (respect their usage guidelines). 3D assets: only CC0 or NASA public-domain models, logged in `apps/web/public/models/LICENSES.md`.
