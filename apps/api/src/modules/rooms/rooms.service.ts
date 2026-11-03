// PLACEHOLDER (no code yet)
// rooms service. Rules: unique 6-char code, max 1 MISSION_CONTROL and 1-3 OUTPOST members, rooms expire (default 24h),
// capture a WorldSnapshot at room start (shared by everyone), create the co-op sim run via @amt/sim.
// Co-op sol resolution: wait for all OUTPOST players to commit decisions (or a timeout), merge into one SolDecisions,
// step the sim, hand results to the realtime layer.
