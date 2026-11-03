// PLACEHOLDER (no code yet)
// Comms panel. Message list with "sent / in transit / delivered" states and a visible countdown for in-transit messages
// (the delay is the point of the mechanic). Input limited to 140 characters, plus quick-reply templates.
// Solo mode: messages come from a scripted NPC Mission Control through the same DelayedQueue (from @amt/shared).
// Multiplayer: backed by socket events comms:send / comms:deliver.
