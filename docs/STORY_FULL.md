# Asteria: the complete story

This is the full narrative. `docs/STORY.md` is the short overview and stays the source for structure; this file holds everything that gets turned into content: the timeline, logs, evidence, messages, debrief text, and the lessons archive.

**Fiction rule.** Asteria, its crew and its failure are invented. Real NASA/JPL/ESA material is used only as (a) live world inputs (light-time, flares) and (b) the "Lessons Archive" of real missions, each with sources in `docs/CONTENT_FACTS.md`. The game must never say Asteria really happened.

**Tone.** Curious, calm, never gory. Nobody dies. Failure means "the habitat was lost, the crew came home, here is what we learned".

---

## 1. Setting

- **Mission:** Asteria, humanity's first long-duration Mars outpost (fictional).
- **Site:** Jezero Crater, on the ancient delta (real site, see `CONTENT_FACTS.md`: about 18°N, 77°E). Terrain type: mixed. Chosen because it has water-bearing minerals and a flat floor for panels.
- **Crew 1 (the failed crew):** three people.
  - **Commander Ananya Rao:** experienced, cautious, keeps meticulous logs.
  - **Dr. Kavya Nair:** life support and greenhouse.
  - **Arjun Mehta:** power and EVA systems.
- **Earth:** **Vikram Deshpande**, flight director at Mission Control.
- **Prithvi:** the onboard operations assistant. Explains, warns, never decides.
- **Light-time during the events:** about 18 minutes one way (a game value inside the real range of about 3 to 22 minutes; see `CONTENT_FACTS.md` and the Horizons fixtures). A question and its answer are therefore about 36 minutes apart.
- **Sol clock:** one turn is one sol. Crew 1's mission lasted 33 sols before evacuation. Crew 2 (the player) is asked to hold the outpost for 40.

## 2. What the player is told before playing

> Asteria's first crew came home early. The habitat did not.
> The official report says "unexpected environmental conditions."
> You have the black box. Find out what really happened, then take command and do better.

## 3. The truth: what happened to Crew 1

### 3.1 The cause chain (the debrief spine)

```text
E1  dust-storm-start        Regional dust storm begins near Jezero (sol 22)
E2  power-shortfall         Solar generation falls, panels also dusty (sol 23-25)
E3  battery-low             Battery reserve drains below 40% (sol 27)
E4  eva-postponed           Panel-cleaning EVA postponed twice (sol 26, sol 28)
E5  flare-warning-delayed   Earth sees a flare/CME watch; message takes ~18 min each way (sol 28-29)
E6  shelter-power-lost      Greenhouse kept at priority; shelter power drops below minimum (sol 31)
E7  radiation-spike         Flare and CME arrival; no powered shelter (sol 32)
E8  habitat-damage          Radiation damages electronics and the greenhouse controller (sol 32)
E9  evacuation              Crew reaches the ascent vehicle and leaves (sol 33)
```

Each event lists the earlier ones in `causedBy`. A reasonable decision at every step produced the failure. No one was careless.

### 3.2 Why each decision looked reasonable

| Decision | Who | Reason at the time |
|---|---|---|
| Keep greenhouse priority | Kavya Nair | The seed crop was at a stage that could not be restarted. Losing food production would end the long-duration mission. |
| Postpone cleaning EVA (sol 26) | Arjun Mehta, approved by Rao | Prithvi had flagged elevated winds. Going out in a storm risked the suit and the airlock. |
| Postpone cleaning EVA again (sol 28) | Rao | A flare watch had been issued; EVAs are not done during radiation warnings. |
| Delay powering the shelter | Rao | Battery reserve was falling, and the shelter drew power continuously even when empty. Cutting it looked like a safe saving. |
| Wait for Earth's confirmation | Rao | Standard procedure. The reply could not arrive in under ~36 minutes. |

The lesson: each choice protected one thing and weakened another. Mars missions fail through *connected* risks.

## 4. Black-box evidence

The black box holds telemetry (one frame per sol), a decision log, crew logs, Mission Control messages, and the final transmission. Telemetry values are **game values**, not mission data.

### 4.1 Telemetry (selected sols)

| Sol | Solar gen (kWh) | Panel dust (%) | Battery (%) | Shelter power | Dose (mSv, cumulative) | Notes |
|---|---|---|---|---|---|---|
| 20 | 300 | 8 | 78 | on | 12 | Normal |
| 22 | 270 | 10 | 74 | on | 13 | Dust opacity rising |
| 23 | 195 | 16 | 66 | on | 14 | Storm confirmed |
| 25 | 115 | 27 | 51 | on | 16 | Panels clogging |
| 27 | 80 | 34 | 38 | on | 18 | Battery below 40% |
| 29 | 70 | 38 | 27 | reduced | 19 | Shelter on minimum load |
| 31 | 65 | 40 | 19 | **off** | 20 | Shelter power cut |
| 32 | 90 | 40 | 15 | off | 31 | Radiation event |
| 33 | n/a | n/a | n/a | off | n/a | Evacuation |

