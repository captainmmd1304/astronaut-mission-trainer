# ADR-0004: NASA data via a server-side proxy with live → cache → fixture fallback

**Status:** Proposed
**Date:** 2026-11-02
**Deciders:** AMT team

## Context
The game's hook is real conditions (DONKI flares/CMEs, Horizons distance). NASA keys have strict limits (`DEMO_KEY` is about 30 requests/hour), outages happen, and a hackathon demo cannot fail because of a third party. The sim must stay deterministic.

## Decision
Only `apps/api` talks to NASA. A poller fetches and normalizes data into `WorldSnapshot`, stores it in `SpaceDataCache`, and serves it at `GET /v1/space/conditions` with a `source` field (`live | cached | fixture`). `SPACE_DATA_MODE` selects the strategy. Recorded fixtures guarantee an offline demo. The sim receives data only as a stored snapshot.

## Options Considered

### Option A: Server proxy + cache + fixtures (chosen)
| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | Free |
| Scalability | One poll serves all users |
| Team familiarity | Good |

**Pros:** key stays secret; rate limits respected; honest source badge; demo-safe.
**Cons:** more code than direct calls.

### Option B: Browser calls NASA directly
**Pros:** least backend work. **Cons:** exposes the key, hits rate limits per user, no fallback, CORS risk, non-reproducible runs.

### Option C: Static snapshots only
**Pros:** most reliable. **Cons:** loses the "live universe" differentiator.

## Trade-off Analysis
A keeps the live hook and the reliability of C. B is unsafe at classroom scale.

## Consequences
- Easier: reliable demos, reproducible replays, UI that shows data provenance.
- Harder: must maintain fixtures and normalizers; some DONKI-to-Mars mapping is a game rule (see `docs/DATA_SOURCES.md`).
- Revisit: if NASA exposes better Mars-specific space weather feeds.

## Action Items
1. [ ] Implement `donki.client.ts` and `horizons.client.ts` with zod-validated output.
2. [ ] Implement `space-data.service.ts` tiers and poller.
3. [ ] Record fixtures (quiet week, active week, closest approach, conjunction).
4. [ ] Show LIVE / CACHED / REPLAY badge in the HUD.
