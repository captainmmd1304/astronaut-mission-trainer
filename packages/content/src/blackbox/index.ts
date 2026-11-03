// PLACEHOLDER (no code yet)
// Black-box case files (validated by BlackBoxCaseSchema in ../schema).
//
// Case 001 (FICTIONAL hero case, set fictional: true) outline:
//   - A crewed Mars outpost is lost. The player investigates telemetry and the decision log.
//   - True cause chain (ordered evidence): shielding upgrade deferred to save power ->
//     dust storm cuts solar generation -> flare warning arrives late because of light-time delay ->
//     crew caught outside shelter during the radiation spike.
//   - Include distractor evidence that looks suspicious but is not causal.
//   - reflyScenarioId points to a scenario in ../scenarios that recreates the starting conditions.
//
// Real case files (add later; each needs sources). Facts are already verified and listed with sources in
// docs/CONTENT_FACTS.md. Remaining work: write the evidence boards and telemetry frames.
//   - Mars Climate Orbiter 1999 (unit mismatch)
//   - Mars Polar Lander 1999
//   - Schiaparelli 2016
