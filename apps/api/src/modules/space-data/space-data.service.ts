// PLACEHOLDER (no code yet)
// space-data service: builds the current WorldSnapshot.
// Strategy by SPACE_DATA_MODE:
//   live    -> call DONKI + Horizons clients, normalize, store in cache; on error fall back to cache, then fixtures
//   cached  -> serve the DB cache only (fall back to fixtures if empty)
//   fixture -> serve recorded fixtures only (offline/demo-safe)
// Also: a poller on SPACE_DATA_TTL_MINUTES (never fetch per user request), light-time conversion
// (range AU x 499.004784 s), solar-conjunction flag, and the `source` field reported to the UI.