### 4.2 Decision log

| Sol | Decision | Logged by |
|---|---|---|
| 22 | Reduce non-essential loads 10% | Rao |
| 24 | Greenhouse stays at priority; seedlings in critical stage | Nair |
| 26 | Panel-cleaning EVA postponed: winds above suit limit | Mehta / Rao |
| 27 | Battery reserve floor lowered from 40% to 25% | Rao |
| 28 | Cleaning EVA postponed again: flare watch | Rao |
| 29 | Shelter moved to minimum load (empty-shelter saving) | Mehta |
| 30 | Message sent to Earth requesting load guidance | Rao |
| 31 | Shelter load cut to zero to protect greenhouse and life support | Rao |
| 32 | "Please confirm" transmission, last message | Rao |

### 4.3 Evidence board items

`relevant: true` items are part of the true chain. The rest are distractors.

| Id | Evidence | Relevant | Why |
|---|---|---|---|
| ev-dust | Dust opacity rises from sol 20, storm confirmed sol 23 | yes | Start of the chain |
| ev-gen | Solar generation falls from 300 to 65 kWh | yes | Cause of the power problem |
| ev-battery | Battery drops below 40% on sol 27 | yes | Squeezed every decision after |
| ev-eva | Cleaning EVA postponed on sols 26 and 28 | yes | Panels stayed dusty |
| ev-warning | Flare watch seen on Earth; guidance takes ~36 min round trip | yes | Delay removed the chance to confirm |
| ev-shelter | Shelter power cut on sol 31 | yes | Left the crew unprotected |
| ev-dose | Dose jumps on sol 32 | yes | The damaging event |
| ev-greenhouse-fault | Greenhouse humidity sensor glitch on sol 24 | no | Minor, fixed in an hour |
| ev-comms-glitch | One dropped telemetry packet on sol 21 | no | Normal; retransmitted |
| ev-water-low | Water at 71% on sol 30 | no | Low-looking but within plan |
| ev-unit | Battery shown in kWh while log shows % | no | Display difference, not an error |
| ev-wind | Wind gusts above suit limit on sol 26 | partly | Explains the first EVA delay but did not cause the loss |

**Root cause chain to submit (ordered):** `ev-dust` → `ev-gen` → `ev-battery` → `ev-eva` → `ev-warning` → `ev-shelter` → `ev-dose`.
Scoring: full credit for the correct order. Partial credit for the right set in the wrong order. Distractors cost nothing but are explained at reveal.

### 4.4 Final transmission (exact text, from `STORY.md`)

> "Mission Control, we are seeing another power drop. Radiation shelter is offline. We still have greenhouse priority. Please confirm—"

Transmission ends. Prithvi adds, in the log: *"Signal sent, sol 32. Earth received the message about 18 minutes later. By then the crew was already moving to the ascent vehicle."*

### 4.5 Crew logs (short, in-world)

**Rao, sol 27:**
"Battery is lower than I like. Arjun wants to clean the panels. Wind is above suit limits and I will not send anyone out in that. We wait one more sol."

**Nair, sol 24:**
"The seedlings are at the stage where one missed watering cycle ends the crop. If we lose the greenhouse we lose the reason we are here. Keeping it at priority."

**Mehta, sol 28:**
"Flare watch from Earth. No EVAs. I hate this. The panels are the whole problem and I cannot touch them."

**Mehta, sol 29:**
"Shelter draws power even with nobody inside. Moving it to minimum saves about a day of reserve. It is a calculated risk. I think."

**Rao, sol 31:**
"I asked Vikram for guidance on loads. Round trip is about thirty-six minutes. I cannot sit on a power cliff for thirty-six minutes. Cutting the shelter load to zero and watching the sky."

## 5. Mission Control messages (Vikram)

All Earth messages use the same format as future multiplayer messages: `{ id, fromRole: 'MISSION_CONTROL', fromName: 'Vikram', body (max 140 chars), sentAt, deliverAt }`. `deliverAt = sentAt + lightTime * COMMS_TIME_SCALE`.

### 5.1 In the black box (Crew 1 timeline)

| Sent (sol) | Received (sol) | Text (max 140 chars) |
|---|---|---|
| 26 | 26 | Dust storm confirmed regional. Expect lower output for days. Watch battery floor. |
| 28 | 28 | Flare watch issued. CME possible in 3-4 sols. No EVAs. Shelter ready. |
| 29 | 29 | Do not cut shelter power. Repeat: keep shelter powered. Acknowledge. |
| 30 | 30 | Reply to your load request: shed greenhouse lighting first. Confirm. |

