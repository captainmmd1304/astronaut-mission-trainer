# Asteria — Story and Narrative Design

## Overview

There is only one mission: **Asteria**.

Asteria is humanity's first long-duration Mars outpost. Its purpose is to prove that a small crew can survive, maintain equipment, grow food, and make decisions without immediate help from Earth.

The player takes command after the previous Asteria crew was forced to abandon the habitat.

The central question is:

> Can you complete the Asteria mission without repeating the decisions that caused the first failure?

This story is fictional. NASA and JPL data are used as external world inputs, not as claims that the fictional Asteria mission actually occurred.

## The opening mystery

The game begins with a damaged Asteria black box.

The final message is from Commander Ananya Rao:

> “Mission Control, we are seeing another power drop. Radiation shelter is offline. We still have greenhouse priority. Please confirm—”

The transmission ends.

The crew survived by reaching the emergency ascent vehicle, but the Asteria habitat was left damaged and unusable. The official report blamed “unexpected environmental conditions.”

The player investigates the evidence and discovers that the failure was caused by a chain of reasonable decisions:

```text
Dust storm
→ reduced solar generation
→ battery reserves declined
→ panel-cleaning EVA was postponed
→ shelter power became unavailable
→ radiation event damaged the habitat
→ emergency evacuation
```

No single crew member was careless. The lesson is that Mars missions fail through connected risks.

## Main characters

### Commander Ananya Rao

The previous Asteria commander. Her logs and decisions form the black-box investigation.

She was experienced and cautious, making the investigation about systems and trade-offs rather than blaming one person.

### Dr. Kavya Nair

Life-support and greenhouse specialist.

Her logs explain why the crew prioritized greenhouse power: losing food production would make the mission unsustainable over the long term.

### Arjun Mehta

Power and EVA systems engineer.

His notes explain why the crew postponed panel cleaning: the EVA itself was dangerous during the radiation warning.

### Vikram Deshpande

Mission Control flight director on Earth.

He sends guidance to the crew, but messages are delayed by Earth–Mars light-time.

### Prithvi

The onboard operations assistant.

Prithvi explains technical terms, displays warnings, and helps the player understand the consequences of decisions. It does not make decisions for the player.

## Single-player structure

The initial game is entirely single-player.

The player controls the Asteria outpost and receives support from Prithvi and Vikram through delayed messages.

### Phase 1: Investigate

The player reviews:

- Telemetry
- Power history
- Radiation readings
- Dust accumulation
- Crew decisions
- Delayed Mission Control messages
- The final transmission

The player identifies the likely chain of failure.

### Phase 2: Reconstruct

The player replays the failed section of the Asteria mission and changes the decisions.

This teaches that the purpose of the investigation is learning, not assigning blame.

### Phase 3: Command

The player takes command of Asteria and manages the outpost across multiple sols.

Each sol requires decisions about:

- Power allocation
- Life support
- Food production
- Radiation protection
- Communications
- EVA activity
- Construction projects
- Battery reserves

### Phase 4: Crisis

A major hazard arrives:

- Solar flare
- CME
- Dust storm
- Solar conjunction
- Or several hazards close together

The player cannot wait for Earth to answer. They must act using the information currently available.

### Phase 5: Debrief

The final report explains:

- What happened
- Which decisions mattered
- Which warnings were available
- How much delayed information affected the mission
- Which learning objectives were achieved

## Single-player now, multiplayer-ready later

The first version should remain single-player. It should not require rooms, multiplayer UI, or server-authoritative gameplay before the core mission loop is complete.

The design should nevertheless preserve the concepts needed for future multiplayer:

- `OUTPOST` role
- `MISSION_CONTROL` role
- Separate player decisions from mission state
- Delayed communications through `DelayedQueue`
- Telemetry snapshots
- Socket event contracts
- A clear distinction between current Mars state and delayed Earth state

### Single-player roles

```text
Player = OUTPOST commander
Prithvi = onboard assistant
Vikram = scripted Mission Control
```

### Future multiplayer roles

```text
Player 1 = OUTPOST commander
Players 2–3 = OUTPOST crew
Player 4 = MISSION_CONTROL
```

The same mission, events, delays, and `WorldSnapshot` data should be reused. Only the source of decisions changes from scripted NPC behavior to another human player.

## Narrative and technical integration

The story should connect directly to the simulation:

| Story element | Game system |
|---|---|
| Dust storm | Reduced solar generation and increased panel dust |
| Solar flare or CME | Radiation event and shelter decision |
| Delayed Earth guidance | `DelayedQueue` and light-time |
| Solar conjunction | Communication blackout |
| Greenhouse priority | Food production versus emergency power |
| Panel-cleaning EVA | EVA risk versus restored generation |
| Black-box investigation | Telemetry, decisions, and cause-linked events |
| Final debrief | Event `causedBy` chain and learning objectives |

The single-player Mission Control should use the same message format as future multiplayer communications, even if the messages are generated by scripted logic.

In the first version:

```text
NPC guidance → delayed queue → player
```

In a future multiplayer version:

```text
Mission Control player → delayed queue → outpost player
```

## Core theme

> Asteria is not about finding the perfect decision. It is about keeping enough options alive to survive the next decision window.

