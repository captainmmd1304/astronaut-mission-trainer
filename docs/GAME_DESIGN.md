# Game design

All numbers here are **game-balance abstractions**, not NASA-validated physics. Keep them in config (`packages/content`), tune by playtest, and label them "simplified" in the UI.

## Core loop (one sol per turn)

1. **Briefing:** conditions for this sol (power forecast, dust level, flare warning, link status, Earth guidance if any has arrived).
2. **Decide:** split available power across systems; optionally start/continue one build project; optionally send an EVA (repair/inspection).
3. **Resolve:** the sim runs systems in a fixed order and emits events with causes.
4. **Report:** what changed and why (short, plain language). Failure or survival to the end of the scenario ends the run.
5. **Debrief:** cause chain, what the player could have done, learning objectives met/missed.

## Systems

| System | Inputs | Outputs | Trade-off it creates |
|---|---|---|---|
| Power | panel area, dust on panels, season/insolation, site modifiers, battery | kWh available this sol | everything else competes for it |
| Life support | power allocation | O2, water, CO2 scrubbing | cannot be starved for long, but over-allocating wastes power |
| Radiation | baseline dose by site, flare/CME events, shielding level | cumulative dose, crew health | shielding projects cost power/time now, pay off during events |
| Food | power + water + light for greenhouse, stock buffer | calories | yield lags investment; buffer vs growth |
| Comms | link state, light-time, power allocation | when Earth guidance arrives, whether telemetry is received | blackout forces autonomy |
| Crew | all of the above | health, morale | slow-burn consequences |

## Events

- **Solar flare / CME** (real from DONKI, or scripted): radiation spike; mitigation = shelter + shielding. Warning arrives delayed.
- **Dust storm** (seasonal probability by site, or scripted): reduces solar generation, reduces visibility, accumulates dust on panels.
- **Solar conjunction** (computed from real geometry, or scripted): comms blackout.
- **Equipment fault** (seeded random): needs EVA and power.
- **Eclipse / Phobos transit** (stretch): short dip in solar generation; derived from Horizons geometry.

## Landing sites

`terrain` is `bright` (dust-covered, high albedo), `dark` (bare basalt, low albedo) or `mixed`. Each site has multiplier modifiers (all `1.0` = baseline): `dustDeposition`, `solarInsolation`, `shielding` (natural), `waterIce`, `tempSwing`. Candidate sites: Jezero (real, Perseverance), a bright-terrain site, a dark-terrain site, a mid-latitude ice-rich plain. Values are placeholders until tuned; every site needs `sources`.

Note for UI copy: Mars is **not tidally locked**, so it has no permanent dark side. "Bright vs dark" refers to surface albedo.

## Modes and difficulty

- **Trainee** (Beginner/Youth): forgiving thresholds, warnings arrive early, hints on.
- **Commander** (Intermediate): tighter margins, delayed or missing warnings, more events.
- **Solo**, **Co-op** (2–4 players), **Historical scenario**, **Black box**.

## Multiplayer roles

- **Outpost (1–3):** same base, shared power budget; players can each own a system (power, life support, shielding, food) and must negotiate.
- **Mission Control (1):** sees delayed telemetry, can send guidance (delayed), has a "what Earth knows" panel showing how stale its picture is.

## Black box

Flow: **case file → evidence board → root-cause pick → reveal → re-fly.**
- Case file shows telemetry frames and decision log up to the failure.
- Player tags evidence and chooses the root-cause chain; distractors exist.
- Reveal compares their chain with the true one.
- "Re-fly" launches a normal run from the failed mission's starting conditions.
- Hero case is **fictional** (`fictional: true`). Outline: shielding upgrade deferred to save power, a dust storm cuts generation, a flare warning arrives late due to light-time, crew is caught outside shelter. Real case files (each with sources, to verify before use): Mars Climate Orbiter 1999 (unit mismatch), Mars Polar Lander 1999, Schiaparelli 2016.

## Historical scenarios (candidates, verify against NASA/ESA sources)

- 2018 global dust storm and the end of the Opportunity mission.
- Dust accumulation on solar panels (InSight).
- A major solar storm as measured at Mars by surface radiation instruments (e.g. May 2024; confirm details first).

## Scoring and learning objectives

Score = sols survived + crew health + objectives met. Each scenario lists `learningObjectives` (e.g. "shelter before a flare", "reduce non-essential load in a dust storm", "act without Earth guidance during blackout"). The debrief marks each met/missed with the event that proves it.

## Tone

Friendly, curious, never gory. Failure is "mission lost, here is what we learned", not a death screen.
