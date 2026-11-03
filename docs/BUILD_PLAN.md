# Build plan

Order matters: single-player vertical slice first, multiplayer last. Each phase ends with something demoable.

## Step 0 — install dependencies (versions are not pinned in the scaffold)

```bash
pnpm install

# web
pnpm --filter @amt/web add next react react-dom three @react-three/fiber @react-three/drei zustand socket.io-client zod
pnpm --filter @amt/web add -D typescript @types/node @types/react @types/react-dom @types/three tailwindcss @tailwindcss/postcss

# api
pnpm --filter @amt/api add express cors helmet socket.io zod pino jsonwebtoken @prisma/client
pnpm --filter @amt/api add -D typescript tsx tsup prisma vitest @types/node @types/express @types/cors @types/jsonwebtoken

# packages
pnpm --filter @amt/shared add zod
pnpm --filter @amt/content add zod
pnpm --filter @amt/sim add -D vitest typescript
pnpm --filter @amt/shared add -D typescript
pnpm --filter @amt/content add -D vitest typescript
```

Prisma note: newer Prisma majors move the connection URL into `prisma.config.ts`. Run `pnpm --filter @amt/api exec prisma init` once and reconcile its output with `prisma/schema.prisma`; adjust the generator block to the installed version. Add workspace deps (`"@amt/shared": "workspace:*"`, etc.) to each package.json that imports them.

## P0 — Vertical slice (must ship)

- [ ] `shared`: `WorldSnapshot`, `SolDecisions`, roles, socket events, `DelayedQueue`.
- [ ] `sim`: state, RNG, power + life support + radiation + food systems, `step()`, cause-linked events, determinism test.
- [ ] `content`: 3 landing sites (Jezero, one bright, one dark), balance config, schemas + validation test.
- [ ] `web`: `/play` HUD with power sliders and sol report; R3F terrain + habitat; landing-site picker.
- [ ] `api`: `/health`, `/v1/space/conditions` with fixture mode working.
- [ ] Debrief page with template-based cause chain.
- **Demo:** pick a site, play 10 sols, a scripted flare hits, see the debrief.

## P1 — Story and real data

- [ ] Black-box page: fictional hero case, evidence board, reveal, re-fly.
- [ ] DONKI integration (live + cache + fixtures), flare → radiation event, "LIVE/CACHED/REPLAY" badge.
- [ ] Horizons integration: light-time + conjunction → comms system, delayed Earth guidance (NPC Mission Control).
- [ ] SolarFlare and DustStorm effects.
- **Demo:** the game opens with the failed mission, then reacts to a real flare.

## P2 — History and polish

- [ ] 2 historical scenarios (dust storm, solar storm) with cited sources and learning objectives.
- [ ] Real case files in black box (verify facts first).
- [ ] OpenRouter debrief prose with template fallback.
- [ ] Audio, transitions, tutorial for Trainee difficulty, accessibility pass.
- [ ] Rehearse with `SPACE_DATA_MODE=fixture`.

## P3 — Multiplayer (only if P0–P1 are solid)

- [ ] Rooms + guest sessions, lobby UI, roles.
- [ ] Server-authoritative co-op sim; delayed chat and delayed telemetry for Mission Control.
- [ ] Chat safety: length limit, filter, rate limit, room expiry.

## P4 — Stretch

Eclipse/Phobos transit events, second planet (new content only), real-delay "hero moment", Earth-dot signal visual.

## Demo path (aim for 90 seconds)

1. Black-box opening (20 s): "this crew was lost, find out why."
2. Choose a landing site; show the live-conditions badge and light-time.
3. Play through a flare and a dust storm; show the delayed Earth message.
4. Debrief with cause chain and objectives.
5. (If built) two browser windows showing Mission Control seeing stale data.

## Risks

| Risk | Mitigation |
|---|---|
| Scope creep (multiplayer, planets) | strict phase gates above |
| NASA API limits/outage | server cache + fixtures |
| 3D performance | low-poly budget, lite fallback |
| Wrong science in content | `sources` required, review before demo |
| Time lost to infra | deploy a hello-world to Vercel + Railway in P0 |
