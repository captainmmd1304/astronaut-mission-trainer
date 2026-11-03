# Fixtures (recorded real API responses)

Purpose: let the whole app run offline and make demos immune to NASA outages (`SPACE_DATA_MODE=fixture`).

Files to record (JSON), with the capture date noted below each:
- `donki-quiet-week.json`: a week with only minor flares.
- `donki-active-week.json`: a week with strong flares and at least one CME.
- `horizons-closest-approach.json`: Earth-Mars range near closest approach (short light-time, around 3 minutes).
- `horizons-conjunction.json`: Earth-Mars geometry near solar conjunction (long light-time, comms blackout).

Capture log:
- (none yet)
