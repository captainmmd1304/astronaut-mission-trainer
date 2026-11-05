import { BlackBoxCaseSchema, type BlackBoxCase } from '../schema';

/**
 * Case 001: Asteria (FICTIONAL). Full narrative in docs/STORY_FULL.md.
 * Telemetry values are game values, not mission data.
 */
const raw: BlackBoxCase[] = [
  {
    id: 'asteria-001',
    title: 'Asteria: the first crew comes home early',
    fictional: true,
    briefing:
      "Asteria's first crew came home early. The habitat did not. The official report says 'unexpected environmental conditions.' You have the black box. Find out what really happened, then take command and do better.",
    telemetry: [
      { sol: 20, values: { solarKwh: 300, panelDustPct: 8, batteryPct: 78, shelterPowered: 1, doseMsv: 12 } },
      { sol: 22, values: { solarKwh: 270, panelDustPct: 10, batteryPct: 74, shelterPowered: 1, doseMsv: 13 } },
      { sol: 23, values: { solarKwh: 195, panelDustPct: 16, batteryPct: 66, shelterPowered: 1, doseMsv: 14 } },
      { sol: 25, values: { solarKwh: 115, panelDustPct: 27, batteryPct: 51, shelterPowered: 1, doseMsv: 16 } },
      { sol: 27, values: { solarKwh: 80, panelDustPct: 34, batteryPct: 38, shelterPowered: 1, doseMsv: 18 } },
      { sol: 29, values: { solarKwh: 70, panelDustPct: 38, batteryPct: 27, shelterPowered: 0.5, doseMsv: 19 } },
      { sol: 31, values: { solarKwh: 65, panelDustPct: 40, batteryPct: 19, shelterPowered: 0, doseMsv: 20 } },
      { sol: 32, values: { solarKwh: 90, panelDustPct: 40, batteryPct: 15, shelterPowered: 0, doseMsv: 31 } },
    ],
    decisionLog: [
      { sol: 22, text: 'Reduce non-essential loads 10%. (Rao)' },
      { sol: 24, text: 'Greenhouse stays at priority; seedlings in a critical stage. (Nair)' },
      { sol: 26, text: 'Panel-cleaning EVA postponed: winds above suit limit. (Mehta / Rao)' },
      { sol: 27, text: 'Battery reserve floor lowered from 40% to 25%. (Rao)' },
      { sol: 28, text: 'Cleaning EVA postponed again: flare watch in effect. (Rao)' },
      { sol: 29, text: 'Shelter moved to minimum load to save power while empty. (Mehta)' },
      { sol: 30, text: 'Message sent to Earth requesting load guidance. (Rao)' },
      { sol: 31, text: 'Shelter load cut to zero to protect greenhouse and life support. (Rao)' },
      { sol: 32, text: "Final transmission: 'Please confirm.' (Rao)" },
    ],
    evidence: [
      { id: 'ev-dust', text: 'Dust opacity rises from sol 20; storm confirmed on sol 23.', relevant: true },
      { id: 'ev-gen', text: 'Solar generation falls from 300 to 65 kWh.', relevant: true },
      { id: 'ev-battery', text: 'Battery drops below 40% on sol 27.', relevant: true },
      { id: 'ev-eva', text: 'Panel-cleaning EVA postponed on sols 26 and 28.', relevant: true },
      { id: 'ev-warning', text: 'Flare watch seen on Earth; guidance takes about 36 minutes round trip.', relevant: true },
      { id: 'ev-shelter', text: 'Shelter power cut on sol 31.', relevant: true },
      { id: 'ev-dose', text: 'Dose jumps on sol 32.', relevant: true },
      { id: 'ev-greenhouse-fault', text: 'Greenhouse humidity sensor glitch on sol 24 (fixed within an hour).', relevant: false },
      { id: 'ev-comms-glitch', text: 'One dropped telemetry packet on sol 21 (retransmitted).', relevant: false },
      { id: 'ev-water-low', text: 'Water at 71% on sol 30, within plan.', relevant: false },
      { id: 'ev-unit', text: 'Battery shown in kWh in one panel and % in another (display difference).', relevant: false },
      { id: 'ev-wind', text: 'Wind gusts above suit limit on sol 26. Explains the first EVA delay but did not cause the loss.', relevant: false },
    ],
    rootCauseChain: ['ev-dust', 'ev-gen', 'ev-battery', 'ev-eva', 'ev-warning', 'ev-shelter', 'ev-dose'],
    reflyScenarioId: 'asteria-refly',
    sources: [],
  },
];

export const blackBoxCases: BlackBoxCase[] = raw.map((c) => BlackBoxCaseSchema.parse(c));
export const getBlackBoxCase = (id: string) => blackBoxCases.find((c) => c.id === id);

/** Score an ordered answer: 1 for exact order, partial for the right set, 0 otherwise. */
export function scoreChain(caseFile: BlackBoxCase, submitted: string[]): { score: number; exact: boolean; correctSet: number } {
  const truth = caseFile.rootCauseChain;
  const exact = submitted.length === truth.length && submitted.every((id, i) => id === truth[i]);
  const hits = submitted.filter((id) => truth.includes(id));
  const correctSet = new Set(hits).size;
  const inPosition = submitted.filter((id, i) => truth[i] === id).length;
  const score = exact ? 1 : Math.round(((correctSet / truth.length) * 0.5 + (inPosition / truth.length) * 0.5) * 100) / 100;
  return { score: Math.max(0, score - (submitted.length - hits.length) * 0.05), exact, correctSet };
}
