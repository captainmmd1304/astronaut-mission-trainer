import { ScenarioSchema, type Scenario } from '../schema';

const raw: Scenario[] = [
  {
    id: 'free-play-30',
    kind: 'free-play',
    title: 'Establish the Outpost (30 sols)',
    summary: 'Keep your crew alive for 30 sols. Conditions come from the live universe.',
    durationSols: 30,
    scriptedEvents: [],
    learningObjectives: [
      {
        id: 'shelter-before-flare',
        text: 'Shelter or shield before a solar flare arrives',
        provenBy: { eventType: 'radiation-spike', explainKey: 'sheltered' },
      },
    ],
    fictional: true,
    sources: [],
  },
  {
    // HISTORICAL: facts verified against NASA on 2026-11-03 (see docs/CONTENT_FACTS.md). Balance numbers are still placeholders.
    id: 'dust-storm-2018',
    kind: 'historical',
    title: 'The Great Dust Storm (inspired by 2018)',
    summary: 'A planet-encircling dust storm cuts solar power. Can you keep the outpost alive when the sky goes dark?',
    durationSols: 40,
    scriptedEvents: [{ sol: 8, type: 'dust-storm', magnitude: 0.9, durationSols: 20 }], // TODO(balance): timing and size are game abstractions; facts verified in docs/CONTENT_FACTS.md
    learningObjectives: [
      {
        id: 'cut-load-in-storm',
        text: 'Reduce non-essential power use during a dust storm',
        provenBy: { eventType: 'power-shortfall', explainKey: 'load-shed' },
      },
    ],
    fictional: false,
    sources: ['https://science.nasa.gov/missions/mer/nasas-opportunity-rover-mission-on-mars-comes-to-end'],
  },
  {
    // FICTIONAL: Asteria Crew 1's last sols, replayed. See docs/STORY_FULL.md.
    id: 'asteria-refly',
    kind: 'historical',
    title: 'Asteria: re-fly the last sols',
    summary: "Take over where Crew 1 lost control. A dust storm drains power, then a flare arrives. Keep the options alive.",
    durationSols: 20,
    scriptedEvents: [
      { sol: 2, type: 'dust-storm', magnitude: 0.9, durationSols: 14 },
      { sol: 12, type: 'solar-flare', magnitude: 0.85 },
    ],
    learningObjectives: [
      { id: 'shelter-before-flare', text: 'Keep the shelter powered before a solar flare arrives', provenBy: { eventType: 'radiation-spike', explainKey: 'sheltered' } },
      { id: 'cut-load-in-storm', text: 'Reduce non-essential power use during a dust storm', provenBy: { eventType: 'power-shortfall', explainKey: 'load-shed' } },
      { id: 'clean-panels-early', text: 'Clean panels before the battery reaches a critical level', provenBy: { eventType: 'eva-done', explainKey: 'eva-done' } },
    ],
    fictional: true,
    sources: [],
  },
];

export const scenarios: Scenario[] = raw.map((s) => ScenarioSchema.parse(s));
export const getScenario = (id: string) => scenarios.find((s) => s.id === id);
