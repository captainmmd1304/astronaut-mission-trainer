// PLACEHOLDER (no code yet)
// Zustand store (client state).
// Holds: scenario/site/config, current SimState, pending SolDecisions draft, latest WorldSnapshot + its source,
// event log for the current run, comms queue, run phase (setup | briefing | deciding | reporting | finished).
// Actions: startRun, updateDraft, commitSol (calls @amt/sim step), appendEvents, finishRun.
// The store is the only thing the HUD and the 3D scene read from.
