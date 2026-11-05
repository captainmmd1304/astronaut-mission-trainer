# TODO

Working list for things that are not code. Update it when something is done. Last updated 2026-11-03.

## Pinned (blocked, come back to it)

### DONKI fixtures: `donki-quiet-week.json` and `donki-active-week.json`
- **Why pinned:** NASA's DONKI service timed out on 2026-11-03 (both `api.nasa.gov/DONKI` and the CCMC host), from the shell and the browser. Not our bug.
- **Where they go:** `apps/api/src/integrations/fixtures/`, shaped as `{ "FLR": [...], "CME": [...] }`.
- **Windows:** active = 2024-05-08 to 2024-05-15 (suggested; confirm it has M/X flares and at least one CME). Quiet = pick a window with few or no strong flares (untested idea: 2019-08-01 to 2019-08-08).
- **How:** see "Fixtures" in `docs/DATA_SOURCES.md` and the capture log in `apps/api/src/integrations/fixtures/README.md`. Use the registered key from `apps/api/.env`, and never paste the key into a page or commit it.
- **Done when:** both files exist, start with `{`, and the fixtures README status table says "recorded" with the date.

## Next: Malhar

Proposed from what he already did (data verification). Change it if he is on something else.

1. **Record the two DONKI fixtures** (the pinned item above). Retry when DONKI is back; if it is still down, note the date tried in the fixtures README.
2. **Check the quiet-week window** while recording: confirm it really is quiet, and say why you chose it in the README capture log.
3. **Confirm the secondary-source facts in `docs/CONTENT_FACTS.md`** against the primary reports, and update the table (mark each one Primary once confirmed):
   - Mars Climate Orbiter: planned about 110 km, minimum survivable about 80 km, estimated actual about 57 km (open the Mishap Investigation Board report: https://discovery.larc.nasa.gov/PDF_FILES/MCO_report_2.pdf)
   - Mars Polar Lander: leg deployment altitude (about 4.8 km), touchdown logic enabled at 40 m, impact speed (about 22 m/s). Primary reports: JPL Special Review Board report (JPL D-18709) and the Young report.
   - Schiaparelli: sequence details (IMU saturation duration, wrong attitude and negative altitude, early release) in the ESA inquiry report: https://exploration.esa.int/web/mars/-/59176-exomars-2016-schiaparelli-anomaly-inquiry
4. **Record a Horizons fixture check:** the two Horizons fixtures are done; just confirm the numbers in `fixtures/README.md` match a fresh Horizons query.
5. **Done when:** `docs/CONTENT_FACTS.md` has no "Secondary: confirm" rows left, or each remaining one says why it could not be confirmed.

## Still open from earlier

- Decide Vercel-only vs Vercel + a realtime service for multiplayer (affects ADR-0002 and deployment notes).
- First dependency install and typecheck (Step 0 in `docs/BUILD_PLAN.md`); the scaffold has never been run.
- Write the black-box hero case content, debrief templates, and NPC Mission Control script.
- Space Apps submission requirements and demo video plan.

## Backend status (2026-11-05)
Done and tested (37 tests): `packages/sim` (power, dust, EVA, projects, life support, radiation + powered shelter, food, comms, failure/completion, cause-linked events), `packages/content` (balance, Asteria black box, re-fly scenario, Vikram/Prithvi messages, debrief templates), `apps/api` (guest sessions, space conditions with live → cached → fixture, content with hidden answer key, runs with replay verification, debrief with template fallback and optional free-model rewrite). `docs/STORY_FULL.md` is the complete story.

Next on the backend:
- Neon: Prisma schema and repositories are written but untested against a real database. Create a Neon project, put the pooled URL in DATABASE_URL and the direct URL in DIRECT_URL (apps/api/.env), then run `pnpm --filter @amt/api db:migrate`.
- Check the live Horizons and DONKI calls on a machine that can reach NASA (only the fixture path was run here).
- Balance pass by playtest (`packages/content/src/balance.ts`).
- Rooms, Socket.IO and delayed comms (deferred until single-player is solid).