Note the timing problem: Vikram's "keep shelter powered" (sent when Earth saw the risk) lands *after* the crew had already moved the shelter to minimum load. This is the delay lesson, shown without blaming anyone.

### 5.2 Scripted guidance for Crew 2 (the player), by situation

| Trigger | Text | Delay behaviour |
|---|---|---|
| Sol 1 start | Asteria, welcome. Systems nominal. Read Crew 1's black box before you roll the dice. | delayed by light-time |
| Dust opacity > 40% | Dust is rising near you. Consider cleaning panels before it gets worse. | delayed |
| Battery < 50% and dust active | Reserve is falling. Which loads can wait? | delayed |
| Flare or CME watch | Space-weather watch. Shelter should be powered. Your call, Commander. | delayed |
| Solar conjunction begins | We lose contact for about two weeks. You are on your own. See you on the other side. | not delivered until blackout ends |
| Player skips shelter during a watch | Please confirm shelter status. | delayed |
| Run complete | Asteria, well done. Debrief when ready. | delayed |

Vikram's messages are guidance, never orders. The player may ignore any of them.

## 6. Prithvi (onboard assistant)

Prithvi explains and warns. It does not choose for the player. Style: clear, friendly, short, plain words, no jargon without a one-line explanation.

| Situation | Prithvi says |
|---|---|
| First EVA decision | An EVA is a spacewalk outside the habitat. It can restore solar power but exposes the crew to risk. |
| Dust storm begins | A dust storm blocks sunlight and coats the panels. Output will fall and may stay low for days. |
| Battery below 40% | Reserve is below 40%. Anything you power now comes out of what you need later. |
| Flare watch | A solar flare sends radiation. A powered shelter cuts exposure a lot. |
| Shelter off during watch | Shelter is unpowered. If a flare arrives now, the crew is unprotected. |
| Light-time notice | Earth's reply will take about [N] minutes each way. Plan for what you can see now. |
| Conjunction | The Sun is between Earth and Mars. No messages either way for about two weeks. |
| Greenhouse vs shelter | Both need power. Food is slow to matter; radiation is fast. |

Prithvi's text is templated first. An LLM may rephrase it later but may never add facts (see `docs/ARCHITECTURE.md`).

## 7. Game structure: how the story plays

### Phase 1: Investigate (the black box)
- The player sees the telemetry table, decision log, crew logs and Earth messages.
- They tag evidence and submit an ordered cause chain (section 4.3).
- Reveal: compare to the true chain, explain each distractor, show the delay timeline from 5.1.

### Phase 2: Reconstruct
- The sim loads `asteria-failed-run` (scripted dust storm sols 22 to 33, scripted flare on sol 32) and starts at sol 20.
- The player replays Crew 1's last sols and tries to avoid the evacuation.
- If they succeed: "You kept enough options alive." If they fail: the debrief shows the same chain.

### Phase 3: Command
- Start Crew 2's mission at Jezero. Free play, 40 sols.
- Conditions begin calm and become eventful. Early sols teach each system.

### Phase 4: Crisis
- A hazard window opens (storm, flare/CME, conjunction, or several).
- The player cannot wait for Earth: guidance arrives late or not at all.

### Phase 5: Debrief
- Outcome, key events, the cause chain, which warnings were available, how delay mattered, learning objectives.

## 8. Debrief text (keyed by `explainKey`)

Each key maps to one short paragraph used by the template debrief. Variables in `{braces}`.

| explainKey | Text |
|---|---|
| `dust-storm-start` | A dust storm began on sol {sol}. It blocks sunlight and coats the solar panels, so power generation fell. |
| `power-shortfall` | Power demand was higher than generation on sol {sol}. Something had to be reduced. |
| `load-shed` | You reduced non-essential loads before the shortfall got worse. That kept more reserve for later. |
| `battery-low` | The battery fell below {pct}% on sol {sol}. From here, every power choice cost something you might need later. |
| `eva-postponed` | The panel-cleaning EVA was postponed on sol {sol}. Dusty panels kept generation low. |
| `eva-done` | You cleaned the panels on sol {sol}. Generation recovered but the crew took on EVA risk. |
| `flare-watch` | A flare/CME watch was in effect on sol {sol}. Earth learned about it {delay} minutes before you could answer. |
| `flare-warning-delayed` | The message about the watch took about {delay} minutes to arrive, and your reply would take as long. |
| `shelter-power-lost` | Shelter power was cut on sol {sol}. The crew had no powered protection if a flare arrived. |
| `sheltered` | You sheltered during the radiation event. The dose you took was much lower than it could have been. |
| `radiation-spike` | A radiation event hit on sol {sol}. Dose rose by {msv} mSv. |
| `habitat-damage` | Without a powered shelter, the radiation damaged habitat systems on sol {sol}. |
| `evacuation` | The crew left for the ascent vehicle on sol {sol}. The mission ended early, but everyone came home. |
| `blackout-autonomy` | During the communications blackout you kept the outpost safe without any guidance from Earth. |
| `food-shortage` | Food stock ran short on sol {sol} because power went elsewhere. |
| `mission-complete` | You held Asteria for {sols} sols. |

