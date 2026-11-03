# Data sources

Everything here is called **only from `apps/api`**. Items marked **VERIFY** must be checked against current docs during implementation; they are written from memory and may have changed.

| Source | Base URL | Key | Used for | Fallback |
|---|---|---|---|---|
| NASA DONKI | `https://api.nasa.gov/DONKI/` (`FLR`, `CME`, `GST`, `CMEAnalysis`, `notifications`) | yes (`api_key`) | solar flares, CMEs, geomagnetic storms | cache → `fixtures/donki-*.json` |
| JPL Horizons | `https://ssd.jpl.nasa.gov/api/horizons.api` | no | Earth–Mars range → light-time; Sun–Earth–Mars geometry (conjunction); Phobos geometry (stretch) | cache → `fixtures/horizons-*.json` |
| NASA Image and Video Library | `https://images-api.nasa.gov` | no | optional imagery for debrief/case files | skip |
| OpenRouter | `https://openrouter.ai/api/v1` | yes | debrief prose | template debrief |
| NASA PDS / mission papers | n/a | n/a | balance references and content sources (not called at runtime) | n/a |

## NASA API key

Register free at `https://api.nasa.gov`. `DEMO_KEY` allows about 30 requests/hour and 50/day; a registered key allows about 1,000/hour. Poll on a timer (`SPACE_DATA_TTL_MINUTES`), never per user request.

## DONKI notes

- Query by `startDate` / `endDate` (YYYY-MM-DD). Normalize results into `SolarEvent { id, kind: 'flare'|'cme', classType?, startTime, peakTime?, sourceUrl? }`.
- DONKI is Earth-centric. **VERIFY:** whether `CMEAnalysis` / WSA-Enlil entries expose Mars impact predictions (look for an impact list naming Mars). If not, use a game rule: a wide or Earth-directed CME becomes a *possible* Mars event with a scripted arrival offset, and say so in the UI.
- Flares arrive at light speed; CMEs take days. Game rule: flare = same-sol radiation spike with short warning; CME = multi-sol warning window.

## Horizons notes

- Request JSON, observer table, `COMMAND='499'` (Mars) with Earth as the observer center, `QUANTITIES` including range (and range-rate). **VERIFY** parameter names and quantity codes in the Horizons API docs.
- `lightTimeSeconds = rangeAU × 499.004784`. Typical range of results: about 3 to 22 minutes.
- Solar conjunction: use the Sun–Observer–Target elongation angle; flag blackout when it is below a threshold (game rule, around a few degrees). **VERIFY** quantity code.
- Sol length constant: 88,775.244 s (24 h 39 m 35.244 s).

## Fixtures

Record real responses into `apps/api/src/integrations/fixtures/` (e.g. one quiet week, one active week, one Horizons table around closest approach and one around conjunction). `SPACE_DATA_MODE=fixture` serves only these. Add a README note listing capture dates.

## Content sources

Every fact in `packages/content` needs `sources` (NASA, ESA, JPL, mission reports). Prefer primary sources (mission websites, official investigation reports).
