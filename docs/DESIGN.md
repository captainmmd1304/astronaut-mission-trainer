# Design: how Asteria looks and feels

Read this before touching `apps/web`. It is the visual contract. If a change makes the UI look like a generic sci-fi dashboard, it is wrong, even if it works.

## The idea in one line

You are looking out of a small outpost at a real sky. The sky is the interface's mood: it changes with the simulation (dust storm, clear night, flare watch), and the instruments sit quietly at the edges.

## What we took from the reference photos

- Light and haze do the work. An amber dust-out sky, deep rust shadows, a black star sky over a red horizon.
- The view is framed from inside: dark rock closes in on both sides and the world is an irregular opening. That opening is our viewport.
- Nothing is neon. Warmth comes from sunlight on rock, not glow effects.

## Rejected on purpose

| Default | Why we skip it |
|---|---|
| Cyan glowing panels, glassmorphism | The generic AI sci-fi look the team asked to avoid |
| Three big "tactical cards" for decisions | Our turn is a power split, EVA, shelter and a project. Cards would hide the tradeoffs |
| ALL CAPS tracked labels above everything | Template chrome. Labels are sentence case and only exist when they carry information |
| Monospace for every number | We use a condensed grotesque with tabular figures instead |
| Identical rounded cards with soft shadows | Panels differ by role. Most things are rules and spacing, not boxes |
| Fade-and-slide entrances everywhere | One orchestrated moment per screen. Motion otherwise answers a click |
| Cream paper + terracotta serif look | The dossier is paper, but dull grey-brown archive paper, not a style choice |

## Palette

Defined once as CSS variables in `apps/web/src/app/globals.css`. Use the names, not raw hex.

| Name | Hex | Use |
|---|---|---|
| night | `#150C09` | Page and viewport shadow. A brown-black, never pure black |
| basalt | `#2B1A13` | Foreground rock silhouettes, panel floors |
| rust | `#8E3F22` | Terrain shade, rules, inactive gauge segments |
| ember | `#D9732B` | Light on rock. Primary accent, active controls |
| haze | `#EBB57C` | Dust-sky horizon, warm highlights |
| bone | `#F0E4D2` | Text on dark, dossier paper highlight |
| starlight | `#BCD0E6` | The only cool colour. Telemetry values and the Earth link |
| caution | `#F2B544` | Warnings |
| critical | `#E5483A` | Failures |
| safe | `#93AB7C` | Used only when something is actually safe |

State is never colour alone: warnings also change wording or shape (a mark beside the number).

## Type

- **Newsreader** (variable serif, optical size): narrative text, headings, the dossier, debrief prose. Line height 1.5, up to about 68 characters per line.
- **Archivo** (variable, uses the width axis): all instruments, numbers, sol labels, buttons. Condensed (`wdth` about 80) for readouts, normal width for buttons. Tabular figures on, so numbers do not jitter as they change.
- Sentence case everywhere. No tracked caps. No middle-dot strings. No arrows in button text.
- Type scale: 13 / 15 / 18 / 24 / 36 / 64. Big sizes are used rarely: the sol number and the headline on the landing screen.

## The memorable thing

The viewport. A full-bleed sky and terrain seen through a rock-framed opening, with haze, star density and horizon colour computed from the sim (`game/atmosphere.ts`). Everything else is deliberately quiet.

## Layout

Play screen (desktop first, then stacked on narrow screens):

```
+--------------------------------------------------------------+
| Asteria   Jezero Crater   Sol 14 of 20          Earth link   |
| rock |                                         | rock        |
| sol  |        sky + terrain seen through       | Power       |
| rail |        the opening (3D + CSS sky)       |  bus bars   |
|      |                                         | Battery     |
| 12   |                                         | Air, water  |
| 13   |                                         | Food, dose  |
| 14 * |                                         |             |
| 15   |                                         | Today       |
|      |-----------------------------------------| shelter     |
|      | log: Prithvi, Vikram, events            | EVA, project|
+------+-----------------------------------------+-------------+
```

- Left rail: sols as a vertical scale with ticks. Done, current and danger are shown by mark and tint, not boxes.
- Right column: instruments grouped by rules and spacing, not cards. Allocation is five vertical bars you drag.
- Bottom: the log is a plain ruled list with a time column. Earth messages in transit show a small countdown.
- Alignment: left-aligned text throughout. Numbers right-aligned in columns.

## Screens

1. **Landing:** the sky alone, one sentence, one action. No hero stat row.
2. **Mission select:** sites as a list that changes the sky behind it. The scenario and difficulty beside it.
3. **Black box:** a paper dossier on a dark desk. Typed logs, a telemetry table, evidence slips you pin and order. Archive paper is grey-tan with faint stains, not cream.
4. **Sol console:** the play screen above.
5. **Debrief:** a flight report. The cause chain is a drawn timeline. Learning objectives are met or missed with the event that proves each. "Try again from Sol N" is a first-class action.

## Atmosphere rules (`game/atmosphere.ts`)

Input is `SimState`. Output is sky colours, fog density and star visibility.

- Dust opacity (storm magnitude plus panel coverage) raises fog and warms the sky toward haze. At high opacity the horizon disappears.
- Clear sols show stars and a red horizon. Visibility changes slowly between sols, never flickers.
- A flare watch adds a thin cold tint at the top of the sky. The flare itself is a short bright wash, never strobing.
- `prefers-reduced-motion`: no camera drift, no particles, transitions between sols are instant.

## Copy

- Plain verbs. "Clean the panels" and "Send the crew out", not "Initiate EVA".
- Prithvi explains in one or two sentences. Vikram's messages are guidance and may be late.
- Failure is calm: "The habitat was lost. Here is what led to it."
- Numbers are labelled "game values" on first view, so nobody mistakes them for NASA data.

## Engineering rules for the web app

- Never import values from `@amt/content` in `apps/web` (the black-box answer key is in that package). Types only. Get content from the API.
- The sim runs in the browser (`@amt/sim`). The server replays it on finish.
- 3D loads only on `/play` and the mission select, through `next/dynamic` with `ssr: false`. If WebGL fails, the CSS sky still renders.
- No state updates in `useFrame`. Drive uniforms and refs.
- Keep the quality floor: keyboard focus visible, text contrast checked, works down to a phone width, reduced motion respected.
