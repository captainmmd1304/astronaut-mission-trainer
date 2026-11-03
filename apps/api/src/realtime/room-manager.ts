// PLACEHOLDER (no code yet)
// In-memory room registry: code -> { members, current SimState, pending decisions per player, queues, timers }.
// Hydrates from Postgres on demand/boot. Provides: getOrLoad(code), commitDecisions(code, playerId, decisions),
// resolveSol(code) (merge decisions -> sim.step -> broadcast), closeRoom(code, reason), expiry sweep.
// Single-instance only for now; a Redis adapter is the scaling path (see ADR-0002).
