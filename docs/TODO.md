# TODO

Working list for things that are not code. Update it when something is done. Last updated 2026-11-12.

## Product backlog: Malhar + Siya

### Malhar

- [ ] **Account identifier limits:** Decide whether account creation and sign-in should support email-style call signs. Align the client and API validation limits, show a useful validation message, and add tests for the minimum and maximum lengths.
- [ ] **Black Box from the game portal:** Add a visible Black Box entry point to the game portal/navigation so players can open it without leaving the game flow. Preserve the existing protected answer/review behavior.
- [ ] **Mission failure flow:** Define and implement what a crew sees when the mission fails: clear cause, crew status, score/debrief access, retry/re-fly path, and whether progress is retained.
- [ ] **Project review revamp:** Rework the project-review layout and wording so it clearly explains the decision, result, trade-off, and next action.
- [ ] **Project-review vocabulary:** Replace repeated sentences with varied, factually accurate templates for success, partial success, failure, and unavailable evidence. Keep the vocabulary appropriate for the youth audience.

### Siya

- [ ] **Chat box layout:** Adjust the chat box height, width, scrolling, and responsive behavior so messages remain readable during play without covering mission controls.
- [ ] **Animation pass:** Improve the existing animation polish, prioritizing mission-critical feedback such as dust, damage, power changes, crew actions, and transitions. Keep the 3D performance rules in `docs/3D_PIPELINE.md`.
- [ ] **Music and sound:** Add a lightweight music/ambient layer with mute and volume controls, plus a fallback when audio cannot load. Do not block gameplay on audio loading.
- [ ] **Build-projects / sols-left bug:** Reproduce the issue where building projects interacts incorrectly with the “sols left” display, document the expected behavior, and add a regression test before fixing it.

### Shared review

- [ ] Review each completed item together in `SPACE_DATA_MODE=fixture`, then run `pnpm typecheck` and `pnpm test` before marking it done.

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
3. **Completed:** verified the Mars Climate Orbiter, Mars Polar Lander, and Schiaparelli facts against primary reports in `docs/CONTENT_FACTS.md`. The remaining 4.8 km Mars Polar Lander figure is documented as unconfirmed because it was not located in the primary reports.
4. **Completed:** verified both Horizons fixtures against fresh NASA/JPL Horizons queries and recorded the matching values in `apps/api/src/integrations/fixtures/README.md`.
5. **Completed:** `docs/CONTENT_FACTS.md` has no unresolved "Secondary: confirm" rows; the remaining 4.8 km Mars Polar Lander figure includes an explanation for why it could not be confirmed in the primary reports.

## Still open from earlier

- Decide Vercel-only vs Vercel + a realtime service for multiplayer (affects ADR-0002 and deployment notes).
- First dependency install and typecheck (Step 0 in `docs/BUILD_PLAN.md`); the scaffold has never been run.
- Write the black-box hero case content, debrief templates, and NPC Mission Control script.
- Space Apps submission requirements and demo video plan.

## Backend status (2026-11-06)
Done and tested (37 tests): `packages/sim` (power, dust, EVA, projects, life support, radiation + powered shelter, food, comms, failure/completion, cause-linked events), `packages/content` (balance, Asteria black box, re-fly scenario, Vikram/Prithvi messages, debrief templates), `apps/api` (guest sessions, space conditions with live → cached → fixture, content with hidden answer key, runs with replay verification, debrief with template fallback and optional free-model rewrite). `docs/STORY_FULL.md` is the complete story.

Neon database setup completed and verified: pooled and direct connection URLs are configured in `apps/api/.env`, and the Prisma migration has been applied successfully.

Next on the backend:
- Check the live Horizons and DONKI calls on a machine that can reach NASA (only the fixture path was run here).
- Balance: two passes done with `pnpm --filter @amt/api playtest`. Trainee: careless bots lose, careful bot wins. Commander: dust storm is hard (careful bot wins ~29%), Asteria re-fly and free play are won by the careful bot but with much higher doses. Needs real playtesters.
- Deploy the API on Railway: `railway.json` is in the repo root. In Railway: new project from the GitHub repo, add the env vars from `.env.example` (both Neon URLs, JWT_SECRET, NASA_API_KEY, SPACE_DATA_MODE=live, CORS_ORIGIN = the web URL), generate a public domain, check `/health`.
- Rooms, Socket.IO and delayed comms (deferred until single-player is solid).


## Frontend status (Nov 9)
- Done: landing (3D Mars + Earth signal), login/register/guest, mission planner, play HUD (power sliders, crew orders, build, end sol), guided tour, debrief, black box.
- Accounts need a DB migration on Neon: run `pnpm --filter @amt/api exec prisma migrate deploy` (adds Player.username and passwordHash), then `prisma generate`.
- Next: sound, flare and damage effects, lobby/multiplayer, mobile polish, playtests.
