# Fixtures (recorded real API responses)

Purpose: let the whole app run offline and make demos immune to NASA outages (`SPACE_DATA_MODE=fixture`).

## Status

| File | Status | Window | Notes |
|---|---|---|---|
| `horizons-closest-approach.json` | recorded 2026-11-03; verified 2026-11-06 | 2018-07-29 to 2018-08-02, 1-day steps | Fresh Horizons query matched every stored row. Earth-Mars range about 0.385 AU, so one-way light-time about 192 s (3.2 min). Mars near opposition, Sun-Observer-Target about 170-173 degrees. |
| `horizons-conjunction.json` | recorded 2026-11-03; verified 2026-11-06 | 2021-10-03 to 2021-10-13, 1-day steps | Fresh Horizons query matched every stored row. Range about 2.63 AU, so light-time about 1,312 s (21.9 min). Minimum Sun-Observer-Target 0.6551 degrees on 2021-Oct-08 (solar conjunction, comms blackout). |
| `donki-quiet-week.json` | PENDING | choose a quiet week (few or no strong flares) | not recorded yet |
| `donki-active-week.json` | PENDING | suggested: 2024-05-08 to 2024-05-15 (strong flares and a major geomagnetic storm; confirm in DONKI) | not recorded yet |

DONKI could not be recorded on 2026-11-03: both `api.nasa.gov/DONKI` and the original `kauai.ccmc.gsfc.nasa.gov/DONKI/WS` host returned connection timeouts from the browser pane. Retry later, and when recording:

- Query `FLR` (flares) and `CME` for the same window and save each response as one JSON file, or one file with `{ "FLR": [...], "CME": [...] }` (pick one shape and have the fixture loader document it).
- Use the real key through the API service (`apps/api`), not a key typed into a web page.
- Do not edit or invent entries. If trimming for size, keep the fields the normalizer reads and note the trimming below.

## How the Horizons fixtures were made

Request (verified in `docs/DATA_SOURCES.md`): `COMMAND='499'`, `CENTER='500@399'`, `QUANTITIES='20,23'`, `STEP_SIZE='1 d'`, JSON format.
The files keep the API's `signature` and a trimmed `result` that contains only the column header and the table between `$$SOE` and `$$EOE`. Columns: date, `delta` (range in AU), `deldot` (range-rate in km/s), `S-O-T` (Sun-Observer-Target elongation, degrees) and a leading/trailing flag. The parser should only rely on the `$$SOE`/`$$EOE` markers.

Light-time check: `lightTimeSeconds = delta x 499.004784`.
- Closest approach: 0.38497 AU x 499.004784 = about 192.1 s.
- Conjunction: 2.62862 AU x 499.004784 = about 1,311.7 s.

## Capture log

- 2026-11-03: Horizons closest approach and conjunction recorded (via browser pane, no API key needed).
- 2026-11-06: Fresh NASA/JPL Horizons queries using the recorded command, observer center, quantities, date windows, and 1-day step matched every stored row in both Horizons fixtures. Closest approach minimum: 0.38497382377498 AU on 2018-Jul-31; conjunction minimum: 0.6551 degrees on 2021-Oct-08 with range 2.62862109938076 AU.
- 2026-11-03: DONKI attempts failed with upstream connection timeouts (NASA side).
