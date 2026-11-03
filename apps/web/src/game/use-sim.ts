// PLACEHOLDER (no code yet)
// Hook that connects the UI to the sim.
// Responsibilities: expose the current SimState, the draft SolDecisions and the latest events from game/store.ts;
// provide commitSol() which calls step() from @amt/sim with the current WorldSnapshot and site rules;
// keep a replayable run log (config, seed, snapshots, decisions) for upload at the end of the run.
// No game rules here: all logic lives in @amt/sim.
