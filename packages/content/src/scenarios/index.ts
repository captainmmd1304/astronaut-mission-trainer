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
    // HISTORICAL: replace placeholders after fact-checking against NASA sources.
    id: 'dust-storm-2018',
    kind: 'historical',
    title: 'The Great Dust Storm (inspired by 2018)',
    summary: 'A planet-encircling dust storm cuts solar power. Can you keep the outpost alive when the sky goes dark?',
    durationSols: 40,
    scriptedEvents: [{ sol: 8, type: 'dust-storm', magnitude: 0.9, durationSols: 20 }], // TODO(balance + facts)
    learningObjectives: [
      {
        id: 'cut-load-in-storm',
        text: 'Reduce non-essential power use during a dust storm',
        provenBy: { eventType: 'power-shortfall', explainKey: 'load-shed' },
      },
    ],
    fictional: false,
    sources: ['https://science.nasa.gov/mars/'], // TODO: replace with the specific NASA page on the 2018 global dust storm / Opportunity
  },
];

export const scenarios: Scenario[] = raw.map((s) => ScenarioSchema.parse(s));
export const getScenario = (id: string) => scenarios.find((s) => s.id === id);
