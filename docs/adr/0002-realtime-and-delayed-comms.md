# ADR-0002: Realtime comms via Socket.IO with server-side delayed delivery

**Status:** Proposed
**Date:** 2026-11-02
**Deciders:** AMT team

## Context
Multiplayer players communicate through "comms" that must be delayed by the Earth–Mars light-time (scaled for playability) and blocked during blackouts. Mission Control must also see delayed telemetry. The audience includes minors, so chat needs moderation hooks. Vercel (web hosting) cannot hold WebSocket connections.

## Decision
Run Socket.IO on the existing Node `apps/api` service (Railway). Delay is applied on the server: `deliverAt = sentAt + lightTime × COMMS_TIME_SCALE`, held in a `DelayedQueue` and persisted in Postgres so restarts do not lose messages. Rooms are in-memory plus DB-backed.

## Options Considered

### Option A: Socket.IO on the api (chosen)
| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | Low (same Railway service) |
| Scalability | Single instance; fine for classrooms |
| Team familiarity | Medium (Node/Express known; realtime new) |

**Pros:** rooms, acks, auto-reconnect; one deploy; full control over delay and moderation.
**Cons:** in-memory rooms limit scaling (needs Redis adapter later).

### Option B: Managed realtime (Ably/Pusher/Supabase Realtime)
| Dimension | Assessment |
|---|---|
| Complexity | Low-Medium |
| Cost | Free tier limits, vendor dependency |
| Scalability | High |
| Team familiarity | Low |

**Pros:** no socket server to run. **Cons:** delay logic and moderation still need a server; extra account and keys; demo risk if limits hit.

### Option C: HTTP polling
**Pros:** simplest, works on Vercel. **Cons:** clunky UX, wasteful, hard to make delays feel right.

## Trade-off Analysis
A keeps all game authority and delay logic in one place we control. B shifts hosting but not the hard parts. C is a fallback only.

## Consequences
- Easier: precise delay semantics, chat moderation, authoritative co-op sim.
- Harder: the api must be a long-lived server; scaling beyond one instance needs Redis.
- Revisit: more than one api instance, or classroom sizes beyond tens of rooms.

## Action Items
1. [ ] Implement `DelayedQueue` (pure, clock-injected) in `@amt/shared` with tests.
2. [ ] Implement gateway, room manager, persistence and reschedule-on-boot.
3. [ ] Add chat length limit, filter, per-socket rate limit, room expiry.