Closing line shown on every debrief (from `STORY.md`):
> Asteria is not about finding the perfect decision. It is about keeping enough options alive to survive the next decision window.

## 9. Learning objectives

| Id | Text | Proven by (event type + explainKey) |
|---|---|---|
| `shelter-before-flare` | Shelter or keep shelter powered before a solar flare arrives | `radiation-spike` + `sheltered` |
| `cut-load-in-storm` | Reduce non-essential power use during a dust storm | `power-shortfall` + `load-shed` |
| `clean-panels-early` | Clean panels before the battery reaches a critical level | `eva-done` + `eva-done` |
| `act-without-earth` | Make safe decisions during a communications blackout | `blackout-autonomy` + `blackout-autonomy` |
| `read-delay` | Account for Earth's delayed warnings when planning | `flare-warning-delayed` + `flare-warning-delayed` (missed when player waits for confirmation) |

## 10. Lessons Archive (real missions, optional extra unlockables)

Short, factual cards shown after the Asteria debrief. Every claim and source is in `docs/CONTENT_FACTS.md`; use only claims marked verified there. Keep the hedging.

| Card | One-line lesson | Where the facts come from |
|---|---|---|
| **Opportunity and the 2018 storm** | A planet-encircling dust storm blocked sunlight and ended the solar-powered rover's mission: last contact 10 June 2018, mission declared over 13 February 2019. | NASA mission-end page, `CONTENT_FACTS.md` |
| **Mars Climate Orbiter (1999)** | The investigation board found a ground software file produced thruster data in English units instead of metric. Small errors added up over months. | MCO Mishap Investigation Board report |
| **Mars Polar Lander (1999)** | The most probable cause (not proven) was a false touchdown signal when the legs deployed, shutting the engines down early. The lander sent no data at the end. | Young and JPL review boards; always say "most probable" |
| **Schiaparelli (2016)** | A brief sensor overload led the software to misjudge its position, so the descent ended too early. ESA's inquiry listed several causes. | ESA inquiry, May 2017 |

Never print a number from a card marked Secondary in `CONTENT_FACTS.md` until it has been confirmed in the primary report.

## 11. Narrative and sim mapping (for engineers)

| Story | Sim event type | explainKey | Notes |
|---|---|---|---|
| Dust storm begins | `dust-storm-start` | `dust-storm-start` | scripted for scenarios, seeded random in free play |
| Generation falls | `power-shortfall` | `power-shortfall` | emitted when demand exceeds supply |
| Load shed | `power-shortfall` | `load-shed` | emitted when the player cut loads in time |
| Battery under 40% | `battery-low` | `battery-low` | threshold in balance config |
| Cleaning EVA postponed | `eva-postponed` | `eva-postponed` | when conditions blocked EVA and the player did not go |
| Cleaning EVA done | `eva-done` | `eva-done` | restores panel dust |
| Flare/CME watch | `flare-watch` | `flare-watch` | one or more sols before arrival |
| Delayed warning | `flare-warning-delayed` | `flare-warning-delayed` | when light-time made reply impossible before arrival |
| Shelter unpowered | `shelter-power-lost` | `shelter-power-lost` | shelter allocation below minimum |
| Radiation event | `radiation-spike` | `radiation-spike` or `sheltered` | depends on shelter power and decisions |
| Habitat damaged | `habitat-damage` | `habitat-damage` | spike while unsheltered above threshold |
| Evacuation | `evacuation` | `evacuation` | run status `failed` |
| Blackout survived | `blackout-autonomy` | `blackout-autonomy` | conjunction with no crew loss |
| Run complete | `mission-complete` | `mission-complete` | run status `completed` |

## 12. Open questions for the team

- Crew 2: do they get names, or stay "you, Commander"? (Default: unnamed Commander plus the Crew 1 characters as the "previous crew".)
- Should Prithvi use an LLM from day one, or stay templated until the core loop works? (Default: templated.)
- Does the black-box investigation have a time limit? (Default: none; it is a learning screen.)
