/** Scripted Mission Control (Vikram) and onboard assistant (Prithvi) text. Plain templates, max 140 chars for comms. */
export interface ScriptedMessage {
  id: string;
  from: 'vikram' | 'prithvi';
  /** Sim event explainKey that triggers this message. */
  trigger: string;
  text: string;
}

export const scriptedMessages: ScriptedMessage[] = [
  { id: 'v-welcome', from: 'vikram', trigger: 'mission-start', text: 'Asteria, welcome. Systems nominal. Read the black box before you roll the dice.' },
  { id: 'v-dust', from: 'vikram', trigger: 'dust-storm-start', text: 'Dust is rising near you. Consider cleaning panels before it gets worse.' },
  { id: 'v-battery', from: 'vikram', trigger: 'battery-low', text: 'Reserve is falling. Which loads can wait?' },
  { id: 'v-watch', from: 'vikram', trigger: 'flare-watch', text: 'Space-weather watch. Shelter should be powered. Your call, Commander.' },
  { id: 'v-shelter', from: 'vikram', trigger: 'shelter-power-lost', text: 'Please confirm shelter status.' },
  { id: 'v-blackout', from: 'vikram', trigger: 'comms-blackout', text: 'We lose contact for a while. You are on your own. See you on the other side.' },
  { id: 'v-done', from: 'vikram', trigger: 'mission-complete', text: 'Asteria, well done. Debrief when ready.' },
  { id: 'p-storm', from: 'prithvi', trigger: 'dust-storm-start', text: 'A dust storm blocks sunlight and coats the panels. Output will fall and may stay low for days.' },
  { id: 'p-battery', from: 'prithvi', trigger: 'battery-low', text: 'Reserve is below 40%. Anything you power now comes out of what you need later.' },
  { id: 'p-watch', from: 'prithvi', trigger: 'flare-watch', text: 'A solar flare sends radiation. A powered shelter cuts exposure a lot.' },
  { id: 'p-shelter', from: 'prithvi', trigger: 'shelter-power-lost', text: 'Shelter is unpowered. If a flare arrives now, the crew is unprotected.' },
  { id: 'p-delay', from: 'prithvi', trigger: 'flare-warning-delayed', text: "Earth's reply will take about {delayMin} minutes each way. Plan for what you can see now." },
  { id: 'p-eva', from: 'prithvi', trigger: 'eva-done', text: 'An EVA is a spacewalk. It can restore solar power but exposes the crew to risk.' },
  { id: 'p-comms-power', from: 'prithvi', trigger: 'comms-down-power', text: 'Comms needs about half of its power to hold the link to Earth. Give it more and the link comes back.' },
  { id: 'p-eva-warning', from: 'prithvi', trigger: 'eva-in-warning', text: 'The crew was outside during a radiation warning. The shelter cannot protect people who are not in it.' },
];

export const messagesForEvent = (explainKey: string) => scriptedMessages.filter((m) => m.trigger === explainKey);
