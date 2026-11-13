/** Template debrief text keyed by SimEvent.explainKey. Used as the fallback when the LLM is unavailable. */
export const debriefTemplates: Record<string, string> = {
  'dust-storm-start': 'A dust storm began on sol {sol}. It blocks sunlight and coats the solar panels, so power generation fell.',
  'power-shortfall': 'Power demand was higher than generation on sol {sol}. Something had to be reduced.',
  'load-shed': 'You reduced non-essential loads before the shortfall got worse. That kept more reserve for later.',
  'battery-low': 'The battery fell below {pct}% on sol {sol}. From here, every power choice cost something you might need later.',
  'eva-postponed': 'The panel-cleaning EVA was postponed on sol {sol}. Dusty panels kept generation low.',
  'eva-done': 'You cleaned the panels on sol {sol}. Generation recovered, but the crew took on EVA risk.',
  'eva-in-warning': 'The crew was outside during a radiation warning on sol {sol}, so the shelter could not protect them.',
  'flare-watch': 'A flare or CME watch was in effect on sol {sol}. A reply from Earth would take about {delayMin} minutes each way.',
  'flare-warning-delayed': 'You were out of contact when the watch was issued, so the warning came about {delayMin} minutes late.',
  'cme-arrival': 'A coronal mass ejection reached the outpost on sol {sol}.',
  'shelter-power-lost': 'Shelter power was too low on sol {sol}. The crew had no powered protection if a flare arrived.',
  sheltered: 'You sheltered during the radiation event on sol {sol}. The dose was {msv} mSv, much lower than the {rawMsv} mSv it could have been.',
  'radiation-spike': 'A radiation event hit on sol {sol}. Dose rose by {msv} mSv.',
  'habitat-damage': 'Without a powered shelter, radiation damaged habitat systems on sol {sol}.',
  'equipment-fault': 'An equipment fault cut your power generation on sol {sol}.',
  'comms-blackout': 'Communications with Earth were lost on sol {sol}.',
  'comms-down-power': 'The link to Earth dropped on sol {sol} because comms had too little power.',
  'comms-down': 'The link to Earth dropped on sol {sol}. Nothing can be sent or received until it is back.',
  'blackout-autonomy': 'During the communications blackout you kept the outpost safe without guidance from Earth.',
  'food-shortage': 'Food stock ran short on sol {sol} because power went elsewhere.',
  'project-complete': 'Success: {project} finished on sol {sol}; the upgrade is now helping the outpost.',
  evacuation: 'The crew left for the ascent vehicle on sol {sol}. The mission ended early, but everyone came home.',
  'mission-complete': 'You held Asteria for {sols} sols.',
};

export const debriefClosingLine =
  'Asteria is not about finding the perfect decision. It is about keeping enough options alive to survive the next decision window.';

export function renderDebriefLine(explainKey: string, vars: Record<string, string | number | boolean | undefined>): string {
  let t = debriefTemplates[explainKey] ?? 'Evidence is unavailable for one event on sol {sol}.';
  if (explainKey === 'project-complete') {
    const project = String(vars.project ?? 'The project');
    const variants: Record<string, string> = {
      'shielding-upgrade': 'Success: thicker shielding finished on sol {sol}; it lowers future radiation dose. The trade-off was time and power during construction.',
      'greenhouse-expansion': 'Partial success: the greenhouse expansion finished on sol {sol}; it can grow more food, but only when it receives power.',
      'panel-cleaning': 'Success: panel brushes finished on sol {sol}; they cleared dust without sending anyone outside.',
      'battery-bank': 'Success: the battery bank finished on sol {sol}; it stores more energy for a later storm.',
    };
    t = variants[project] ?? 'Evidence is unavailable for the project finished on sol {sol}.';
  }
  return t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? '?'));
}
